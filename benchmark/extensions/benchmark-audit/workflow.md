# Benchmark audit workflow

Use this workflow to audit a saved run or comparison block. Keep the audit
read-only.

## Inputs

Require a run ID, task ID, or comparison-block path. If the request names only
an assistant or model, identify the relevant saved artifacts and state the
selection rule.

## Procedure

1. Read `AGENTS.md` and the versioned task contract.
2. Prefer the `benchmark-audit` MCP tools when available:
   - `get_task_contract` for scope, acceptance checks, prompt digest, and rubric;
   - `summarize_run` for the manifest, outcome, changed paths, and verification.
3. Fall back to the corresponding files under `benchmark/tasks`,
   `benchmark/runs`, and `benchmark/blocks` if the MCP server is unavailable.
4. Check that the run started from a clean named commit, used the frozen prompt,
   changed only allowed paths, and preserved every failed check.
5. Separate process completion from acceptance. A completed assistant command
   is not a pass unless required verification and scope checks pass.
6. Label cost as metered API spend, subscription telemetry, estimate, or
   missing. Do not treat a zero or absent field as free usage.
7. Do not compare token totals across adapters unless their cache and total
   definitions match.
8. Inspect a saved patch or transcript only when the summarized evidence cannot
   answer the audit question. Do not open `benchmark/private` or expose hidden
   test contents.

## Output

Return four short sections:

- **Verdict:** pass, fail, invalid, or insufficient evidence.
- **Evidence:** baseline, prompt match, scope, verification, and relevant patch
  facts with artifact paths.
- **Telemetry:** elapsed time, tool/usage/cost fields with their definitions.
- **Limitations:** missing evidence, contaminated graders, incomparable fields,
  or claims that require another run.

Do not invent a score. Use the frozen rubric when a score is requested and show
the category deductions.
