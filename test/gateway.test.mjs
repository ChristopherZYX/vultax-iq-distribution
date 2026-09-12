import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { Store } from '../src/store.mjs';
import { IqSource } from '../src/upstream.mjs';
import { createGateway } from '../src/gateway.mjs';
import { FACTORS, normalize, hash } from '../src/contract.mjs';

export const fixture = (overrides = {}) => ({ pair: 'BTCUSDT', timestamp: '2026-09-13T00:00:00Z', as_of: '2026-09-13T00:00:00Z',
  score: 67, label: 'neutral', coverage: 0.8, confidence: null,
  factors: Object.fromEntries(FACTORS.map(name => [name, { score: 60, weight: name === 'market_quality' ? 0.25 : 0.15, label: 'neutral', as_of: '2026-09-13T00:00:00Z' }])), ...overrides });
const token = 'test-only-consumer-key-123456';
async function harness(t, { plan = 'ULTRA', records, rapidSecret = 'test-only-rapid-secret', sourceOptions = {} } = {}) {
  let now = Date.parse('2026-09-13T00:01:00Z'), calls = 0;
  const store = new Store();
  const source = new IqSource({ apiKey: 'test-only-reader-key', store, pairs: ['BTCUSDT','ETHUSDT'], clock: () => now,
    fetchImpl: async () => { calls++; return Response.json(records ?? [fixture()]); }, ...sourceOptions });
  const server = createServer(createGateway({ store, source, clock: () => now, rapidSecret, clients: [{ id: 'test', sha256: hash(token), plan }] }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await new Promise(resolve => server.close(resolve)); store.close(); });
  const url = `http://127.0.0.1:${server.address().port}`;
  return { store, source, calls: () => calls, advance: ms => { now += ms; }, request: (path, headers = { Authorization: `Bearer ${token}` }) => fetch(url + path, { headers }) };
}
test('private IQ cannot be accessed by spoofing a plan or Unicode proxy key', async t => {
  const h = await harness(t);
  assert.equal((await h.request('/v1/iq/BTCUSDT', { 'X-RapidAPI-Subscription':'ULTRA' })).status, 401);
  assert.equal((await h.request('/v1/iq/BTCUSDT', { 'X-RapidAPI-Proxy-Secret':'é'.repeat(22) })).status, 401);
  assert.equal(h.calls(), 0);
});
test('cold-cache concurrent requests share one bounded upstream request', async t => {
  const h = await harness(t);
  const responses = await Promise.all(Array.from({length: 8}, () => h.request('/v1/iq/BTCUSDT')));
  assert.ok(responses.every(r => r.status === 200)); assert.equal(h.calls(), 1);
  assert.equal(h.store.coverage().observations, 1);
  const body = await responses[0].json(); assert.equal(body.data[0].score, 67); assert.equal(body.records_billed, 1);
});
test('unknown floor scores and missing factors remain null without billing', async t => {
  const h = await harness(t, { records: [fixture({ score: 1, label:'unknown', factors: Object.fromEntries(FACTORS.map(name => [name, { score: 50, weight: 0.1, label:'unknown' }])) })] });
  const body = await (await h.request('/v1/iq/BTCUSDT')).json();
  assert.equal(body.records_billed, 0); assert.equal(body.data[0].score, null); assert.equal(body.data[0].missing_factors.length, 6);
});
test('source failure preserves source times and ages the cached observation', async t => {
  const h = await harness(t); await h.request('/v1/iq/BTCUSDT');
  h.advance(600000); h.source.fetchImpl = async () => { throw new Error('secret must not leak'); };
  const response = await h.request('/v1/iq/BTCUSDT'); const body = await response.json();
  assert.equal(response.status, 200); assert.equal(body.data[0].freshness, 'stale');
  assert.equal(body.data[0].source_as_of, '2026-09-13T00:00:00.000Z'); assert.equal(body.source_warning, 'upstream_unavailable');
  assert.ok(!JSON.stringify(body).includes('secret must not leak'));
});
test('missing upstream credential fails closed after consumer authentication', async t => {
  const h = await harness(t, { sourceOptions: { apiKey:'' } });
  assert.equal((await h.request('/v1/iq/BTCUSDT')).status, 503); assert.equal(h.calls(), 0);
});
test('batch credits count returned instruments; RapidAPI gets the billing header', async t => {
  const h = await harness(t, { records: [fixture(), fixture({pair:'ETHUSDT'})] });
  const response = await h.request('/v1/iq?pairs=BTCUSDT,ETHUSDT', { 'X-RapidAPI-Proxy-Secret':'test-only-rapid-secret', 'X-RapidAPI-User':'test-user', 'X-RapidAPI-Subscription':'PRO' });
  assert.equal(response.status, 200); assert.equal(response.headers.get('X-RapidAPI-Billing'), 'Records=2');
  assert.equal((await response.json()).records_billed, 2);
});
test('BASIC cannot retrieve multiple instruments or history', async t => {
  const h = await harness(t, { plan:'BASIC' });
  assert.equal((await h.request('/v1/iq?pairs=BTCUSDT,ETHUSDT')).status, 400);
  assert.equal((await h.request('/v1/iq/BTCUSDT/history')).status, 403);
});
test('unknown pairs, traversal and invalid dates cannot reach the upstream', async t => {
  const h = await harness(t);
  assert.equal((await h.request('/v1/iq?pairs=FAKEUSDT')).status, 400);
  assert.equal((await h.request('/v1/iq?pairs=../../secret')).status, 400);
  assert.equal((await h.request('/v1/iq/BTCUSDT/history?from=nonsense')).status, 400); assert.equal(h.calls(), 0);
});
test('history deduplicates observations and does not invent missing days', async t => {
  const h = await harness(t); await h.request('/v1/iq/BTCUSDT'); h.advance(61000); await h.request('/v1/iq/BTCUSDT');
  const body = await (await h.request('/v1/iq/BTCUSDT/history')).json();
  assert.equal(body.data.length, 1); assert.equal(body.history_basis, 'gateway_collected_observations');
  const empty = await (await h.request('/v1/iq/BTCUSDT/history?from=2026-09-01T00:00:00Z&to=2026-09-02T00:00:00Z')).json();
  assert.equal(empty.data.length, 0); assert.equal(empty.records_billed, 0);
});
test('changes require observations from a verified common model version', async t => {
  const h = await harness(t); await h.request('/v1/iq/BTCUSDT'); h.advance(61000);
  h.source.fetchImpl = async () => Response.json([fixture({score:80,timestamp:'2026-09-13T00:02:00Z'})]); await h.request('/v1/iq/BTCUSDT');
  const body = await (await h.request('/v1/iq/BTCUSDT/changes')).json();
  assert.equal(body.change.score_delta, null); assert.equal(body.data.length, 2);
});
test('direct record quota is atomic and persistent in its own store', () => {
  const store = new Store();
  try { store.consume('test','2026-09','records',2,2); assert.throws(() => store.consume('test','2026-09','records',1,2), /usage limit/);
    store.consume('test','2026-10','records',1,2); } finally { store.close(); }
});
test('composite timestamps do not stand in for missing factor timestamps', () => {
  const raw = fixture(); raw.factors.volatility.as_of = null;
  const result = normalize(raw, { pairs:['BTCUSDT'], now:Date.parse('2026-09-13T00:01:00Z') });
  assert.equal(result.factors.volatility.source_as_of, null); assert.equal(result.factors.volatility.freshness, 'unknown');
  assert.equal(result.model_version, null);
});
