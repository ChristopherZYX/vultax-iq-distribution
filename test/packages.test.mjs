import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import SwaggerParser from '@apidevtools/swagger-parser';
import { FACTORS } from '../src/contract.mjs';
test('OpenAPI imports have valid operations, paths and schemas',async()=>{
  await SwaggerParser.validate('openapi.json'); await SwaggerParser.validate('integrations/rapidapi/openapi.json');
});
test('published Postman files contain a working public entry and no credential values',async()=>{
  const c=JSON.parse(await readFile('integrations/postman/collection.json','utf8'));
  assert.equal(c.item[0].request.url,'https://vultax.com/feed.xml');
  assert.ok(!c.variable.some(v=>/token|secret|key/i.test(v.key)&&v.value));
  const e=JSON.parse(await readFile('integrations/postman/environment.json','utf8'));
  assert.equal(e.values.find(v=>v.key==='apiToken').value,'');
});
test('n8n screen retains rows and flags stale, missing and incomplete evidence',async()=>{
  const w=JSON.parse(await readFile('integrations/n8n/vi-iq-screen.json','utf8'));
  assert.equal(w.active,false); assert.ok(w.nodes.some(n=>n.type==='n8n-nodes-base.manualTrigger'));
  const script=w.nodes.find(n=>n.type==='n8n-nodes-base.code').parameters.jsCode;
  const good={score:70,coverage:0.9,freshness:'fresh',factors:Object.fromEntries(FACTORS.map(name=>[name,{score:65,freshness:'fresh'}]))};
  const data=[good,{...good,score:null},{...good,freshness:'stale'},{...good,coverage:null},{...good,factors:{market_quality:{score:65,freshness:'unknown'}}}];
  const output=new Function('$input',script)({all:()=>[{json:{data}}]});
  assert.equal(output.length,5); assert.deepEqual(output.map(r=>r.json.passes_screen),[true,false,false,false,false]);
});
test('Hugging Face sample explicitly marks every invented example',async()=>{
  const rows=(await readFile('integrations/huggingface/evidence-cases.jsonl','utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(rows.length,12); assert.ok(rows.every(r=>r.provenance==='synthetic_example'&&r.pair==='EXAMPLEUSDT'));
  assert.ok(rows.filter(r=>r.score===null).every(r=>!r.expected_may_describe_current_score));
});
