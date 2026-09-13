import { createHash } from 'node:crypto';

export const FACTORS = ['market_quality', 'liquidity_health', 'arbitrage_potential', 'order_flow', 'volatility', 'news_sentiment'];
export const MODEL_ID = 'vultax.crypto.vi-iq';
export const PLANS = Object.freeze({
  BASIC: { monthlyPrice: 0, monthlyRecords: 250, rpm: 6, batch: 1, history: false },
  PRO: { monthlyPrice: 49, monthlyRecords: 10000, rpm: 30, batch: 3, history: false },
  ULTRA: { monthlyPrice: 149, monthlyRecords: 50000, rpm: 60, batch: 25, history: true },
});
export class ApiError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
export const hash = value => createHash('sha256').update(value).digest('hex');
// A timezone-less source time cannot establish freshness across different hosts.
export const iso = value => typeof value === 'string' && /T.*(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
const number = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : null;
export function parsePairs(value, allowed, max = 25) {
  const pairs = [...new Set(String(value).split(',').map(x => x.trim().toUpperCase()))];
  if (!pairs.length || pairs.length > max || pairs.some(x => !/^[A-Z0-9]{5,20}$/.test(x) || !allowed.includes(x))) {
    throw new ApiError(400, 'invalid_pairs', `Choose 1-${max} distinct supported pairs from /v1/metadata.`);
  }
  return pairs;
}
export function freshness(timestamp, now, threshold) {
  if (!timestamp) return 'unknown';
  const age = now - Date.parse(timestamp);
  if (age < -5000) return 'unknown';
  return age > threshold * 1000 ? 'stale' : 'fresh';
}
export function normalize(raw, { pairs, now = Date.now(), modelVersion = null, staleSeconds = 300 } = {}) {
  if (!raw || !pairs.includes(raw.pair) || !raw.factors || !iso(raw.timestamp)) {
    throw new ApiError(502, 'upstream_contract_error', 'The upstream IQ response does not match its contract.');
  }
  const valid = raw.label !== 'unknown';
  const factors = Object.fromEntries(FACTORS.map(name => {
    const f = raw.factors[name];
    if (!f || number(f.weight, 0, 1) === null) throw new ApiError(502, 'upstream_contract_error', 'A required factor is missing.');
    const sourceAsOf = iso(f.as_of);
    return [name, { score: f.label === 'unknown' ? null : number(f.score, 0, 100), weight: f.weight,
      coverage: number(f.coverage, 0, 1), confidence: number(f.confidence, 0, 1), source_as_of: sourceAsOf,
      source_as_of_raw: typeof f.as_of === 'string' ? f.as_of : null,
      label: typeof f.label === 'string' ? f.label : null,
      details: typeof f.details === 'string' ? f.details : null,
      notes: Array.isArray(f.notes) ? f.notes.filter(n => typeof n === 'string') : null,
      freshness: freshness(sourceAsOf, now, staleSeconds) }];
  }));
  const sourceAsOf = iso(raw.as_of);
  const record = {
    schema_version: '1.0', pair: raw.pair, model_id: MODEL_ID, model_version: modelVersion,
    model_identity_status: modelVersion ? 'configured_producer_version' : 'unversioned_upstream',
    score: valid ? number(raw.score, 1, 100) : null,
    coverage: number(raw.coverage, 0, 1), confidence: number(raw.confidence, 0, 1),
    source_as_of: sourceAsOf, upstream_timestamp: iso(raw.timestamp),
    collected_at: new Date(now).toISOString(), freshness: freshness(sourceAsOf, now, staleSeconds), factors,
    missing_factors: FACTORS.filter(name => factors[name].score === null),
    methodology_url: 'https://vultax.com/methodology',
  };
  // Collection time and age labels are not new score observations.
  const identity = { ...record, collected_at: undefined, freshness: undefined,
    factors: Object.fromEntries(FACTORS.map(name => [name, { ...factors[name], freshness: undefined }])) };
  return { ...record, observation_id: hash(JSON.stringify(identity)).slice(0, 32) };
}
export function ageRecord(record, now, staleSeconds) {
  return { ...record, freshness: freshness(record.source_as_of, now, staleSeconds),
    factors: Object.fromEntries(FACTORS.map(name => [name, { ...record.factors[name],
      freshness: freshness(record.factors[name].source_as_of, now, staleSeconds) }])) };
}
