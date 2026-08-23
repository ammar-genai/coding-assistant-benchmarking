/**
 * Build one comparison summary per assistant from raw benchmark run records.
 */
export function summarizeAssistants(runs) {
  if (!Array.isArray(runs)) {
    throw new TypeError("runs must be an array");
  }

  return [];
}
