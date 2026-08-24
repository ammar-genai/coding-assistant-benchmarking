# Insights worker: securitized-product trade capture

Build the desk insights panel for the synthetic `/trade-capture` workspace.
Read the product brief and frozen contract first. This is intentionally a
small, bounded open-model task: render the summary you receive and nothing
else.

You may change only:

- `app/trade-capture/components/desk-insights.tsx`

## Required behavior

- Render all seven `DeskSummary` values: active trades, booked trades, error
  exceptions, buy exposure, sell exposure, net exposure, and gross principal.
- Use a labelled section and a clear heading. Group the metrics so their labels
  and values remain unambiguous to assistive technology.
- Format all exposures and principal as USD with no false cents. Preserve the
  supplied sign, including a negative sell exposure and potentially negative
  net exposure. Counts are plain localized integers.
- Use the existing `.tc-` class convention and provide useful class hooks for
  positive, negative, and alert values. Do not add inline styles.
- Do not import calculations, validation, lifecycle, state, or trade arrays.
  Do not derive totals, fetch data, mutate props, add dependencies, or edit any
  other file.

Run only `npm run typecheck` and `npm run lint`. In the final response, report
the changed file and check results. Do not claim browser verification.
