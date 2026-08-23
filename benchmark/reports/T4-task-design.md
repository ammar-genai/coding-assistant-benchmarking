# T4 task design and maintainer validation

Date: 2026-08-23

Task: `T4-run-explorer@1.0.0`

## Purpose

T4 is the first new complex task in the frontier-first program. It asks an
assistant to build a responsive benchmark run explorer from a deliberately
incomplete, dependency-free HTML, CSS, and JavaScript fixture.

The task measures all three primary harnesses on the same work:

- pure filtering, deterministic sorting, summaries, and input immutability;
- safe browser rendering and state updates;
- desktop and narrow-screen layout judgment;
- labels, live status, visible outcome text, focus behavior, and reduced motion;
- assistant-authored tests, verification discipline, file scope, and handoff.

Only four implementation files may change. The committed visible test is
read-only, and the answer-bearing private test stays outside Git history.

## Maintainer validation

A complete reference implementation was created locally, tested, browser
checked, and then removed. It passed:

- 6 of 6 visible and maintainer-authored tests;
- 7 of 7 private checks;
- assistant and outcome filters, combined-filter behavior, cost sorting,
  reset, summaries, and the empty state in a real browser;
- desktop layout at 1280 by 720 with three filter columns and two result
  columns;
- narrow layout at 390 by 844 with one filter and result column and no
  horizontal page overflow;
- keyboard focus returning to the assistant filter after reset; and
- browser console inspection with no warnings or errors.

The current committed candidate is intentionally restored to the incomplete
starter. Its visible suite fails four checks, as required for a valid seeded
benchmark task. The reference answer is not stored in a committed path.

## Grading boundary

The automated runner decides visible/private correctness and file scope. The
same external browser-QA checklist must be applied after each run patch is
reconstructed. Visual quality is graded from observable layout and usability,
not from whether an assistant happens to reproduce the maintainer's design.
