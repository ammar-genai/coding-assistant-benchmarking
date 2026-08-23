# Securitized product trade capture mock

Project version: `1.0.0-draft`

Date: 2026-08-23

## Purpose

Build a polished, local-only mock trade-capture workspace for a securitized
products desk. It should demonstrate realistic domain structure, validations,
workflow, exception handling, and audit evidence without connecting to trading,
booking, regulatory, settlement, pricing, or client systems.

All records are synthetic. The application is a workflow demonstration, not a
system of record and not financial or regulatory advice.

## Users and primary flow

The primary user is a trader or trade-support analyst who needs to:

1. enter trade economics and security details;
2. see product-aware validation before booking;
3. save a draft or book a valid mock trade;
4. inspect a blotter of today's activity;
5. filter and sort the blotter;
6. open a trade to review economics, exceptions, allocations, and audit events;
7. cancel a selected mock trade while preserving its history; and
8. see desk-level totals and outstanding exceptions.

## Product coverage

The mock supports these desk categories:

- Agency RMBS;
- non-agency RMBS;
- CMBS;
- ABS;
- CLO; and
- TBA MBS.

The UI may expose more specific labels, but these six values are the stable
domain contract.

## Trade fields

### Core identity

- internal trade ID;
- client trade ID;
- trade status;
- execution timestamp;
- trade date;
- settlement date;
- side: buy or sell;
- product type;
- CUSIP or security identifier;
- issuer or deal name;
- tranche or class;
- counterparty;
- book;
- trader; and
- currency, fixed to USD for this mock.

### Economics

- original face;
- factor;
- current face;
- price as percent of par;
- gross principal amount;
- coupon;
- spread in basis points; and
- optional accrued interest.

### Securitized-product details

- agency;
- pool number;
- weighted-average life;
- collateral type;
- rating; and
- trade modifier: regular, specified pool, stipulation, dollar roll, or
  weighted-average price.

### Control and workflow

- exception list with severity;
- allocations that must total current face;
- audit events;
- free-text note; and
- synthetic-data marker.

## Stable calculations

- `current face = original face × factor`.
- `gross principal = current face × price / 100`.
- Buy exposure is positive and sell exposure is negative.
- Desk totals exclude cancelled trades.
- Values shown to users are formatted, but internal calculations retain full
  numeric precision.

## Validation rules

1. CUSIP/security identifier, counterparty, book, trader, product, side, trade
   date, settlement date, original face, factor, and price are required.
2. Original face must be greater than zero.
3. Factor must be greater than zero and no more than one.
4. Price must be greater than zero and no more than 250.
5. Settlement date cannot precede trade date. The mock does not hard-code a
   universal T+1 rule because securitized products can have product-specific
   conventions.
6. A nine-character uppercase alphanumeric value is accepted as the mock CUSIP
   shape. The application does not perform a real CUSIP check digit or master
   security lookup.
7. Agency RMBS and TBA MBS require an agency.
8. Specified-pool trades require a pool number.
9. Dollar-roll and stipulation modifiers are valid only for TBA MBS.
10. Weighted-average-price modifier is valid only for ABS or CMBS.
11. Allocations, when present, must total current face within one cent.
12. Booking is blocked by errors. Warnings remain visible but do not prevent
    booking.

## Status model

`draft → validated → booked → cancelled`

- Save draft may retain validation errors.
- Validate calculates fields and refreshes exceptions without booking.
- Book requires zero errors and records a booking audit event.
- Cancel is available only on a booked trade and records a cancellation event.
- Status transitions are local UI state and reset with a page reload.

## Seed data

Include at least six synthetic trades spanning all six product types. The data
should include:

- buys and sells;
- at least one warning;
- at least one draft;
- at least three booked trades;
- one cancelled trade; and
- different counterparties, books, traders, factors, prices, and modifiers.

Do not use real client names, trader names, account identifiers, or trade IDs.

## Required interface

The route is `/trade-capture` and should feel like a focused institutional
workflow rather than a generic consumer dashboard.

The first view must show:

- a plain synthetic-data notice;
- desk totals;
- the trade ticket;
- validation state;
- the blotter; and
- a selected-trade review panel.

Required interactions:

- create or edit a draft;
- validate;
- book a valid trade;
- reset the ticket;
- filter by product and status;
- search by ID, CUSIP, deal, or counterparty;
- sort at least by execution time, current face, and gross principal;
- select a blotter row; and
- cancel a booked trade.

The interface must remain usable at desktop and 390-pixel widths, use semantic
labels and buttons, provide visible keyboard focus, and avoid page-level
horizontal overflow. The blotter may scroll inside its own labelled container.

## Technical boundaries

- Preserve the existing Next/vinext application and benchmark dashboard.
- Add a separate `/trade-capture` route.
- Use React and TypeScript already present in the repository.
- Do not add dependencies.
- Use local component state only; no database, authentication, network calls,
  market data, real pricing, or file uploads.
- Keep the mock deterministic except for generated local trade IDs and audit
  timestamps.
- Add focused domain tests and rendered-HTML assertions.
- Do not deploy unless the user separately requests deployment.

## Distributed build roles

- Codex + GPT-5.6 Sol: architecture, task contracts, integration, and final
  verification.
- Claude Code + Opus 5: architecture challenge and final independent review.
- Codex + GPT-5.6 Terra: domain types, calculations, validation, and unit tests.
- Claude Code + Sonnet 5: accessible trade-ticket component.
- OpenCode + Qwen3.8-27B: bounded desk-insights component.
- OpenCode + Kimi K3: application state, blotter, selected-trade panel, and
  visual system.

Each implementation worker receives non-overlapping owned files. Frontier
integration may change worker files only to repair a verified integration or
acceptance failure, and every such edit must be reported.

## Acceptance gate

- Type checking, lint, production build, existing tests, domain tests, and
  benchmark contract validation pass.
- All required interactions are represented in product code and tested where
  practical without a browser.
- No existing benchmark route or evidence file is broken.
- Only preregistered project paths change during worker stages.
- Cost and token fields are labelled according to their actual access path.

## Domain references

The field selection is informed by FINRA's securitized-product TRACE material,
which includes security identifier, pool number for MBS, quantity/par, price,
factor, execution date/time, settlement date, side, modifiers, counterparty,
and client trade ID:

- https://www.finra.org/filing-reporting/trace/historic-file-layout-securitized-products
- https://www.finra.org/compliance-tools/report-center/trace/quality-of-markets-securitized-products
- https://www.finra.org/filing-reporting/market-transparency-reporting/trace/faq/reporting-mortgage-and-asset-backed-securities

This mock deliberately simplifies regulatory reporting and does not claim
TRACE compliance.
