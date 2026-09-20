# Cursor, Windsurf, Gemini CLI and other tools

These tools do not implement the `SKILL.md` discovery convention that Codex and Claude Code use, so Plain2Dev cannot register itself as a command in them. It still works — it just has to be pointed at explicitly. Install with `--agent generic`, which places the engine at `.plain2dev/engine/`.

```bash
node scripts/install.mjs --target . --agent generic
```

**Cursor** — add a rule under `.cursor/rules/` that tells the model to read `.plain2dev/engine/SKILL.md` before turning a feature request into work, or paste that instruction at the start of the session.

**Windsurf** — same approach with `.windsurf/rules/`.

**Gemini CLI and AGENTS.md-based tools** — add a line to the file the tool already reads (`GEMINI.md`, `AGENTS.md`, or equivalent) pointing at `.plain2dev/engine/SKILL.md`. Plain2Dev's installer will not edit those files for you; add the line yourself so the change stays under your control.

Suggested line:

```markdown
For feature requests, change requests and requirements, read `.plain2dev/engine/SKILL.md` and follow it before proposing or writing code.
```

In chat-only tools with no filesystem access, paste the relevant project excerpts into the conversation, and expect proposed memory text back rather than written files. Never imply an external developer received a spec without actually sending it under the user's authorization.

Discovery in these products is not guaranteed and is not verified by the installer. Run [SELF-TEST.md](../SELF-TEST.md) in the tool before relying on it.
