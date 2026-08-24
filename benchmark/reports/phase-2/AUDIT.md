# Phase 2 benchmark audit

## Verdict

Valid with two preserved failures and documented limitations. All 20 counted
observations used the frozen Pi 0.84.2 harness, baseline, prompts, tool sets, run
order, and zero-intervention policy. Thirteen of fifteen automatically graded
write observations passed; one failed and one timed out. The five read-only T8
responses were scored manually because the frozen contract did not define a
binary threshold.

## Evidence

- Baseline: `a36716140a0fb331c4f37584448d44b0937f936e`; every manifest records
  `dirty_at_start: false`.
- Prompt hashes in every manifest match the committed T8, T9, and T10 prompts.
- T8 changed zero files in all five runs.
- Every T9 and T10 patch stayed inside its allowed paths.
- All completed write-run checks and their failures remain in each run's
  `verification.json`; raw results were not rewritten.
- Kimi T9 remained a counted timeout. Its unchanged patch was separately
  applied to the baseline and passed 8/8 visible and 5/5 private tests.

## Telemetry

Saved Pi telemetry sums to `$0.5933099058`: `$0.013097062` for five access checks
and `$0.5802128438` for the 20 counted runs. The user separately observed an
approximately `$2.50` OpenRouter account-balance decrease. The `$1.9066900942`
difference cannot be allocated to individual runs from saved evidence, so the
report keeps both figures and labels route-level cost comparisons as Pi-reported.
Elapsed time, time to first edit, tools, tokens, and Pi-reported costs remain
preserved per run.

## Limitations

- Only T10 was repeated; T8 and T9 have one observation per route.
- The T8 contract has no binary pass threshold.
- The strict report assigns zero to Kimi's counted T9 timeout; its separately
  labeled post-timeout patch score is 95 and is not substituted.
- The 900-second T9 timeout closed after 1,037.803 seconds, showing that the
  runner's termination was not a hard wall-clock cutoff.
- `served_model` was not exposed, so the exact backend revision cannot be proven.
- Account-level spend does not reconcile to the sum of saved Pi cost telemetry;
  route-level cost rankings are therefore provisional.
- This small synthetic sample supports observed trade-offs, not a universal
  model ranking.
