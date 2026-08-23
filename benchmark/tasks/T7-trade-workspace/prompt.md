# Workspace worker: securitized-product trade capture

Build the interactive application, state, blotter, review panel, and responsive
visual system for the synthetic `/trade-capture` route. Read the product brief,
frozen contract, domain types, and owned stubs first. Consume the finished
domain and the separately owned ticket/insights interfaces; do not duplicate
their work.

You may change only:

- `app/trade-capture/trade-capture-app.tsx`
- `app/trade-capture/components/trade-blotter.tsx`
- `app/trade-capture/components/trade-review.tsx`
- `app/trade-capture/state/reducer.ts`
- `app/trade-capture/state/selectors.ts`
- `app/trade-capture/trade-capture.css`

## Reducer and selector behavior

- Keep the frozen state shape and action names. `draft-changed` refreshes live
  exceptions. `reset` restores a copied deterministic empty draft and clears
  editing state and exceptions.
- `save-draft`, `validate`, and `book` use the corresponding domain lifecycle
  function with the supplied context, replace an edited record or append a new
  one, select the result, then reset the edit/draft area. Booking errors may
  propagate because the UI prevents the action while errors exist.
- `edit` loads a non-cancelled record into a clean `TradeDraft`, preserves its
  internal ID through `editingTradeId`, and refreshes exceptions. `cancel`
  calls the domain helper, preserves the record and its selection, and cannot
  delete history.
- Search internal/client trade IDs, security ID, deal, and counterparty without
  case sensitivity. Apply product and status filters together. Implement all
  three sorts, descending, with internal trade ID as the deterministic final
  tie-breaker. Selectors and reducer remain pure and import no React.
- `selectDeskSummary` summarizes all records, not the filtered subset.

## Application behavior

- Compose the existing `TradeTicket` and `DeskInsights` with your blotter and
  review. The first render must keep the synthetic notice, totals, ticket,
  validation status, blotter, and selected-record panel visible.
- Dispatch IDs and ISO timestamps only when a user triggers a lifecycle action.
  Use browser-native APIs; do not add dependencies. A small local synthetic ID
  format is enough.
- Validation summary uses `role="status"` and explains error versus warning
  counts. Do not calculate or validate in the component.

## Blotter and review behavior

- Render all six product and four status filter choices, search, and all three
  sorts. Use a semantic table with caption. Its horizontal scroll wrapper must
  be focusable, `role="region"`, and labelled. Row selection is a real button
  with `aria-pressed`.
- Show useful identity, side, execution, current face, price, principal, and
  status columns with readable number/date formatting.
- Review shows selected trade identity, status, economics, exceptions,
  read-only allocations, notes, and complete audit history. Editing is allowed
  only when not cancelled. Cancellation is enabled only when booked and has a
  plain visible explanation otherwise.

## Visual system

- Make the route feel like a focused institutional control surface, with a
  strong hierarchy, compact readable data, visible status treatments, and
  clear focus states. Keep it distinct from the benchmark dashboard.
- Every CSS selector must begin with `.tc-`; no `:root`, universal selector,
  bare element selector, global reset, or dashboard selector is allowed.
- Keep the page usable at desktop and 390 pixels without page-level horizontal
  overflow. The blotter may scroll only inside its labelled region. Include a
  breakpoint no wider than 760 pixels and visible `:focus-visible` styling.
- Do not add assets, dependencies, data persistence, network behavior, inline
  styles, or real financial/client information.

Run only `npm run typecheck` and `npm run lint`. In the final response, report
changed files, check results, and any remaining limitation. Do not claim
browser verification or production readiness.
