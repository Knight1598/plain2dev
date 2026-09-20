# Contributing

Bug reports and focused pull requests are welcome. Plain2Dev is source-available, not open source — see [LICENSE.md](LICENSE.md). Contributions are licensed to the copyright holder under the same terms so they can ship in paid releases; you keep your own copyright.

## Before opening a pull request

```bash
node --test
```

```bash
node scripts/validate.mjs
```

Both must pass. `validate.mjs` checks the skill's frontmatter and every relative Markdown link in the repository, so a new document with a link to a file that does not exist yet will fail the build.

Behavioral changes to the skill should come with an eval case under `evals/`, and ideally a `claude plugin eval .` result in the pull request showing the delta against the no-plugin baseline.

## What gets merged quickly

- A failing test that demonstrates a real installer bug, with the fix.
- An adapter for a tool you actually use, written honestly about what is and is not verified.
- Corrections to documentation that overstates what the package does.

## What will be asked to change

- **Any claim that is not measured.** No percentage, ratio or "up to" figure enters this repository without a recorded run under `tests/BENCHMARK.md`. This is the package's main promise to its users and it is not negotiable.
- Engine text that grows without earning it. Every line in `SKILL.md` and `references/` is loaded into a model's context on use; verbosity is a direct cost to the user.
- Changes that make the installer overwrite something silently. Conflicts must stay loud, and destructive behavior must stay behind an explicit flag.
- New runtime dependencies.

## Style

Match the surrounding text. The engine is written as terse, declarative instruction to a model, not as prose for a human reader. Documentation is written for someone deciding whether to trust the package. Both are honest about limits.
