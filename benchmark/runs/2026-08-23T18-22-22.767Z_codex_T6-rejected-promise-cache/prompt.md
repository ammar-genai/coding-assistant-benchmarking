# Incident task: recover config reads after a transient origin failure

Investigate and repair the configuration-read incident in
`benchmark/fixtures/T6-rejected-promise-cache`. A healthy origin probe appears
between failed requests, but the application continues returning the original
timeout. Use the committed tests, `incident.log`, and implementation to prove
the root cause before changing code.

You may edit only:

- `benchmark/fixtures/T6-rejected-promise-cache/config-cache.mjs`
- `benchmark/fixtures/T6-rejected-promise-cache/config-api.mjs`
- `benchmark/fixtures/T6-rejected-promise-cache/student-tests.mjs`
- `benchmark/fixtures/T6-rejected-promise-cache/INCIDENT.md`

Do not edit `config-cache.test.mjs` or `incident.log`.

## Required behavior

- A successful configuration remains cached per normalized tenant ID.
- Callers receive independent copies and cannot mutate cached state.
- Concurrent misses for the same tenant share one in-flight origin load.
- Different tenants do not share entries.
- A failed or invalid origin result must not poison future reads. All callers
  already waiting on that load may observe the same failure, but the next read
  must be allowed to call the origin again.
- Failure cleanup must remove only the matching failed load. If that entry was
  explicitly cleared and replaced while the first load was still running, its
  late failure must not remove the replacement.
- Successful entries must not be evicted merely to make retries pass.
- Preserve the API contract: JSON responses, `no-store`, 503 plus
  `retry-after: 1` for `ConfigOriginError`, 500 for other origin/config errors,
  400 for an invalid tenant, 405 for a recognized route with the wrong method,
  and 404 for an unknown route.
- Keep the implementation dependency-free and make the smallest maintainable
  change that addresses the root cause. Do not add arbitrary retry loops,
  sleeps, or a second cache.

## Regression evidence

Replace the placeholder with at least three meaningful `node:test` cases in
`student-tests.mjs`. Cover the incident and important behavior that could be
broken by an overly broad fix. Do not use skips, todos, or placeholder
assertions.

Complete `INCIDENT.md` in plain language. It must describe user impact, the
root cause and code/log evidence, why the healthy probe and repeated
`cache=hit` lines can send investigation in the wrong direction, the repair,
the regression coverage, and one honest remaining risk or operating limit.

Run:

`node --test benchmark/fixtures/T6-rejected-promise-cache/config-cache.test.mjs benchmark/fixtures/T6-rejected-promise-cache/student-tests.mjs`

In the final response, report the root cause, changed files, verification
result, and any remaining concern.
