# Phase 2 in brief

Pi 0.84.2 was held constant while five OpenRouter model routes completed 20
counted observations across analysis, bounded implementation, and difficult
concurrency debugging.

| Route | Strict score | Write acceptance | Total time | Pi cost incl. access |
|---|---:|---:|---:|---:|
| GPT-5.6 Sol | 100.0 | 3/3 | 333.389 s | $0.0808 |
| GLM 5.2 | 100.0 | 3/3 | 744.357 s | $0.0562 |
| Claude Fable 5 | 99.8 | 3/3 | 241.862 s | $0.3644 |
| Qwen3.8-27B | 98.8 | 3/3 | 621.744 s | $0.0160 |
| Kimi K3 | 68.75 | 1/3 | 1,178.618 s | $0.0760 |

The practical result is not one winner:

- Use **Sol** for planning and difficult integration: perfect observed quality,
  much faster than GLM, and far cheaper than Fable.
- Use **Qwen3.8-27B** for low-cost bounded work: all write checks passed at the
  lowest cost by a wide margin.
- Use **GLM 5.2** when quality and low spend matter more than speed.
- Use **Fable 5** when turnaround matters more than API cost; it was the fastest
  reliable route in this sample.
- Keep **Kimi K3** experimental in unattended workflows. Its saved work was
  strong, but one run timed out and one repeated debugging run failed.

Saved Pi telemetry sums to **$0.5933**, but the observed OpenRouter balance
decrease was approximately **$2.50**. The difference is not allocatable per
route, so the cost column is provisional Pi telemetry. The higher account figure
used about 13.9% of the approved `$18` ceiling. These are observations from
three synthetic tasks, not a universal ranking.
