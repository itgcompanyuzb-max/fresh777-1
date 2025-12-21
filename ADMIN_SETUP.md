# Admin Guruhni Sozlash

## Telegram guruhga buyurtma xabarlari olish uchun:

### 1. Telegram guruh yarating
- Telegram'da yangi guruh yarating (masalan: "Fresh777 Buyurtmalar")
- Yoki mavjud guruhingizdan foydalaning

### 2. Botni guruhga qo'shing
- @fesh777_bot botini guruhga admin qilib qo'shing
- Botga "Xabar yuborish" huquqini bering

### 3. Guruh ID'sini oling

**Usul 1: @userinfobot yordamida**
1. @userinfobot ni guruhga qo'shing
2. Bot guruh ID'sini yuboradi (masalan: `-1001234567890`)
3. Guruh ID'sini nusxalang

**Usul 2: Bot orqali**
1. Guruhga biror xabar yuboring
2. Quyidagi URL'ni brauzerda oching:
   ```
   https://api.telegram.org/bot8359379882:AAGKJztoz5r0llpr6mBv7Z5z2BFQtN3isHM/getUpdates
   ```
3. Natijadan `"chat":{"id":-1001234567890...}` qismidagi raqamni topib oling

### 4. .env fayliga qo'shing
`.env` faylini oching va `ADMIN_CHAT_ID` qatorini o'zgartiring:

```env
ADMIN_CHAT_ID=-1001234567890
```

**MUHIM:** 
- Guruh ID'si albatta **minus (-)** belgisi bilan boshlanadi!
- Agar minus yo'q bo'lsa, ID noto'g'ri!

### 5. Serverni qayta ishga tushiring
```bash
npm run dev
```

## ✅ Tekshirish

1. Bot orqali buyurtma bering
2. Guruhga quyidagi xabar kelishi kerak:

```
🔔 YANGI BUYURTMA!

📋 Buyurtma raqami: #1
👤 Mijoz: Ism Familiya
   (@username)
📞 Telefon: +998901234567
📍 Manzil: Toshkent sh., Chilonzor...

💵 Jami summa: 50000 so'm

📦 Buyurtma tarkibi:
1. Mahsulot nomi
   2 dona × 25000 so'm = 50000 so'm

⏳ Status: Kutilmoqda
📅 Sana: 18.12.2025, 22:01:48
```

## Admin Panel

Buyurtmalar admin panelda ham ko'rinadi:
- Brauzerda: `http://localhost:5000/admin/orders`
- Login: `admin`
- Parol: `admin123`

Bu yerda:
- ✅ Barcha buyurtmalarni ko'rish
- ✅ Status o'zgartirish
- ✅ Mijoz ma'lumotlarini ko'rish
- ✅ Buyurtma tarkibini ko'rish
