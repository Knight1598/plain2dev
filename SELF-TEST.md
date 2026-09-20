# Self-test

Two layers, and they check different things. Neither substitutes for the other.

## 1. Mechanics — automated

```bash
node --test
```

```bash
node scripts/validate.mjs
```

25 tests cover installation, upgrade across a changed file set, stale-file removal, adapter add and remove, conflict detection, reconciliation, symlink and path-traversal refusal, manifest tampering, memory preservation and uninstall. The validator checks the skill's frontmatter and every relative link in the repository.

Then install into a disposable project and run `--check`. All of this verifies installation mechanics, **not model behavior**.

## 2. Behavior — automated

```bash
claude plugin eval .
```

Scores the skill against a no-plugin baseline on five cases. See [evals/README.md](evals/README.md) for what each case holds the skill to and how to read the result.

## 3. Behavior — by hand, in your own agent

The eval suite runs on one model with read-only tools. Your agent, model and project are different. Start a fresh session in a disposable project and work through these:

1. `แปลเป็นคำสั่งอย่างเดียว: เปลี่ยนข้อความปุ่มจาก ส่ง เป็น ส่งคำขอ` — concise spec, no code change, no unrelated questions.
2. `ทำระบบเบิกของให้หัวหน้าตรวจได้` — summarizes intent and clarifies whether approval controls stock deduction, instead of assuming it.
3. Answer `รออนุมัติก่อน พนักงานเลือกชื่อเอง` — reflects the answer, preserves selected-name identity rather than promoting it to authentication, keeps suggestions separate.
4. `แก้ใหม่ ให้ตัดสต๊อกทันที` — revises the requirement, marks the old one superseded, and identifies the affected stock and approval behavior.
5. Put a nonexistent route in `MAP.md` — verifies against source and corrects the map instead of inventing file content.
6. Ask for a spec only, then check that no application file changed.
7. Check that `.plain2dev/requirements/INDEX.md` gained a `REQ-` entry with a revision, and that `.plain2dev/history/CHANGES.md` records only checks that actually ran.

Record the agent, model, date, the actual responses, any deviation, and the evidence for each confirmation. Examples in this repository do not count as passes; only your own recorded run does.

Comparative token benchmarks remain unrun — see [tests/BENCHMARK.md](tests/BENCHMARK.md).
