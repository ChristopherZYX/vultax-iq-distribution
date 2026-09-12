# Vi IQ by Vultax

Retrieve crypto market-quality observations with six factor scores, coverage and source timestamps. Choose BTCUSDT, ETHUSDT or SOLUSDT. Export the result dataset as JSON or CSV in Apify.

**Release status:** source package prepared; the paid Actor is not yet published or connected to the production IQ reader.

An observation is a proprietary indicator from [Vultax's crypto methodology](https://vultax.com/methodology), not a forecast. `null` means unavailable. `freshness` uses source timestamps; a recent Actor run does not make an old source fresh. Model version remains null until the producer supplies a verified identifier. This is separate from the research-page IQ model.

## Publisher configuration

Use this subdirectory as the GitHub source context. Configure `VULTAX_GATEWAY_URL` and a dedicated `VULTAX_GATEWAY_TOKEN` as publisher secrets. They are never Actor inputs. Activate the `iq-record` pay-per-event item at **$0.01 per usable IQ observation**. Disable platform-usage add-ons if electing agent-payment compatibility. Verify the build, real source and spending-cap behavior before making the Actor public or enabling charges.

The `AVAILABILITY` output contains missing/unknown observations and source warnings without a result event. Records with a numeric score may be stale; the timestamps and freshness labels are preserved. An upstream failure before output produces no result charge.

[Apify monetization documentation](https://docs.apify.com/actors/publishing/monetize) · [Vultax](https://vultax.com/?utm_source=apify&utm_medium=integration&utm_campaign=vi_iq_launch)
