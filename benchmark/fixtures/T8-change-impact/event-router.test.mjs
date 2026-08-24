import assert from "node:assert/strict";
import test from "node:test";

import { createEventRouter } from "./event-router.mjs";
import { createEventStore } from "./event-store.mjs";

test("routes a normalized event once", async () => {
  const store = createEventStore();
  const published = [];
  const route = createEventRouter(store, async (event) => published.push(event));
  const event = {
    eventId: "evt-1",
    type: "trade.captured",
    tradeId: "trade-1",
    occurredAt: "2026-08-23T12:00:00Z",
    payload: { notional: 1_000_000 },
  };

  assert.deepEqual(await route(event), { status: "accepted", eventId: "evt-1" });
  assert.deepEqual(await route(event), { status: "duplicate", eventId: "evt-1" });
  assert.equal(published.length, 1);
});
