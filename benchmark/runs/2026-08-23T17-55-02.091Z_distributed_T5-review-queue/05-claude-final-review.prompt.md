# Cross-layer feature: build a run review queue

Complete the dependency-free run review queue in
`benchmark/fixtures/T5-review-queue`. The feature spans an in-memory store, a
JSON-style API boundary, a server-rendered HTML page, tests, and operator
documentation.

Implement only these files:

- `benchmark/fixtures/T5-review-queue/review-store.mjs`
- `benchmark/fixtures/T5-review-queue/review-api.mjs`
- `benchmark/fixtures/T5-review-queue/review-page.mjs`
- `benchmark/fixtures/T5-review-queue/student-tests.mjs`
- `benchmark/fixtures/T5-review-queue/README.md`

Do not edit the committed `review-queue.test.mjs` suite.

## In-memory store

Export `createReviewStore({ now } = {})` from `review-store.mjs`.

- `now` defaults to a function returning the current ISO timestamp. Reject a
  non-function `now` with `TypeError`; each returned timestamp must be a
  non-empty string.
- Keep at most one current review per `runId`.
- Expose `save(review)`, `get(runId)`, and `list({ decision } = {})`.
- A saved input has string fields `runId`, `decision`, `reviewer`, and `note`.
  Reject a non-object input or a non-string field with `TypeError`.
- `save` calls `now` once. A new run uses that value for both `createdAt` and
  `updatedAt`. An update preserves `createdAt` and replaces `updatedAt`.
- `save` returns `{ created, review }`, where `created` distinguishes insert
  from update. `get` returns a review or `null`.
- `list` optionally filters by exact decision. Sort newest `updatedAt` first,
  then lexicographically smaller `runId` for a timestamp tie.
- Returned objects and arrays must be copies. A caller must not be able to
  mutate stored state through a returned value.

## API boundary

Export `createReviewApi(store)` from `review-api.mjs`. Reject a store without
`save`, `get`, and `list` functions with `TypeError`. Return a synchronous
`handleReviewRequest(request)` function.

Every response has exactly the shape `{ status, headers, body }` and includes
the header `content-type: application/json; charset=utf-8`.

### `POST /api/reviews`

- Accept only `runId`, `decision`, `reviewer`, and `note`; report sorted unknown
  field names as a `body` field error.
- Trim all four string values before validation and storage.
- `runId` must match `^run-[a-z0-9][a-z0-9-]{2,63}$`.
- `decision` must be `approve`, `reject`, or `needs-work`.
- `reviewer` must contain 2 through 40 characters after trimming.
- `note` is at most 240 characters and is required for `reject` and
  `needs-work`; it may be empty for `approve`.
- Report all detected field problems with status 400 and
  `{ error: "validation_failed", fields: { ... } }`. Do not save invalid data.
- Return `{ review }` with status 201 for a new run and 200 for an update.

### Reads and errors

- `GET /api/reviews` returns `{ reviews, summary }`. `summary` always counts all
  stored reviews and has exactly `total`, `approve`, `reject`, and
  `needs-work`. An optional `decision` query filters only `reviews`; an invalid
  decision returns the standard validation error.
- `GET /api/reviews/:runId` returns `{ review }` or status 404 with
  `{ error: "review_not_found" }`.
- Unsupported methods on a recognized route return status 405 with
  `{ error: "method_not_allowed" }` and an `allow` header (`GET, POST` for the
  collection and `GET` for a detail route).
- Unknown routes return status 404 with `{ error: "not_found" }`.
- An unusable request object or URL returns status 400 with
  `{ error: "invalid_request" }` rather than throwing.

## User-facing page

Export `renderReviewPage({ reviews, summary, message = "" })` from
`review-page.mjs` and return a complete HTML document.

- Include one main heading, a short explanation, and a `main` landmark.
- Show all four summary values.
- Include a POST form for the four review fields. Every control must have a
  matching `label`; describe when the note is required.
- Put `message` in a polite live status region.
- Render reviews in a table with a caption and column headers. Show run ID,
  decision, reviewer, note, and updated timestamp. Render `No reviews yet.` as
  the empty state.
- HTML-escape every dynamic value, including message, summary values, and all
  review fields. Do not allow caller data to create tags or attributes.

## Tests and documentation

- Add at least three meaningful `node:test` cases to `student-tests.mjs`. Do not
  use skips, todos, or placeholder assertions.
- Update `README.md` with the three routes, input and error behavior, and the
  fact that the store resets on process restart because it is not durable.

Run:

`node --test benchmark/fixtures/T5-review-queue/review-queue.test.mjs benchmark/fixtures/T5-review-queue/student-tests.mjs`

In the final response, summarize the design, tests added, verification result,
and any remaining concern.


---

# Your role: final independent reviewer

Do not edit any file or attempt to create a plan file. Return the review directly in your response. Inspect the current diff and run the visible verification command if permitted. Review correctness, validation and error consistency, data isolation, HTML injection safety, test quality, documentation, and file scope. Do not claim access to private tests. End with one valid JSON object on a single line using this shape: {"verdict":"pass|fail","findings":[{"severity":"high|medium|low","file":"path","issue":"text"}],"visible_verification":"pass|fail|not-run"}.