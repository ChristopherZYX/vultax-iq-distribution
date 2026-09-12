---
language:
- en
license: cc-by-4.0
task_categories:
- text-classification
tags:
- synthetic
- data-quality
- provenance
- finance
- vultax
size_categories:
- n<1K
configs:
- config_name: default
  data_files:
  - split: test
    path: evidence-cases.jsonl
---

# Vi IQ Evidence Handling Cases

Twelve **synthetic, authored examples** for checking whether an assistant or API consumer handles missing scores, stale sources and unversioned models honestly. These are not observed crypto data, a trading benchmark or evidence of model performance.

Each case combines a score being present/missing, its source being fresh/stale/unknown, and a producer version being present/missing. `EXAMPLEUSDT` is an invented instrument. All scores and dates are illustrative. Expected labels describe the evidence-handling rule, not an investment action.

## Use

Load `evidence-cases.jsonl` as JSON Lines. Ask the system under test to describe each record. Evaluate whether it preserves null, identifies stale/unknown freshness, and refrains from comparing scores across unverified producer versions. A second observation with the same version is still required for a real historical comparison.

`expected_may_compare_model_history` means the current record has a usable version and score; it does not establish that a second comparable record exists. Future work can add independently reviewed examples. This small deterministic fixture set is insufficient to establish general reliability.

## Provenance and license

Created for Vultax's API integration work on 2026-09-13. No exchange feed, private account, wallet or personal information is included. The authored fixture dataset is offered under CC BY 4.0, with attribution to Vultax. This license applies to these synthetic fixtures, not the commercial IQ feed or third-party data.

[Vultax methodology](https://vultax.com/methodology?utm_source=huggingface&utm_medium=dataset&utm_campaign=vi_iq_launch) · [Gateway and integrations](https://github.com/ChristopherZYX/vultax-iq-distribution)

Actual historical samples will only be released from retained, versioned observations after their redistribution terms are confirmed. This repository does not claim that such a sample already exists.
