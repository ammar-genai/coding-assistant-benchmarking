function copy(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function normalizeEvent(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("event must be an object");
  if (typeof value.tradeId !== "string" || value.tradeId.trim() === "") throw new TypeError("tradeId must be non-empty");
  if (!Number.isInteger(value.version) || value.version < 1) throw new TypeError("version must be a positive integer");
  if (!["CREATED", "AMENDED", "CANCELLED"].includes(value.type)) throw new TypeError("unsupported event type");
  if (!value.payload || typeof value.payload !== "object" || Array.isArray(value.payload)) throw new TypeError("payload must be an object");
  return { tradeId: value.tradeId.trim(), version: value.version, type: value.type, payload: copy(value.payload) };
}

function validateState(state) {
  if (!Number.isFinite(state.notional) || state.notional <= 0) throw new TypeError("notional must be positive and finite");
  if (typeof state.owner !== "string" || state.owner.trim() === "") throw new TypeError("owner must be non-empty");
  return { ...state, owner: state.owner.trim() };
}

function nextState(current, event) {
  if (!current) {
    if (event.type !== "CREATED" || event.version !== 1) throw new TypeError("first event must be CREATED at version 1");
    return validateState({ tradeId: event.tradeId, version: 1, status: "active", notional: event.payload.notional, owner: event.payload.owner });
  }
  if (event.version <= current.version) return null;
  if (event.version !== current.version + 1) throw new TypeError("event version gap");
  if (current.status === "cancelled") throw new TypeError("cancelled trade is terminal");
  if (event.type === "CREATED") throw new TypeError("trade already created");
  if (event.type === "CANCELLED") return { ...current, version: event.version, status: "cancelled" };
  return validateState({ ...current, ...event.payload, tradeId: current.tradeId, version: event.version, status: "active" });
}

export function createEventProjector(applyToStore) {
  if (typeof applyToStore !== "function") throw new TypeError("applyToStore must be a function");
  const states = new Map();
  const queues = new Map();

  function project(input) {
    const event = normalizeEvent(input);
    const prior = queues.get(event.tradeId) ?? Promise.resolve();
    const work = prior.catch(() => undefined).then(async () => {
      const current = states.get(event.tradeId);
      const next = nextState(current, event);
      if (next === null) return copy(current);
      await applyToStore(event.tradeId, copy(next), copy(event));
      states.set(event.tradeId, next);
      return copy(next);
    });
    queues.set(event.tradeId, work);
    void work.finally(() => {
      if (queues.get(event.tradeId) === work) queues.delete(event.tradeId);
    }).catch(() => undefined);
    return work;
  }

  return {
    project,
    getSnapshot(tradeId) {
      return copy(states.get(tradeId)) ?? null;
    },
  };
}
