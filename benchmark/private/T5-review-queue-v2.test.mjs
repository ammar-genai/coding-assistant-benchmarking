import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const targetRoot = process.env.BENCHMARK_TARGET_ROOT;
assert.ok(targetRoot, "BENCHMARK_TARGET_ROOT is required");
const fixtureRoot = resolve(targetRoot, "benchmark/fixtures/T5-review-queue");

async function load(file) {
  const url = pathToFileURL(resolve(fixtureRoot, file));
  url.searchParams.set("private", `${process.pid}-${Date.now()}-${Math.random()}`);
  return import(url.href);
}

const [{ createReviewStore }, { createReviewApi }, { renderReviewPage }] = await Promise.all([
  load("review-store.mjs"),
  load("review-api.mjs"),
  load("review-page.mjs"),
]);

function sequence(...values) {
  let index = 0;
  return () => values[index++];
}

test("store isolates records, preserves creation, and sorts deterministically", () => {
  const store = createReviewStore({
    now: sequence(
      "2026-08-23T10:00:00.000Z",
      "2026-08-23T11:00:00.000Z",
      "2026-08-23T11:00:00.000Z",
    ),
  });
  const first = store.save({ runId: "run-zeta", decision: "approve", reviewer: "Ada", note: "" });
  first.review.note = "mutated";
  const update = store.save({ runId: "run-zeta", decision: "reject", reviewer: "Grace", note: "Regression" });
  store.save({ runId: "run-alpha", decision: "approve", reviewer: "Lin", note: "" });

  assert.equal(update.review.createdAt, "2026-08-23T10:00:00.000Z");
  assert.deepEqual(store.list().map((review) => review.runId), ["run-alpha", "run-zeta"]);
  const listed = store.list();
  listed[0].reviewer = "changed";
  assert.equal(store.get("run-alpha").reviewer, "Lin");
  assert.equal(store.get("missing"), null);
});

test("POST trims values, rejects unknown fields, and distinguishes create from update", () => {
  const store = createReviewStore({
    now: sequence("2026-08-23T10:00:00.000Z", "2026-08-23T11:00:00.000Z"),
  });
  const handle = createReviewApi(store);
  const created = handle({
    method: "POST",
    url: "/api/reviews",
    body: { runId: " run-alpha ", decision: " approve ", reviewer: " Ada ", note: " okay " },
  });
  const updated = handle({
    method: "POST",
    url: "/api/reviews",
    body: { runId: "run-alpha", decision: "needs-work", reviewer: "Ada", note: " tests " },
  });
  const invalid = handle({
    method: "POST",
    url: "/api/reviews",
    body: { runId: "run-beta", decision: "approve", reviewer: "Lin", note: "", extra: true },
  });

  assert.equal(created.status, 201);
  assert.equal(updated.status, 200);
  assert.equal(updated.body.review.createdAt, "2026-08-23T10:00:00.000Z");
  assert.equal(updated.body.review.updatedAt, "2026-08-23T11:00:00.000Z");
  assert.equal(invalid.status, 400);
  assert.match(invalid.body.fields.body, /extra/);
  assert.equal(store.get("run-beta"), null);
});

test("validation reports independent fields and requires notes selectively", () => {
  const store = createReviewStore();
  const handle = createReviewApi(store);
  const invalid = handle({
    method: "POST",
    url: "/api/reviews",
    body: { runId: "no", decision: "reject", reviewer: "x", note: " ".repeat(250) },
  });
  assert.equal(invalid.status, 400);
  assert.deepEqual(Object.keys(invalid.body.fields).sort(), ["note", "reviewer", "runId"]);

  const approved = handle({
    method: "POST",
    url: "/api/reviews",
    body: { runId: "run-good", decision: "approve", reviewer: "Jo", note: "" },
  });
  assert.equal(approved.status, 201);
});

