# Plain2Dev

**พูดแบบที่คุณพูด → ได้คำสั่งที่นักพัฒนาเข้าใจ**

Plain2Dev v0.1.0 เป็นแพ็กเกจสกิลสำหรับ Coding AI: ตีความคำสั่งไทยหรืออังกฤษ ถามเฉพาะข้อมูลที่ขาด สรุปกลับให้ตรวจ และสร้างข้อกำหนดที่ตรวจรับได้ พร้อมเก็บความจำในโปรเจกต์

เริ่มที่ [START-HERE.md](START-HERE.md) แล้วให้ AI ติดตั้งตาม [INSTALL.md](INSTALL.md)

```sh
node scripts/install.mjs --target /path/to/project --agent codex
node scripts/install.mjs --target /path/to/project --check
```

ต้องมี Node.js 22+ ไม่มี dependencies เลือก `codex`, `claude`, `both` หรือ `generic` ได้ ตัวติดตั้งไม่แก้ AGENTS.md/CLAUDE.md เดิม ติดตั้งซ้ำได้ และเก็บ project memory ไว้เมื่ออัปเดต

## รุ่นนี้มีอะไร

- Intent Engine: แยกคำสั่งจริง สมมติฐาน ข้อเสนอ และข้อมูลที่ยังไม่รู้
- Question Engine: ถาม 1–3 เรื่องเฉพาะที่เปลี่ยนผลลัพธ์สำคัญ
- Context Router: เริ่มจากแผนที่และไฟล์ที่เกี่ยวข้อง ตรวจความสดก่อนใช้
- Token Engine: ลดการอ่าน/สรุปซ้ำโดยไม่ตัดข้อกำหนดหรือการทดสอบ
- Change Ledger: บันทึกเหตุผล ข้อกำหนดที่เปลี่ยน และหลักฐานการตรวจ
- ตัวติดตั้ง offline, self-check, ตัวอย่าง และแผน benchmark

`skills/plain2dev/` คือสกิลที่แจก; `scripts/` คือเครื่องมือติดตั้ง; `tests/` คือการทดสอบและแผนวัดพฤติกรรม

## สถานะ

รุ่นทดลองใช้ AI ที่ลูกค้ามีอยู่แล้ว ไม่มีเซิร์ฟเวอร์ API key หรือระบบสมาชิก ตัวแพ็กเกจไม่มีบริการที่ต้องจ่ายเพิ่ม แต่ AI อาจมีค่าบริการของผู้ให้บริการนั้น

การตีความและบันทึกความจำทำโดย AI ตามสกิล ไม่มี background watcher และอาจต้องสำรวจทั้งโปรเจกต์เมื่อผลกระทบกว้าง **ยังไม่มีผลวัดว่าลดโทเคนได้กี่เปอร์เซ็นต์** ดู [tests/BENCHMARK.md](tests/BENCHMARK.md) ก่อนกล่าวอ้างทางการตลาด

ตรวจตัวติดตั้งด้วย `node --test` และ `node scripts/validate.mjs` ดู [SELF-TEST.md](SELF-TEST.md) สำหรับทดลองกับ AI จริง และ [LICENSE.md](LICENSE.md) สำหรับสถานะสิทธิ์
