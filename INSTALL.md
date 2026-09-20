# Install, upgrade and remove

Read the destination project's existing instructions first. Take the target directory from the user task, not a guessed home or global location.

## Claude Code plugin

```bash
claude marketplace add Knight1598/plain2dev
```

```bash
claude plugin install plain2dev@plain2dev
```

The same two steps work as `/plugin marketplace add Knight1598/plain2dev` and `/plugin install plain2dev@plain2dev` inside a session. A plugin install is user-level: it gives you `/plain2dev` in every project but writes no project memory until you use it. Verify discovery in the client; restart the session if the command does not appear.

## Project-local install

```bash
npx github:Knight1598/plain2dev --target . --agent codex
```

From an extracted release, run the installer directly:

```bash
node scripts/install.mjs --target /absolute/project/path --agent codex
```

```bash
node scripts/install.mjs --target /absolute/project/path --check
```

Node.js 18 or newer, no dependencies.

| Option | Effect |
| --- | --- |
| `--target PATH` | Project to install into. Required. |
| `--agent NAME` | `codex` (default), `claude`, `both`, `generic`. |
| `--dry-run` | Print the plan; write nothing. |
| `--check` | Verify installed files against the manifest. |
| `--uninstall` | Remove the engine. Memory is kept. |
| `--purge-memory` | With `--uninstall`, also delete `.plain2dev` memory. Destructive. |
| `--reconcile` | Replace or delete managed files you edited locally. Destructive. |

| Target | Skill location |
| --- | --- |
| Codex | `.agents/skills/plain2dev/` |
| Claude Code | `.claude/skills/plain2dev/` |
| Generic | `.plain2dev/engine/` |

Memory is separate, under `.plain2dev/project/`, `.plain2dev/requirements/` and `.plain2dev/history/`. Only missing initial templates are created. No global config, credentials, `AGENTS.md` or `CLAUDE.md` are changed.

`--check` verifies files and integrity only. Run [SELF-TEST.md](SELF-TEST.md) in the target agent before reporting behavioral readiness; a hash check does not prove the AI loaded the skill.

## Upgrading

Run the same install command from the newer package. Upgrades:

- add files the new version introduces,
- remove files the previous version installed that the new one no longer ships,
- preserve every file under `.plain2dev/project/`, `.plain2dev/requirements/` and `.plain2dev/history/` byte-for-byte,
- keep adapters you installed earlier, and add the one you name.

An engine file you edited yourself stops the upgrade with a conflict naming the file. Reconcile it by hand, or re-run with `--reconcile` to replace your version with the packaged one. There is no silent overwrite.

Installations made by copying files, with no `.plain2dev/install.json` manifest, cannot be upgraded or checked automatically. Reinstall over them with the installer once, resolving any conflict it reports.

## Switching or adding an agent

Running the installer with a different `--agent` adds that adapter and keeps the existing ones. To drop one:

```bash
node scripts/install.mjs --target /absolute/project/path --uninstall --agent codex
```

The remaining adapters and all memory stay in place.

## Removal

```bash
node scripts/install.mjs --target /absolute/project/path --uninstall
```

This removes the skill folders and the installer manifest, prunes the directories it emptied, and **keeps your project memory**. Add `--purge-memory` to delete `.plain2dev/` as well — only possible when no adapter remains, and not reversible.

Never remove a parent `.agents` or `.claude` folder by hand; the installer only prunes directories it emptied itself. Add `--dry-run` to either form to see the file list first.

## Without Node.js

Copy the entire `skills/plain2dev` folder to the chosen skill location. Preserve customized files. Create `.plain2dev/project/MAP.md` from `templates/PROJECT_MAP.md`, `.plain2dev/requirements/INDEX.md` from `templates/REQUIREMENTS.md`, and `.plain2dev/history/CHANGES.md` from `templates/CHANGE.md`, only if absent. Run behavioral checks afterwards. Manual installations lack a manifest and need one reinstall through the installer before automated upgrades or checks work.

## Recovery

Inspect `.plain2dev/install.json` for the managed engine paths and the recorded version. Installation is preflighted — nothing is written when the plan reports a conflict — but it is not a multi-file transaction: after a disk or permission failure mid-write, run `--check` to see what is missing, then re-run the install to repair it. Back up customizations before using `--reconcile`.
