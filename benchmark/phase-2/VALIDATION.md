# Phase 2 setup validation

Date: 2026-08-23

Inference requests made during setup: 0

New metered model spend during setup: `$0`

## Harness and access

- Pi version `0.84.2` is installed.
- The existing benchmark runner already supports Pi in isolated worktrees.
- Pi OpenRouter OAuth reports `ready`.
- The refreshed Pi catalog contains all five exact core model routes.
- No API key or OAuth token is stored in the repository or printed in evidence.

## Task baselines

- T8's fixture sanity test passes before model work.
- T9's visible tests and placeholder student test fail before model work.
- T10's recovery test and placeholder student test fail before model work.

The expected baseline failures prove that a model must make a substantive repair
rather than receiving an already-solved fixture.

## Grader reference check

Ignored private reference implementations were copied into a temporary target,
never into the committed fixture. Results:

| Task | Visible/reference checks | Private checks |
|---|---:|---:|
| T9 capacity allocation | 7/7 pass | 5/5 pass |
| T10 event projector | 6/6 pass | 6/6 pass |

The reference files remain under the Git-ignored `benchmark/private` boundary
and are not copied to model worktrees. Private suite SHA-256 values match the
task contracts.

## Telemetry

The new Pi telemetry parser passed two focused tests and reproduced the saved
Phase 1 Pi pilot fields: DeepSeek via Ollama, 19,570 input, 1,597 output, 21,167
total tokens, 29 read-only tool calls, zero tool errors, and no edit request.

## Repository validation

- `npm run benchmark:phase2:validate`: pass.
- `npm run benchmark:validate`: pass.
- `git diff --check`: pass.

The Phase 2 baseline still requires a deliberate commit before any counted run.
