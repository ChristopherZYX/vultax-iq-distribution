import { DatabaseSync } from 'node:sqlite';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { FACTORS, hash } from '../src/contract.mjs';

// Local preparation only. Publishing requires the selected data's redistribution rights.
const dbPath = process.env.STATE_PATH || './state/iq.sqlite';
const output = resolve(process.env.DATASET_OUTPUT_DIR || './private/dataset-export');
const db = new DatabaseSync(dbPath, { readOnly:true });
const data = db.prepare('SELECT body FROM observations ORDER BY collected_at LIMIT 1000').all().map(x=>JSON.parse(x.body)); db.close();
if (!data.length) throw new Error('No recorded observations exist. No sample was fabricated.');
if (data.some(r=>!r.model_version)) throw new Error('A verified producer version is required for a versioned historical dataset.');
const columns = ['observation_id','pair','model_id','model_version','source_as_of','upstream_timestamp','collected_at','score','coverage',...FACTORS.map(x=>x+'_score')];
const quote = x => '"'+String(x ?? '').replaceAll('"','""')+'"';
const csv = [columns.join(','),...data.map(r=>columns.map(c=>quote(c.endsWith('_score') ? r.factors[c.slice(0,-6)]?.score : r[c])).join(','))].join('\n')+'\n';
await mkdir(output,{recursive:true});
await writeFile(resolve(output,'sample.csv'),csv);
await writeFile(resolve(output,'sample.jsonl'),data.map(r=>JSON.stringify(r)).join('\n')+'\n');
await writeFile(resolve(output,'manifest.json'),JSON.stringify({status:'local_export_not_published',records:data.length,csv_sha256:hash(csv),collected_from:data[0].collected_at,collected_to:data.at(-1).collected_at,model_versions:[...new Set(data.map(r=>r.model_version))],license_status:'requires_selected_data_rights_confirmation'},null,2));
console.log('Prepared',data.length,'observations in',output);
