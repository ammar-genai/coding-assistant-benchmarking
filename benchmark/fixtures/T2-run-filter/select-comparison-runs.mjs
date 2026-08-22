/**
 * Return the run records that are safe to include in a comparison report.
 *
 * Keep the original order and return the original record objects.
 */
export function selectComparisonRuns(runs) {
  if (!Array.isArray(runs)) {
    throw new TypeError("runs must be an array");
  }

  return runs.filter(
    (run) =>
      run.status === "complete" ||
      run.acceptance_status === "pass" ||
      run.comparison_eligible !== false,
  );
}
