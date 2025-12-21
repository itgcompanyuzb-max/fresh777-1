# 🌐 BotFather'da Web App Menu Button Qo'shish

## 1️⃣ Ngrok O'rnatish va Ishga Tushirish

### Ngrok Yuklab Olish
1. [ngrok.com](https://ngrok.com) ga kiring
2. Ro'yxatdan o'ting (bepul)
3. Windows uchun yuklab oling
4. Zip faylni ochib, ngrok.exe ni oling

### Ngrok Ishga Tushirish
PowerShell'da bajaring:

```powershell
# Birinchi marta - account'ni ulash (ngrok.com'dan token oling)
.\ngrok.exe authtoken YOUR_TOKEN_HERE

# Tunnel ochish (server ishlab turganida)
.\ngrok.exe http 5000
```

**Natija:**
```
Forwarding   https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:5000
```

Bu HTTPS URL'ni nusxalang!

---

## 2️⃣ BotFather'da Menu Button Sozlash

### BotFather'ga Kiring
Telegram'da @BotFather botini oching

### Buyruqlar Ketma-ketligi:

```
1. /mybots
   → @fesh777_bot ni tanlang

2. Bot Settings
   → Edit Settings

3. Menu Button
   → Configure Menu Button

4. Button Text kiriting:
   🛍 Do'kon

5. URL kiriting (ngrok'dan):
   https://xxxx-xx-xx-xx-xx.ngrok-free.app

6. Done!
```

---

## 3️⃣ .env Faylini Yangilash

`.env` faylida WEBAPP_URL ni ngrok URL ga o'zgartiring:

```env
WEBAPP_URL=https://xxxx-xx-xx-xx-xx.ngrok-free.app
```

---

## 4️⃣ Serverni Qayta Ishga Tushirish

```bash
npm run dev
```

---

## 5️⃣ Test Qilish

1. Telegram'da @fesh777_bot ni oching
2. Pastki o'ng tarafda **Menu** tugmasini ko'rasiz (yonida bot nomi)
3. Menu tugmasini bosing
4. **"🛍 Do'kon"** tugmasi paydo bo'ladi
5. Uni bosing - Web App ochiladi!

---

## 📱 Qanday Ko'rinadi

### Odatdagi Bot:
```
[Keyboard tugmalari]
🛍 Katalog | 🛒 Savatcha
📦 Buyurtmalarim | ℹ️ Yordam
```

### Menu Tugmasi (yangi):
```
Pastki o'ng tarafda:
[☰ Menu] ← Shu yerda
```

Bosganda:
```
╭─────────────────╮
│ 🛍 Do'kon       │  ← Bu Web App ochadi
╰─────────────────╯
```

---

## ⚡ Tezkor Qo'llanma

### Terminal 1: Server
```bash
npm run dev
```

### Terminal 2: Ngrok
```bash
ngrok http 5000
```

### BotFather:
```
/mybots → @fesh777_bot → Bot Settings → Menu Button
  Text: 🛍 Do'kon
  URL: https://xxxx.ngrok-free.app
```

---

## 🔄 Har Safar Ngrok Qayta Ishlaganda

Ngrok har safar yangi URL beradi. Shuning uchun:

1. Yangi ngrok URL'ni oling
2. BotFather'da Menu Button URL'ni yangilang
3. .env faylidagi WEBAPP_URL'ni yangilang
4. Serverni qayta ishga tushiring

---

## 💡 Doimiy URL Uchun (Tavsiya)

### Ngrok Premium (Doimiy URL):
- $8/oy - bitta static domain
- Masalan: `https://myshop.ngrok.io` (o'zgarmas)

### Yoki Production Hosting:
- **Vercel** (bepul) - vercel.com
- **Railway** (bepul) - railway.app
- **Render** (bepul) - render.com

---

## 🎯 Natija

Endi @fesh777_bot da **3 xil** ishlatish usuli bor:

### 1. Reply Keyboard (Odatiy)
```
🛍 Katalog → Kategoriyalar → Mahsulotlar
```

### 2. Menu Button (Yangi!)
```
☰ Menu → 🛍 Do'kon → Web App ochiladi
```

### 3. /start Inline Button
```
/start → 📂 Kategoriyalar → ...
```

---

## ✅ Tekshirish

1. Server ishlab turibdi ✓
2. Ngrok ishlab turibdi ✓
3. HTTPS URL olindi ✓
4. BotFather'da Menu Button sozlandi ✓
5. .env yangilandi ✓
6. Telegram'da Menu tugmasi ko'rinadi ✓
7. Web App ochiladi ✓

---

**Muvaffaqiyatlar! 🚀**
