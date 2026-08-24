import { normalizeEvent } from "./event-normalizer.mjs";

export function createEventRouter(store, publish) {
  if (!store || typeof store.hasEvent !== "function" || typeof store.save !== "function") {
    throw new TypeError("store is invalid");
  }
  if (typeof publish !== "function") {
    throw new TypeError("publish must be a function");
  }

  return async function routeEvent(input) {
    const event = normalizeEvent(input);
    if (store.hasEvent(event.eventId)) {
      return { status: "duplicate", eventId: event.eventId };
    }

    store.save(event);
    await publish(event);
    return { status: "accepted", eventId: event.eventId };
  };
}
