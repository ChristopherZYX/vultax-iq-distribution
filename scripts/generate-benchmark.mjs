import { mkdir,writeFile } from 'node:fs/promises';
const cases=[];
for(const freshness of ['fresh','stale','unknown']) for(const available of [true,false]) for(const versioned of [true,false]) {
  cases.push({case_id:`${freshness}-${available?'present':'missing'}-${versioned?'versioned':'unversioned'}`,
    provenance:'synthetic_example',pair:'EXAMPLEUSDT',score:available?67:null,source_as_of:freshness==='unknown'?null: freshness==='fresh'?'2026-09-13T00:00:00Z':'2026-09-12T00:00:00Z',
    evaluated_at:'2026-09-13T00:01:00Z',freshness,model_version:versioned?'example-model-v1':null,
    expected_may_describe_current_score:freshness==='fresh'&&available,expected_must_disclose_missing:!available,
    expected_may_compare_model_history:versioned&&available,
    explanation:!available?'Report the score as unavailable. Never replace it with zero.':freshness!=='fresh'?'Label the observation stale or of unknown age. Do not describe it as current.':!versioned?'The observation has a score and recent source time, but its producer version is unverified.':'An individual current observation is available; a historical comparison additionally needs another observation of the same version.'});
}
const dir=new URL('../integrations/huggingface/',import.meta.url);await mkdir(dir,{recursive:true});
await writeFile(new URL('evidence-cases.jsonl',dir),cases.map(c=>JSON.stringify(c)).join('\n')+'\n');
await writeFile(new URL('dataset_infos.json',dir),JSON.stringify({default:{description:'12 authored synthetic evidence-handling cases. No market observations or investment outcomes.',features:Object.fromEntries(Object.entries(cases[0]).map(([k,v])=>[k,{dtype:typeof v==='boolean'?'bool':typeof v==='number'?'float64':'string',_type:'Value'}])),splits:{test:{name:'test',num_examples:cases.length}},license:'cc-by-4.0'}},null,2));
console.log('Generated',cases.length,'explicitly synthetic evidence-handling cases.');
