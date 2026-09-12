import { createServer } from 'node:http';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Store } from './store.mjs';
import { IqSource } from './upstream.mjs';
import { createGateway } from './gateway.mjs';

const env = process.env;
const positive = (name, fallback, min, max) => {
  const n = Number(env[name] ?? fallback);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`Invalid ${name}`); return n;
};
const path = env.STATE_PATH || './state/iq.sqlite'; mkdirSync(dirname(path), { recursive: true });
const store = new Store(path);
const pairs = (env.VI_IQ_PAIRS || 'BTCUSDT,ETHUSDT,SOLUSDT').split(',').map(x => x.trim());
if (!pairs.length || pairs.length > 25 || new Set(pairs).size !== pairs.length || pairs.some(p => !/^[A-Z0-9]{5,20}$/.test(p))) throw new Error('Invalid VI_IQ_PAIRS');
const retentionDays = positive('VI_IQ_RETENTION_DAYS', 30, 1, 90);
const source = new IqSource({ baseUrl: env.VULTAX_UPSTREAM_URL, apiKey: env.VULTAX_UPSTREAM_KEY,
  pairs, cacheSeconds: positive('VI_IQ_CACHE_SECONDS', 60, 30, 3600), staleSeconds: positive('VI_IQ_STALE_SECONDS', 300, 30, 86400),
  modelVersion: env.VI_IQ_MODEL_VERSION || null, store });
const clients = JSON.parse(env.API_CLIENTS_JSON || '[]');
if (!Array.isArray(clients) || clients.some(c => !c.id || !/^[a-f0-9]{64}$/.test(c.sha256))) throw new Error('Invalid API_CLIENTS_JSON');
const server = createServer(createGateway({ source, store, clients, rapidSecret: env.RAPIDAPI_PROXY_SECRET, retentionDays }));
server.requestTimeout = 15000; server.headersTimeout = 10000; server.maxConnections = 100;
const collect = async () => { try { if (source.configured) await source.get(); store.prune(Date.now(), retentionDays); } catch { /* availability exposed by the data endpoint */ } };
await collect();
const timer = setInterval(collect, source.cacheSeconds * 1000).unref();
server.listen(positive('PORT', 3189, 1, 65535), env.HOST || '127.0.0.1', () => console.log('Vi IQ gateway listening; source configured:', source.configured));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { clearInterval(timer); server.close(() => { store.close(); process.exit(0); }); });
