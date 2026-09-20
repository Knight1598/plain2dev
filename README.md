# Plain2Dev

**Say it the way you'd say it. Get an instruction a developer can build from.**

[ไทย](README.th.md) · [Install](INSTALL.md) · [Changelog](CHANGELOG.md) · [License](LICENSE.md)

Plain2Dev is a skill package for coding AI. It reads a request in Thai or English, asks only the questions that would change the result, shows you what it understood before it builds anything, and compiles a testable developer instruction — then remembers the decision in the project so the next session doesn't start from zero.

It is not a code generator and not a chatbot wrapper. It is the layer between "I want the manager to give a reason when rejecting" and a spec with acceptance criteria that survives review.

---

## Install

**Claude Code plugin** — recommended:

```bash
claude marketplace add Knight1598/plain2dev
```

```bash
claude plugin install plain2dev@plain2dev
```

**Project-local install** — Codex, Claude Code, or any agent, no account needed:

```bash
npx github:Knight1598/plain2dev --target . --agent codex
```

**From a downloaded release:**

```bash
node scripts/install.mjs --target /absolute/project/path --agent claude
```

```bash
node scripts/install.mjs --target /absolute/project/path --check
```

Node.js 18 or newer. No dependencies, no server, no API key, no account. Agents: `codex`, `claude`, `both`, `generic`. Add `--dry-run` to preview, `--uninstall` to remove.

The installer never edits your `AGENTS.md` or `CLAUDE.md`, never touches global config, and preserves project memory byte-for-byte across upgrades.

---

## Use it

In Claude Code:

```
/plain2dev I want the supervisor to give a reason when rejecting a requisition
```

In Codex: `$plain2dev` followed by the request. In any other agent: tell it to read `.plain2dev/engine/SKILL.md`.

You get back what it understood, at most a few questions that actually matter, and a spec:

> **REQ-0003 r1** — Rejection requires a reason
> - The reason is required, validated non-blank on the server, stored with the rejection and shown to the requester.
> - Preserved: approval path, stock behavior, notifications, roles.
> - Not included: LINE notification (suggested, not accepted).
> - Acceptance: an empty reason cannot reject; a valid reason persists and appears after reload; approval behavior unchanged.

Correct it at any point — `actually, deduct the stock immediately` — and it supersedes the affected requirement instead of quietly rewriting history.

---

## What's in it

| Part | Job |
| --- | --- |
| Intent Engine | Separates what you asked for, what the AI assumed, what it merely suggested, and what nobody knows yet |
| Question Engine | Asks 1–3 questions per round, only where different answers change the outcome |
| Context Router | Starts from the project map and named files, verifies before trusting, corrects a stale map |
| Token Engine | Avoids re-reading and re-summarising the same ground without dropping constraints or tests |
| Change Ledger | Records why a requirement changed, what it affected, and what was actually verified |

Memory lives in the target project under `.plain2dev/` — a feature map, a requirement index numbered `REQ-0001 r1`, and a dated change history. It is plain Markdown you can read, diff and edit. Git owns the diffs; the ledger owns the intent.

---

## What is measured, and what is not

This matters more than a feature list.

**Verified by the test suite** (`node --test`, 25 tests): installation, upgrade across changed file sets, stale-file removal, adapter add/remove, conflict detection, symlink and path-traversal refusal, manifest tampering, memory preservation, uninstall.

**Not yet measured:** how much this reduces token spend, and by how much. There is no percentage claim anywhere in this package, because no comparative benchmark has been run. [`tests/BENCHMARK.md`](tests/BENCHMARK.md) is the protocol that would produce one — eight cases, two arms, three runs each, provider-reported usage only. Until those numbers exist, the value on offer is a scoped spec and a project that remembers its own decisions, not a savings figure.

Behavioral evals live in [`evals/`](evals/) and run with `claude plugin eval .`, which scores the skill against a no-plugin baseline.

---

## Documentation

- [INSTALL.md](INSTALL.md) — install, upgrade, uninstall, recovery, manual install without Node
- [SELF-TEST.md](SELF-TEST.md) — behavioral checks to run in your own agent before trusting it
- [tests/BENCHMARK.md](tests/BENCHMARK.md) — the measurement protocol and its current status
- [adapters/](adapters/) — Claude Code, Codex, and other tools
- [examples/](examples/) — worked transcripts
- [SECURITY.md](SECURITY.md) — reporting a vulnerability
- [CONTRIBUTING.md](CONTRIBUTING.md) — how to propose a change

---

## Licence

Source-available, not open source. Free to read, install, modify privately and use for personal, hobby, learning or evaluation work, forever. **Commercial use requires a paid licence.** Redistribution and resale are not permitted under any licence.

Full terms: [LICENSE.md](LICENSE.md).

© 2026 IAHCARUS
