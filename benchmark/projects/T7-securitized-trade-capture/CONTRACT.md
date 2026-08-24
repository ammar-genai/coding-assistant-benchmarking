# Frozen distributed implementation contract

Contract version: `1.0.1`

Version 1.0.1 is a post-review correction. It adds the two date-required codes
already required by `PRODUCT.md`, prevents status regression after booking, and
keeps a validated ticket active for the next Book action.

This file incorporates the required changes from the Sol plan and Opus review.
Worker prompts may narrow it but may not contradict it.

## Baselines

- **B1:** stable types, route, package and TypeScript wiring, rendered assertions,
  and compiling worker stubs.
- **B2:** B1 plus the accepted Terra domain implementation and domain tests.
- Sonnet, Qwen, and Kimi each start from B2 in fresh isolated worktrees.

## Stable domain behavior

- Calculations and validation live only in the domain layer.
- Lifecycle helpers preserve the internal ID and append audit history.
- Booking revalidates and throws while any error exists.
- Validation does not write a validated record while an error exists.
- Cancellation throws unless the record is booked.
- Booked and cancelled records cannot return to draft or validated status.
- Validated records cannot return to draft; edits must be revalidated or booked.
- Cancelled records remain visible but do not contribute to summary totals.
- `signedExposure` uses gross principal: buys positive, sells negative.
- Sell exposure stays negative in `DeskSummary`.
- Allocation difference uses rounded integer cents with a tolerance of one cent.
- Allocations are read-only in the first mock. Seed trades may contain them;
  new tickets use an empty list.
- Empty-draft and seed timestamps are fixed strings. IDs and audit timestamps
  are created only inside explicit state actions.

## Stable state behavior

- State owns trades, draft, live exceptions, `editingTradeId`, selection,
  product/status filters, search, and sort.
- Reducer actions are `draft-changed`, `reset`, `save-draft`, `validate`,
  `book`, `edit`, `cancel`, `selected`, `product-filtered`,
  `status-filtered`, `searched`, and `sorted`. Lifecycle actions receive a
  caller-created `{ id, at }` context so the reducer itself stays deterministic.
- Editing loads the selected non-cancelled trade and preserves its ID/history.
  A booked record loads read-only; reset starts a new mutable ticket.
- Reset clears `editingTradeId` and restores the deterministic empty draft.
- Validate writes a validated record and leaves it active in the ticket for
  booking. Book revalidates, writes a booked record, and clears the ticket.
  Cancel preserves selection on the cancelled record.
- Reducer and selectors have no React import and are independently testable.
- Search covers internal ID, client trade ID, security ID, issuer/deal, and
  counterparty, case-insensitively.
- Sort order is stable and uses internal trade ID as the final tie-breaker.

## Stable accessibility behavior

- Ticket controls use `tc-field-{field}` IDs.
- Error messages use `tc-error-{field}` IDs.
- Error controls set `aria-invalid` and `aria-describedby`.
- Validation summary uses `role="status"` and live updates.
- Book is disabled while errors exist and shows a visible explanation.
- Blotter is a semantic table with a caption.
- The scroll wrapper is focusable, has `role="region"`, and has an accessible
  name.
- Each row has a selection button with `aria-pressed`.
- Route CSS contains no bare element selector, `:root`, or universal selector;
  every selector begins with `.tc-`.

## Stable exception ownership

Exception codes are stable in `domain/types.ts`. Version 1.0.1 added
`required-trade-date` and `required-settlement-date` to satisfy the existing
product requirement. Cross-field failures attach to:

- settlement ordering → `settlementDate`;
- modifier/product conflicts → `modifier`;
- agency requirement → `agency`;
- specified pool requirement → `poolNumber`;
- allocation mismatch → `allocations`.

## Stable file ownership

### Terra

- `app/trade-capture/domain/calculations.ts`
- `app/trade-capture/domain/validation.ts`
- `app/trade-capture/domain/lifecycle.ts`
- `app/trade-capture/domain/seed.ts`
- `tests/trade-domain.test.mjs`

### Sonnet

- `app/trade-capture/components/trade-ticket.tsx`

### Qwen

- `app/trade-capture/components/desk-insights.tsx`

### Kimi

- `app/trade-capture/trade-capture-app.tsx`
- `app/trade-capture/components/trade-blotter.tsx`
- `app/trade-capture/components/trade-review.tsx`
- `app/trade-capture/state/reducer.ts`
- `app/trade-capture/state/selectors.ts`
- `app/trade-capture/trade-capture.css`

### Sol integrator

- `app/trade-capture/domain/types.ts`
- `app/trade-capture/domain/index.ts`
- `app/trade-capture/page.tsx`
- `package.json`
- `tsconfig.json`
- `tests/rendered-html.test.mjs`

No implementation worker may change an integrator file or another worker's
file. Sol records every later repair to worker-owned code.

## Worker verification

- Terra: `node --test tests/trade-domain.test.mjs`, `npm run typecheck`, and
  `npm run lint`.
- Sonnet, Qwen, Kimi: `npm run typecheck` and `npm run lint`.
- No worker runs a build or uses the network.
- Final Sol integration runs the complete repository gate.
