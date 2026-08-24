import assert from "node:assert/strict";
import test from "node:test";

import { createEventProjector } from "./event-projector.mjs";

const created = (tradeId = "trade-1") => ({
  tradeId,
  version: 1,
  type: "CREATED",
  payload: { notional: 100, owner: "desk-a" },
});

test("serializes concurrent events for one trade", async () => {
  const persisted = [];
  const projector = createEventProjector(async (_tradeId, state) => {
    await Promise.resolve();
    persisted.push(state.version);
  });

  const first = projector.project(created());
  const second = projector.project({
    tradeId: "trade-1",
    version: 2,
    type: "AMENDED",
    payload: { notional: 125 },
  });

  await Promise.all([first, second]);
  assert.deepEqual(persisted, [1, 2]);
  assert.deepEqual(projector.getSnapshot("trade-1"), {
    tradeId: "trade-1",
    version: 2,
    status: "active",
    notional: 125,
    owner: "desk-a",
  });
});

test("a persistence rejection does not commit state or poison later work", async () => {
  let fail = true;
  const projector = createEventProjector(async () => {
    if (fail) {
      fail = false;
      throw new Error("temporary store failure");
    }
  });

  await assert.rejects(projector.project(created()), /temporary store failure/);
  assert.equal(projector.getSnapshot("trade-1"), null);
  assert.equal((await projector.project(created())).version, 1);
});
