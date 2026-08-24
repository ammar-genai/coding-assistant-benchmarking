function requireRecord(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`);
  }
}

export function allocateCapacity(requests, capacityByDesk) {
  if (!Array.isArray(requests)) throw new TypeError("requests must be an array");
  requireRecord(capacityByDesk, "capacityByDesk");

  const ids = new Set();
  const normalized = requests.map((request) => {
    requireRecord(request, "request");
    if (typeof request.id !== "string" || request.id.trim() === "" || ids.has(request.id)) {
      throw new TypeError("request ids must be non-empty and unique");
    }
    ids.add(request.id);
    if (typeof request.desk !== "string" || request.desk.trim() === "") {
      throw new TypeError("desk must be a non-empty string");
    }
    if (!Number.isFinite(request.requested) || request.requested <= 0) {
      throw new TypeError("requested must be positive and finite");
    }
    if (!Number.isInteger(request.priority)) {
      throw new TypeError("priority must be an integer");
    }
    const submittedAt = Date.parse(request.submittedAt);
    if (!Number.isFinite(submittedAt)) throw new TypeError("submittedAt must be valid");
    if (!Object.hasOwn(capacityByDesk, request.desk)) throw new TypeError("desk capacity is required");
    const capacity = capacityByDesk[request.desk];
    if (!Number.isFinite(capacity) || capacity < 0) throw new TypeError("capacity must be finite and non-negative");
    return { ...request, submittedAtValue: submittedAt };
  });

  const remaining = new Map();
  for (const request of normalized) remaining.set(request.desk, capacityByDesk[request.desk]);
  const byId = new Map();
  const ordered = [...normalized].sort((left, right) =>
    right.priority - left.priority
    || left.submittedAtValue - right.submittedAtValue
    || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));

  for (const request of ordered) {
    const allocated = Math.min(request.requested, remaining.get(request.desk));
    remaining.set(request.desk, remaining.get(request.desk) - allocated);
    byId.set(request.id, { id: request.id, allocated, unfilled: request.requested - allocated });
  }
  return requests.map((request) => byId.get(request.id));
}
