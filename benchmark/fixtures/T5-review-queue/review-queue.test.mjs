import assert from "node:assert/strict";
import test from "node:test";

import { createReviewApi } from "./review-api.mjs";
import { renderReviewPage } from "./review-page.mjs";
import { createReviewStore } from "./review-store.mjs";

function clock(...timestamps) {
  let index = 0;
  return () => timestamps[index++];
}

test("stores one current review per run and preserves creation time", () => {
  const store = createReviewStore({
    now: clock("2026-08-23T10:00:00.000Z", "2026-08-23T11:00:00.000Z"),
  });
  const first = store.save({ runId: "run-alpha", decision: "approve", reviewer: "Ada", note: "" });
  const updated = store.save({ runId: "run-alpha", decision: "needs-work", reviewer: "Ada", note: "Add tests" });

  assert.equal(first.created, true);
  assert.equal(updated.created, false);
  assert.equal(store.list().length, 1);
  assert.equal(updated.review.createdAt, "2026-08-23T10:00:00.000Z");
  assert.equal(updated.review.updatedAt, "2026-08-23T11:00:00.000Z");
});

test("creates, normalizes, lists, and filters reviews through the API", () => {
  const store = createReviewStore({ now: () => "2026-08-23T12:00:00.000Z" });
  const handle = createReviewApi(store);
  const created = handle({
    method: "POST",
    url: "/api/reviews",
    body: { runId: " run-alpha ", decision: " approve ", reviewer: " Ada ", note: " looks good " },
  });

  assert.equal(created.status, 201);
  assert.equal(created.headers["content-type"], "application/json; charset=utf-8");
  assert.deepEqual(created.body.review, {
    runId: "run-alpha",
    decision: "approve",
    reviewer: "Ada",
    note: "looks good",
    createdAt: "2026-08-23T12:00:00.000Z",
    updatedAt: "2026-08-23T12:00:00.000Z",
  });

  const listed = handle({ method: "GET", url: "/api/reviews?decision=approve" });
  assert.equal(listed.status, 200);
  assert.equal(listed.body.reviews.length, 1);
  assert.deepEqual(listed.body.summary, { total: 1, approve: 1, reject: 0, "needs-work": 0 });
});

test("returns field errors instead of saving an invalid decision", () => {
  const store = createReviewStore();
  const handle = createReviewApi(store);
  const result = handle({
    method: "POST",
    url: "/api/reviews",
    body: { runId: "bad", decision: "reject", reviewer: "A", note: "" },
  });

  assert.equal(result.status, 400);
  assert.equal(result.body.error, "validation_failed");
  assert.deepEqual(Object.keys(result.body.fields).sort(), ["note", "reviewer", "runId"]);
  assert.deepEqual(store.list(), []);
});

test("renders a labeled form, summary, table, and empty state", () => {
  const html = renderReviewPage({
    reviews: [],
    summary: { total: 0, approve: 0, reject: 0, "needs-work": 0 },
    message: "",
  });

  assert.match(html, /<main>/);
  assert.match(html, /<label for="run-id">Run ID<\/label>/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /<caption>Saved run reviews<\/caption>/);
  assert.match(html, /No reviews yet\./);
});
