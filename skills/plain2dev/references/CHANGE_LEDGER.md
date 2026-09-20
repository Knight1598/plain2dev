# Project memory

Keep knowledge outside the engine:

- `.plain2dev/project/MAP.md`: feature/path index with verified revision.
- `.plain2dev/requirements/INDEX.md`: requirement IDs, revisions, states; link longer records. Allocate IDs as `REQ-0001` by incrementing the highest entry already in the index, and revisions as `r1`, `r2`; never reuse a retired ID.
- `.plain2dev/history/CHANGES.md`: why, affected requirement/files, decisions and verification.

Update affected entries after confirmed requirements or actual work. Distinguish specified/implemented/verified/blocked. Record checks only if run; commit SHA only if it exists, otherwise timestamp and working-tree state. Git owns diffs; the ledger owns intent.

Without filesystem access return a proposed entry and disclose it was not persisted. Never log credentials, personal customer data, unrelated chat or fabricated history. Reconcile concurrent edits; preserve memory during upgrades.
