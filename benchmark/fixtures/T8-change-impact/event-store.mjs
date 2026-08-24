export function createEventStore() {
  const events = new Map();

  return {
    hasEvent(eventId) {
      return events.has(eventId);
    },
    getEvent(eventId) {
      const event = events.get(eventId);
      return event ? structuredClone(event) : null;
    },
    save(event) {
      events.set(event.eventId, structuredClone(event));
    },
    listForTrade(tradeId) {
      return [...events.values()]
        .filter((event) => event.tradeId === tradeId)
        .map((event) => structuredClone(event));
    },
  };
}
