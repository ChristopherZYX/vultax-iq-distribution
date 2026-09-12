# Vi IQ x402 / Bazaar adapter

Runnable source package for **$0.01 per returned IQ observation**. It defaults to Base Sepolia and test funds. It has not accepted a payment or been indexed by Bazaar.

Install with `npm ci --ignore-scripts` in this directory. Configure the five variables named in `server.mjs` through the hosting platform's private secrets interface. `X402_PAY_TO` must be an address controlled by the publisher; the server does not create a wallet. Only set `X402_ENVIRONMENT=production` after the owner has supplied the receiving address and authorized mainnet launch.

The adapter retrieves and validates one IQ observation before allowing payment processing. Once installed on public HTTPS, validate its unpaid 402 response and Bazaar metadata through [Coinbase's validation endpoint](https://docs.cdp.coinbase.com/x402/seller/get-discovered). Successful settlement triggers indexing; source code or a 402 response alone is not a listing. A real-money test payment is an owner action.

The underlying dedicated gateway account needs adequate credits for readiness reads as well as paid calls. A request returning only a missing score fails with 503 before settlement. `source_as_of`, model identity and missing factors are preserved. Scores are indicators, not forecasts.

[Official seller quickstart](https://docs.cdp.coinbase.com/x402/seller/quickstart) · [Vultax](https://vultax.com/?utm_source=x402&utm_medium=integration&utm_campaign=vi_iq_launch)
