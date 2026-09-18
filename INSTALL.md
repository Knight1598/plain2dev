# Install / update

Read the destination project's existing instructions first. Take the target directory from the user task, not a guessed home/global location. Install project-locally from the extracted package:

```sh
node scripts/install.mjs --target /absolute/project/path --agent codex
node scripts/install.mjs --target /absolute/project/path --check
```

Agents: `codex` (default), `claude`, `both`, `generic`. Use `--dry-run` to preview. Existing managed files upgrade only when recorded hashes match; local edits produce a conflict. There is no force-overwrite option. Reconcile customized files before retrying.

| Target | Skill location |
| --- | --- |
| Codex | `.agents/skills/plain2dev/` |
| Claude Code | `.claude/skills/plain2dev/` |
| Generic | `.plain2dev/engine/` |

Memory is separate under `.plain2dev/project/`, `.plain2dev/requirements/`, `.plain2dev/history/`. Only missing initial templates are created; upgrades preserve existing memory byte-for-byte. Switching agents adds the new adapter and keeps previous adapters. No global config, credentials, AGENTS.md or CLAUDE.md are changed.

`--check` verifies files and integrity only. Run SELF-TEST.md in the target agent before reporting behavioral readiness; a hash check does not prove the AI loaded the skill.

## Without Node.js

Copy the entire `skills/plain2dev` folder to the chosen skill location. Preserve customized files. Create `.plain2dev/project/MAP.md` from `templates/PROJECT_MAP.md`, `.plain2dev/requirements/INDEX.md` from `templates/REQUIREMENTS.md`, and `.plain2dev/history/CHANGES.md` from `templates/CHANGE.md` only if absent. Run behavioral checks. Manual installations lack an installer manifest and need reconciliation before automated upgrades/checks.

## Removal / recovery

Review `.plain2dev/install.json` for managed engine paths. Remove only the selected Plain2Dev skill folder; retain memory unless the user requests its removal. Never remove parent `.agents` or `.claude` folders. Back up customizations before reconciliation. Installation is preflighted but not a multi-file transaction: inspect partial output after disk/permission failures before retrying.
