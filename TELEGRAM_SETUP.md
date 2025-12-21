# Telegram Bot O'rnatish Yo'riqnomasi

Bu faylda sizning do'kon botingizni Telegram bilan qanday ulash kerak to'liq tushuntirib berilgan.

## 1-qadam: Bot yaratish

1. Telegram'da [@BotFather](https://t.me/botfather) ga o'ting
2. `/newbot` komandasi yuboring
3. Bot nomini kiriting (masalan: "Mening Do'konim Bot")
4. Bot username'ini kiriting (masalan: "mening_dokonim_bot")
5. BotFather sizga bot tokenini beradi

## 2-qadam: Bot tokenini sozlash

1. Loyiha papkasidagi `.env` faylini oching
2. `TELEGRAM_BOT_TOKEN=your_bot_token_here` qismini o'zgartirib, o'z tokeningizni yozing:
   ```
   TELEGRAM_BOT_TOKEN=1234567890:AABBBCCCddddEEEfffGGGhhhIIIjjjKKK
   ```

## 3-qadam: WebApp URL sozlash

Development uchun:
```
WEBAPP_URL=http://localhost:5000
```

Production uchun:
```
WEBAPP_URL=https://yourdomain.com
```

## 4-qadam: Bot komandalarini o'rnatish

BotFather'da bot komandalarini o'rnating:

1. `/setcommands` yuboring
2. Quyidagi matnni yuborimg:
```
start - Botni ishga tushirish
catalog - Mahsulotlar katalogi
cart - Savat
help - Yordam
```

## 5-qadam: Bot tavsifini o'rnating

Bot tavsifini o'rnatish:
```
/setdescription
🛍️ Do'kon botiga xush kelibsiz! Bu yerda siz mahsulotlarni ko'rishingiz, savatga qo'shishingiz va buyurtma berishingiz mumkin.
```

Qisqa tavsif:
```
/setabouttext
🛍️ Online xarid uchun qulay bot
```

## 6-qadam: WebApp tugmasini o'rnatish

1. `/setmenubutton` komandasi yuboring
2. "WebApp" tugmasini tanlang
3. Tugma nomini kiriting: "🛍️ Do'konni ochish"
4. WebApp URL kiriting: `http://localhost:5000` (development) yoki `https://yourdomain.com` (production)

## 7-qadam: Serverni ishga tushirish

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 8-qadam: Botni sinab ko'rish

1. Telegram'da o'z botingizga o'ting
2. `/start` komandasi yuboring
3. "🛍️ Do'konni ochish" tugmasini bosing
4. WebApp ochilishi kerak

## 9-qadam: Admin Guruh Sozlamasi (Yangi buyurtmalar uchun bildirishnomalar)

Yangi buyurtmalar haqida guruhga bildirishnomalar yuborish uchun:

### Guruh yaratish va Bot qo'shish
1. Telegram'da yangi guruh yarating (masalan: "Do'kon Admin Guruhi")
2. O'z botingizni guruhga qo'shing
3. Botga admin huquqlari bering

### Guruh ID ni topish
1. Botga `/getgroupid` komandasi yuboring (bu komanda ishlashini tekshiring)
2. Agar komanda ishlamasa:
   - Guruhda istalgan habar yuboring
   - Bot loglarida guruh ID ni ko'rishingiz kerak
   - Yoki quyidagi vositalardan foydalaning:
     - https://t.me/userinfobot - Guruh ID ni ko'rish

### `.env` faylida sozlash
```
# Admin shaxsiy chat ID (ixtiyoriy) - Shaxsiy bildirishnoma uchun
ADMIN_CHAT_ID=123456789

# Admin guruh ID (mahalliy buyurtmalar) - Guruh bildirishnomasi uchun
ADMIN_GROUP_ID=-1001234567890
```

**Eslatma:** Guruh ID manfiy (-) ishora bilan boshlanadi va "-100" prefiksi bilan kiritiladi.

### Ishlab chiqish (Sinov)
```
ADMIN_GROUP_ID=-1001234567890
```

### Production Sozlamasi
```
ADMIN_GROUP_ID=-1001234567890
```

## 10-qadam: Webhook o'rnatish (Production uchun)

Production muhitda webhook ishlatish tavsiya qilinadi:

1. HTTPS domani tayyorlang
2. `.env` faylida webhook URL ni sozlang:
   ```
   TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/telegram/webhook
   ```
3. Server ishga tushgandan keyin webhook avtomatik o'rnatiladi

## Muammoli holatlar

### Bot ishlamayapti?
1. Bot tokenining to'g'riligini tekshiring
2. `.env` fayli to'g'ri joylashganligini tekshiring
3. Server loglarini ko'ring

### WebApp ochilmayapti?
1. WEBAPP_URL to'g'ri sozlanganligini tekshiring
2. Server ishlab turganligini tekshiring
3. HTTPS sertifikatini tekshiring (production uchun)

### Bildirishnomalar kelmayapti?
1. Bot foydalanuvchi bilan suhbat boshlaganligini tekshiring
2. Foydalanuvchi botni block qilmaganligini tekshiring
3. Chat ID to'g'ri ekanligini tekshiring

### Guruh bildirishnomalarivoni kelmayapti?
1. Bot guruhga qo'shilganligini tekshiring
2. Bot admin huquqlariga ega ekanligini tekshiring
3. ADMIN_GROUP_ID to'g'ri sozlanganligini tekshiring (manfiy ishora bilan)
4. Server loglarini tekshiring

## Qo'shimcha sozlamalar

### Bot rasmini o'rnatish
```
/setuserpic
```

### Bot holatini sozlash
```
/setprivacy
Disabled  # Guruhlarda ishlatish uchun
```

### Inline rejimni yoqish
```
/setinline
Mahsulot izlash...
```

## Foydali linklar

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [WebApp hujjatlari](https://core.telegram.org/bots/webapps)
- [BotFather yo'riqnomasi](https://core.telegram.org/bots#botfather)

## Yordam

Agar qandaydir muammo bo'lsa:
1. README.md faylini o'qing
2. Server loglarini tekshiring
3. Bot tokenining to'g'riligini tasdiqang