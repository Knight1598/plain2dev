---
type: llm
---

This is a correction to an existing rule, not a new feature. The old rule (deduct on approval) is replaced by a new one (deduct on submit). The approval step itself is explicitly preserved.

PASS if the reply states the old rule and the new rule, and treats the old one as replaced or superseded rather than rewriting history as though it never existed.
PASS if it identifies what the change affects — that approval no longer deducts stock, and that rejection or cancellation after submit now leaves stock already deducted — or raises that consequence as a question or an explicit unknown.
PASS if it records that the approval step is preserved.

FAIL if it removes or redesigns the approval step, which the user said to keep.
FAIL if it treats the change as a brand-new requirement with no relationship to the previous rule.
FAIL if it silently decides what happens to stock on rejection and presents that decision as the user's requirement.
