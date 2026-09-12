import { timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { ApiError, PLANS, MODEL_ID, FACTORS, hash, iso, parsePairs, ageRecord } from './contract.mjs';

const equal = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string' || !a || !b) return false;
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};
export function authenticate(headers, { clients = [], rapidSecret = '' }) {
  const proxy = headers['x-rapidapi-proxy-secret'];
  if (proxy !== undefined) {
    if (!equal(proxy, rapidSecret)) throw new ApiError(401, 'unauthorized', 'Invalid marketplace credentials.');
    const user = headers['x-rapidapi-user'], plan = headers['x-rapidapi-subscription'];
    if (typeof user !== 'string' || user.length > 200 || !user || !Object.hasOwn(PLANS, plan ?? '')) throw new ApiError(403, 'unsupported_plan', 'The subscription is not enabled.');
    return { id: `rapid:${hash(user)}`, plan, rapid: true };
  }
  const bearer = /^Bearer ([^\s]{16,256})$/.exec(headers.authorization ?? '')?.[1];
  const client = bearer && clients.find(c => equal(c.sha256, hash(bearer)));
  if (!client || !Object.hasOwn(PLANS, client.plan)) throw new ApiError(401, 'unauthorized', 'Provide a valid consumer Bearer token.');
  return { id: `direct:${client.id}`, plan: client.plan, rapid: false };
}

export function createGateway({ source, store, clients = [], rapidSecret = '', clock = Date.now, retentionDays = 30 }) {
  function send(res, status, body, extra = {}) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff', ...extra }); res.end(JSON.stringify(body));
  }
  return async (req, res) => {
    try {
      if (req.url.length > 2048) throw new ApiError(414, 'url_too_long', 'The request URL is too long.');
      const url = new URL(req.url, 'http://gateway.invalid');
      if (req.method !== 'GET') throw new ApiError(405, 'method_not_allowed', 'Use GET.');
      if (url.pathname === '/healthz') return send(res, 200, { status: 'running', source_configured: source.configured });
      if (url.pathname === '/openapi.json') {
        const spec = JSON.parse(await readFile(new URL('../openapi.json', import.meta.url), 'utf8'));
        return send(res, 200, spec);
      }
      if (url.pathname === '/v1/metadata') return send(res, 200, {
        product: 'Vi IQ by Vultax', schema_version: '1.0', model_id: MODEL_ID,
        model_version: source.modelVersion, pairs: source.pairs, factors: FACTORS,
        source_configured: source.configured, cache_seconds: source.cacheSeconds,
        stale_after_seconds: source.staleSeconds, history: { ...store.coverage(), retention_days: retentionDays,
          semantics: 'Observations collected by this gateway; gaps are not backfilled. Query dates refer to collected_at.' },
        methodology_url: 'https://vultax.com/methodology',
      });
      const match = /^\/v1\/iq(?:\/([A-Z0-9]{5,20})(?:\/(history|changes))?)?$/.exec(url.pathname);
      if (!match) throw new ApiError(404, 'not_found', 'See /openapi.json for supported routes.');
      const client = authenticate(req.headers, { clients, rapidSecret });
      const plan = PLANS[client.plan], now = clock(), day = new Date(now).toISOString();
      store.consume(client.id, day.slice(0,16), 'requests', 1, plan.rpm);
      const pairs = parsePairs(match[1] ?? url.searchParams.get('pairs') ?? 'BTCUSDT', source.pairs, plan.batch);
      let data, extra = {};
      if (match[2]) {
        if (!plan.history) throw new ApiError(403, 'plan_required', 'History and changes require ULTRA.');
        const from = iso(url.searchParams.get('from')) ?? new Date(now - 86400000).toISOString();
        const to = iso(url.searchParams.get('to')) ?? day;
        if ((url.searchParams.has('from') && !iso(url.searchParams.get('from'))) || (url.searchParams.has('to') && !iso(url.searchParams.get('to'))) || from > to || Date.parse(to) - Date.parse(from) > retentionDays * 86400000) throw new ApiError(400, 'invalid_time_range', 'Use ISO timestamps within the configured retention window.');
        const limit = Number(url.searchParams.get('limit') ?? 1000);
        if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new ApiError(400, 'invalid_limit', 'limit must be 1-1000.');
        const rows = store.history(pairs[0], from, to, limit + 1);
        extra = { history_basis: 'gateway_collected_observations', from, to, truncated: rows.length > limit };
        data = rows.slice(-limit).map(r => ageRecord(r, now, source.staleSeconds));
        if (match[2] === 'changes') {
          const first = data[0], last = data.at(-1);
          const comparable = data.length >= 2 && Boolean(first.model_version) && data.every(r => r.model_version === first.model_version) && first.score !== null && last.score !== null;
          extra.change = { score_delta: comparable ? Number((last.score - first.score).toFixed(8)) : null,
            reason: comparable ? 'same_version_observed_endpoints' : 'insufficient_or_unversioned_observations',
            from_observation_id: first?.observation_id ?? null, to_observation_id: last?.observation_id ?? null };
          data = data.length > 1 ? [first, last] : data;
        }
      } else {
        const records = await source.get();
        data = pairs.map(pair => records.find(r => r.pair === pair)).filter(Boolean);
        extra = { unavailable_pairs: pairs.filter(pair => !data.some(r => r.pair === pair)), source_warning: source.lastError ?? null };
        if (!data.length) throw new ApiError(503, 'data_unavailable', 'No observations are available for these pairs.');
      }
      // Bill only records containing a usable numeric score, including repeated reads.
      const units = data.filter(r => r.score !== null).length;
      // RapidAPI owns the subscriber billing period; its record quota must be HARD.
      if (!client.rapid) store.consume(client.id, day.slice(0,7), 'records', units, plan.monthlyRecords);
      return send(res, 200, { data, ...extra, records_billed: units },
        client.rapid ? { 'X-RapidAPI-Billing': `Records=${units}` } : {});
    } catch (e) {
      const status = e instanceof ApiError ? e.status : 500;
      send(res, status, { error: e instanceof ApiError ? e.code : 'internal_error', message: e instanceof ApiError ? e.message : 'The service could not complete this request.' }, status === 429 ? { 'Retry-After': '60' } : {});
    }
  };
}
