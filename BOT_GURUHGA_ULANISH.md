# 🤖 Botni Telegram Guruhga Ulanish - Qadam-Qadam Ko'rsatma

## 📱 1-QADAM: Telegram Guruh Yaratish

### Oson Usuli:
1. Telegram ochib, **"+" belgisini bosing** (yuqori chap burchakda)
2. **"Yangi guruh"** deb tanlang
3. Guruh nomini kiriting:
   ```
   📞 Do'kon Admin Guruhi
   ```
4. Admin/hodimlarni qo'shing (ixtiyoriy)
5. **"Yaratish"** deb bosing ✅

### Guruh Sozlamasi:
- Rasm: Do'kon logotipini qo'yish mumkin
- Tavsif: "Buyurtmalar haqida bildirishnomalar" (ixtiyoriy)
- Shaxsiylik: "Faqat adminlar xabar yuborishi mumkin" (ixtiyoriy)

---

## 🤖 2-QADAM: Botni Guruhga Qo'shish

### Usul A: Yangi Guruh Yaratganda
```
1. Guruhga odamlar qo'shish ekranida
2. "Botlarni qo'shish" deb qidiring
3. O'z botingizni (@your_bot_name) tanlang
4. "Qo'shish" deb bosing
```

### Usul B: Mavjud Guruhga Qo'shish
```
1. Guruhga oching
2. Guruh nomi > "Guruh sozlamasi"
3. "Adminlar" yoki "A'zolar"
4. "+" deb bosing
5. Botni qidiring va tanlang
6. "Qo'shish" deb bosing
```

---

## 👑 3-QADAM: Botga Admin Huquqlari Berish

### MUHIM: Bot admin bo'lishi kerak!

1. **Guruhga oching**
2. Guruh nomiga ustiga bosing (yoki guruh sozlamasini oching)
3. **"Adminlar"** bo'limiga o'ting
4. **Botni toping** (masalan: @my_shop_bot)
5. Botga **admin** deb belgilang ✅

#### Admin Huquqlari:
```
✅ Xabar yuborish
✅ Media yuborish
✅ Linkarni tahrir qilish
✅ Rasm yuklash
```

> **Agar bu qilinmasa, bot xabar yubormaydi!** ⚠️

---

## 🔢 4-QADAM: Guruh ID ni Topish

### Usul 1: Bot Loglaridan (Eng Oson) ⭐

```bash
# Terminal'da
npm run dev

# Keyin Telegram'da:
# 1. Guruhga oching
# 2. Istalgan xabar yuboring
# 3. Server loglarini ko'ring

# Bu ko'rinish kerak:
# "Group ID: -1001234567890"
```

### Usul 2: Userinfobot dan Foydalanish

```
1. Telegram'da @userinfobot izlang
2. /start yuboring
3. Guruhga qo'shing
4. Guruhda /id yuboring
5. Bot javob beradi:
   "Chat ID: -1001234567890"
```

### Usul 3: Web Vositalardan

- https://www.shotsapp.io/articles/find-telegram-group-id
- https://t.me/userinfobot

### ⚠️ MUHIM:
```
✅ To'g'ri:   -1001234567890
❌ Xato:      1001234567890
❌ Xato:      -1001234567890  (bo'sh joy)
```

**Manfiy belgi (-) ZARUR!**

---

## 📝 5-QADAM: .env Faylida Sozlash

### Loyihani Oching:
```
c:/Users/Asus/OneDrive/Desktop/Shop-Assistant-Bot/.env
```

### Agar Hali Yo'q Bo'lsa, Yarating:
Windows:
```
Ctrl + Shift + N (papka)
.env fayli yarating (nomlash muhim!)
```

### Quyidagi Matnni Qo'shing:
```env
# Bot Token (allaqachon mavjud bo'lishi kerak)
TELEGRAM_BOT_TOKEN=1234567890:AABBBCCCddddEEEfffGGGhhhIIIjjjKKK

# Guruh ID (yangi qo'shish)
ADMIN_GROUP_ID=-1001234567890

# Shaxsiy Admin Chat (ixtiyoriy)
ADMIN_CHAT_ID=987654321
```

### Saqlang:
```
Ctrl + S
```

---

## 🚀 6-QADAM: Serverni Ishga Tushirish

### Terminal Oching:
```bash
# Proyekta papkasida
cd c:/Users/Asus/OneDrive/Desktop/Shop-Assistant-Bot

# Serverni ishga tushiring
npm run dev
```

### Agar Xato Bo'lsa:
```bash
# Kelib chiqib, qayta ishga tushiring
npm run dev
```

---

## ✅ 7-QADAM: Tekshirish

### Test Qilish:
1. **Web App'da buyurtma yarating**
   ```
   1. Web App'ni oching
   2. Mahsulot tanlang
   3. Savatga qo'shing
   4. Checkout bosing
   5. Buyurtma submit qiling
   ```

