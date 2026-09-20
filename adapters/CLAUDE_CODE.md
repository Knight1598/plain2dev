# Claude Code

Two supported paths.

**Plugin (user-level):** `claude marketplace add Knight1598/plain2dev`, then `claude plugin install plain2dev@plain2dev`. Gives you `/plain2dev` in every project. The plugin ships the skill; project memory is still written into whichever project you are working in.

**Project-local:** install to `.claude/skills/plain2dev/` with `node scripts/install.mjs --target . --agent claude`. Use this when the skill should travel with the repository and be shared through version control.

Invoke with `/plain2dev` followed by the request, or let the model select the skill from the request itself. No provider-specific tool permission override is used. Preserve `CLAUDE.md` and project conventions.

[Official Claude Code documentation](https://code.claude.com/docs/en/skills). Runtime behavior depends on the client and model; the installer does not launch Claude Code. If the command does not appear, restart the session.
