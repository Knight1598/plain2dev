# Change history

No changes recorded yet.

Append dated entries: requirement ID/revision, reason, decisions, affected files, specified/implemented/verified/blocked status, actual checks/results and commit SHA when available. Preserve prior entries.

<details>
<summary>Example entry — delete this block once real changes exist</summary>

## 2026-09-20 · REQ-0001 r2 — stock deducts on approval

- Reason: user corrected the original rule; submitting a requisition must not move stock.
- Decisions: deduction moved into the approval path; rejection leaves stock untouched. Reversal on cancellation is UNKNOWN and left out of scope.
- Affected: `app/services/stock/deduct.rb`, `app/controllers/approvals_controller.rb`, `spec/models/requisition_spec.rb`.
- Status: implemented, verified.
- Checks: `bundle exec rspec spec/models/requisition_spec.rb` — 14 examples, 0 failures.
- Commit: `a1b2c3d`.

Record a check only if it was actually run, and paste its real result. Omit the commit line when no commit exists.
</details>
