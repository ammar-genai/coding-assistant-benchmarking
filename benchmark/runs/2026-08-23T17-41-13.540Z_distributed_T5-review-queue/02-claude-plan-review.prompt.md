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

No files were modified during planning.

### 1. `review-store.mjs` — isolated in-memory persistence

Implement `createReviewStore({ now } = {})` around a private `Map` keyed by `runId`.

- Default `now` to `() => new Date().toISOString()`.
- Reject a non-function `now` immediately with `TypeError`.
- `save(review)`:
  - Reject `null`, arrays, primitives, and any non-string required field with `TypeError`.
  - Copy only `runId`, `decision`, `reviewer`, and `note`.
  - Call `now()` exactly once per valid save; reject a non-string or empty timestamp with `TypeError`.
  - Insert with identical `createdAt` and `updatedAt`.
  - Update the existing entry while preserving `createdAt` and replacing `updatedAt`.
  - Return `{ created, review }`, with a fresh review copy.
- `get(runId)` returns a fresh copy or `null`.
- `list({ decision } = {})`:
  - Optionally apply exact decision equality.
  - Sort descending by `updatedAt`, then ascending by `runId`.
  - Return a new array containing new object copies.

Never expose the objects held by the map, including through `save`.

### 2. `review-api.mjs` — synchronous request boundary

Validate that the supplied store is non-null and has callable `save`, `get`, and `list` properties; otherwise throw `TypeError`. Return `handleReviewRequest(request)`.

Use small internal helpers for:

- JSON response construction, always returning exactly `{ status, headers, body }`.
- The mandatory `content-type: application/json; charset=utf-8` header.
- Standard validation errors.
- Decision validation and summary calculation.

Request handling:

- Treat a non-object request, missing/non-string method or URL, or an unparsable URL as `{ status: 400, body: { error: "invalid_request" } }`.
- Parse relative URLs against a fixed dummy origin.
- Recognize only the exact collection path and a single-segment detail path.
- Normalize methods to uppercase if desired, but apply method rules consistently.

For `POST /api/reviews`:

- Treat a missing, null, array, or otherwise unusable body as validation failure rather than allowing store errors to escape.
- Detect all unknown own enumerable keys, sort their names, and report them under `fields.body`.
- Validate all four expected fields in one pass:
  - A non-string value is a field error and must not be trimmed.
  - Trim valid strings before all subsequent checks.
  - Apply the exact run-ID regex.
  - Accept only the three decisions.
  - Enforce reviewer length 2–40.
  - Enforce note length ≤240 and non-empty notes for `reject`/`needs-work`.
- If any problem exists, return status 400 and `{ error: "validation_failed", fields }`; never call `save`.
- Save only the normalized four-field object.
- Return status 201 for insertion or 200 for update, with `{ review }`.

For reads:

- `GET /api/reviews` obtains the complete list once for summary counts. Validate an optional `decision` query; when valid, filter only `reviews`, not `summary`.
- Summary must contain exactly `total`, `approve`, `reject`, and `"needs-work"`.
- `GET /api/reviews/:runId` returns `{ review }` or the specified 404 error.
- Recognized routes with unsupported methods return 405 and the correct `allow` header in addition to content type.
- Nested or otherwise unknown paths return `{ error: "not_found" }` with 404.
- Keep expected request failures inside the response contract; do not broadly hide unexpected store programming errors.

### 3. `review-page.mjs` — complete, safely escaped HTML

Create one shared escaping helper that stringifies dynamic values and replaces at least `&`, `<`, `>`, `"`, and `'`.

Return a complete document containing:

- `<!doctype html>`, language, metadata, title, body, and one `main`.
- Exactly one main heading and a short operational explanation.
- Four visibly labeled summary values, with all values escaped.
- A form using `method="post"` and `action="/api/reviews"`:
  - Labeled `runId`, `decision`, `reviewer`, and `note` controls.
  - Matching `for`/`id` pairs and correct `name` attributes.
  - A decision select with the three accepted values.
  - Help text explaining conditional note requirements, connected to the textarea where practical.
- A status region containing escaped `message`, using `aria-live="polite"` (and optionally `role="status"`).
- A table with the required caption, headers, and five escaped review fields.
- A clear `No reviews yet.` row/state when the input list is empty.

Place dynamic values in text nodes rather than constructing markup or attribute fragments from caller data.

### 4. `student-tests.mjs` — meaningful regression coverage

Add at least three independent `node:test` cases, preferably these:

1. Store timestamp ordering and isolation:
   - Tie sorting by `runId`.
   - Mutation of `save`, `get`, or `list` results cannot alter stored state.
   - Invalid `now` return values throw.

2. API validation aggregation and no-save guarantee:
   - Unknown fields are sorted.
   - Whitespace normalization, invalid run ID/decision/reviewer/note, and conditional note requirements are covered together.
   - Confirm the store remains empty.

3. API routing and summaries:
   - Filtered reviews coexist with an unfiltered summary.
   - Update returns 200.
   - Detail missing, unknown route, malformed request, and 405 `allow` behavior are checked.

4. Page escaping:
   - Inject tag/attribute-like strings through message, summary, and every review field.
   - Assert escaped text is present and executable/raw injected markup is absent.

Do not duplicate the four existing visible tests verbatim.

### 5. `README.md` — operator contract

Document:

- `POST /api/reviews`, `GET /api/reviews`, and `GET /api/reviews/:runId`.
- Accepted fields, trimming, validation rules, create/update statuses, filtering, and unfiltered summaries.
- Validation, invalid-request, missing-resource, unknown-route, and method errors, including `allow`.
- JSON content type.
- The in-memory store’s one-review-per-run behavior and explicit warning that all data resets on process restart because it is not durable.

### Ownership and verification

Only the five user-authorized files belong to the worker. Do not edit the frozen committed test, task definitions, harness, dependencies, or generated evidence.

Run the visible command exactly:

```bash
node --test benchmark/fixtures/T5-review-queue/review-queue.test.mjs benchmark/fixtures/T5-review-queue/student-tests.mjs
```

Then inspect `git status --short` and `git diff --check` to confirm scope and whitespace integrity. Report only visible verification; do not claim access to private tests.

---

# Your role: pre-implementation plan reviewer

Do not edit any file. Find cross-layer mismatches, missing validation or safety cases, and test gaps. Return a compact corrected plan of at most 900 words with exactly these headings: Blocking gaps, Corrected contract decisions, Worker checklist. If there are no blocking gaps, write "No blocking gaps" under that heading. The implementation worker will receive your review. Do not claim access to private tests.