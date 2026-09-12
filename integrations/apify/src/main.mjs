import { Actor } from 'apify';
await Actor.main(async () => {
  const input = await Actor.getInput();
  const pairs = [...new Set(input?.pairs ?? [])];
  if (!pairs.length || pairs.length > 3 || pairs.some(p => !['BTCUSDT','ETHUSDT','SOLUSDT'].includes(p))) throw new Error('Choose 1-3 supported pairs.');
  const base = process.env.VULTAX_GATEWAY_URL, token = process.env.VULTAX_GATEWAY_TOKEN;
  if (!base || !token) throw new Error('Publisher gateway connection is not configured.');
  const url = new URL('/v1/iq', base);
  if (url.protocol !== 'https:') throw new Error('The publisher must configure an HTTPS gateway.');
  url.searchParams.set('pairs', pairs.join(','));
  const response = await fetch(url, { headers:{Authorization:`Bearer ${token}`}, signal:AbortSignal.timeout(15000), redirect:'error' });
  if (!response.ok) throw new Error(`IQ gateway returned HTTP ${response.status}; no result event was charged.`);
  const body = await response.json();
  if (!Array.isArray(body.data) || body.data.length > pairs.length || body.data.some(r => !pairs.includes(r.pair) || !r.observation_id)) throw new Error('Unexpected IQ gateway response.');
  const usable = body.data.filter(r => typeof r.score === 'number');
  await Actor.setValue('AVAILABILITY', { unavailable_pairs:body.unavailable_pairs ?? [], source_warning:body.source_warning ?? null,
    unavailable_observations:body.data.filter(r => r.score === null), methodology_url:'https://vultax.com/methodology' });
  // SDK integrates event charging with dataset insertion and the user's spending limit.
  if (usable.length) await Actor.pushData(usable, 'iq-record');
});
