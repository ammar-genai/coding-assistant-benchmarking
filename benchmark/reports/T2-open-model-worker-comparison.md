# T2 hosted open-model worker comparison

Date: 2026-08-23

Block: `T2-open-model-worker-2026-08-23`

Baseline commit: `67d434e5889c23853c1afbf126b721a1f320de88`

Task: `T2-filter-valid-runs@1.0.0`

Harness: OpenCode `1.18.21`

Runs per model: one

## Purpose

This block tests three hosted open-weight models as bounded coding workers while
holding the assistant harness, prompt, task, repository commit, permissions,
timeout, and grading constant. The protocol and run order were committed before
execution in `benchmark/blocks/T2-open-model-worker-2026-08-23.json`.

The deterministic randomized order was Qwen, DeepSeek, then Kimi. All runs were
executed once in that order without substitution or rerun.

## Results

| Model route | Score | Elapsed | Visible | Private | Scope | Tools | Total tokens | Reported cost |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Qwen3.8-27B via OpenRouter | 100/100 | 37.815 s | 2/2 | 5/5 | pass | 4 | 29,430 | $0.0090234 |
| DeepSeek V4 Flash via Ollama Cloud | 100/100 | 7.528 s | 2/2 | 5/5 | pass | 3 | 25,470 | $0 reported |
| Kimi K2.7 Code via Ollama Cloud | 100/100 | 7.092 s | 2/2 | 5/5 | pass | 4 | 24,602 | $0 reported |

Every model:

- changed exactly `benchmark/fixtures/T2-run-filter/select-comparison-runs.mjs`;
- replaced the incorrect OR conditions with AND conditions;
- passed both committed tests and all five private tests;
- preserved order, object identity, input immutability, and validation behavior;
- explained the root cause, change, and visible test result;
- required no human intervention; and
- produced patch SHA-256
  `65e7817388ad10c7133b05ed38721f3f3753e8adb2a31e1430965de5869e4946`.

## Usage detail

| Model | Input | Cache read | Output | Reasoning | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Qwen3.8-27B | 15,365 | 13,328 | 551 | 186 | 29,430 |
| DeepSeek V4 Flash | 24,980 | 0 | 490 | 0 | 25,470 |
| Kimi K2.7 Code | 24,026 | 0 | 576 | 0 | 24,602 |

OpenCode's total for Qwen includes cache-read and reasoning tokens. The Ollama
routes reported no cache or reasoning categories for these runs.

The cost fields are not directly comparable. OpenCode reported the OpenRouter
charge for Qwen, while the Ollama wrapper reported zero for DeepSeek and Kimi;
zero is not proof that hosting those models has no underlying cost.

## Interpretation

This task produced a functional tie. It is too small to distinguish coding
quality because the correct patch is a three-operator change and all models
found it immediately.

Kimi was the fastest measured run at 7.092 seconds, followed closely by
DeepSeek at 7.528 seconds. Qwen took 37.815 seconds, about 5.3 times Kimi's time
and 5.0 times DeepSeek's. Qwen used only four tool calls, so the gap was not
caused by a tool loop.

Qwen's behavior improved materially from its read-only T1 pilot: this bounded
task used 29,430 total reported tokens and cost less than one cent, compared
with the much broader repository-reading strategy seen in T1. This supports
using tight task contracts when assigning work to a paid smaller model.

## Decision

Advance Qwen to one moderate T3 write-task comparison. Its correctness and
scope control are proven on T2, and its paid charge was small enough to justify
the next test. Do not select it over Kimi or DeepSeek yet: the only observed T2
difference favors the Ollama routes on elapsed time, and one run per model does
not establish reliability.

The next block should repeat OpenCode + DeepSeek, Kimi, and Qwen on frozen T3
from one new baseline in a newly randomized order. T3 can reveal differences in
multi-file reasoning, assistant-authored tests, edge-case handling, scope, and
cost that T2 could not expose.
