# Feature: build an assistant comparison summary

Implement the comparison-summary feature in these files:

- `benchmark/fixtures/T3-comparison-summary/summarize-assistants.mjs`
- `benchmark/fixtures/T3-comparison-summary/render-comparison-table.mjs`

Also add at least two meaningful `node:test` cases to:

- `benchmark/fixtures/T3-comparison-summary/student-tests.mjs`

Do not edit the committed `comparison-summary.test.mjs` suite.

## `summarizeAssistants(runs)` contract

1. Throw `TypeError` when `runs` is not an array.
2. A run is eligible only when `status === "complete"`,
   `acceptance_status === "pass"`, and `comparison_eligible !== false`.
3. Validate eligible runs. `run_id` and `assistant` must be non-empty strings;
   `score` must be a finite number from 0 through 100; `elapsed_ms` must be a
   finite number greater than or equal to zero. Throw `TypeError` for invalid
   eligible data. Invalid fields on an ineligible run do not matter.
4. Group eligible runs by the exact, case-sensitive `assistant` value.
5. Return one object per assistant with exactly these fields:
   `assistant`, `run_count`, `best_score`, `best_run_id`, and
   `median_elapsed_ms`.
6. The best run has the highest score. Break a score tie using the lower elapsed
   time, then the lexicographically smaller `run_id` using normal JavaScript
   string comparison.
7. Median time uses all eligible runs for the assistant after a numeric sort. For
   an even count, average the two middle values.
8. Sort the returned summaries by `assistant` using normal JavaScript string
   comparison. Do not mutate the input array or its records.

## `renderComparisonTable(summaries)` contract

1. Throw `TypeError` when `summaries` is not an array or a summary has invalid
   fields. `assistant` and `best_run_id` must be non-empty strings; `run_count`
   must be a positive integer; `best_score` must be a finite number from 0
   through 100; and `median_elapsed_ms` must be a finite number greater than or
   equal to zero.
2. Preserve the supplied summary order.
3. Return this exact Markdown header:

   `| Assistant | Runs | Best score | Best run | Median time |`

   followed by:

   `|---|---:|---:|---|---:|`
4. Render median milliseconds as seconds with exactly three decimal places.
5. Escape `|` in assistant names and run IDs as `\|`.
6. For an empty array, render the two header lines, a blank line, and
   `_No eligible runs._`.

## Boundaries and verification

- Change only the three files named at the top of this prompt.
- Do not install dependencies, use the network, commit, or alter generated runs.
- Add at least two real tests; do not use `test.todo`, `test.skip`, or placeholder
  assertions.
- Run:
  `node --test benchmark/fixtures/T3-comparison-summary/comparison-summary.test.mjs benchmark/fixtures/T3-comparison-summary/student-tests.mjs`

In the final response, summarize the design, edge cases covered by your added
tests, and the verification result.
