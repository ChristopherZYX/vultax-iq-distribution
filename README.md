# Vi IQ by Vultax — distribution gateway

One API implementation and launch packages for **RapidAPI, Apify, Postman, n8n, Datarade, Hugging Face and x402/Bazaar**.

The gateway wraps Vultax's authenticated crypto Vi IQ response, preserving its composite score, six factors, source timestamps, missing values and coverage. It adds bounded shared caching, consumer authentication, per-record usage accounting and an archive of observations collected after startup. It does not recompute the IQ model.

**The HTTPS gateway is deployed:** [coverage metadata](https://api.vultax.com/marketplace/v1/metadata) and [OpenAPI](https://api.vultax.com/marketplace/openapi.json) are public. Authenticated BTC, ETH and SOL observations were verified on 13 September 2026. Marketplace subscriptions are not activated. [Launch links](LAUNCH.md) and [publication status](STATUS.md) distinguish deployed software, private Actors and public listings. The [existing public research plugin](https://github.com/ChristopherZYX/vultax-research-plugin) and [research feed](https://vultax.com/feed.xml) are also public.

[Public API documentation on Postman](https://documenter.getpostman.com/view/30539890/2sBYAytUCG) · [Postman collection](https://www.postman.com/galactic-meadow-109643/vultax-developer-tools/collection/hhs5p3j/vultax-public-research-and-vi-iq-developer-preview)

## Run

Node.js 24 or later is required; the gateway uses Node's SQLite library and has no third-party runtime dependencies.

```sh
npm ci --ignore-scripts
npm test
npm run generate
npm start
```

Read `http://127.0.0.1:3189/v1/metadata` and `/openapi.json`. Without credentials, the gateway responds honestly that its upstream is not configured and protected IQ requests require authentication. Configure the variables documented in [.env.example](.env.example) through the deployment's private environment. To load a local environment file explicitly, use `node --env-file=.env src/server.mjs`.

Use a dedicated, read-only Vultax IQ credential for `VULTAX_UPSTREAM_KEY`. Do not use a browser session cookie, put keys in URLs, or publish the environment file. Consumer credentials contain SHA256 key hashes in `API_CLIENTS_JSON`. RapidAPI has a separate unique proxy secret. Caller-supplied plan headers are trusted only after that secret is verified.

## API

| Route | Purpose |
| --- | --- |
| `GET /v1/metadata` | Supported pairs, source configuration and observed history coverage |
| `GET /v1/iq/BTCUSDT` | One score, factors and provenance |
| `GET /v1/iq?pairs=BTCUSDT,ETHUSDT` | Bounded batch |
| `GET /v1/iq/BTCUSDT/history` | Retained observations in a collection-time range |
| `GET /v1/iq/BTCUSDT/changes` | Compare endpoints only with a verified common producer version |

See [OpenAPI](openapi.json) for schemas and authentication. Source coverage starts with BTCUSDT, ETHUSDT and SOLUSDT; the operator can expand the verified allowlist to 25 pairs. Quotas count numeric-score records returned, including repeated reads. Direct-client monthly counters use UTC calendar months; RapidAPI owns marketplace billing cycles and must enforce the configured hard Records quota.

History records are deduplicated by content identity. Collection began on 13 September 2026; the default 30-day retention is a maximum, not an assertion that 30 days exist. `source_as_of`, `upstream_timestamp` and `collected_at` stay separate. A source timestamp is not inferred from the latest request time. A timestamp without an explicit timezone is preserved in `source_as_of_raw`, while normalized time remains null and freshness is unknown. Producer notes preserve fallback and stale-input warnings. A missing producer version stays null and prevents score-delta claims.

## Integrations

| Channel | Package |
| --- | --- |
| RapidAPI | [OpenAPI](integrations/rapidapi/openapi.json), [plans and copy](integrations/rapidapi/LISTING.md) |
| Apify | [Actor source, schemas and event pricing](integrations/apify/) |
| Postman | [Collection](integrations/postman/collection.json) and blank private-token [environment](integrations/postman/environment.json) |
| n8n | [Importable workflow](integrations/n8n/vi-iq-screen.json) |
| Datarade | [Provider copy and three product drafts](integrations/datarade/LISTINGS.md) |
| Hugging Face | [Twelve synthetic evidence-handling cases and dataset card](integrations/huggingface/) |
| x402 / Bazaar | [Payment adapter and discovery metadata](integrations/x402/) |

The Hugging Face sample is an authored software-evaluation fixture, clearly labelled synthetic. It is not historical crypto data. `npm run export:dataset` prepares a separate real-data sample only when retained observations have verified model versions. It never uploads that sample automatically.

## Deployment boundary

This source repository is independent of the Vultax application and data workers. [The deployment package](deploy/) runs a single gateway process with a persistent volume. Public launch requires a dedicated IQ reader connection and verified HTTPS hosting. Existing terminal, API, workers, billing and source databases need no replacement to run the adapter. Neither Datarade nor the API sales material asserts raw exchange-feed redistribution rights.

[Vultax methodology](https://vultax.com/methodology?utm_source=github&utm_medium=integration&utm_campaign=vi_iq_launch) · [Sources and implementation evidence](EVIDENCE.md)
