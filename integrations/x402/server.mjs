import express from 'express';
import { createX402Server } from '@coinbase/cdp-sdk/x402';
import { paymentMiddlewareFromHTTPServer } from '@x402/express';
import { declareDiscoveryExtension } from '@x402/extensions/bazaar';

const env = process.env;
for (const key of ['CDP_API_KEY_ID','CDP_API_KEY_SECRET','X402_PAY_TO','VULTAX_GATEWAY_URL','VULTAX_GATEWAY_TOKEN']) {
  if (!env[key]) throw new Error(`Set ${key} privately before starting the x402 adapter.`);
}
if (!/^0x[a-fA-F0-9]{40}$/.test(env.X402_PAY_TO) || /^0x0{40}$/.test(env.X402_PAY_TO)) throw new Error('Configure a valid owned receiving address.');
const mainnet = env.X402_ENVIRONMENT === 'production';
const server = await createX402Server({
  environment: mainnet ? 'production' : 'development',
  payToConfig: {type:'address',evm:env.X402_PAY_TO},
  routes: {'GET /v1/iq/:pair': {
    price:'$0.01', networks:[mainnet ? 'eip155:8453' : 'eip155:84532'],
    description:'Retrieve one source-reported Vi IQ crypto market-quality observation with six factors, coverage and freshness. No forecast or execution.',
    extensions: declareDiscoveryExtension({method:'GET',pathParamsSchema:{properties:{pair:{type:'string',enum:['BTCUSDT','ETHUSDT','SOLUSDT']}},required:['pair']},
      output:{example:{data:[{pair:'BTCUSDT',score:null,model_version:null,freshness:'unknown'}],records_billed:0}}}),
  }},
});
const app = express(); app.disable('x-powered-by');
app.get('/healthz', (_req,res) => res.json({status:'running',network:mainnet?'base':'base-sepolia'}));
// Validate availability BEFORE a payment can settle. No upstream consumer token reaches the buyer.
app.get('/v1/iq/:pair', async (req,res,next) => {
  if (!['BTCUSDT','ETHUSDT','SOLUSDT'].includes(req.params.pair)) return res.status(400).json({error:'unsupported_pair'});
  try {
    const url = new URL(`v1/iq/${req.params.pair}`,env.VULTAX_GATEWAY_URL.replace(/\/?$/, '/'));
    if (url.protocol !== 'https:' && !['127.0.0.1','localhost'].includes(url.hostname)) throw new Error('HTTPS required');
    const response = await fetch(url,{headers:{Authorization:`Bearer ${env.VULTAX_GATEWAY_TOKEN}`},signal:AbortSignal.timeout(15000),redirect:'error'});
    if (!response.ok) return res.status(503).json({error:'iq_unavailable'});
    const body = await response.json();
    if (body.data?.length !== 1 || typeof body.data[0].score !== 'number') return res.status(503).json({error:'iq_unavailable'});
    res.locals.iq = body; next();
  } catch { res.status(503).json({error:'iq_unavailable'}); }
});
app.use(paymentMiddlewareFromHTTPServer(server));
app.get('/v1/iq/:pair',(_req,res)=>res.json(res.locals.iq));
app.use((_req,res)=>res.status(404).json({error:'not_found'}));
app.listen(Number(env.PORT || 8402),env.HOST || '127.0.0.1',()=>console.log('Vi IQ x402 adapter listening on',mainnet?'Base':'Base Sepolia'));