2. **Guruhda xabar kelmayotganligini tekshiring**
   ```
   Telegram > Admin guruh > Yangi xabar ko'rishingiz kerak
   ```

3. **Xabar ko'rinishi:**
   ```
   📦 Yangi buyurtma #123
   
   👤 Foydalanuvchi: @john_doe
   *Mahsulotlar:*
   1. *Sabzi*
      💰 Narxi: 15000 so'm × 2 = 30000 so'm
   
   💰 Jami: 30000 so'm
   📱 Telefon: +998901234567
   🏠 Manzil: Andijon sh.
   ```

---

## 🆘 Agar Kelmasa - Tekshirish Listi

### ❌ Xabar Kelmayapti?

**1️⃣ Bot Guruhda Bor Mi?**
```
Telegram > Guruh > Info > Adminlar
→ Botni topishingiz kerak
```

**2️⃣ Bot Admin Mi?**
```
Telegram > Guruh > Info > Adminlar
→ Botni toping
→ "Admin" belgisi bor mi?
→ Yo'q bo'lsa, qo'shing!
```

**3️⃣ .env Faylida ID Mavjud Mi?**
```
c:/Users/Asus/OneDrive/Desktop/Shop-Assistant-Bot/.env
→ ADMIN_GROUP_ID=-100... bo'lishi kerak
```

**4️⃣ Manfiy Belgi Bor Mi?**
```
✅ -1001234567890    (to'g'ri)
❌ 1001234567890     (xato - manfiy yo'q)
```

**5️⃣ Server Qayta Ishga Tushirildi Mi?**
```bash
npm run dev
# Serverni to'xtatib, qayta ishga tushiring
```

**6️⃣ Server Loglarini Ko'ring**
```bash
npm run dev
# "Failed to send group notification" xatosi bo'lsa:
# → Bot admin emasdir
# → ID noto'g'ri
# → Guruh o'chirilgan
```

---

## 🎯 Qadamlar Ro'yxati

| Qadam | Nima Qilish | ✅ |
|-------|-----------|---|
| 1 | Guruh yaratish | ☐ |
| 2 | Botni qo'shish | ☐ |
| 3 | Admin huquqlari | ☐ |
| 4 | ID topish | ☐ |
| 5 | .env da qo'shish | ☐ |
| 6 | Server ishga tushirish | ☐ |
| 7 | Test qilish | ☐ |

---

## 💡 Foydali Maslahatlar

### Bot Admin Huquqlarini Tekshirish
```
Guruh Info > Adminlar > Bot nomiga bosing
→ "Admin" belgisini ko'rishingiz kerak
→ "Xabar yuborish" checkmark bo'lishi kerak
```

### Agar Hali Yo'q Bo'lsa
```
1. "Edit" deb bosing
2. "Admin" toggle-ni yoqing
3. "Xabar yuborish" allow qiling
4. Saqlang
```

### .env Fayl Xatosi
```
❌ ADMIN_GROUP_ID = -1001234567890  (bo'sh joy)
✅ ADMIN_GROUP_ID=-1001234567890    (bo'sh joy yo'q)
```

### Guruh Shaxsiylik Sozlamasi
```
Agar "Faqat adminlar xabar yuborishi mumkin" bo'lsa:
→ Bot admin bo'lishi shart!
→ Admin qilgandan keyin xabar yuboradi
```

---

## 🔗 Foydali Linklar

| Link | Uchun |
|------|-------|
| https://t.me/userinfobot | Guruh ID topish |
| https://t.me/botfather | Yangi bot yaratish |
| [ADMIN_GROUP_SETUP.md](./ADMIN_GROUP_SETUP.md) | Batafsil ko'rsatma |

---

## ❓ Tez-tez Savollar

**S: Nechta guruhga xabar yuborish mumkin?**
A: Hozirda bitta guruhga (`ADMIN_GROUP_ID`). Kerak bo'lsa, kod o'zgartirilishi mumkin.

**S: Bot O'z Xabarlarini O'qiya Oladimi?**
A: Yo'q, faqat admin/foydalanuvchilar yo'llaydigan xabarni o'qiydi.

**S: Hangroupga parol o'rnatdim, xabar kelmadi?**
A: Botni private guruhlarga qo'shing va admin qiling.

**S: Guruh o'chirilsa nima bo'ladi?**
A: Xabar yuborish muvaffaqiyatsiz bo'ladi, lekin buyurtma saqlanadi.

---

## 📞 Foydalaningiz Tayyor!

Barcha qadamlarni bajargandan keyin:
- ✅ Buyurtmalar guruhiga keladi
- ✅ Mahsulot tafsillari ko'rinadi
- ✅ Foydalanuvchi username ko'rinadi
- ✅ Telefon va manzil ko'rinadi

**Hozir ishlatishga tayyor!** 🎉
