# Shop Assistant Bot

Telegram orqali ishlaydigan to'liq funksional do'kon boti. Bu bot Telegram WebApp texnologiyasidan foydalanadi va foydalanuvchilarga qulay interfeys orqali xarid qilish imkoniyatini beradi.

## Xususiyatlari

### Foydalanuvchilar uchun:
- 🛍️ Mahsulotlar katalogi
- 🛒 Savat boshqaruvi
- 💰 Checkout jarayoni
- 📱 Telegram WebApp interfeysi
- 🔔 Buyurtma bildirishnomalari
- 📞 Telefon raqami orqali buyurtma

### Administratorlar uchun:
- 📊 Dashboard va statistika
- 📦 Mahsulotlar boshqaruvi
- 📂 Kategoriyalar boshqaruvi
- 📋 Buyurtmalar boshqaruvi
- 👥 Mijozlar boshqaruvi
- 📢 Broadcast xabarlar
- 🤖 Telegram bot holati

## O'rnatish

### 1. Repository ni klonlash
```bash
git clone <your-repo-url>
cd Shop-Assistant-Bot
npm install
```

### 2. Environment o'zgaruvchilarini sozlash

`.env` faylini yarating va quyidagi ma'lumotlarni kiriting:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:AABBBCCCddddEEEfffGGGhhhIIIjjjKKK
WEBAPP_URL=https://yourdomain.com
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/telegram/webhook

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/shopbot

# Server Configuration
NODE_ENV=production
PORT=5000
```

### 3. Telegram Botni yaratish

1. Telegram'da [@BotFather](https://t.me/botfather) ga murojaat qiling
2. `/newbot` komandasi bilan yangi bot yarating
3. Bot nomini va username'ini belgilang
4. Bot tokenini `.env` fayliga kiriting

### 4. Bot sozlamalari

BotFather orqali bot sozlamalarini o'rnating:

```
/setcommands

start - Botni ishga tushirish
catalog - Mahsulotlar katalogi
cart - Savat
help - Yordam
```

Bot tavsifini o'rnating:
```
/setdescription
🛍️ Do'kon botiga xush kelibsiz! Bu yerda siz qulay interfeys orqali mahsulotlarni ko'rishingiz, savatga qo'shishingiz va buyurtma berishingiz mumkin.
```

Qisqa tavsif:
```
/setabouttext  
🛍️ Online xarid uchun qulay bot
```

### 5. WebApp sozlash

Bot uchun WebApp ni faollashtiring:

```
/setmenubutton
```

WebApp URL: `https://yourdomain.com`

### 6. Database o'rnatish

```bash
# Database schema'ni yaratish
npm run db:push
```

### 7. Ishga tushirish

Development rejimida:
```bash
npm run dev
```

Production rejimida:
```bash
npm run build
npm start
```

## Telegram Bot Komandalar

- `/start` - Botni ishga tushirish va asosiy menyuni ko'rsatish
- `/catalog` - Mahsulotlar katalogini ochish
- `/cart` - Savatni ko'rish
- `/help` - Yordam ma'lumotlari

## Webhook sozlash

Production muhitda webhook ishlatish tavsiya qilinadi:

1. HTTPS domain tayyorlang
2. `.env` faylida `TELEGRAM_WEBHOOK_URL` ni sozlang
3. Bot ishga tushgandan keyin webhook avtomatik o'rnatiladi

Yoki qo'lda o'rnatish:
```bash
curl -X POST "https://api.telegram.org/bot{BOT_TOKEN}/setWebhook" \
  -d "url=https://yourdomain.com/api/telegram/webhook"
```

## API Endpoints

### Telegram Bot
- `POST /api/telegram/webhook` - Telegram webhook
- `POST /api/telegram/set-webhook` - Webhook o'rnatish
- `DELETE /api/telegram/webhook` - Webhook o'chirish
- `POST /api/telegram/notify` - Foydalanuvchiga xabar yuborish
- `POST /api/telegram/order-notification` - Buyurtma bildirishnomasini yuborish
- `GET /api/telegram/bot-info` - Bot ma'lumotlari

### Do'kon API
- `GET /api/categories` - Kategoriyalar
- `GET /api/products` - Mahsulotlar
- `GET /api/cart` - Savat
- `POST /api/orders` - Buyurtma berish

## Loyiha Strukturasi

```
├── client/          # Frontend (React + Vite)
├── server/          # Backend (Express.js)
├── shared/          # Umumiy schemalar
├── script/          # Build scriptlari
├── .env            # Environment o'zgaruvchilari
└── package.json
```

## Development

```bash
# Development serverni ishga tushirish
npm run dev

# Type checking
npm run check

# Build qilish
npm run build

# Database schemani yangilash
npm run db:push
```

## Deployment

1. Server/VPS ni tayyorlang
2. Node.js va PostgreSQL o'rnating
3. Environment o'zgaruvchilarini sozlang
4. Build qiling va ishga tushiring:

```bash
npm install
npm run build
npm start
```

## Yordam

Bot bilan bog'liq muammolar uchun:
1. Bot tokenining to'g'riligini tekshiring
2. WebApp URL'ning accessibility'ini tekshiring  
3. Webhook holatini tekshiring
4. Loglarni ko'rib chiqing

## Litsenziya

MIT License