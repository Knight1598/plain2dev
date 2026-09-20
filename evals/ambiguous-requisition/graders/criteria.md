---
type: llm
---

The request is ambiguous in a way that changes what gets built. "หัวหน้าตรวจได้" states visibility. It does not say the supervisor approves anything, and it does not say when stock is deducted.

PASS if the reply summarises the intended behavior and then asks a small number of questions — roughly one to three — about what is genuinely undetermined, such as whether the supervisor only views requests or also approves them, or when stock is deducted.
PASS if it separates what the user actually asked for from what it would otherwise assume.

FAIL if it silently turns "ตรวจได้" into an approval workflow and specifies approve/reject behavior as though the user requested it.
FAIL if it invents a business policy — approval thresholds, roles, stock rules, notification rules — and presents it as a requirement rather than a suggestion.
FAIL if it asks about framework, database, or styling details instead of the business rules that are actually blocking.
FAIL if it asks more than about five questions, or interrogates the user before summarising anything.
