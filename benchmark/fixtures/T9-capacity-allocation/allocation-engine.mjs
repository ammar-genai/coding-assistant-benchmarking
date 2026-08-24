function validateInputs(requests, capacityByDesk) {
  if (!Array.isArray(requests)) throw new TypeError("requests must be an array");
  if (!capacityByDesk || typeof capacityByDesk !== "object" || Array.isArray(capacityByDesk)) {
    throw new TypeError("capacityByDesk must be an object");
  }
}

export function allocateCapacity(requests, capacityByDesk) {
  validateInputs(requests, capacityByDesk);

  return requests.map((request) => ({
    id: request.id,
    allocated: request.requested,
    unfilled: 0,
  }));
}
