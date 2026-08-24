# Diagnose and repair the event projector

The synthetic trade event projector in
`benchmark/fixtures/T10-event-projector/event-projector.mjs` fails after a
temporary persistence rejection and also blocks unrelated trades behind one
global queue.

Repair it, replace `student-tests.mjs` with at least four meaningful regression
tests, and complete `INCIDENT.md`.

## Required behavior

- `createEventProjector(applyToStore)` returns `project(event)` and
  `getSnapshot(tradeId)`.
- Events for one trade are applied serially in call order. Different trades
  must be able to make progress concurrently.
- The first accepted event is `CREATED` at version 1. Later accepted events use
  exactly the current version plus one.
- Duplicate or stale versions return the current snapshot without persisting.
- A version gap or an invalid first event rejects without changing state.
- A `CANCELLED` trade is terminal and rejects a later new version.
- State commits only after `applyToStore` succeeds. A rejection must not poison
  later work for that trade or another trade.
- `CREATED` requires positive finite `notional` and non-empty `owner`.
  `AMENDED` may replace either field but must leave a valid complete state.
- Supported types are `CREATED`, `AMENDED`, and `CANCELLED`; malformed events
  reject with `TypeError`.
- Inputs, callback values, returned states, and snapshots must not expose
  mutable internal state.

## Boundaries

- Change only `event-projector.mjs`, `student-tests.mjs`, and `INCIDENT.md` in
  this fixture.
- Do not edit the committed test, task definitions, harness files, or generated
  evidence.
- Do not install dependencies, use the network, add sleeps or retry loops,
  commit, or start a service.
- Run:
  `node --test benchmark/fixtures/T10-event-projector/event-projector.test.mjs benchmark/fixtures/T10-event-projector/student-tests.mjs`

The final response must state the root cause, repair, tests added, visible test
result, and remaining risk.
