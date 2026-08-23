# T4 v2 task correction

Date: 2026-08-23

New task: `T4-run-explorer-v2@1.0.1`

The first shared-harness block revealed that the original private suite required
the CSS source to match `/\.outcome/i`. The written task required visible Pass
or Fail text, but it did not prescribe a CSS class name. No top-native run had
started when the issue was discovered.

The original task, private suite, preregistration, and raw results remain
unchanged. The corrected task uses the same prompt and seeded fixture but a new
task ID and private-suite file, so both versions remain independently
hash-verifiable.

The v2 private suite removes only the class-name assertion. It still checks the
required summary landmarks and reduced-motion rule. Visible outcome text and
color-independent presentation are verified through the same external browser
check for every patch.

- Prompt SHA-256: `29ead71f698afec910207d63c9b09057990e9a3aaf1807f164ff7cc9694d3653`
- Private-suite SHA-256: `47da3888ebd6fd535829f17bb72f46d52544b5a00171b9a7a3f0527064fd2a67`
- Superseding protocol: `benchmark/blocks/T4-top-native-v2-2026-08-23.json`
- Runs under the superseded top-native protocol: `0`

As a regression check, the saved Codex, Claude Code, and OpenCode patches from
the shared-harness block were each reconstructed against the unchanged baseline
and graded with the v2 suite. All three passed 7 of 7 private checks. This
confirms that the new suite removes the accidental naming preference while
retaining the remaining private checks.
