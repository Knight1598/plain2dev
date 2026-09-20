# Developer instruction

Use only fields relevant to the task, filled from actual evidence:

- Requirement ID and revision (`REQ-0007 r1`)
- Goal and requested behavior
- Scope, preserved behavior and non-goals
- Verified source paths/current behavior
- Assumptions, provenance and unresolved blockers
- Observable acceptance criteria
- Existing-project constraints
- Appropriate verification

Do not mark READY while a consequential unknown blocks a correct spec.

<details>
<summary>Example of a filled instruction</summary>

**REQ-0003 r1** — Rejection requires a reason

- Goal: a supervisor cannot reject a requisition without recording why.
- Verified context: rejection handled in `app/controllers/approvals_controller.rb#reject`; requester view is `app/views/requisitions/show.html.erb`.
- Behavior: the reason is required, validated on the server as non-blank, persisted with the rejection, and displayed to the requester as text.
- Preserved: approval path, stock behavior, notification behavior, role model.
- Non-goals: LINE notification (SUGGESTED, not accepted); reason templates.
- Assumption (AI_ASSUMED): a free-text field is acceptable; a fixed reason list was not requested.
- Acceptance: rejecting with an empty reason fails and the requisition stays pending; rejecting with text persists it and the requester sees it after reload; approval behavior unchanged.
- Verification: model validation spec plus one request spec for the empty-reason case.

Scale this down for small changes. Three lines is a valid instruction.
</details>
