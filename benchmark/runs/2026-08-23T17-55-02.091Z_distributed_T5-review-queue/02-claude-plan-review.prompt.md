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

# Lead plan to review

## Implementation plan

No files were modified. The fixture’s three modules are currently stubs, `student-tests.mjs` contains only instructions, and the README is a placeholder.

### 1. Store — `review-store.mjs`

Implement `createReviewStore({ now } = {})` around a private `Map`, keyed by `runId`.

- Default `now` to `() => new Date().toISOString()`.
- Throw `TypeError` during construction if `now` is not a function.
- `save(review)`:
  - Reject null, arrays, and other non-object inputs with `TypeError`.
  - Require `runId`, `decision`, `reviewer`, and `note` to be strings; extra properties need not be persisted.
  - Call `now()` exactly once and require its result to be a non-empty string.
  - Insert with identical `createdAt` and `updatedAt`.
  - Update the existing entry while preserving `createdAt`.
  - Return `{ created, review: copy }`.
- `get(runId)` returns a fresh object or `null`.
- `list({ decision } = {})`:
  - Filter by exact decision only when supplied.
  - Sort by descending `updatedAt`, then ascending `runId`.
  - Return a new array containing fresh review objects.
- Never expose the objects held by the map. In particular, mutating the result of `save`, `get`, or `list` must not affect later reads.

High-risk cases: invalid clocks, accidentally calling the clock twice, losing `createdAt` during updates, timestamp ties, and shallow reference leakage.

### 2. API — `review-api.mjs`

Implement `createReviewApi(store)` and validate that `store` is non-null and has callable `save`, `get`, and `list` members. Return a synchronous handler.

Use one response helper so every result has only:

```js
{ status, headers, body }
```

Every response header map must contain `content-type: application/json; charset=utf-8`; 405 responses additionally receive `allow`.

Request handling:

- Treat a null/non-object request, missing or non-string method/URL, empty URL, or unparseable URL as `400 { error: "invalid_request" }`.
- Parse relative and absolute URLs safely with a fixed base.
- Match the collection path exactly and detail paths with one non-empty path segment.
- Normalize methods to uppercase if desired, but do not let malformed requests throw.

For `POST /api/reviews`:

- Require a plain, non-array body object.
- Detect every key outside the four allowed names, sort those names, and report them through `fields.body`, using one stable message such as `Unknown fields: a, z`.
- For each required field, report a field error if it is not a string.
- Trim valid string inputs before all checks and storage.
- Validate:
  - `runId` against `/^run-[a-z0-9][a-z0-9-]{2,63}$/`.
  - Exact decision membership.
  - Reviewer length of 2–40 characters.
  - Note length no greater than 240.
  - Non-empty note for `reject` and `needs-work`.
- Accumulate all detectable errors into `{ error: "validation_failed", fields }`; never call `save` if any exist.
- Return 201 for insertion and 200 for update, both as `{ review }`.

For reads:

- `GET /api/reviews` obtains the unfiltered list once for summary calculation. The summary must have exactly `total`, `approve`, `reject`, and `"needs-work"`.
- If the `decision` query parameter is present, validate it and filter only `reviews`; summary remains global.
- `GET /api/reviews/:runId` returns `{ review }` or `404 { error: "review_not_found" }`.
- Collection 405: `allow: "GET, POST"`.
- Detail 405: `allow: "GET"`.
- All other paths: `404 { error: "not_found" }`.

High-risk cases: distinguishing malformed requests from unknown routes, preserving the global summary during filtering, sorting unknown keys, collecting rather than short-circuiting validation errors, and returning the exact error bodies.

### 3. Page — `review-page.mjs`

Create a small HTML-escaping helper that stringifies values and escapes at least `&`, `<`, `>`, `"`, and `'`.

Return a complete document with doctype, `<html>`, `<head>`, and `<body>`. Inside a single `<main>`:

- One `<h1>` and a short explanatory paragraph.
- Four visible summary values, escaping even numeric-looking caller values.
- A static `aria-live="polite"` status region containing the escaped message.
- A `method="post"` form targeting `/api/reviews`.
- Controls named `runId`, `decision`, `reviewer`, and `note`, each paired through matching `label[for]` and control `id`.
- Explain that notes are required for reject and needs-work; link that guidance to the note control with `aria-describedby`.
- A table with caption `Saved run reviews`, five column headers, and escaped cells for every review field.
- When empty, use one row with `colspan="5"` and `No reviews yet.`

Keep all dynamic data in text positions rather than dynamic tag or attribute construction.

### 4. Student tests — `student-tests.mjs`

Add meaningful `node:test` coverage without copying the committed cases. Recommended tests:

1. Store isolation, ordering tie-breaks, decision filtering, and rejection of an empty/non-string clock result.
2. API update status, unknown-field sorting, invalid-request handling, detail 404, method 405/`allow`, and confirmation that invalid input does not save.
3. Global summary versus filtered reviews.
4. Page escaping using malicious values in the message, every summary entry, and every review field; assert injected tags/attributes do not appear.

At least three tests are required; four focused tests would give better boundary coverage.

### 5. Documentation — `README.md`

Document:

- `POST /api/reviews`, `GET /api/reviews`, and `GET /api/reviews/:runId`.
- Accepted fields, trimming, allowed decisions, validation limits, insert/update statuses, filtering, and global summary behavior.
- Standard validation, not-found, method-not-allowed, invalid-request, and unknown-route errors.
- The JSON content type and `allow` behavior.
- That storage is process-local, dependency-free, non-durable, and resets on process restart.

### Ownership and order

The worker should modify only the five named files. `review-queue.test.mjs`, task contracts, harness files, and generated evidence remain untouched.

Implement in dependency order: store → API → page → student tests → README. This lets each layer be tested against a stable lower-level contract.

Run the visible suite exactly as specified:

```bash
node --test benchmark/fixtures/T5-review-queue/review-queue.test.mjs benchmark/fixtures/T5-review-queue/student-tests.mjs
```

Then run `git diff --check` and inspect `git status --short` to confirm clean formatting and five-file scope. Private tests are referenced by the task contract but are not available for inspection or execution.

---

# Your role: pre-implementation plan reviewer

Do not edit any file or attempt to create a plan file. Return the review directly in your response. Find cross-layer mismatches, missing validation or safety cases, and test gaps. Return a compact corrected plan of at most 900 words with exactly these headings: Blocking gaps, Corrected contract decisions, Worker checklist. If there are no blocking gaps, write "No blocking gaps" under that heading. The implementation worker will receive your review. Do not claim access to private tests.