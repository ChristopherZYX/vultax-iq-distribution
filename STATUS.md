# Publication status

Updated 2026-09-13. A built file, published source repository, draft listing and working paid marketplace product are distinct states.

| Surface | Current state | Remaining activation |
| --- | --- | --- |
| Shared Vi IQ gateway | Implemented; local contract and access tests pass | Dedicated IQ reader credential, live model identity, approved HTTPS deployment and real-data verification |
| GitHub distribution repository | [Public source verified](https://github.com/ChristopherZYX/vultax-iq-distribution) | Production remains a separate activation |
| RapidAPI | OpenAPI, pricing quotas and listing copy prepared | Sign-in explicitly accepts RapidAPI terms; listing, proxy secret and payout setup then production verification |
| Apify | Runnable Actor, input/output schemas and result-event pricing prepared | Existing Chris account found; updated terms acceptance blocks continued use, then import/build, gateway secret and seller eligibility |
| Postman | [Public workspace and six-request collection published and read back](https://www.postman.com/galactic-meadow-109643/vultax-developer-tools/collection/hhs5p3j/vultax-public-research-and-vi-iq-developer-preview) | Paid IQ calls still target the local developer preview; private-token environment is not published |
| n8n | Importable workflow with freshness/coverage filters prepared | Creator account sign-in, then submit for review |
| Datarade | Provider copy and three scoped product drafts prepared | Legal entity/address/contact, distribution rights and real measured sample, then provider application |
| Hugging Face | 12 synthetic evidence cases and dataset card prepared | Account sign-in then publish dataset; real historical sample remains separate and unavailable |
| x402 / Bazaar | Seller adapter and discovery schemas implemented, dependencies installed | Owned receiving address, facilitator credentials, live reader, deployment, validation and owner-performed settlement |

No paid plans have been activated and no live IQ data has been redistributed. The existing Vultax public research plugin and feed remain usable while the commercial API is being connected.

## Verification completed

Sixteen focused tests passed, including both OpenAPI imports, authentication, usage/batch billing, concurrent cache behavior, stale/null preservation, observed-only history, n8n filtering and synthetic dataset labels. An actual server process also passed metadata, protected-route and schema smoke checks. Apify source syntax and x402 SDK imports/discovery declaration were checked. Neither a hosted Apify paid run nor an x402 payment was performed. The public research feed returned HTTP 200; production IQ correctly rejected an anonymous request with HTTP 401.

## Prepared launch economics

RapidAPI BASIC: free / 250 records. PRO: $49 / 10,000 records. ULTRA: $149 / 50,000 records. Hard quotas and plan-specific request/batch limits; no automatic overage spending. Apify and x402 draft rate: $0.01 per usable observation. These are prepared settings, not active subscriptions.

## Account and approval boundaries observed

RapidAPI's Google/GitHub login page states that pressing the button accepts its Terms of Service. Apify displays an updated-terms notice stating continued use accepts its General Terms, Actor Terms and Data Processing Addendum. Those actions were left pending. n8n and Hugging Face require sign-in. Datarade requires company and compliance information that is not supplied by the Vultax brand name alone.

Remote Vultax `/root/AGENTS.md` requires separate explicit authority for production promotion/mutation and canonical secret access. Production deployment and credential connection are pending that authority; no existing runtime or secrets were changed.
