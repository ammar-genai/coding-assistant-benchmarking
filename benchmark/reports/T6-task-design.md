# T6 task design and maintainer validation

Date: 2026-08-23

Task: `T6-rejected-promise-cache@1.0.0`

## Purpose

T6 is the incident/debugging task in the frontier-first program. It presents a
configuration service that keeps returning an origin timeout after an
independent probe says the origin is healthy. The supplied log makes the
surface symptom look like a stale upstream or HTTP cache problem. The actual
defect is inside the process: an in-flight Promise is cached for request
coalescing and remains cached after it rejects.

The task measures whether an assistant can:

- reconcile tests, logs, API behavior, and implementation state;
- distinguish a useful successful-result cache from a rejected-load poison;
- make a narrow repair without disabling caching or adding blind retries;
- preserve same-tenant concurrency, tenant isolation, copy isolation, status
  codes, response headers, and explicit invalidation;
- handle the less obvious race where an old failed load must not delete a newer
  replacement; and
- add regression evidence plus a plain-language incident explanation.

Four answer files may change. The visible suite and incident log are read-only,
and the answer-bearing private suite remains outside Git history.

## Maintainer validation

A temporary reference repair was created locally and then removed. It used
identity-checked cleanup of only the rejected in-flight entry and passed:

- 8 of 8 visible and maintainer-authored tests;
- 8 of 8 private checks;
- retry after a transient `ConfigOriginError`;
- coalescing for concurrent waiters on the same rejected load;
- protection of a newer replacement from an old late rejection;
- retry after invalid origin data;
- tenant isolation, successful caching, copy isolation, and explicit clear;
- API recovery with unchanged status, content type, `no-store`, and
  `retry-after`; and
- student-test quality checks.

The committed candidate is intentionally restored to the failing starter. It
passes three of six visible checks and fails the transient-retry, API-recovery,
and placeholder-test checks. The reference answer is not stored in a committed
path.

## Why this is suitable for the next block

The code change can be small, but locating and proving it requires disciplined
debugging. An over-broad solution can easily make the visible retry pass by
turning off caching while violating concurrency and performance behavior. The
private replacement race also separates a plausible patch from a careful one.

Use subscription-backed Codex and Claude routes first. Do not start another
OpenRouter run under the current budget: cumulative spend is `$1.3764798` of
the approved `$1.50`, leaving only `$0.1235202`.
