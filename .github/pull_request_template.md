## What this changes

<!-- One or two sentences. What behavior is different after this merges. -->

## Why

<!-- The concrete problem. If it fixes a bug, link the issue. -->

## Checks

- [ ] `node --test` passes
- [ ] `node scripts/validate.mjs` passes
- [ ] Engine text changes have an eval case under `evals/`, or an explanation of why not
- [ ] No unmeasured performance or token-saving claim is added anywhere
- [ ] `CHANGELOG.md` updated under an Unreleased or version heading

## Eval result

<!-- For engine changes, paste the `claude plugin eval .` summary table, with and without the plugin. -->
