# UI feature: build a benchmark run explorer

Build a polished, responsive run explorer from the seeded fixture. It must let a
researcher filter sample benchmark runs, sort the visible results, and understand
the current subset without reading raw JSON.

Implement only these files:

- `benchmark/fixtures/T4-run-explorer/index.html`
- `benchmark/fixtures/T4-run-explorer/styles.css`
- `benchmark/fixtures/T4-run-explorer/run-explorer.mjs`
- `benchmark/fixtures/T4-run-explorer/student-tests.mjs`

Do not edit the committed `run-explorer.test.mjs` suite.

## Data and pure-function contract

Keep the supplied `sampleRuns` records and implement these exports in
`run-explorer.mjs`:

### `filterRuns(runs, filters)`

1. Throw `TypeError` when `runs` is not an array.
2. `filters` has `assistant` and `outcome` strings. The value `all` disables that
   filter; any other value is an exact, case-sensitive match.
3. Apply both filters together and return a new array without mutating the input
   array or its records.

### `sortRuns(runs, order)`

1. Throw `TypeError` when `runs` is not an array.
2. Return a new array without mutating the input array or its records.
3. Support these orders:
   - `score-desc`: higher score, then lower elapsed time, then lexicographically
     smaller `id`;
   - `time-asc`: lower elapsed time, then higher score, then smaller `id`;
   - `cost-asc`: known numeric costs before `null`, lower cost first, then higher
     score, then smaller `id`.
4. Throw `TypeError` for any unsupported order.

### `summarizeRuns(runs)`

1. Throw `TypeError` when `runs` is not an array.
2. Return exactly `visibleCount`, `passRatePct`, `medianElapsedSeconds`,
   `totalCostUsd`, and `costedRunCount`.
3. `passRatePct` is the percentage of records whose outcome is `pass`, rounded
   to one decimal place.
4. Median uses a numeric elapsed-time sort and averages the middle pair for an
   even count.
5. Total only numeric costs, avoid floating-point residue, and count how many
   runs have known costs. Empty inputs return zero for every field.
6. Do not mutate the input.

## Interface contract

- Use semantic HTML with one main heading and a short explanation that these are
  sample records, not final study results.
- Provide labeled native selects with these IDs:
  - `assistant-filter`: All assistants, Codex, Claude Code, OpenCode;
  - `outcome-filter`: All outcomes, Pass, Fail;
  - `sort-order`: Score (high to low), Time (fastest), Cost (known first).
- Provide a `Reset filters` button with ID `reset-filters`.
- Show four summary values with IDs `visible-count`, `pass-rate`, `median-time`,
  and `known-cost`. Make clear that unknown subscription costs are excluded.
- Render the visible records into `results-list`. Each record must visibly name
  the assistant, model, outcome text, score, elapsed seconds, and either a USD
  cost or `Subscription`.
- Put a concise result-count message in an `aria-live="polite"` status region.
- Include an initially hidden `empty-state`. When no records match, show it and
  leave the results list empty.
- Changing any select updates the records and summaries. Reset restores all
  filters and score sorting.
- Build result markup with safe DOM APIs such as `createElement` and
  `textContent`; do not assign record data through `innerHTML`.

## Visual and responsive contract

- Create an intentional visual hierarchy for the introduction, filter panel,
  summary values, and run records. Do not use inline styles or external assets.
- At desktop width, make efficient use of horizontal space. At 720 px or below,
  controls and results must reflow without horizontal page scrolling.
- Provide clear hover and `:focus-visible` states, readable contrast, visible
  outcome text in addition to color, and a `prefers-reduced-motion` rule.

## Tests and verification

Add at least two meaningful `node:test` cases to `student-tests.mjs`. Do not use
skips, todos, or placeholder assertions.

Run:

`node --test benchmark/fixtures/T4-run-explorer/run-explorer.test.mjs benchmark/fixtures/T4-run-explorer/student-tests.mjs`

In the final response, summarize the implementation, your added edge cases, the
test result, and any browser behavior you could not directly verify.
