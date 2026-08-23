# Frontier architecture plan

Planner: Codex + GPT-5.6 Sol

Run ID: `2026-08-23T21-56-20.470Z_codex_T7-trade-capture-plan`

Elapsed: `203.673 seconds`

Status: read-only pass; prompt hash matched; no workspace changes

## Product interpretation

The `/trade-capture` workspace supports a local lifecycle: enter or edit a
draft, validate and calculate economics, save or book, filter and select from
today's blotter, review economics, exceptions, allocations, and audit history,
then cancel booked trades without deleting history.

Simplifying assumptions:

- USD only, local React state, and no external data.
- The six stable product identifiers are `agency-rmbs`, `non-agency-rmbs`,
  `cmbs`, `abs`, `clo`, and `tba-mbs`.
- Dates use ISO `YYYY-MM-DD`; timestamps use ISO strings. There is no holiday
  calendar or settlement-convention engine.
- Blank numeric form values use `null`. Calculations retain number precision
  and formatting occurs only in components.
- A missing optional client trade ID creates a warning, not an error.
- Allocation tolerance is one cent. Cancelled trades remain visible and are
  excluded from desk totals.

## Architecture

Add a separate route and keep the benchmark dashboard unchanged:

```text
app/trade-capture/page.tsx
└── TradeCaptureApp
    ├── DeskInsights
    ├── TradeTicket
    ├── validation summary
    ├── TradeBlotter
    └── TradeReview
```

`page.tsx` is a server route shell that imports route-specific CSS and the
client application. `TradeCaptureApp` owns a reducer containing trades, the
ticket draft, selected trade ID, filters, search, and sort. There are no server
actions, storage APIs, network calls, or database calls.

Pure domain code lives under `app/trade-capture/domain/` with no React imports.
Route styles use `tc-` prefixed selectors below `.tc-shell` so they do not
change the existing dashboard in `app/globals.css`.

## Stable contracts

```ts
export type ProductType =
  | "agency-rmbs"
  | "non-agency-rmbs"
  | "cmbs"
  | "abs"
  | "clo"
  | "tba-mbs";

export type TradeStatus = "draft" | "validated" | "booked" | "cancelled";
export type Side = "buy" | "sell";
export type TradeModifier =
  | "regular"
  | "specified-pool"
  | "stipulation"
  | "dollar-roll"
  | "weighted-average-price";
export type ExceptionSeverity = "error" | "warning";

export interface AllocationInput {
  id: string;
  label: string;
  currentFace: number | null;
}

export interface Allocation {
  id: string;
  label: string;
  currentFace: number;
}

export interface TradeException {
  code: string;
  severity: ExceptionSeverity;
  field: keyof TradeDraft | "allocations";
  message: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  action: "created" | "draft-saved" | "validated" | "booked" | "cancelled";
  detail: string;
}

export interface TradeEconomics {
  currentFace: number;
  grossPrincipal: number;
  signedExposure: number;
}

export interface TradeDraft {
  internalTradeId: string | null;
  clientTradeId: string;
  executionTimestamp: string;
  tradeDate: string;
  settlementDate: string;
  side: Side;
  productType: ProductType;
  securityId: string;
  issuerDeal: string;
  trancheClass: string;
  counterparty: string;
  book: string;
  trader: string;
  currency: "USD";
  originalFace: number | null;
  factor: number | null;
  price: number | null;
  coupon: number | null;
  spreadBps: number | null;
  accruedInterest: number | null;
  agency: string;
  poolNumber: string;
  weightedAverageLife: number | null;
  collateralType: string;
  rating: string;
  modifier: TradeModifier;
  allocations: AllocationInput[];
  note: string;
}

export type Trade = Omit<TradeDraft, "internalTradeId" | "allocations"> & {
  internalTradeId: string;
  status: TradeStatus;
  allocations: Allocation[];
  economics: TradeEconomics;
  exceptions: TradeException[];
  auditEvents: AuditEvent[];
  synthetic: true;
};

export interface DeskSummary {
  activeTradeCount: number;
  bookedTradeCount: number;
  exceptionCount: number;
  buyExposure: number;
  sellExposure: number;
  netExposure: number;
  grossPrincipal: number;
}
```

Domain exports:

```ts
calculateEconomics(
  originalFace: number,
  factor: number,
  price: number,
  side: Side,
): TradeEconomics;

validateTrade(draft: TradeDraft): TradeException[];

materializeTrade(
  draft: TradeDraft,
  context: { id: string; status: TradeStatus; at: string },
): Trade;

summarizeDesk(trades: readonly Trade[]): DeskSummary;

EMPTY_TRADE_DRAFT: Readonly<TradeDraft>;
SEED_TRADES: readonly Trade[];
```

