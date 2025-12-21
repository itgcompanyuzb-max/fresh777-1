# Admin Guruh Sozlamasi - Buyurtma Bildirishnomalarivoni

Yangi buyurtmalar haqida Telegram guruhga avtomatik bildirishnomalar yuborish uchun sozlamalar.

## Tezkor O'rnatish

### 1. Telegram Guruhni Yaratish
```
1. Telegram'da "📞 Do'kon Admin Guruhi" nomli yangi guruh yarating
2. O'z botingizni guruhga qo'shing (masalan: @my_shop_bot)
3. Botga admin huquqlari bering
```

### 2. Guruh ID ni Topish

**Usul 1: Bot Loglaridan Topish**
```bash
npm run dev
# Guruhda istalgan xabar yuboring
# Server konsolida [GROUP_ID] ko'rishingiz kerak
```

**Usul 2: Online Vositalardan Foydalanish**
- https://t.me/userinfobot bot ishlatish
- Yoki https://www.shotsapp.io/articles/find-telegram-group-id

### 3. `.env` Faylida Sozlash

```env
# Yangi buyurtmalar uchun guruh ID (manfiy belgi bilan)
ADMIN_GROUP_ID=-1001234567890

# Ixtiyoriy: Admin shaxsiy bildirishnoma uchun
ADMIN_CHAT_ID=123456789
```

### 4. Serverni Qayta Ishga Tushirish

```bash
npm run dev
```

## Bildirishnomalar Formati

Yangi buyurtma kelganda guruhga quyidagi ma'lumotlar yuboriladi:

```
📦 Yangi buyurtma #123

💰 Summa: 250000 so'm
📱 Telefon: +998901234567
🏠 Manzil: Andijon sh., Navoi ko'chasi
🚚 Yetkazib berish: Yetkazib berish
💳 To'lov: Naqd pul
📝 Izoh: Erta orada kerak
```

## Muhim Eslatmalar

⚠️ **Guruh ID Formati:**
- Manfiy ishora bilan boshlanishi kerak: `-1001234567890`
- Shaxsiy chat ID dan farqli: `123456789`
- Noto'g'ri ID: `1001234567890` (bu xato)

✅ **Admin Huquqlari:**
- Botni guruhga qo'shgandan keyin "Admin" deb belgilang
- Botga xabar yuborish huquqini bering

🔒 **Xavfsizlik:**
- ADMIN_GROUP_ID va ADMIN_CHAT_ID private bo'lishi kerak
- `.env` faylini git-ga qo'shmang
- `.gitignore`da `.env` mavjudligini tekshiring

## Muammolar va Yechimlar

### ❌ Bildirishnomalar kelmayapti

1. Bot guruhga qo'shilganligini tekshiring
   ```
   Telegram > Guruh > Adminlar > Bot nomi
   ```

2. Bot admin statusiga ega ekanligini tekshiring
   ```
   Grup Sozlamasi > Adminlar > Bot nomi (✓)
   ```

3. ADMIN_GROUP_ID to'g'ri ekanligini tekshiring
   ```bash
   # Server konsolida guruh ID ni ko'rish
   npm run dev
   # Guruhda xabar yuboring
   ```

4. `.env` faylida o'zgarishlar saqlanganligini tekshiring
   ```bash
   cat .env | grep ADMIN_GROUP_ID
   ```

### ❌ Chat ID topilmayapti

**Usul 1: Terminal orqali**
```bash
# Guruhda /getgroupid yuboring (agar mavjud bo'lsa)
# Yoki bot loglarini ko'ring
```

**Usul 2: Test Botidan Foydalanish**
```
https://t.me/userinfobot
- Botga /start yuboring
- Guruhga qo'shing
- /id komandasi yuboring
```

## Qo'shimcha

### ADMIN_CHAT_ID - Shaxsiy Bildirishnomalar

Agar shaxsiy chat ID-ga bildirishnomalar istasangiz:

```env
# Admin shaxsiy chat ID (ixtiyoriy)
ADMIN_CHAT_ID=123456789
```

Topish:
1. Bot bilan bevosita chat oching
2. /start yuboring
3. Bot loglaridan ID ni ko'ring

### Buyurtma Turudagi Ma'lumotlar

Bildirishnomada quyidagi ma'lumotlar bo'ladi:

| Ma'lumot | Tavsifi |
|---------|---------|
| `orderId` | Buyurtma raqami |
| `total` | Jami summa |
| `phoneNumber` | Foydalanuvchi telefoni |
| `deliveryAddress` | Yetkazib berish manzili |
| `deliveryMethod` | Yetkazib berish usuli |
| `paymentMethod` | To'lov usuli |
| `notes` | Qo'shimcha izohlar |

## Tekshirish

Hammasi to'g'ri o'rnatilganligini tekshirish:

```bash
# 1. Serverni ishga tushiring
npm run dev

# 2. Web App orqali buyurtma yarating

# 3. Guruhda bildirishnoma kelganligini tekshiring

# 4. Agar kelmasa, loglarni ko'ring:
# "Failed to send group notification" xatosi bo'lsa,
# ADMIN_GROUP_ID va bot admin huquqlarini tekshiring
```

## Foydali Linklar

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Group Chat ID Finder](https://t.me/userinfobot)
- [Bot Huquqlari](https://core.telegram.org/bots/api#getting-updates)

## Savol-Javob

**S: Ikkala joyga (shaxsi va guruhga) bildirishnoma yuborish mumkinmi?**
Ja, `.env`da ikkala ID ni sozlang:
```env
ADMIN_CHAT_ID=123456789
ADMIN_GROUP_ID=-1001234567890
```

**S: Guruh ID ni o'zgartirish mumkinmi?**
Ha, `.env` faylida o'zgartirib, serverni qayta ishga tushiring.

**S: Nega bot guruhda xabar yubormayapti?**
1. Bot admin emasligi mumkin
2. Guruh ID noto'g'ri bo'lishi mumkin
3. Bot block qilingan bo'lishi mumkin

---

**Keyingi qadam:** [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md) faylini ko'ring
