# Project map

State: not yet surveyed. Populate from source evidence.

| Feature | Paths | Purpose / dependencies | Verified revision/date |
| --- | --- | --- | --- |

Use project-relative paths. Mark unknowns; this index is not authoritative source.

<details>
<summary>Example of a populated row — delete this block once real entries exist</summary>

| Feature | Paths | Purpose / dependencies | Verified revision/date |
| --- | --- | --- | --- |
| Requisition approval | `app/models/requisition.rb`, `app/controllers/approvals_controller.rb`, `spec/models/requisition_spec.rb` | Approve/reject flow; writes `stock_movements` on approve | `a1b2c3d` · 2026-09-20 |
| Stock deduction | `app/services/stock/deduct.rb` | Called only from approval; unknown whether cancellation reverses it | unverified |

Paths are relative to the project root. `unverified` is a valid entry and is better than a guess.
</details>
