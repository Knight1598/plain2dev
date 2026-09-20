# Changelog

All notable changes to Plain2Dev. Versions follow [semantic versioning](https://semver.org/).

## 0.2.0 — 2026-09-20

First release intended to be installed directly from GitHub.

### Fixed

- **Upgrades no longer break when the package's file set changes.** v0.1.0 compared the recorded file list against the current package and refused any difference with `Manifest file set differs; migration required`. Adding or removing a single engine file made every existing installation permanently un-upgradable, with no migration path and no override. The installer now adds new files, removes files a previous version installed that the current one no longer ships, and prunes the directories that empties. Manifests written by v0.1.0 (`schema: 1`) upgrade in place.
- `--check` now reports every problem it finds instead of stopping at the first one.

### Added

- `--uninstall`, which removes the engine and keeps project memory; `--purge-memory` to delete memory as well, permitted only when no adapter remains.
- `--reconcile`, an explicit opt-in that replaces or deletes managed files you edited locally. Conflicts still stop an ordinary run.
- `--version` and a real `--help`.
- Claude Code plugin packaging: `.claude-plugin/plugin.json`, and a self-hosted `marketplace.json`, so the package installs with `claude marketplace add Knight1598/plain2dev`.
- `npx github:Knight1598/plain2dev --target . --agent codex` as an install path with no download step.
- A behavioral eval suite under `evals/`, runnable with `claude plugin eval .` against a no-plugin baseline.
- A fixed requirement identifier scheme — `REQ-0001 r1` — defined in `SKILL.md` and used by the templates, so identifiers stay stable across sessions and agents.
- Worked examples in every template, and a filled developer-instruction example in `SKILL.md`.
- `adapters/OTHER_TOOLS.md` for Cursor, Windsurf, Gemini CLI and AGENTS.md-based tools.
- English `README.md` with `README.th.md` alongside it; `CHANGELOG.md`, `SECURITY.md`, `CONTRIBUTING.md`; CI running the test suite and validator on every push.
- Twelve installer tests covering migration, stale-file removal, adapter removal, reconciliation, memory purge and the uninstall CLI. The suite is 25 tests.

### Changed

- Licence replaced. v0.1.0 shipped an "all rights reserved" notice that granted nobody any right to use the package and explicitly withheld permission to sell it. v0.2.0 is source-available: free for personal, learning and evaluation use, paid for commercial use, redistribution prohibited. See [LICENSE.md](LICENSE.md).
- Minimum Node.js lowered from 22 to 18; nothing in the installer needed a newer runtime.
- Installer results now report the resolved target, the previous version, and any files removed or reconciled.

### Not changed

No token-saving claim is made in this release. The benchmark protocol in `tests/BENCHMARK.md` has still not been run. See the status section there before using any number in marketing.

## 0.1.0 — 2026-09-18

Initial development preview. Skill engine, five references, four templates, Codex and Claude Code adapters, offline installer with hash manifest and conflict detection, 13 installer tests, benchmark protocol.

Not published to GitHub.
