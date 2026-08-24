const SUPPORTED_TYPES = new Set(["trade.captured", "trade.cancelled"]);

export function normalizeEvent(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("event must be an object");
  }
  if (typeof value.eventId !== "string" || value.eventId.trim() === "") {
    throw new TypeError("eventId must be a non-empty string");
  }
  if (!SUPPORTED_TYPES.has(value.type)) {
    throw new TypeError(`unsupported event type: ${value.type}`);
  }
  if (typeof value.tradeId !== "string" || value.tradeId.trim() === "") {
    throw new TypeError("tradeId must be a non-empty string");
  }
  if (!value.payload || typeof value.payload !== "object" || Array.isArray(value.payload)) {
    throw new TypeError("payload must be an object");
  }

  return {
    eventId: value.eventId.trim(),
    type: value.type,
    tradeId: value.tradeId.trim(),
    occurredAt: new Date(value.occurredAt).toISOString(),
    payload: structuredClone(value.payload),
  };
}
