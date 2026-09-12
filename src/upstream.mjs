import { ApiError, normalize, ageRecord } from './contract.mjs';

export class IqSource {
  constructor({ baseUrl = 'https://api.vultax.com', apiKey = '', pairs = ['BTCUSDT','ETHUSDT','SOLUSDT'],
    cacheSeconds = 60, staleSeconds = 300, modelVersion = null, fetchImpl = fetch, store, clock = Date.now }) {
    const url = new URL(baseUrl);
    if (url.username || url.password || !['https:', 'http:'].includes(url.protocol) ||
        (url.protocol === 'http:' && !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname))) throw new Error('Use HTTPS or a loopback upstream.');
    Object.assign(this, { baseUrl: url.origin, apiKey, pairs, cacheSeconds, staleSeconds, modelVersion, fetchImpl, store, clock });
    this.records = []; this.nextFetch = 0; this.pending = null;
  }
  get configured() { return Boolean(this.apiKey); }
  async get() {
    if (!this.configured) throw new ApiError(503, 'upstream_not_configured', 'The dedicated Vultax IQ reader credential is not configured.');
    if (this.clock() >= this.nextFetch && !this.pending) {
      this.nextFetch = this.clock() + this.cacheSeconds * 1000;
      this.pending = this.refresh().finally(() => { this.pending = null; });
    }
    if (this.pending) await this.pending;
    if (!this.records.length) throw new ApiError(503, 'upstream_unavailable', 'No validated IQ observations are available.');
    return this.records.map(r => ageRecord(r, this.clock(), this.staleSeconds));
  }
  async refresh() {
    try {
      const url = new URL('/v1/crypto/vi-iq/batch', this.baseUrl);
      url.searchParams.set('pairs', this.pairs.join(',')); url.searchParams.set('limit', String(this.pairs.length));
      const response = await this.fetchImpl(url, { headers: { 'X-API-Key': this.apiKey, Accept: 'application/json' },
        signal: AbortSignal.timeout(12000), redirect: 'error' });
      if (!response.ok) throw new Error(`upstream_${response.status}`);
      // Hard response cap bounds a malformed or unexpectedly large provider result.
      const reader = response.body.getReader(); const chunks = []; let size = 0;
      while (true) { const { value, done } = await reader.read(); if (done) break;
        size += value.byteLength; if (size > 1000000) { await reader.cancel(); throw new Error('upstream_size'); } chunks.push(value); }
      const raw = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (!Array.isArray(raw) || raw.length > this.pairs.length) throw new Error('upstream_shape');
      const records = raw.map(r => normalize(r, { pairs: this.pairs, modelVersion: this.modelVersion, now: this.clock(), staleSeconds: this.staleSeconds }));
      if (new Set(records.map(r => r.pair)).size !== records.length) throw new Error('duplicate_pairs');
      this.store.save(records); this.records = records; this.lastError = null;
    } catch {
      this.lastError = 'upstream_unavailable';
      // Keep the last validated observation with its ORIGINAL source timestamps.
      if (!this.records.length) throw new ApiError(503, 'upstream_unavailable', 'The IQ source did not return validated observations.');
    }
  }
}
