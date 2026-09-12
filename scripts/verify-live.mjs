const base = process.env.VI_IQ_VERIFY_URL || 'http://127.0.0.1:3189';
const url = new URL(base);
if (url.username || url.password || (url.protocol !== 'https:' && !['127.0.0.1','localhost'].includes(url.hostname))) throw new Error('Use an HTTPS URL or loopback.');
const fetchJson = async (path,headers={}) => {const r=await fetch(new URL(path,url),{headers,redirect:'error',signal:AbortSignal.timeout(20000)});return {status:r.status,body:await r.json()};};
const meta=await fetchJson('/v1/metadata');
if(meta.status!==200 || !Array.isArray(meta.body.pairs)) throw new Error('Metadata contract failed');
const anonymous=await fetchJson('/v1/iq/BTCUSDT');
if(anonymous.status!==401) throw new Error('Anonymous data access must return 401');
console.log(JSON.stringify({metadata:'passed',anonymous_access:'rejected',source_configured:meta.body.source_configured,history:meta.body.history},null,2));
if(!process.env.VI_IQ_VERIFY_TOKEN) {console.log('Authenticated live IQ verification not performed: VI_IQ_VERIFY_TOKEN is missing.');process.exitCode=2;}
else {
  const result=await fetchJson('/v1/iq/BTCUSDT',{Authorization:`Bearer ${process.env.VI_IQ_VERIFY_TOKEN}`});
  if(result.status!==200 || !result.body.data?.some(r=>typeof r.score==='number')) throw new Error('No usable authenticated IQ record');
  console.log(JSON.stringify({authenticated_iq:'passed',observations:result.body.data.map(r=>({pair:r.pair,score:r.score,model_version:r.model_version,source_as_of:r.source_as_of,freshness:r.freshness}))},null,2));
}