test("collection filters only rows while summary covers all stored reviews", () => {
  const store = createReviewStore({ now: () => "2026-08-23T10:00:00.000Z" });
  store.save({ runId: "run-one", decision: "approve", reviewer: "Ada", note: "" });
  store.save({ runId: "run-two", decision: "reject", reviewer: "Lin", note: "Broken" });
  store.save({ runId: "run-three", decision: "needs-work", reviewer: "Jo", note: "Tests" });
  const handle = createReviewApi(store);

  const filtered = handle({ method: "GET", url: "/api/reviews?decision=reject" });
  assert.deepEqual(filtered.body.reviews.map((review) => review.runId), ["run-two"]);
  assert.deepEqual(filtered.body.summary, { total: 3, approve: 1, reject: 1, "needs-work": 1 });
  const invalid = handle({ method: "GET", url: "/api/reviews?decision=maybe" });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error, "validation_failed");
});

test("detail, method, invalid-request, and missing-route errors are consistent", () => {
  const store = createReviewStore({ now: () => "2026-08-23T10:00:00.000Z" });
  store.save({ runId: "run-one", decision: "approve", reviewer: "Ada", note: "" });
  const handle = createReviewApi(store);

  assert.equal(handle({ method: "GET", url: "/api/reviews/run-one" }).status, 200);
  assert.deepEqual(handle({ method: "GET", url: "/api/reviews/run-missing" }).body, { error: "review_not_found" });
  const method = handle({ method: "PATCH", url: "/api/reviews/run-one" });
  assert.equal(method.status, 405);
  assert.equal(method.headers.allow, "GET");
  assert.equal(handle({ method: "GET", url: "/elsewhere" }).status, 404);
  assert.equal(handle(null).status, 400);
});

test("rendered page escapes every dynamic field and exposes accessible landmarks", () => {
  const html = renderReviewPage({
    reviews: [{
      runId: "run-safe<script>",
      decision: "needs-work",
      reviewer: 'A & "B"',
      note: "<img src=x onerror=alert(1)>",
      updatedAt: "2026-08-23T10:00:00.000Z",
    }],
    summary: { total: 1, approve: 0, reject: 0, "needs-work": 1 },
    message: "Saved <strong>now</strong>",
  });

  assert.doesNotMatch(html, /<script>|<img|<strong>now/);
  assert.match(html, /run-safe&lt;script&gt;/);
  assert.match(html, /A &amp; &quot;B&quot;/);
  const statusTag = html.match(/<[^>]+aria-live=["']polite["'][^>]*>/i)?.[0] ?? "";
  assert.match(statusTag, /role=["']status["']/i);
  for (const id of ["run-id", "decision", "reviewer", "note"]) {
    assert.match(html, new RegExp(`<label\\b[^>]*\\bfor=["']${id}["'][^>]*>`, "i"));
    assert.match(html, new RegExp(`\\bid=["']${id}["']`, "i"));
  }
  assert.match(html, /<caption\b[^>]*>\s*Saved run reviews\s*<\/caption>/i);
});

test("student tests and documentation contain meaningful coverage and operating limits", async () => {
  const [studentTests, readme] = await Promise.all([
    readFile(resolve(fixtureRoot, "student-tests.mjs"), "utf8"),
    readFile(resolve(fixtureRoot, "README.md"), "utf8"),
  ]);
  const declaredTests = studentTests.match(/\btest\s*\(/g) ?? [];
  assert.ok(declaredTests.length >= 3, "student-tests.mjs must declare at least three tests");
  assert.doesNotMatch(studentTests, /test\.(?:todo|skip)\s*\(/);
  assert.doesNotMatch(studentTests, /assert\.(?:ok|equal)\s*\(\s*true\b/);
  assert.match(readme, /POST \/api\/reviews/);
  assert.match(readme, /GET \/api\/reviews/);
  assert.match(readme, /validation_failed/);
  assert.match(readme, /\bin[- ]memory\b/i);
  assert.match(readme, /reset|restart/i);
});
