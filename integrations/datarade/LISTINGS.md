# Datarade provider and product copy

Status: prepared, not submitted. Use the $0/year commission-only plan (currently 30% commission). No paid membership is requested.

## Provider

Brand: **Vultax**

Website: https://vultax.com/?utm_source=datarade&utm_medium=marketplace&utm_campaign=vi_iq_launch

Description: Vultax builds crypto and prediction-market research tools. Its crypto Vi IQ model organizes market quality, liquidity, arbitrage, order flow, volatility and news evidence into source-reported factor scores. Data products preserve source timestamps, missing values and coverage so buyers can assess what was observed.

Required business details to supply: registered legal entity name, registration documents, registered business address/country, responsible contact and business email. Do not substitute a brand name for the registered entity or assert redistribution rights without the relevant contracts.

## Product 1: Vi IQ Crypto Market Quality API

**Description:** Retrieve a composite score and six factor scores for supported crypto pairs. JSON records include source timestamps, freshness, coverage, missing factors and producer-version status. Intended for research dashboards, evidence-aware screeners and analytics workflows. Scores are indicators, not forecasts or executable prices.

**Delivery:** REST JSON through the Vultax distribution gateway. Initial integration allowlist: BTCUSDT, ETHUSDT, SOLUSDT. Actual availability comes from service metadata. Refresh is bounded by source coverage and a 60-second gateway cache; this is not an exchange-tick feed or freshness SLA.

**Commercial setup:** API plans drafted at $49 and $149/month for defined record quotas. Enterprise use and redistribution need a separate offer. Do not publish paid availability until the live reader, seller account and billing are verified.

## Product 2: Vi IQ Observed Factor History

**Description:** Versioned observations retained by the distribution gateway, with explicit gaps and collection/source timestamps. Useful for studying indicator changes and auditing data availability.

**Delivery:** CSV/JSONL sample plus API history. No history predating actual collection will be reconstructed. The retention cap is 30 days; this does not imply 30 days are currently available. Listing waits for a real sample and verified producer version.

## Product 3: Crypto Evidence Coverage Observations

**Description:** Per-factor availability and age observations for Vi IQ inputs. Measures whether the gateway received usable, timestamped evidence. It does not measure exchange execution latency, trading profitability, or worldwide service uptime.

**Delivery:** CSV/JSONL with observation IDs, collection times, source times and missing-factor counts. Listing waits for a measured sample and selected-data licensing confirmation.

## Sample preparation

Run `npm run export:dataset` only once retained observations and producer versions exist. It writes to the ignored `private/dataset-export` directory and fails if there is no real versioned data. Review the sample's manifest before uploading it. Source-data licenses must permit the selected derived outputs and intended use.

[Provider application](https://providers.datarade.ai/apply) · [Publishing policies](https://datarade.ai/company/publishing-policies)
