# Evidence and boundaries — 2026-09-13

## Product source

The existing authenticated route is `GET https://api.vultax.com/v1/crypto/{pair}/vi-iq`, with a batch reader at `/v1/crypto/vi-iq/batch`. An anonymous request returned HTTP 401 on 2026-09-13. The source contract exposes `pair`, `timestamp`, `as_of`, `score`, coverage, confidence and six named factors with nullable factor timestamps. It does not include a producer model version. The distribution contract therefore preserves null unless the operator configures a verified producer identifier. No real score or historical sample was obtained in this implementation session.

Adapter contract reference: Vultax's `vultax_contracts/crypto.py`, classes `ViIQFactor`, `ViIQFactors`, `ViIQResponse`, as present in the selected September 11 API component source. This validates field shape, not current production data or version identity.

The public methodology separates the crypto IQ model from the research-page model. This implementation uses the crypto field contract only. [Methodology](https://vultax.com/methodology)

## Marketplace references

- [RapidAPI proxy headers](https://docs.rapidapi.com/v2.0/docs/additional-request-headers): unique proxy-secret verification and subscription identity.
- [RapidAPI monetization](https://docs.rapidapi.com/docs/hub-listing-monetize-tab): custom counters and plan setup.
- [RapidAPI payouts](https://docs.rapidapi.com/docs/payouts-and-finance): 25% marketplace fee and payout setup.
- [Apify Actor schema](https://docs.apify.com/actors/development/actor-definition/actor-json) and [SDK pushData](https://docs.apify.com/sdk/js/reference/class/Actor): runnable package and event-based dataset insertion.
- [Apify monetization](https://docs.apify.com/actors/publishing/monetize): seller eligibility, charging and agent-payment constraints.
- [Postman public APIs](https://learning.postman.com/docs/postman-api-network/showcase/publish/public-apis): public workspace distribution.
- [n8n creator portal](https://creators.n8n.io/): template submission requires a creator account.
- [Datarade application](https://providers.datarade.ai/apply): registered business, distribution rights and commission-only plan. The observed form requests contact details, legal name, address, country and website, followed by data, compliance and documents.
- [Hugging Face dataset cards](https://huggingface.co/docs/hub/datasets-cards): metadata and discoverability.
- [Coinbase seller quickstart](https://docs.cdp.coinbase.com/x402/seller/quickstart) and [Bazaar discovery](https://docs.cdp.coinbase.com/x402/seller/get-discovered): SDK integration, validation and paid-settlement indexing.

## Claims deliberately left unverified

There is no claimed marketplace approval, paid subscription, payout, live x402 settlement, model-performance result, measured acquisition, backlink indexing, or domain-authority gain. Those require actual platform or traffic evidence. A public source repository and importable package are useful distribution assets; they are not proof of a live paid API.
