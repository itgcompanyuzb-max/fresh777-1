# 📸 Mahsulot Tafsillari Guruh Xabarida

**Yangilandi:** December 21, 2025

## ✨ Nima O'zgarishi?

Endi admin guruhiga kelgan xabarlar mahsulotlar haqida batafsil ma'lumot o'z ichiga oladi:
- 📦 Mahsulot nomi
- 💰 Narxi va miqdori
- 🖼️ Mahsulot rasmi
- ✖️ Nomerlangan ro'yxat

## 📋 Yangi Xabar Formati

```
📦 Yangi buyurtma #123

*Mahsulotlar:*
1. *Sabzi (Fresh)*
   💰 Narxi: 15000 so'm × 2 = 30000 so'm
   🖼 [Rasm](https://example.com/image1.jpg)

2. *Pomidor (Tazelik)*
   💰 Narxi: 12000 so'm × 3 = 36000 so'm
   🖼 [Rasm](https://example.com/image2.jpg)

💰 Jami: 66000 so'm
🚚 Yetkazib berish: 5000 so'm
📱 Telefon: +998901234567
🏠 Manzil: Andijon sh., Navoi ko'chasi
🚚 Yetkazib berish usuli: Yetkazib berish
💳 To'lov: Naqd pul
📝 Izoh: Erta orada kerak
```

## 🔧 O'zgartirilgan Fayllar

### 1. **server/telegram-bot.ts** (Bosh o'zgarish)
- Mahsulotlar uchun tsikl qo'shildi
- Har bir mahsulot uchun:
  - Nomi
  - Narxi × Miqdori = Jami
  - Rasmi (agar mavjud bo'lsa)
- Nomerlangan ro'yxat (1., 2., 3., ...)
- Yetkazib berish narxi alohida ko'rsatiladi

### 2. **server/routes.ts** (Buyurtma yaratishda)
- Buyurtma yaratilgandan keyin mahsulot ma'lumotlarini oladi
- Telegram xabaraga mahsulot ro'yxatini yuboradi

## 🎯 Qo'llash

Hech nima qo'shish kerak emas! Kod allaqachon ishlaydi:

```bash
npm run dev
```

Endi buyurtma yaratilsa:
1. Web App-dan buyurtma bering
2. Admin guruhiga xabar keladi
3. Barcha mahsulot tafsillari ko'rinadi
4. Rasimlar ham ko'rinadi (agar mavjud bo'lsa)

## 📸 Rasim Ko'rsatish

Rasimlar Telegram-da inline link sifatida ko'rsatiladi:

```
🖼 [Rasm](https://cdn.example.com/product-123.jpg)
```

Foydalanuvchi linkga bosarkan rasm ochiladi.

## 💾 Ma'lumot Manbai

Mahsulot ma'lumotlari quyidagilardan kelib chiqadi:
- `productName` - Mahsulot nomi
- `price` - Mahsulot narxi
- `quantity` - Belgilangan miqdori
- `productImage` - Mahsulot rasmi URL

## 🧪 Tekshirish

1. Web App ochib mahsulot tanlang
2. Savatga qo'shing (bir nechta mahsulot tanlang)
3. Checkout yarating
4. Buyurtmani tasdiqlang
5. Admin guruhiga xabar kelmayotganligini tekshiring

Xabarda ko'rishingiz kerak:
- ✅ Mahsulot nomlari
- ✅ Narxlar va miqdorlari
- ✅ Jami summa
- ✅ Rasim linkalari

## 📞 Agar Xabar Kelmasa

1. [ADMIN_GROUP_SETUP.md](./ADMIN_GROUP_SETUP.md) bo'limini o'qing
2. Bot admin huquqlariga ega ekanligini tekshiring
3. Server loglarini ko'ring:
   ```bash
   npm run dev
   ```

## ✨ Qo'shimcha Xususiyatlari

- **Nomerlash:** Mahsulotlar tartib bilan nomerlangan (1, 2, 3...)
- **Hisob:** `Narxi × Miqdori = Jami` formulasi
- **Rasim:** Mavjud bo'lsa, rasm linki ko'rsatiladi
- **Boş rasm:** Agar rasm yo'q bo'lsa, xabar bo'lmaydi
- **Yetkazib berish:** Alohida qatorni yetkazib berish narxi

## 📝 Misol

3 ta mahsulot bo'lgan buyurtma:

```
📦 Yangi buyurtma #456

*Mahsulotlar:*
1. *Olma*
   💰 Narxi: 20000 so'm × 2 = 40000 so'm

2. *Apelsin*
   💰 Narxi: 18000 so'm × 1 = 18000 so'm

3. *Banan*
   💰 Narxi: 15000 so'm × 3 = 45000 so'm

💰 Jami: 103000 so'm
🚚 Yetkazib berish: 10000 so'm
```

---

**Status:** ✅ Tayyor ishlatishga
**O'zgartirish soni:** 2 fayl
**Kod xatosini:** ❌ Yo'q

Endi admin guruhiga buyurtmalar haqida batafsil ma'lumot kelib chiqadi! 🎉