Component props:

```ts
export interface TradeTicketProps {
  draft: TradeDraft;
  exceptions: readonly TradeException[];
  onChange(next: TradeDraft): void;
  onSaveDraft(): void;
  onValidate(): void;
  onBook(): void;
  onReset(): void;
}

export interface DeskInsightsProps {
  summary: DeskSummary;
}

export interface TradeBlotterProps {
  trades: readonly Trade[];
  selectedTradeId: string | null;
  product: ProductType | "all";
  status: TradeStatus | "all";
  search: string;
  sort: "execution-desc" | "current-face-desc" | "gross-principal-desc";
  onProductChange(value: ProductType | "all"): void;
  onStatusChange(value: TradeStatus | "all"): void;
  onSearchChange(value: string): void;
  onSortChange(value: TradeBlotterProps["sort"]): void;
  onSelect(id: string): void;
}

export interface TradeReviewProps {
  trade: Trade | null;
  onEditDraft(id: string): void;
  onCancel(id: string): void;
}
```

## File ownership

- GPT-5.6 Terra owns:
  `app/trade-capture/domain/types.ts`, `calculations.ts`, `validation.ts`,
  `seed.ts`, `index.ts`, and `tests/trade-domain.test.ts`.
- Sonnet 5 owns:
  `app/trade-capture/components/trade-ticket.tsx`.
- Qwen3.8-27B owns:
  `app/trade-capture/components/desk-insights.tsx`.
- Kimi K3 owns:
  `app/trade-capture/trade-capture-app.tsx`,
  `app/trade-capture/components/trade-blotter.tsx`,
  `app/trade-capture/components/trade-review.tsx`, and
  `app/trade-capture/trade-capture.css`.
- GPT-5.6 Sol integrator owns:
  `app/trade-capture/page.tsx`, `package.json`, and
  `tests/rendered-html.test.mjs`.

No worker may modify another worker's files, existing dashboard files,
lockfiles, benchmark evidence, configuration, or integrator-owned files.

## Worker tasks

### Terra domain worker

Implement every product rule, calculation, immutable seed fixtures, all-six
product coverage, and boundary/status tests. It may run the domain test,
typecheck, and lint. It must not add UI or dependencies.

### Sonnet ticket worker

Build a fully labelled form using semantic fieldsets, inputs, selects, inline
error associations, and real buttons. Book is disabled when errors exist. It
must not calculate, validate, own global state, or style other panels.

### Qwen insights worker

Render only the supplied `DeskSummary` with clear signed and currency
formatting and meaningful headings. It must not derive totals, mutate data, or
expand into application state.

### Kimi application worker

Implement reducer-driven lifecycle, filtering, search, sorting, row selection,
cancellation history, review, and the responsive visual system. It consumes
domain functions rather than duplicating rules and must not alter the ticket or
insights components.

## Integration sequence

1. Apply Terra's patch and run its domain tests.
2. Freeze the domain export surface.
3. Apply Sonnet and Qwen without changing their files.
4. Apply Kimi's application and styles.
5. Add the Sol-owned route, test-script wiring, and rendered assertions.
6. Run the complete gate.

For an interface mismatch, record the declared contract and the worker output
that disagree. Prefer adapting the consumer in its owning patch. If acceptance
requires an integrator edit to worker-owned code, make the smallest repair,
rerun that worker's checks, and report the file and original failure. Do not
silently normalize a patch or report it as independently passing.

## Verification

The domain worker tests calculation precision, signed exposure, required
fields, numeric bounds, identifier shape, date ordering, agency and modifier
rules, allocation tolerance, warnings, cancelled-trade exclusion, and seed
coverage.

Final integrated gate:

1. `node --test tests/trade-domain.test.ts`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run build`
5. `node --test tests/rendered-html.test.mjs`
6. `npm run benchmark:validate`
7. `npm run verify`

Rendered assertions request both `/` and `/trade-capture`, preserve existing
dashboard assertions, and verify the synthetic notice, totals, ticket,
validation region, blotter, review heading, and seed records.

Manual checks cover workflow actions, keyboard use, focus visibility, error
association, cancellation history, sorting, filters, search, reload reset,
console errors, desktop layout, and 390-pixel layout without page overflow.

## Risks and review focus

1. Floating-point and blank-number handling could violate precise calculations
   or allocation tolerance.
2. Product/modifier validation and lifecycle transitions could diverge between
   domain code and reducer logic.
3. Seed data could accidentally resemble real clients, traders, accounts, or
   regulated records.
4. Cross-worker contract or CSS drift could yield a type-correct but inaccessible
   UI.
5. Hydration, timestamps, responsive tables, or route styles could break
   rendered HTML, mobile usability, or the existing dashboard.
