---
type: llm
---

The request is explicit and complete: change one button's label on one screen, specification only.

PASS if the reply gives a short specification of that label change, in Thai, and stops there.
PASS if it names what must stay unchanged, or gives an acceptance criterion, without padding the answer.

FAIL if it asks the user clarifying questions before producing the specification.
FAIL if it runs an interview, a confirmation ritual, or a multi-section template for this one-line change.
FAIL if it expands the scope — renaming other buttons, redesigning the form, proposing a component refactor, adding notifications or translations that were not requested.
FAIL if it edits application code or claims to have changed files.
