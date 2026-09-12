import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname,basename} from 'node:path';
import assert from 'node:assert/strict';
const dir=await mkdtemp(join(tmpdir(),'vultax-iq-smoke-'));
const port=3198;
const child=spawn(process.execPath,['src/server.mjs'],{windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,PORT:String(port),HOST:'127.0.0.1',STATE_PATH:join(dir,'smoke.sqlite'),VULTAX_UPSTREAM_KEY:'',API_CLIENTS_JSON:'[]',RAPIDAPI_PROXY_SECRET:''}});
try {
  await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',code=>reject(new Error('Server exited '+code)));setTimeout(()=>reject(new Error('Startup timeout')),15000).unref();});
  const base=`http://127.0.0.1:${port}`;
  const meta=await(await fetch(base+'/v1/metadata')).json();assert.equal(meta.source_configured,false);assert.equal(meta.history.observations,0);
  assert.equal((await fetch(base+'/v1/iq/BTCUSDT')).status,401);
  assert.equal((await fetch(base+'/openapi.json')).status,200);
  console.log('Actual server process: metadata, protected IQ access and OpenAPI passed; upstream remains unconfigured.');
} finally {
  child.kill();await new Promise(resolve=>{if(child.exitCode!==null)resolve();else child.once('exit',resolve);});
  // Remove only the exact fresh temporary directory created by this smoke test.
  if(dirname(resolve(dir))!==resolve(tmpdir()) || !basename(dir).startsWith('vultax-iq-smoke-')) throw new Error('Unexpected temporary directory boundary');
  await rm(dir,{recursive:true,force:true});
}
