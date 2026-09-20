# ตัวอย่างสมมติ: เพิ่มเหตุผลการปฏิเสธ

> ตัวอย่างนี้เขียนขึ้นเพื่อแสดงรูปแบบผลลัพธ์ ไม่ใช่ผล benchmark

ผู้ใช้: “เพิ่มให้หัวหน้าใส่เหตุผลตอนปฏิเสธการเบิก”

> **PLAIN2DEV · UNDERSTANDING**  
> เป้าหมาย: เพิ่มเหตุผลเมื่อปฏิเสธคำขอ

เข้าใจว่าต้องการให้หัวหน้ากรอกเหตุผลตอนปฏิเสธ ผมจะตรวจขั้นตอนเดิมและจุดแสดงสถานะก่อน

ถ้าบริบทยังตอบไม่ได้: “บังคับกรอกทุกครั้งไหม และผู้ขอเบิกควรเห็นเหตุผลด้วยหรือไม่?”

ผู้ใช้: “บังคับกรอก และให้คนเบิกเห็นด้วย”

สรุป: หัวหน้าต้องกรอกเหตุผลก่อนปฏิเสธ ผู้ขอเห็นเหตุผลพร้อมสถานะเดิม

Developer instruction:

- Locate the real rejection handler, model and requester view.
- Validate nonblank reasons on the server, persist with rejection and display as text.
- Preserve approval and inventory behavior; no notifications or role redesign.
- Acceptance: empty reason cannot reject; valid reason persists and appears after reload; approval behavior stays unchanged.

การแจ้งเตือน LINE เป็นข้อเสนอเพิ่มเติม ไม่อยู่ในงานนี้ ตัวอย่างนี้ไม่ใช่ผล benchmark
