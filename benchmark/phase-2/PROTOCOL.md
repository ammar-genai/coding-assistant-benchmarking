# Phase 2 neutral Pi comparison protocol

Status: draft until committed before the first paid access check

Harness: Pi 0.84.2

Planned counted runs: 20
Human interventions per run: 0

## Separation from Phase 1

Phase 1 artifacts remain unchanged. Phase 2 uses new T8, T9, and T10 fixtures so
models are not evaluated on already-solved Phase 1 code. Results will be stored
in a separate Phase 2 block and report. Pi is the only counted harness.

## Models and access

All five core models should use Pi's OpenRouter provider so provider cost is
metered consistently and Pi's tool implementation is identical:

| Label | Pi model route | Role |
|---|---|---|
| Sol | `openrouter/openai/gpt-5.6-sol` | OpenAI frontier |
| Fable | `openrouter/anthropic/claude-fable-5` | Anthropic highest-capability frontier |
| Kimi | `openrouter/moonshotai/kimi-k3` | Large open-weight agentic model |
| Qwen | `openrouter/qwen/qwen3.8-27b` | Smaller 27B open-weight model |
| GLM | `openrouter/z-ai/glm-5.2` | Top open-weight long-horizon model |

If and only if Fable fails the pre-run access check, replace that row with
`openrouter/anthropic/claude-opus-5` and label the substitution everywhere. Do
not silently fall back during a counted run.

## Fixed Pi surface

- Non-interactive JSON output.
- No saved session.
- No extensions, skills, prompt templates, or themes.
- Same repository context files for every model.
- Read-only tools for T8: `read,grep,find,ls`.
- Write tools for T9 and T10: `read,grep,find,ls,edit,write,bash`.
- No network or dependency installation inside tasks.
- Provider/model default reasoning setting; record the effective setting where
  Pi exposes it. Do not force a nominal level that means different things across
  model families.

## Tasks and weighting

| Task | Type | Runs per model | Timeout | Overall weight |
|---|---|---:|---:|---:|
| T8 change-impact analysis | Read-only reasoning | 1 | 600 s | 20% |
| T9 capacity allocation | Bounded implementation | 1 | 900 s | 30% |
| T10 event projector | Concurrency/debugging incident | 2 | 1,200 s | 50% using the mean of both runs |

The predefined second T10 observation is a repeat, not a failure rerun. Both T10
results count even if the first passes, fails, or times out.

## Frozen run order

The order is rotated to avoid giving one model the same warm-provider position
in every block:

| Block | Order |
|---|---|
| T8 | Qwen → Sol → GLM → Kimi → Fable |
| T9 | Sol → GLM → Kimi → Fable → Qwen |
| T10 observation 1 | GLM → Kimi → Fable → Qwen → Sol |
| T10 observation 2 | Kimi → Fable → Qwen → Sol → GLM |

## Result rules

- Preserve runner status, automatic acceptance, patch, tests, stderr, and raw Pi
  JSON before grading.
- A timeout or nonzero runner exit remains a failed counted run. A saved partial
  patch may receive a separately labeled post-timeout rubric score.
- Correct grader defects against the unchanged saved patch and version the
  grader; never rewrite the raw result.
- Do not rerun a model because its answer is weak. A provider failure after
  inference begins counts unless a preregistered addendum identifies a pure
  infrastructure failure before inspecting model output.
- T8 is graded manually once against its frozen rubric, blinded to model name
  where practical.
- T9 and T10 use visible tests, private suites, scope checks, and the frozen
  rubric.

## Metrics

Primary:

1. runner acceptance and rubric score;
2. visible and private checks;
3. scope compliance; and
4. elapsed wall time.

Secondary:

- time to first edit request;
- tool calls and tool errors;
- input, output, cache-read, cache-write, reasoning, and total tokens as Pi
  reports them;
- OpenRouter-reported cost;
- assistant-authored test count and quality;
- final-answer completeness; and
- human intervention count.

Because the same Pi adapter is used, token fields are more comparable than in
Phase 1. They still remain provider-reported telemetry and must be checked for
model-specific differences.

## Comparison method

Overall score is `20% × T8 + 30% × T9 + 50% × mean(T10-1, T10-2)`. Report
acceptance count beside the score so a polished partial answer cannot hide a
runner failure. Use time and cost as separate trade-off dimensions, not hidden
deductions from quality.

No universal-winner claim is allowed from twenty runs. The report may identify
the best observed route for quality, speed, cost, and consistency under this
protocol.

## Stop conditions

- Stop before paid access checks until Pi OpenRouter authentication and the
  explicit Phase 2 spend ceiling are approved.
- After every paid run, record its provider cost before starting the next run.
- Phase 2's effective ceiling is `$18.00`, matching the confirmed available
  OpenRouter credit.
- Stop starting new runs at `$16.50` recorded Phase 2 spend, leaving `$1.50`
  safety headroom for delayed or final in-flight telemetry.
- Stop a run at its frozen timeout; do not extend it interactively.
- Do not increase an account spending limit or enable a provider billing mode
  without separate approval.
