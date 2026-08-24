function copyState(state) {
  return state ? structuredClone(state) : null;
}

function reduceEvent(previous, event) {
  if (event.type === "CREATED") {
    return {
      tradeId: event.tradeId,
      version: event.version,
      status: "active",
      notional: event.payload.notional,
      owner: event.payload.owner,
    };
  }
  if (event.type === "AMENDED") {
    return { ...previous, ...event.payload, version: event.version };
  }
  if (event.type === "CANCELLED") {
    return { ...previous, version: event.version, status: "cancelled" };
  }
  throw new TypeError(`unsupported event type: ${event.type}`);
}

export function createEventProjector(applyToStore) {
  if (typeof applyToStore !== "function") {
    throw new TypeError("applyToStore must be a function");
  }

  const states = new Map();
  let pending = Promise.resolve();

  async function project(event) {
    pending = pending.then(async () => {
      const next = reduceEvent(states.get(event.tradeId), event);
      states.set(event.tradeId, next);
      await applyToStore(event.tradeId, copyState(next), structuredClone(event));
      return copyState(next);
    });
    return pending;
  }

  function getSnapshot(tradeId) {
    return copyState(states.get(tradeId));
  }

  return { project, getSnapshot };
}
