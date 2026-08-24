# Phase 2 comprehensive report: neutral Pi model comparison

Status: complete and audited
Execution date: 2026-08-23 America/New_York; run artifacts use UTC timestamps
Baseline: `a36716140a0fb331c4f37584448d44b0937f936e`

## 1. What Phase 2 answers

Phase 1 compared coding assistants as products. Phase 2 asks a narrower model
question: what changes when the harness stays fixed and only the model route
changes?

Pi 0.84.2 was the only counted assistant harness. All five models used
OpenRouter, the same prompts, the same isolated baseline, the same Pi tools, the
same provider-default reasoning policy, no extensions or skills, fresh sessions,
and zero human interventions.

The five routes were:

- `openrouter/openai/gpt-5.6-sol`
- `openrouter/anthropic/claude-fable-5`
- `openrouter/moonshotai/kimi-k3`
- `openrouter/qwen/qwen3.8-27b`
- `openrouter/z-ai/glm-5.2`

This design removes most assistant-product differences. It does not remove
provider routing, backend revision, or model-family telemetry differences.

## 2. Executive finding

There is no single winner across quality, time, cost, and reliability.

- **Sol and GLM tied on strict observed quality at 100.** Sol took 333.389
  seconds with `$0.0808` in Pi-reported cost; GLM took 744.357 seconds with
  `$0.0562` in Pi-reported cost.
- **Fable was the fastest reliable route.** It completed all four observations
  in 241.862 seconds with full write acceptance, with `$0.3644` in Pi-reported
  cost.
- **Qwen had the lowest saved Pi cost telemetry.** It passed all three
  automatically graded write observations, scored 98.8 strict overall, and
  reported `$0.0160` including access verification.
- **Kimi showed high implementation quality but weak unattended reliability.**
  Its analysis scored 100 and its T10 results scored 95 and 100, but it timed
  out on T9 and failed one T10 private check. The unchanged timeout patch later
  passed both test suites and scored 95; the counted timeout was not rewritten.

For the user's intended two-level workflow, the evidence supports Sol as the
planner/integrator and Qwen as the default bounded worker. GLM is a useful
low-cost hard-task alternative, while Fable is the speed-first premium route.

## 3. Frozen protocol

### Tasks

| Task | Purpose | Runs/model | Timeout | Weight |
|---|---|---:|---:|---:|
| T8 change-impact analysis | Read-only reasoning and planning | 1 | 600 s | 20% |
| T9 capacity allocation | Bounded implementation | 1 | 900 s | 30% |
| T10 event projector | Concurrency and recovery debugging | 2 | 1,200 s | 50% using the mean |

The second T10 run was preregistered for every model. It was not a failure rerun,
and both observations count.

### Frozen order

| Block | Order |
|---|---|
| T8 | Qwen → Sol → GLM → Kimi → Fable |
| T9 | Sol → GLM → Kimi → Fable → Qwen |
| T10 observation 1 | GLM → Kimi → Fable → Qwen → Sol |
| T10 observation 2 | Kimi → Fable → Qwen → Sol → GLM |

### Evidence controls

- Every run began from the same clean named commit.
- Prompt digests match the committed T8, T9, and T10 prompts.
- T8 had read-only tools: `read,grep,find,ls`.
- T9 and T10 had `read,grep,find,ls,edit,write,bash`.
- Pi ran with no session, extensions, skills, prompt templates, or themes.
- Private checks ran after the assistant stopped and were not included in the
  model prompt.
- No failed result was rerun or overwritten.

## 4. Score interpretation

The frozen formula is:

`20% × T8 + 30% × T9 + 50% × mean(T10-1, T10-2)`

T8 was graded once, blinded to model identity during scoring where practical.
The task contract did not define a binary pass threshold, so the report keeps
T8 as a manual numeric score and a separate read-only scope check.

Kimi's T9 run timed out. The strict comparison assigns zero to that counted
failure so the formula can be evaluated. Its separately labeled post-timeout
patch score is 95 and is not substituted. The report also shows a 97.25
diagnostic scenario to make the difference between implementation quality and
run completion explicit.

## 5. Overall results

| Model | T8 | T9 counted | T10-1 | T10-2 | Strict score | Write acceptance |
|---|---:|---:|---:|---:|---:|---:|
| GPT-5.6 Sol | 100 | 100 | 100 | 100 | **100.0** | 3/3 |
| GLM 5.2 | 100 | 100 | 100 | 100 | **100.0** | 3/3 |
| Claude Fable 5 | 99 | 100 | 100 | 100 | **99.8** | 3/3 |
| Qwen3.8-27B | 94 | 100 | 100 | 100 | **98.8** | 3/3 |
| Kimi K3 | 100 | 0 timeout | 95 fail | 100 | **68.75** | 1/3 |

Automatic write-run acceptance was 13/15: thirteen passes, one completed
failure, and one timeout. All five T8 runs stayed read-only and received scores
from 94 to 100.

## 6. Task-by-task findings

