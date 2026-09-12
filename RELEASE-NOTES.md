# Vi IQ distribution developer preview 0.1.0

Packages for RapidAPI, Apify, Postman, n8n, Datarade, Hugging Face and x402/Bazaar, backed by one authenticated gateway contract. The gateway adds record-based usage limits, shared caching, preserved source freshness and deduplicated observed history.

The code is public. The [Postman collection](https://www.postman.com/galactic-meadow-109643/vultax-developer-tools/collection/hhs5p3j/vultax-public-research-and-vi-iq-developer-preview) includes a live public research-feed request and the local IQ preview requests. Other marketplace packages are prepared, with account/terms, source access and paid activation steps recorded in [STATUS.md](STATUS.md).

[Hosted API documentation](https://documenter.getpostman.com/view/30539890/2sBYAytUCG) is published with no environment secrets.

The package has 16 passing focused tests, valid OpenAPI definitions and a successful real server-process smoke check. SDK imports and Apify source syntax were verified. Live IQ, paid Actor runs, x402 settlement and marketplace approvals have not been verified. No real historical IQ dataset is included; the Hugging Face fixture is explicitly synthetic.

Use Node.js 24+. No third-party runtime dependencies are needed for the gateway. Apify and x402 dependencies are isolated in their respective directories. Import files contain no credentials.
