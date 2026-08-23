# T5 task design and maintainer validation

Date: 2026-08-23

Task: `T5-review-queue@1.0.0`

## Purpose

T5 is the cross-layer feature in the frontier-first program. It asks an
assistant to complete a dependency-free run review queue across an in-memory
data store, request/response API boundary, safe server-rendered page, tests, and
operator documentation.

The task measures contract reasoning across layers rather than visual taste:

- insert-versus-update semantics, timestamps, copy isolation, and sorting;
- normalization, validation, response status, headers, filtering, and errors;
- user-facing HTML structure, accessibility landmarks, and output escaping;
- assistant-authored regression tests and operating-limit documentation; and
- file ownership, verification discipline, and final handoff.

Only five answer files may change. The committed visible suite is read-only,
and the answer-bearing private suite remains outside Git history.

## Maintainer validation

A complete reference implementation was created locally and then removed. It
passed:

- 7 of 7 visible and maintainer-authored tests;
- 7 of 7 private checks;
- create and update status behavior with preserved creation timestamps;
- deterministic filtering, summary, and copy-isolation checks;
- field-level validation, method, missing-resource, and missing-route errors;
- malicious dynamic HTML values without creating executable markup; and
- student-test and documentation-quality checks.

The committed candidate is intentionally restored to an incomplete starter.
Its visible suite fails, as required for an unseen seeded benchmark task. The
reference answer is not stored in a committed path.

## Distributed-workflow fit

The contract contains natural planning boundaries without allowing parallel
workers to evade integration work. The lead must define data and error shapes,
the reviewer can find cross-layer mismatches before implementation, the worker
must implement all layers consistently, and the final reviewers can test both
observable behavior and maintainability. A solo frontier control receives the
same frozen prompt and starter in a separate worktree.