### T8: change-impact analysis

| Model | Score | Time | Pi cost | Words | Main deduction |
|---|---:|---:|---:|---:|---|
| Sol | 100 | 32.537 s | $0.0264 | 891 | None |
| GLM | 100 | 161.706 s | $0.0402 | 915 | None |
| Kimi | 100 | 54.250 s | $0.0349 | 943 | None |
| Fable | 99 | 41.131 s | $0.1952 | 1,002 | Slightly above word limit |
| Qwen | 94 | 28.809 s | $0.0070 | 1,046 | Word limit and one inaccurate fixture statement |

Sol had the strongest planning trade-off: full score, second-fastest time, and a
moderate cost. Qwen was fastest and cheapest but required more frontier review.
GLM and Kimi also produced full-score plans, though GLM took much longer. Fable
was strong and fast but disproportionately expensive on this reasoning task.

### T9: deterministic capacity allocation

| Model | Counted result | Score | Visible | Private | Time | Pi cost | First edit |
|---|---|---:|---:|---:|---:|---:|---:|
| Fable | Pass | 100 | 7/7 | 5/5 | 38.460 s | $0.0423 | 3.727 s |
| Sol | Pass | 100 | 7/7 | 5/5 | 81.077 s | $0.0119 | 8.852 s |
| Qwen | Pass | 100 | 8/8 | 5/5 | 97.293 s | $0.0024 | 3.623 s |
| GLM | Pass | 100 | 11/11 | 5/5 | 135.418 s | $0.0060 | 1.754 s |
| Kimi | Timeout | 0 strict | Not run in counted result | Not run | 1,037.803 s | $0.0176 | 4.327 s |

Kimi had already changed only the two allowed files before timing out. A
separate audit applied that unchanged patch to the baseline: 8/8 visible and
5/5 private tests passed, producing a post-timeout rubric score of 95. The five
deducted points reflect the missing final verification response. This confirms
the code was good, but completion reliability is part of the benchmark, so the
raw timeout remains the counted result.

The nominal 900-second timeout took 1,037.803 seconds to close. This is a harness
limitation for future unattended studies; the runner signaled termination but
did not enforce a hard final wall-clock bound.

### T10: concurrent event projector

| Model | Observation 1 | Observation 2 | Mean score | Mean time | Combined Pi cost |
|---|---:|---:|---:|---:|---:|
| Sol | 100 pass | 100 pass | 100 | 109.888 s | $0.0413 |
| Fable | 100 pass | 100 pass | 100 | 81.136 s | $0.1180 |
| GLM | 100 pass | 100 pass | 100 | 223.617 s | $0.0096 |
| Qwen | 100 pass | 100 pass | 100 | 247.821 s | $0.0060 |
| Kimi | 95 fail | 100 pass | 97.5 | 43.283 s | $0.0214 |

Kimi's first T10 run passed all eight visible tests but passed five of six
private tests. Five points were deducted from the private-test category; hidden
test details are intentionally not reproduced. Its second observation passed
8/8 visible and 6/6 private tests. The mixed result is precisely why the frozen
repeat matters: one fast successful run alone would have hidden the instability.

Fable was the fastest route with two accepted observations. Sol was next.
Qwen and GLM both reached full correctness at much lower cost, but their complex
debugging runs were slower.

## 7. Time, cost, tools, and tokens

| Model | Total time | Pi task cost | Pi access cost | Pi total | Tool calls | Tool errors |
|---|---:|---:|---:|---:|---:|---:|
| Fable | 241.862 s | $0.3556 | $0.0088 | $0.3644 | 30 | 0 |
| Sol | 333.389 s | $0.0797 | $0.0011 | $0.0808 | 41 | 0 |
| Qwen | 621.744 s | $0.0154 | $0.0006 | $0.0160 | 40 | 0 |
| GLM | 744.357 s | $0.0558 | $0.0004 | $0.0562 | 41 | 0 |
| Kimi | 1,178.618 s | $0.0738 | $0.0021 | $0.0760 | 34 | 0 |

Saved Pi telemetry sums to `$0.5933099058`: `$0.013097062` for five access
checks and `$0.5802128438` for the 20 counted observations. The user separately
observed an approximately `$2.50` OpenRouter account-balance decrease, or 13.9%
of the `$18` ceiling. The `$1.9066900942` difference cannot be allocated to
individual runs from the saved evidence. Route-level cost comparisons in this
report are therefore Pi-reported and provisional, while `$2.50` is the safer
account-level budget figure.

| Model | Input | Output | Cache read | Cache write | Reasoning subset | Pi total tokens |
|---|---:|---:|---:|---:|---:|---:|
| Sol | 12 | 3,371 | 27,494 | 7,101 | 1,426 | 37,978 |
| Fable | 8 | 4,712 | 31,222 | 7,093 | 33 | 43,035 |
| GLM | 1,568 | 14,487 | 53,184 | 0 | 10,952 | 69,239 |
| Qwen | 5,181 | 3,538 | 34,496 | 0 | 93 | 43,215 |
| Kimi | 9,995 | 2,594 | 16,480 | 0 | 49 | 29,069 |

