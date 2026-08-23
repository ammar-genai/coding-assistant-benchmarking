# Read-only architecture review

Review the proposed architecture for the synthetic securitized-product trade
capture project.

Read:

- `benchmark/projects/T7-securitized-trade-capture/PRODUCT.md`
- `benchmark/projects/T7-securitized-trade-capture/ARCHITECTURE-SOL.md`
- the existing application, TypeScript, package-script, and rendered-test files
  necessary to validate claims.

This is read-only. Do not edit, create, rename, or delete files. Do not use the
network, install dependencies, change Git state, start a service, or inspect
`benchmark/private` or `benchmark/runs`.

The implementation will be distributed across GPT-5.6 Terra, Claude Sonnet 5,
Qwen3.8-27B, and Kimi K3, then integrated by GPT-5.6 Sol. Your job is to find
problems before worker prompts and stubs are frozen.

Return a concise report with these exact sections:

## Verdict

Use `approve`, `approve with required changes`, or `reject`, followed by a
two-sentence explanation.

## Required contract changes

List only issues that could cause incorrect behavior, incompatible patches,
ungradeable work, accessibility failure, or hidden frontier repair. For each,
give the exact contract change.

## Domain review

Check calculations, status transitions, validation ownership, allocation
handling, synthetic seed rules, identifier handling, and cancelled-trade
totals.

## Component and state review

Check props, reducer ownership, form semantics, error association, blotter
filter/sort behavior, selection, cancellation, and route isolation.

## Worker isolation review

Check whether all four workers can start from one committed baseline without
overlapping files or relying on files another worker has not yet implemented.
Give a corrected sequencing rule when needed.

## Verification gaps

List missing objective tests or rendered assertions. Distinguish automated
checks from later manual interaction checks.

## Optional improvements

List no more than five improvements that are useful but not required for the
first mock.

Keep the entire response below 1,600 words. Cite concrete file paths when a
claim depends on the current repository.
