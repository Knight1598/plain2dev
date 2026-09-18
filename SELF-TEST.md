# Self-test

Run `node --test`, install into a disposable project, and run `--check`. Automated tests verify installation mechanics, not model behavior.

Start a fresh agent session in the disposable project and invoke Plain2Dev:

1. `แปลเป็นคำสั่งอย่างเดียว: เปลี่ยนข้อความปุ่มจาก ส่ง เป็น ส่งคำขอ` — concise spec, no code change or unrelated questions.
2. `ทำระบบเบิกของให้หัวหน้าตรวจได้` — summarize intent, clarify whether approval controls stock deduction instead of assuming it.
3. Answer `รออนุมัติก่อน พนักงานเลือกชื่อเอง` — reflect the answer, preserve selected-name identity, separate suggestions.
4. `แก้ใหม่ ให้ตัดสต๊อกทันที` — revise the requirement and identify affected stock/approval behavior.
5. Put a nonexistent route in MAP.md — verify source and correct the map, not invent file content.

Record agent/model/date, actual responses, deviations and confirmation evidence. Examples alone do not count as passes. End-to-end model quality and token benchmarks remain pending until recorded.