These fields are Pi's provider-reported telemetry. Reasoning is a subset, not a
separate amount to add to total tokens. The same adapter improves comparability,
but provider-specific cache and reasoning definitions can still differ. Cost,
time, and acceptance are safer comparison fields than one derived token ratio.

## 8. Model profiles from this sample

### GPT-5.6 Sol

Best observed lead-model trade-off. It produced a full-score plan, passed the
bounded implementation and both complex debugging runs, and was much faster
than GLM while far cheaper than Fable. It is the strongest default for planning,
integration, and final review in this portfolio.

### Claude Fable 5

Fastest reliable route and technically excellent. Its Pi-reported cost was
`$0.3644`, about 61% of the saved Pi total. Use it where wall-clock urgency
matters enough to justify the apparent premium, not as the default worker for
every bounded task.

### GLM 5.2

Full observed quality at low spend, with the highest token total and long wall
time. It is attractive for hard asynchronous work where cost matters and latency
does not.

### Qwen3.8-27B

Strongest low-cost worker result in the saved Pi telemetry. It passed all three
write observations and reported `$0.0160` for the entire route. Its read-only memo needed tighter scope and
one factual correction, and its complex runs were slow. Give it bounded tasks,
explicit checks, and frontier review rather than open-ended planning ownership.

### Kimi K3

The difference between capability and operational reliability is clearest here.
The saved artifacts were high quality, but the harness observed one timeout and
one private-check failure. Keep it experimental for unattended workflows until
hard timeout and recovery controls are in place.

## 9. Recommended distributed workflow

The measured evidence supports this practical arrangement:

1. **Sol plans.** It writes the implementation brief, divides work into small
   units, freezes interfaces, identifies risky dependencies, and defines tests.
2. **Qwen handles bounded units.** Give it one module or repair with narrow
   allowed paths and executable acceptance checks.
3. **GLM handles a second hard unit or independent review.** It is cheaper than
   Sol and Fable but should run asynchronously because it was slower.
4. **Sol integrates and reviews.** It resolves conflicting patches, runs the
   full suite, and checks the result against the original plan.
5. **Fable is the urgency option.** Use it for a difficult task when elapsed
   time matters more than cost.
6. **Kimi remains guarded.** Require hard termination, patch preservation, and
   automatic verification; do not make it the only unattended owner of a
   critical unit yet.

This exact distributed workflow is an inference from separately measured model
behavior. It was not run as an additional Phase 2 observation and should be
tested later before being presented as a measured result.

## 10. What this adds to Phase 1

Phase 1 showed differences among Codex, Claude Code, and OpenCode as complete
products: permissions, orchestration, native integrations, tool behavior, and
developer experience. Phase 2 shows that model choice still changes cost,
latency, and reliability after those product differences are removed.

Together, the phases support a layered conclusion:

- Choose **Codex or Claude Code** based on the full-product workflow established
  in Phase 1.
- Use **Pi** as the neutral model laboratory, not as a claim that harness
  features are interchangeable.
- Use **Sol** for top-level reasoning, **Qwen** for cheap bounded work, and
  **GLM/Fable** according to the cost-versus-speed need.
- Treat open-weight status as neither a quality guarantee nor a weakness;
  Qwen and GLM were excellent here, while Kimi's issue was completion
  consistency rather than lack of coding capability.

## 11. Audit verdict and limitations

The result block is valid with preserved failures and limitations:

- all 20 observations match the frozen baseline and prompt hashes;
- every run began clean;
- all changed paths stayed in scope;
- raw failures, patches, stderr, verification, and telemetry were preserved;
- private test contents are not reproduced in public reports;
- T8 has no binary pass threshold;
- only T10 was repeated;
- the Kimi timeout was not a hard 900-second wall-clock stop;
- `served_model` was null in Pi telemetry;
- Pi-reported costs do not reconcile with the approximately `$2.50` observed
  account-balance decrease, so route-level cost rankings are provisional;
- twenty synthetic observations cannot justify a universal model ranking.

## 12. Evidence map

- Frozen protocol: `benchmark/phase-2/PROTOCOL.md`
- Frozen run matrix: `benchmark/phase-2/run-matrix.json`
- Machine-readable result:
  `benchmark/blocks/phase-2-pi-model-comparison-2026-08-23.results.json`
- Manual T8 grading: `benchmark/phase-2/T8-GRADING.json`
- Kimi post-timeout patch audit:
  `benchmark/phase-2/KIMI-T9-POST-TIMEOUT-AUDIT.json`
- Short audit: `benchmark/reports/phase-2/AUDIT.md`
- Raw local evidence: `benchmark/runs/<run-id>/`

Raw run directories contain manifests, frozen prompts, stdout/stderr, patches,
changed-path summaries, verification results, and final runner results. They are
Git-ignored local evidence and should be retained with the report package.
