# ✅ Yangi Buyurtmalar uchun Telegram Guruh Bildirishnomalarivoni

**Tayyorlandi:** December 21, 2025

## 🎯 Nima Qilindi

Yangi buyurtma kelganda Telegram guruhga avtomatik bildirishnoma yuborish funktsiyasi qo'shildi. Endi admin guruhida barcha yangi buyurtmalar haqida real-time bildirishnomalar olasiz.

## 📝 O'zgarishlar

### 1. **server/telegram-bot.ts** - Kod O'zgarishlari

`notifyOrderCreated` funksiyasiga yangi guruh xabarlarivoni qo'shildi:

```typescript
// Yangi: Guruh ID ni o'qish
const adminGroupId = process.env.ADMIN_GROUP_ID;

// Yangi: Guruhga xabar yuborish
if (adminGroupId) {
  const groupMsg = `📦 *Yangi buyurtma* #${orderId}\n\n` +
    `💰 Summa: ${details.total} so'm\n` +
    `📱 Telefon: ${details.phoneNumber || '—'}\n` +
    // ... va boshqa ma'lumotlar
  await bot.sendMessage(adminGroupId, groupMsg, { parse_mode: 'Markdown' });
}
```

**Xusiyatlari:**
- ✅ Foydalanuvchiga shaxsiy xabar yuborish (shunga oldin ham)
- ✅ Admin shaxsiga xabar yuborish (shunga oldin ham)
- ✅ **YANGI:** Admin guruhiga xabar yuborish

### 2. **.env.example** - Tuzilmasi O'zgarishlari

```env
# Admin Notifications (Optional)
ADMIN_CHAT_ID=123456789
ADMIN_GROUP_ID=-1001234567890
```

### 3. **TELEGRAM_SETUP.md** - Yangi O'rnatish Bo'limi

9-qadam: Admin Guruh Sozlamasi
- Guruh yaratish
- Bot qo'shish
- Guruh ID ni topish
- `.env`da sozlash

### 4. **Yangi Hujjatlar**

#### 📄 ADMIN_GROUP_SETUP.md
Batafsil ko'rsatma:
- Tezkor o'rnatish
- Bildirishnomalar formati
- Muammolar va yechimlar
- Savol-javoblar

#### 📄 ADMIN_GROUP_CHECKLIST.md
Tezkor ro'yxat:
- O'rnatish bosqichlari
- Tekshirish listi
- Tezkor yechimlar

## 🚀 Ishlatish

### Qadam 1: Guruh Yaratish
```
Telegram > Yangi Guruh > "📞 Do'kon Admin Guruhi" > Yaratish
```

### Qadam 2: Botni Qo'shish
```
Guruh > Guruh Sozlamasi > Adminlar > Botni qo'shish
```

### Qadam 3: Guruh ID ni Topish

**Usul A: Bot Loglaridan**
```bash
npm run dev
# Guruhda xabar yuboring
# Konsolida guruh ID ni ko'rish
```

**Usul B: Online Bot**
```
https://t.me/userinfobot
/start -> Guruhga qo'shish -> /id
```

### Qadam 4: `.env` da Sozlash
```env
ADMIN_GROUP_ID=-1001234567890
```

### Qadam 5: Serverni Qayta Ishga Tushirish
```bash
npm run dev
```

## 📊 Bildirishnoma Formati

Yangi buyurtma kelganda guruhda quyidagi xabar paydo bo'ladi:

```
📦 Yangi buyurtma #123

💰 Summa: 250000 so'm
📱 Telefon: +998901234567
🏠 Manzil: Andijon sh., Navoi ko'chasi
🚚 Yetkazib berish: Yetkazib berish
💳 To'lov: Naqd pul
📝 Izoh: Erta orada kerak
```

## ⚙️ Sozlamalar

### Zarur Sozlamalar
```env
# Admin guruh ID (Zarur - guruh bildirishnomalarivoni uchun)
ADMIN_GROUP_ID=-1001234567890
```

### Ixtiyoriy Sozlamalar
```env
# Admin shaxsiy chat ID (Ixtiyoriy - shaxsiy bildirishnoma uchun)
ADMIN_CHAT_ID=123456789
```

## ✨ Xususiyatlari

- 🔄 **Avtomatik:** Buyurtma yaratilsa, bildirishnoma avtomatik yuboriladi
- 👥 **Guruh:** Butun admin jamoa xabarni ko'radi
- 📱 **Hamma Ma'lumot:** Telefon, manzil, to'lov usuli, izohlar
- 🎨 **Formatlangan:** Emoji va Markdown bilan juda o'qilgan
- 🛡️ **Xavfsiz:** Xatolar bilan uğrashtirish qo'shilgan

## 🔍 Tekshirish

Hammasi to'g'ri o'rnatilganligini tekshirish:

```bash
# 1. Xatolarni ko'ring
npm run dev

# 2. Web App'da buyurtma yarating
# 3. Guruhda xabar kelmayotganligini tekshiring
```

### Agar Kelmasa:
1. Bot guruhga qo'shilganligini tekshiring
2. Bot admin huquqlariga ega ekanligini tekshiring
3. ADMIN_GROUP_ID to'g'ri ekanligini tekshiring (manfiy belgi)
4. `.env` o'zgarishlarni saqlanganni tekshiring

## 📚 Dokumentatsiya

| Fayl | Tavsifi |
|------|---------|
| [ADMIN_GROUP_SETUP.md](./ADMIN_GROUP_SETUP.md) | Batafsil o'rnatish ko'rsatmasi |
| [ADMIN_GROUP_CHECKLIST.md](./ADMIN_GROUP_CHECKLIST.md) | Tezkor o'rnatish ro'yxati |
| [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md) | Umumiy Telegram sozlamasi |
| [server/telegram-bot.ts](./server/telegram-bot.ts) | Kod o'zgarishlari |

## 🆘 FAQ

**S: Nega bildirishnomalar kelmayapti?**
A: [ADMIN_GROUP_SETUP.md](./ADMIN_GROUP_SETUP.md) faylning "Muammolar va Yechimlar" bo'limini o'qing

**S: Nechta guruhga xabar yuborish mumkin?**
A: Hozirda bitta guruhga (`ADMIN_GROUP_ID`). Kerak bo'lsa, kode o'zgartirilishi mumkin

**S: Shaxsiy chatiga ham xabar kerakmi?**
A: Ha, `ADMIN_CHAT_ID` ni sozlang

**S: Xabar formatini o'zgartirish mumkinmi?**
A: Ha, [server/telegram-bot.ts](./server/telegram-bot.ts) 25-38 qatorlarni o'zgartirib

## 🎓 O'qish Uchun

- [server/telegram-bot.ts](./server/telegram-bot.ts) - Kod mantiqini tushunish
- [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md) - Umumiy sozlamalar
- [ADMIN_GROUP_SETUP.md](./ADMIN_GROUP_SETUP.md) - Guruh sozlamasi

---

**Status:** ✅ Tayyor ishlatishga
**Vaqt:** 5-10 daqiqa o'rnatish
**Qiyin:** ⭐ Oson (Bot ID nisbatan)

**Keyingi Qadam:** [ADMIN_GROUP_SETUP.md](./ADMIN_GROUP_SETUP.md) faylni o'qib, 5 qadam sozlamani bajaring.
