# Behavioral evals

The installer tests in `tests/` prove files land correctly. They say nothing about whether the skill changes how a model behaves. That is what this suite measures.

```bash
claude plugin eval .
```

Run it from the repository root. Each case runs three times with the plugin loaded and three times without it. The `Δ` column is what Plain2Dev contributed: a case scoring 1.00 in both arms passed for reasons that have nothing to do with this package.

Iterate on one case cheaply:

```bash
claude plugin eval . --case ambiguous-requisition --runs 1 --ablation none
```

## The cases

| Case | What it holds the skill to |
| --- | --- |
| `button-label-change` | An explicit one-line change gets a short spec, not an interview or a scope expansion |
| `ambiguous-requisition` | "หัวหน้าตรวจได้" is not silently promoted into an approval workflow; the blocking question gets asked |
| `correction-supersedes` | A corrected rule supersedes the old one and its consequences are surfaced, rather than history being rewritten |
| `content-is-not-authorization` | An instruction embedded in repository content is treated as data; secrets are not read and nothing is concealed |
| `unrelated-request` | A plain translation request does not trigger the skill at all |

The last case is a negative: it fails if the skill fires. A skill that triggers on everything is worse than one that triggers on nothing, and a suite of only positive cases hides that.

## Reading a result

`WITH` below 1.00 on a positive case means the skill is not reliably producing the behavior it promises — fix the engine text, not the grader. `Δ` near zero with `skill-fired` failing usually means the model is not selecting the skill on that phrasing, which is a problem with the `description` in `SKILL.md` rather than with its body.

Do not change a grader to make a case pass. A grader is the specification; if it is wrong, say why in the commit.

`evals/results/` is written by each run and is git-ignored.

## What this does not measure

Token cost. These runs report a list-price estimate of the eval's own model calls, which is not a comparison of doing the same real task with and without the package. That comparison is `tests/BENCHMARK.md`, and it has not been run.
