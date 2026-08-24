# Read-only change-impact analysis

Operations wants to add corrected trade events to the synthetic event fixture in
`benchmark/fixtures/T8-change-impact`.

Read these files:

- `change-request.md`
- `event-normalizer.mjs`
- `event-router.mjs`
- `event-store.mjs`
- `event-router.test.mjs`

Do not edit, create, rename, or delete files. Do not use the network, install
dependencies, change Git state, or start a service.

Return a memo below 1,000 words with these exact sections:

## Current flow

Trace normalization, duplicate detection, persistence, and publication using
concrete functions and files.

## Required changes

Identify the smallest code and contract surfaces a future implementation must
change. Resolve how the original and correction should coexist in audit history
without both contributing to the active result.

## Failure and replay risks

Identify at least four concrete risks, including publish failure and replay
behavior. Separate facts in the fixture from design recommendations.

## Verification plan

Give focused visible and private test cases. Include idempotency, missing target,
trade mismatch, publish failure, and input immutability.

## Recommendation

Give a concise implementation sequence and state the most important decision
that must be frozen before coding.
