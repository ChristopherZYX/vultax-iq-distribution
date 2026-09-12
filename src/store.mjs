import { DatabaseSync } from 'node:sqlite';
import { ApiError } from './contract.mjs';

export class Store {
  constructor(path = ':memory:') {
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS observations(id TEXT PRIMARY KEY, pair TEXT NOT NULL, collected_at TEXT NOT NULL, body TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS pair_time ON observations(pair,collected_at);
      CREATE TABLE IF NOT EXISTS usage(client TEXT, period TEXT, kind TEXT, count INTEGER NOT NULL, PRIMARY KEY(client,period,kind));`);
  }
  save(records) {
    const q = this.db.prepare('INSERT OR IGNORE INTO observations VALUES(?,?,?,?)');
    this.db.exec('BEGIN IMMEDIATE');
    try { for (const r of records) q.run(r.observation_id, r.pair, r.collected_at, JSON.stringify(r)); this.db.exec('COMMIT'); }
    catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  consume(client, period, kind, count, limit) {
    if (!count) return;
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const old = this.db.prepare('SELECT count FROM usage WHERE client=? AND period=? AND kind=?').get(client, period, kind)?.count ?? 0;
      if (old + count > limit) throw new ApiError(429, kind === 'requests' ? 'rate_limit' : 'quota_exceeded', 'The usage limit has been reached.');
      this.db.prepare('INSERT INTO usage VALUES(?,?,?,?) ON CONFLICT(client,period,kind) DO UPDATE SET count=excluded.count').run(client, period, kind, old + count);
      this.db.exec('COMMIT');
    } catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  history(pair, from, to, limit = 1000) {
    return this.db.prepare('SELECT body FROM observations WHERE pair=? AND collected_at>=? AND collected_at<=? ORDER BY collected_at DESC LIMIT ?')
      .all(pair, from, to, limit).map(x => JSON.parse(x.body)).reverse();
  }
  coverage() {
    return this.db.prepare('SELECT MIN(collected_at) AS collected_from, MAX(collected_at) AS collected_to, COUNT(*) AS observations FROM observations').get();
  }
  prune(now, retentionDays) {
    // Only this gateway's own bounded cache/history and counters, never source data.
    this.db.prepare('DELETE FROM observations WHERE collected_at<?').run(new Date(now - retentionDays * 86400000).toISOString());
    this.db.prepare("DELETE FROM usage WHERE kind='requests' AND period<?").run(new Date(now - 3600000).toISOString().slice(0,16));
    this.db.prepare("DELETE FROM usage WHERE kind='records' AND period<?").run(new Date(now - 65 * 86400000).toISOString().slice(0,7));
  }
  close() { this.db.close(); }
}
