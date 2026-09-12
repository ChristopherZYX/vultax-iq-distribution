# Crypto Market Quality & Liquidity API — Vi IQ by Vultax

Source package prepared. The RapidAPI listing is not yet created.

## Description

Add Vi IQ crypto observations to a dashboard, screener or research workflow. Retrieve the composite score and six factor scores with coverage, missing values and original source times. Check whether evidence is current before using it.

The crypto model covers market quality, liquidity health, arbitrage potential, order flow, volatility and news sentiment. It differs from the IQ model on Vultax's research pages. The gateway preserves source-reported scores and does not make a fresh model call per request. Scores are indicators, not predictions or trade execution.

Initial supported pairs: BTCUSDT, ETHUSDT, SOLUSDT, subject to source availability. `/v1/metadata` reports the active allowlist. Unavailable values remain null. Historical endpoints contain only observations actually retained by the gateway, with explicit model-version status. No complete historical coverage or uptime SLA is advertised.

## Import and billing

Import `openapi.json`, then replace the local URL with the verified production HTTPS gateway URL. Set the gateway's `RAPIDAPI_PROXY_SECRET` to the listing's unique Security-tab value. Keep it server-side. Do not expose the Vultax upstream key in the definition or consumer examples.

Configure a custom quota named **Records**, with usage supplied by the response header `X-RapidAPI-Billing: Records=N`. Set hard quotas and no overage purchases for launch. A batch counts each returned observation with a numeric score. Unknown observations and errors have zero record charge. Rate limits apply to requests as well.

| Plan | Monthly price | Records/month | Requests/min | Batch | History |
| --- | ---: | ---: | ---: | ---: | --- |
| BASIC | $0 | 250 | 6 | 1 | No |
| PRO | $49 | 10,000 | 30 | 3 | No |
| ULTRA | $149 | 50,000 | 60 | Up to 25 supported pairs | Observed records only |

The initial three-pair allowlist applies to all plans. ULTRA's main initial difference is usage and observed history. Defer paid activation if no meaningful history is available. The terminal subscription and marketplace API subscription are separate entitlements; do not promise either includes the other.

RapidAPI's documented marketplace fee is 25% before additional payout fees. Verify PayPal payout setup and seller eligibility before enabling subscriptions. At listed prices, gross provider receipts before payout/hosting costs are $36.75 and $111.75 per monthly subscriber.

Resource links: [Methodology](https://vultax.com/methodology?utm_source=rapidapi&utm_medium=marketplace&utm_campaign=vi_iq_launch), [Code and integrations](https://github.com/ChristopherZYX/vultax-iq-distribution).

[Billing configuration](https://docs.rapidapi.com/docs/hub-listing-monetize-tab) · [Payout terms](https://docs.rapidapi.com/docs/payouts-and-finance) · [Proxy authentication](https://docs.rapidapi.com/v2.0/docs/additional-request-headers)
