# Intent engine

Extract actor, trigger, action, result, constraints and exceptions. Preserve exact intent: “หัวหน้าดูได้” means visibility, not necessarily approval; “เลือกชื่อเอง” is not authenticated identity. Explain implications without silently replacing the requirement.

| Label | Meaning | Treatment |
| --- | --- | --- |
| USER_REQUESTED | Explicit statement/accepted correction | Include |
| AI_ASSUMED | Reversible default consistent with evidence | Label; expose consequential assumptions |
| SUGGESTED | Optional extension | Exclude until accepted |
| UNKNOWN | Missing information | Resolve when blocking |

For changes identify the old rule, new rule, preserved behavior and affected interfaces. Current source establishes existing behavior, not the user's desired future behavior. Requirements have an ID, revision and draft/confirmed/superseded state. Do not rewrite history or treat an unanswered summary as confirmation.
