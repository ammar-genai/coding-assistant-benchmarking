# Bug report: invalid runs appear in comparison reports

The comparison report is including failed, interrupted, and explicitly excluded
runs. Fix the selection logic in:

`benchmark/fixtures/T2-run-filter/select-comparison-runs.mjs`

A run is eligible only when all three rules are satisfied:

1. `status` is exactly `"complete"`.
2. `acceptance_status` is exactly `"pass"`.
3. `comparison_eligible` is not exactly `false`. A missing value is allowed.

Preserve the input order, return the original run objects, and do not mutate the
input array or records.

## Boundaries

- Change only `benchmark/fixtures/T2-run-filter/select-comparison-runs.mjs`.
- Do not edit tests, task definitions, the benchmark harness, or generated runs.
- Do not install dependencies, use the network, or commit changes.
- Run the visible test before finishing:
  `node --test benchmark/fixtures/T2-run-filter/select-comparison-runs.test.mjs`

In the final response, briefly state the root cause, the change, and the test
result.
