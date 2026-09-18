# Context router

Read relevant entries in `.plain2dev/project/MAP.md` if present; use as an index, not truth. Start with named files/symbols and nearby tests. Inspect working-tree changes and revision metadata when available. Verify mapped paths exist and match the feature.

Search filenames/symbols and bounded ranges before large reads. Follow imports, callers, schemas and tests across affected boundaries. Stale/absent maps require discovery and correction. Cross-cutting changes may require broad scans; explain why rather than forbidding them.

Exclude generated files, dependencies and secrets from routine scans. Record feature → paths → purpose/dependencies → verified revision/date, marking unknowns. Do not infer no impact from absence in a map. Avoid copying source/logs into memory.

Memory belongs to the target project. Read relevant requirement/history entries only. Summarize long ledgers into indexes without losing originals. No daemon is included; the current agent refreshes entries after changes.
