# เริ่มใช้ Plain2Dev

## ทางที่เร็วที่สุด — Claude Code

```bash
claude marketplace add Knight1598/plain2dev
```

```bash
claude plugin install plain2dev@plain2dev
```

เสร็จแล้วพิมพ์ `/plain2dev` ตามด้วยสิ่งที่อยากได้ ถ้ายังไม่เห็นคำสั่ง ให้เปิด session ใหม่

## ทางที่ติดตั้งลงในโปรเจกต์

เปิดโปรเจกต์ที่ต้องการทำงานใน Codex หรือ Claude Code แล้วรัน

```bash
npx github:Knight1598/plain2dev --target . --agent codex
```

เปลี่ยน `codex` เป็น `claude`, `both` หรือ `generic` ตาม AI ที่ใช้ ต้องมี Node.js 18 ขึ้นไป

## ถ้าอยากให้ AI ติดตั้งให้

แตก ZIP แล้วบอก AI ว่าโฟลเดอร์ Plain2Dev อยู่ที่ไหน จากนั้นส่งข้อความนี้

> อ่าน INSTALL.md ในแพ็กเกจ Plain2Dev แล้วติดตั้งให้โปรเจกต์นี้ ใช้ตัวเลือกที่ตรงกับ AI ที่ฉันใช้อยู่ ตรวจการติดตั้งและบอกผล จากนั้นช่วยแปลงคำสั่งของฉันเป็นข้อกำหนดก่อนเริ่มเขียนโค้ด

## ลองใช้จริง

เมื่อติดตั้งเสร็จแล้ว ลองสั่ง

> ใช้ Plain2Dev ช่วยแปลงคำสั่งนี้: อยากให้หัวหน้าใส่เหตุผลตอนปฏิเสธการเบิกของ

AI จะสรุปสิ่งที่เข้าใจและถามเฉพาะที่จำเป็น คุณแก้ความเข้าใจได้ทุกครั้ง แล้วมันจะจดข้อกำหนดที่ตกลงกันแล้วไว้ใต้ `.plain2dev/` ในโปรเจกต์ เป็นไฟล์ Markdown ธรรมดาที่คุณเปิดอ่านและแก้เองได้

Codex เรียกด้วย `$plain2dev` ส่วน Claude Code ใช้ `/plain2dev` AI อื่นให้บอกมันอ่าน `.plain2dev/engine/SKILL.md` โดยตรง — ดู [adapters/OTHER_TOOLS.md](adapters/OTHER_TOOLS.md)

## ถอนออก

```bash
node scripts/install.mjs --target . --uninstall
```

ความจำในโปรเจกต์จะถูกเก็บไว้ ถ้าต้องการลบด้วยให้เติม `--purge-memory`

ไม่ต้องใช้บัญชีใหม่ ไม่ต้องใช้ API key และตัวติดตั้งไม่แก้ `AGENTS.md` หรือ `CLAUDE.md` เดิมของคุณ
