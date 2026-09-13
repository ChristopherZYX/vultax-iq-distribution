# Publication status

Updated 2026-09-13. The user approved RapidAPI/Apify terms, production gateway deployment and private IQ reader access, and supplied OmniOS OÜ / support@vultax.com as seller identity. [All launch links](LAUNCH.md).

| Surface | Current state | Remaining activation |
| --- | --- | --- |
| Shared Vi IQ gateway | [HTTPS metadata and real authenticated BTC/ETH/SOL responses verified](https://api.vultax.com/marketplace/v1/metadata) | Producer model version remains unavailable; score deltas remain null |
| GitHub distribution repository | [Public source verified](https://github.com/ChristopherZYX/vultax-iq-distribution) | Production remains a separate activation |
| RapidAPI | Signed in and terms accepted; new-API form prepared | API creation/import, proxy secret, quotas, pricing, payouts and marketplace verification |
| Apify | [Private Actor created from GitHub](https://console.apify.com/actors/1iEoeC66ymTd9Z6D0#/source); updated terms accepted | Hosted build/run, gateway publisher secret, seller eligibility and public Store publication |
| Postman | [Public workspace and six-request collection published and read back](https://www.postman.com/galactic-meadow-109643/vultax-developer-tools/collection/hhs5p3j/vultax-public-research-and-vi-iq-developer-preview) | Existing Postman IQ requests still use the older local preview URL; deployed definitions are ready in GitHub |
| n8n | Importable workflow with freshness/coverage filters prepared | Creator account sign-in, then submit for review |
| Datarade | Provider copy and three product drafts prepared; company/email supplied | Confirm registered address, data/compliance information and application documents |
| Hugging Face | 12 synthetic evidence cases and dataset card prepared | Account sign-in then publish dataset; real historical sample remains separate and unavailable |
| x402 / Bazaar | Seller adapter and discovery schemas implemented, dependencies installed | Owned receiving address, facilitator credentials, live reader, deployment, validation and owner-performed settlement |

No paid marketplace plans have been activated. The authenticated gateway is live. Chrome disconnected during seller setup, preventing the remaining browser forms from being completed.

Postman documentation is also published at https://documenter.getpostman.com/view/30539890/2sBYAytUCG with a search title, description and Vultax methodology link. Publication settings explicitly show **published**, with no environment values attached.

## Verification completed

Seventeen focused tests passed, including both OpenAPI imports, authentication, usage/batch billing, caching, stale/null preservation, source fallback notes and timezone handling, observed history, n8n filtering and synthetic labels. The deployed HTTPS metadata/schema, authenticated BTC/ETH/SOL, history and changes routes returned 200; anonymous IQ returned 401. The container reports healthy. Collection advanced naturally from 00:31 to 00:41 UTC on 13 September, with 33 observations at that recorded verification time. This dated count is not a promise of current coverage. No hosted Apify paid run or x402 payment was performed.

The producer supplies no model version, so comparison deltas remain null. Factor fallback notes are retained. The volatility source timestamp lacks a timezone, so its normalized time is null and freshness is unknown. The 30-day retention limit does not imply 30 days of history.

## Prepared launch economics

RapidAPI BASIC: free / 250 records. PRO: $49 / 10,000 records. ULTRA: $149 / 50,000 records. Hard quotas and plan-specific request/batch limits; no automatic overage spending. Apify and x402 draft rate: $0.01 per usable observation. These are prepared settings, not active subscriptions.

## Account and approval boundaries observed

RapidAPI and Apify terms were accepted after explicit user approval. n8n and Hugging Face still require sign-in; no authenticated Hugging Face CLI account was available. Datarade's registered-address question remains pending.

The approved deployment added an isolated gateway and only the `/marketplace/` ingress prefix. It uses the existing private reader credential for fixed, read-only IQ requests and separate consumer tokens. Runtime source: `8f62c1f45af0a8cbaed9cfb48cf1a9f555827ad7`. Existing application routes, workers and source databases were preserved.
