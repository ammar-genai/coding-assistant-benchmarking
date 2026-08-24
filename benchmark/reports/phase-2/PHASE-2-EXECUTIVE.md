# Phase 2 executive report: models inside one Pi harness

## Outcome

The neutral comparison is complete. Pi, prompts, tools, baseline, provider,
timeouts, and intervention policy were held constant while five model routes ran
20 observations. The cleanest operating portfolio from this sample is:

1. **GPT-5.6 Sol as planner and integrator.** It tied for the highest strict
   score, passed every write observation, and completed the whole set in 333.389
   seconds for `$0.0808` including its access check.
2. **Qwen3.8-27B as the default economical worker.** It passed all three write
   observations and cost only `$0.0160` for its complete lane. Its analysis memo
   was weaker and over the word limit, so important planning should still be
   reviewed by a frontier model.
3. **GLM 5.2 as a low-cost hard-task alternative.** It tied Sol on strict
   quality and cost `$0.0562`, but took 744.357 seconds.
4. **Claude Fable 5 for urgent difficult work.** It was the fastest reliable
   route at 241.862 seconds, but its `$0.3644` cost was more than half of all
   Phase 2 spend.
5. **Kimi K3 as an experimental worker.** Its T8 analysis scored 100 and its
   T10 scores were 95 and 100, but T9 timed out and one T10 repeat failed. The
   unchanged timeout patch later passed both suites and scored 95, confirming
   good implementation quality but poor unattended completion reliability.

## Results

| Model route | T8 | T9 counted | T10-1 | T10-2 | Strict weighted | Automatic write acceptance |
|---|---:|---:|---:|---:|---:|---:|
| GPT-5.6 Sol | 100 | 100 | 100 | 100 | 100.0 | 3/3 |
| GLM 5.2 | 100 | 100 | 100 | 100 | 100.0 | 3/3 |
| Claude Fable 5 | 99 | 100 | 100 | 100 | 99.8 | 3/3 |
| Qwen3.8-27B | 94 | 100 | 100 | 100 | 98.8 | 3/3 |
| Kimi K3 | 100 | 0 timeout | 95 fail | 100 | 68.75 | 1/3 |

The strict Kimi score uses zero for the counted timeout. Its diagnostic score
would be 97.25 if the post-timeout patch score were substituted, but the frozen
protocol does not allow that substitution.

## Time and spend

| Model | Total elapsed | Pi task cost | Pi access cost | Pi total |
|---|---:|---:|---:|---:|
| Fable | 241.862 s | $0.3556 | $0.0088 | $0.3644 |
| Sol | 333.389 s | $0.0797 | $0.0011 | $0.0808 |
| Qwen | 621.744 s | $0.0154 | $0.0006 | $0.0160 |
| GLM | 744.357 s | $0.0558 | $0.0004 | $0.0562 |
| Kimi | 1,178.618 s | $0.0738 | $0.0021 | $0.0760 |

Saved Pi telemetry sums to `$0.5933099058`. The user observed an approximately
`$2.50` OpenRouter account-balance decrease, or 13.9% of the `$18` ceiling. The
`$1.9066900942` difference cannot be allocated to individual routes from the
saved evidence. The table therefore remains useful as Pi-reported telemetry,
but its per-model cost ranking is provisional until billing is reconciled.

## Recommended two-level workflow

Use Sol to read the request, identify risks, divide the work, define acceptance
checks, and review integration. Send bounded, testable implementation units to
Qwen first. Use GLM for a second difficult module or independent review when
latency is acceptable. Escalate a failed or ambiguous worker task back to Sol;
use Fable when fast completion is worth the extra spend. Keep Kimi behind a hard
timeout and require saved-patch recovery until its completion behavior improves.

This workflow is a recommendation inferred from the separate observations. It
was not itself measured as a new distributed Phase 2 run.

## Important limits

Only the complex T10 task was repeated. T8 had no frozen binary pass threshold.
Kimi's timeout exceeded the nominal wall time during termination. OpenRouter did
not expose `served_model`. Token categories came through the same Pi adapter but
may still reflect provider-specific cache and reasoning definitions. Account
spend also does not reconcile to the saved Pi cost sum. The study therefore
identifies trade-offs under this protocol, not a universal winner.
