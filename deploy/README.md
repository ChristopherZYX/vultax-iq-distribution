# Scoped gateway deployment

The gateway is prepared for loopback port 3189 behind an HTTPS reverse proxy. These files have not been installed into production.

1. Provision a dedicated IQ reader credential authorized only for the source endpoints and assign a verified model-version identifier if the producer supports one. Keep both separate from consumer credentials.
2. Copy the source and configure `.env` privately, including a reviewed list of consumer key hashes. Mount the gateway's own persistent state volume. Use one replica for the SQLite-backed gateway; do not scale multiple containers against a shared SQLite file.
3. Start the selected isolated deployment. The service exposes no trading, account, position, raw-feed or administrative endpoints. Confirm `/v1/metadata` and an authenticated IQ request using `npm run verify:live`; inspect actual source times and missing factors.
4. Point an approved HTTPS hostname to port 3189. Configure reverse-proxy request limits for the unauthenticated metadata/schema endpoints as well as authenticated traffic. Record the verified URL in OpenAPI and marketplace packages with `PUBLIC_BASE_URL`, then run `npm run generate`.
5. Enable one real consumer or marketplace test client, verify plan limits, usage counters and errors. Only then activate paid plans and public marketplace listings. Confirm the selected data's resale/redistribution terms before distributing commercial samples.

Vultax's current remote workspace instructions require separate production-promotion authority. This repository changes no existing release pointer, systemd unit, database or secret. The source can be reviewed before that approval.
