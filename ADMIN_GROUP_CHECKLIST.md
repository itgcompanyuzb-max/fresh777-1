# Telegram Guruh Bildirishnomalarivoni - Tezkor Ro'yxati

## ✅ O'rnatish Bosqichlari

### 1. Telegram Guruh Tayyorlash
- [ ] Telegram'da yangi guruh yaratish
- [ ] Botni guruhga qo'shish
- [ ] Botga admin huquqlari berish

### 2. Guruh ID ni Topish
```bash
# Variant 1: Loglardan topish
npm run dev
# Guruhda xabar yuboring
# Konsolida: "Group ID: -1001234567890"
```
- [ ] Guruh ID ni yozib olish (manfiy belgi bilan: `-100...`)

### 3. `.env` Faylida Qo'shish
```env
ADMIN_GROUP_ID=-1001234567890
```
- [ ] `.env` faylini tahrirlash
- [ ] ADMIN_GROUP_ID qo'shish (to'g'ri format)
- [ ] Faylni saqlash

### 4. Serverni Ishga Tushirish
```bash
npm run dev
```
- [ ] Serverni qayta ishga tushirish
- [ ] Xatolar kelmayotganligini tekshiring

### 5. Test Qilish
```
1. Web App'da mahsulot tanlang
2. Savatga qo'shing
3. Buyurtma bering
4. Guruhda bildirishnoma kelmayotganligini tekshiring
```
- [ ] Buyurtma yaratish
- [ ] Guruhda xabar kelmayotgani

## 🔧 Agar Bildirishnoma Kelmasa

### 1-Qadam: Format Tekshirish
```
✅ To'g'ri:   ADMIN_GROUP_ID=-1001234567890
❌ Xato:      ADMIN_GROUP_ID=1001234567890
❌ Xato:      ADMIN_GROUP_ID=-1001234567890  (bo'sh joy)
```

### 2-Qadam: Bot Admin Huquqlari
1. Telegram guruhni oching
2. Guruh nomiga bosing
3. "Adminlar" sectsiyasiga o'ting
4. Botni admin deb belgilang

### 3-Qadam: Server Loglarini Tekshiring
```bash
# Xabarni topadigon xato
"Failed to send group notification"

# ID xatosi
"Chat not found"

# Huquq xatosi
"Forbidden"
```

### 4-Qadam: Serverni Qayta Ishga Tushirish
```bash
# Ctrl+C bilan to'xtating
Ctrl+C

# Qayta ishga tushiring
npm run dev
```

## 📋 Tekshirish Ro'yxati

| Tekshirish | ✓/✗ |
|-----------|-----|
| `.env` faylida ADMIN_GROUP_ID mavjud | |
| ADMIN_GROUP_ID manfiy belgi bilan boshlanadi | |
| Bot guruhga qo'shilgan | |
| Bot admin huquqlariga ega | |
| Server qayta ishga tushirilgan | |
| Buyurtma yaratish ishlatildi | |
| Guruhda bildirishnoma keldi | |

## 💾 Fayllar

O'zgartirilgan fayllar:
- ✏️ [server/telegram-bot.ts](server/telegram-bot.ts) - Guruh bildirishnomalarivoni qo'shildi
- ✏️ [.env.example](.env.example) - ADMIN_GROUP_ID qo'shildi
- ✏️ [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) - Yangi qadam qo'shildi

Yangi fayllar:
- 📄 [ADMIN_GROUP_SETUP.md](ADMIN_GROUP_SETUP.md) - Batafsil ko'rsatma
- 📄 [ADMIN_GROUP_CHECKLIST.md](ADMIN_GROUP_CHECKLIST.md) - Bu fayl

## 🆘 Yordam

**Muammo:** Bildirishnomalar kelmayapti
**Yechim:** ADMIN_GROUP_SETUP.md faylni o'qing

**Muammo:** Guruh ID ni topila olmayapti
**Yechim:** https://t.me/userinfobot botdan foydalaning

**Muammo:** Server xatosi keltirmoqda
**Yechim:** Console loglarini ko'rish uchun `npm run dev` ishlatib, xabarni toping

---

**Asosiy Ko'rsatma:** [ADMIN_GROUP_SETUP.md](ADMIN_GROUP_SETUP.md)
**Batafsil Sozlamalar:** [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md)
