# Domain worker: securitized-product trade capture

Implement the pure domain layer for the synthetic `/trade-capture` workspace.
Read `benchmark/projects/T7-securitized-trade-capture/PRODUCT.md` and
`benchmark/projects/T7-securitized-trade-capture/CONTRACT.md` first. The types
and exports are frozen. Do not add React, I/O, dependencies, or real data.

You may change only:

- `app/trade-capture/domain/calculations.ts`
- `app/trade-capture/domain/validation.ts`
- `app/trade-capture/domain/lifecycle.ts`
- `app/trade-capture/domain/seed.ts`
- `tests/trade-domain.test.mjs`

## Required behavior

- Current face is original face times factor. Gross principal is current face
  times price divided by 100. Buy exposure is positive and sell exposure is
  negative.
- Summary totals exclude cancelled records. Gross principal is the sum of
  absolute signed exposures; sell exposure remains negative. Count only error
  exceptions on non-cancelled records.
- Implement every frozen validation rule and exception code. A missing client
  trade ID is the only warning. Required text means non-blank after trimming.
- Use integer rounded cents for the one-cent allocation tolerance. Ignore an
  empty allocation list; non-empty allocations must all contain finite,
  non-negative values and total current face within one cent.
- `saveDraft`, `validateTradeRecord`, and `bookTrade` create a record when
  `existing` is null, using `context.id`, and preserve identity/history when
  editing. A creation appends `created` before the requested lifecycle action;
  an edit appends `updated` before it.
- `validateTradeRecord` stores all current exceptions. `bookTrade` revalidates
  and throws when an error exists. `cancelTrade` accepts only booked records.
  Lifecycle helpers return new records and never mutate inputs.
- Audit IDs and timestamps are deterministic from the supplied context. Do not
  call the clock, randomness, or UUID APIs.
- Provide exactly six clearly synthetic, immutable seed trades: one per product
  type, with unique IDs and fixed timestamps. Include booked and cancelled
  records plus at least one draft or validated record. Use fictional labels,
  not real client, account, or trader information.
- Expand the visible domain test with meaningful boundary and transition
  coverage. Do not weaken existing assertions.

Run only:

1. `node --test tests/trade-domain.test.mjs`
2. `npm run typecheck`
3. `npm run lint`

In the final response, state the changed files, checks run, and any remaining
domain limitation. Do not claim production, pricing, settlement, or regulatory
readiness.
