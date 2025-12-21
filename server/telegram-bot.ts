import TelegramBot from 'node-telegram-bot-api';
import { dbStorage } from './storage';

const token = process.env.TELEGRAM_BOT_TOKEN!;
const webappUrl = process.env.WEBAPP_URL || 'http://localhost:5000';

export const bot = new TelegramBot(token, { polling: true });

// Helper API exported for server to notify users/admins about orders
export const telegramBot = {
  notifyOrderCreated: async (userTelegramId: number, orderId: string, details: any) => {
    try {
      const adminChat = process.env.ADMIN_CHAT_ID;
      const adminGroupId = process.env.ADMIN_GROUP_ID;
      
      const userMsg = `✅ Sizning buyurtmangiz qabul qilindi.\nBuyurtma #: ${orderId}\nUmumiy: ${details.total} so'm\nManzil: ${details.deliveryAddress || '—'}\nTelefon: ${details.phoneNumber || '—'}`;
      await bot.sendMessage(userTelegramId, userMsg);

      // Send to admin chat (personal notification)
      if (adminChat) {
        const adminMsg = `📦 Yangi buyurtma #${orderId}\nUmumiy: ${details.total} so'm\nTelefon: ${details.phoneNumber || '—'}\nManzil: ${details.deliveryAddress || '—'}\nTo'lov: ${details.paymentMethod || '—'}`;
        // Convert string to number if needed
        const adminChatNumber = typeof adminChat === 'string' ? parseInt(adminChat, 10) : adminChat;
        await bot.sendMessage(adminChatNumber, adminMsg);
      }

      // Send to admin group (simple notification - only name and order ID)
      if (adminGroupId) {
        // Build customer name
        let customerName = '—';
        if (details.customerUsername) {
          customerName = `@${details.customerUsername}`;
        } else if (details.customerFirstName || details.customerLastName) {
          customerName = `${details.customerFirstName || ''} ${details.customerLastName || ''}`.trim();
        }

        const groupMsg = `📦 Yangi buyurtma #${orderId}\n👤 ${customerName}`;
        
        // Convert string to number for sendMessage
        const groupIdNumber = typeof adminGroupId === 'string' ? parseInt(adminGroupId, 10) : adminGroupId;
        await bot.sendMessage(groupIdNumber, groupMsg);
      }
    } catch (err) {
      console.error('telegramBot.notifyOrderCreated error', err);
      throw err;
    }
  },
};

// Send a simple message to a user (used by admin UI)
export async function sendMessageToUser(userTelegramId: number | string, text: string) {
  try {
    return await bot.sendMessage(Number(userTelegramId), text);
  } catch (err) {
    console.error('sendMessageToUser error', err);
    throw err;
  }
}

// Foydalanuvchi sessiyalari (xotira)
interface UserSession {
  cart: Map<number, { product: any; quantity: number }>;
  checkoutStep?: 'phone' | 'address' | 'confirm';
  tempPhone?: string;
  tempAddress?: string;
}

const userSessions = new Map<number, UserSession>();

function getSession(userId: number): UserSession {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      cart: new Map(),
    });
  }
  return userSessions.get(userId)!;
}

// Asosiy menyu
function getMainMenuKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: '🛍 Katalog' }, { text: '🛒 Savatcha' }],
        [{ text: '📦 Buyurtmalarim' }, { text: 'ℹ️ Yordam' }]
      ],
      resize_keyboard: true,
    },
  };
}

// /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || 'Foydalanuvchi';

  await bot.sendMessage(
    chatId,
    `👋 Assalomu aleykum, ${firstName}!\n\n` +
    `🛍 Fresh777 do'koniga xush kelibsiz!\n\n` +
    `Mahsulotlarni ko'rish uchun quyidagi Menyu tugmani bosing! 🛒
    
    
    
    Bot @IIllllIIlIIll tarafidan qilingan📞`,
    getMainMenuKeyboard()
  );
});

// /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    `ℹ️ *Yordam*\n\n` +
    `🛍 *Katalog* - Barcha mahsulotlarni ko'rish\n` +
    `🛒 *Savatcha* - Savatingizni ko'rish\n` +
    `📦 *Buyurtmalarim* - Buyurtmalaringizni kuzatish\n\n` +
    `🖥️Texnig nosozlik bo'yicha: @IIllllIIlIIll`,
    { parse_mode: 'Markdown' }
  );
});

// Katalog tugmasi
bot.onText(/🛍 Katalog/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const categories = await dbStorage.getCategories();

    if (categories.length === 0) {
      await bot.sendMessage(chatId, '❌ Hozircha kategoriyalar mavjud emas.');
      return;
    }

    // Inline keyboard bilan kategoriyalar
    const keyboard = categories.map((cat) => [
      { text: cat.name, callback_data: `cat_${cat.id}` },
    ]);

    keyboard.push([{ text: '◀️ Orqaga', callback_data: 'main_menu' }]);

    await bot.sendMessage(chatId, '📂 Kategoriyani tanlang:', {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } catch (error) {
    console.error('Kategoriyalarni olishda xato:', error);
    await bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
  }
});

// Savatcha tugmasi
bot.onText(/🛒 Savatcha/, async (msg) => {
  const chatId = msg.chat.id;
  await showCart(chatId, msg.from!.id);
});

// Buyurtmalarim tugmasi
bot.onText(/📦 Buyurtmalarim/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from!.id;

  try {
    const orders = await dbStorage.getOrders();

    if (orders.length === 0) {
      await bot.sendMessage(chatId, '📦 Sizda hali buyurtmalar yo\'q.');
      return;
    }

    let message = '📦 *Sizning buyurtmalaringiz:*\n\n';

    orders.slice(0, 10).forEach((order: any, index: number) => {
      const status = order.status === 'pending' ? '⏳ Kutilmoqda' :
                     order.status === 'processing' ? '🔄 Jarayonda' :
                     order.status === 'completed' ? '✅ Tugallangan' :
                     '❌ Bekor qilingan';

      message += `${index + 1}. Buyurtma #${order.id}\n`;
      message += `   ${status}\n`;
      message += `   💰 ${order.totalAmount} so'm\n`;
      message += `   📅 ${new Date(order.createdAt).toLocaleDateString('uz-UZ')}\n\n`;
    });

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Buyurtmalarni olishda xato:', error);
    await bot.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
});

// Yordam tugmasi
bot.onText(/ℹ️ Yordam/, async (msg) => {
  await bot.sendMessage(
    msg.chat.id,
    `ℹ️ *Yordam*\n\n` +
    `🛍 *Katalog* - Barcha mahsulotlarni ko'rish\n` +
    `🛒 *Savatcha* - Savatingizni ko'rish\n` +
    `📦 *Buyurtmalarim* - Buyurtmalaringizni kuzatish\n\n` +
    `Savollar bo'lsa, admin bilan bog'laning: @IIllllIIlIIll`,
    { parse_mode: 'Markdown' }
  );
});

// Callback query handler
bot.on('callback_query', async (query) => {
  const chatId = query.message!.chat.id;
  const userId = query.from.id;
  const data = query.data!;

  try {
    // Kategoriyalarni ko'rsatish
    if (data === 'show_categories') {
      const categories = await dbStorage.getCategories();

      if (categories.length === 0) {
        await bot.sendMessage(chatId, '❌ Hozircha kategoriyalar mavjud emas.');
        return;
      }

      const keyboard = categories.map((cat) => [
        { text: cat.name, callback_data: `cat_${cat.id}` },
      ]);

      keyboard.push([{ text: '◀️ Orqaga', callback_data: 'main_menu' }]);

      await bot.sendMessage(chatId, '📂 Kategoriyani tanlang:', {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    }
    // Kategoriya tanlandi
    else if (data.startsWith('cat_')) {
      const categoryId = parseInt(data.split('_')[1]);
      await showCategoryProducts(chatId, categoryId);
    }
    // Mahsulot tanlandi
    else if (data.startsWith('prod_')) {
      const productId = parseInt(data.split('_')[1]);
      await showProductDetail(chatId, productId);
    }
    // Savatga qo'shish
    else if (data.startsWith('add_')) {
      const productId = parseInt(data.split('_')[1]);
      await addToCart(chatId, userId, productId);
    }
    // Miqdorni o'zgartirish
    else if (data.startsWith('qty_')) {
      const parts = data.split('_');
      const action = parts[1]; // 'plus' or 'minus'
      const productId = parseInt(parts[2]);
      await updateQuantity(chatId, userId, productId, action);
    }
    // Mahsulotni o'chirish
    else if (data.startsWith('del_')) {
      const productId = parseInt(data.split('_')[1]);
      await removeFromCart(chatId, userId, productId);
    }
    // Buyurtma berish
    else if (data === 'checkout') {
      await startCheckout(chatId, userId);
    }
    // Savatchani ko'rish
    else if (data === 'view_cart') {
      await showCart(chatId, userId);
    }
    // Orqaga
    else if (data === 'back_to_catalog') {
      await bot.sendMessage(chatId, '📂 Kategoriyani tanlang:', {
        reply_markup: {
          inline_keyboard: (await dbStorage.getCategories()).map((cat) => [
            { text: cat.name, callback_data: `cat_${cat.id}` },
          ]),
        },
      });
    }
    // Asosiy menyu
    else if (data === 'main_menu') {
      await bot.sendMessage(
        chatId,
        '🏠 Asosiy menyu',
        getMainMenuKeyboard()
      );
    }

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Callback query xato:', error);
    await bot.answerCallbackQuery(query.id, {
      text: '❌ Xatolik yuz berdi',
      show_alert: true,
    });
  }
});

// Kategoriya mahsulotlarini ko'rsatish
async function showCategoryProducts(chatId: number, categoryId: number) {
  try {
    const products = await dbStorage.getProductsByCategory(categoryId);
    const category = await dbStorage.getCategory(categoryId);

    if (!products || products.length === 0) {
      await bot.sendMessage(chatId, '❌ Bu kategoriyada mahsulotlar yo\'q.');
      return;
    }

    const keyboard = products.map((prod) => [
      { text: `${prod.name} - ${prod.price} so'm`, callback_data: `prod_${prod.id}` },
    ]);

    keyboard.push([{ text: '◀️ Katalogga qaytish', callback_data: 'back_to_catalog' }]);

    await bot.sendMessage(
      chatId,
      `📂 *${category?.name || 'Kategoriya'}*\n\nMahsulotni tanlang:`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }
    );
  } catch (error) {
    console.error('Mahsulotlarni olishda xato:', error);
    await bot.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

// Mahsulot tafsilotlarini ko'rsatish
async function showProductDetail(chatId: number, productId: number) {
  try {
    const product = await dbStorage.getProduct(productId);

    if (!product) {
      await bot.sendMessage(chatId, '❌ Mahsulot topilmadi.');
      return;
    }

    // Rasmni parse qilish
    let images: string[] = [];
    if (typeof product.images === 'string') {
      try {
        images = JSON.parse(product.images);
      } catch {
        images = [];
      }
    } else if (Array.isArray(product.images)) {
      images = product.images;
    }

    const imageUrl = images.length > 0 ? images[0] : null;

    const message =
      `🛍 *${product.name}*\n\n` +
      `💰 Narxi: *${product.price} so'm*\n` +
      `📦 Omborda: ${product.stock} dona\n\n` +
      `📝 ${product.description || 'Tavsif yo\'q'}`;

    const keyboard = [
      [{ text: '➕ Savatga qo\'shish', callback_data: `add_${product.id}` }],
      [{ text: '🛒 Savatchani ko\'rish', callback_data: 'view_cart' }],
      [{ text: '◀️ Orqaga', callback_data: `cat_${product.categoryId}` }],
    ];

    if (imageUrl && imageUrl.startsWith('http')) {
      await bot.sendPhoto(chatId, imageUrl, {
        caption: message,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } else if (imageUrl && !imageUrl.startsWith('http')) {
      // Local fayl
      const fullPath = imageUrl.startsWith('/') ? `.${imageUrl}` : imageUrl;
      try {
        await bot.sendPhoto(chatId, fullPath, {
          caption: message,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: keyboard,
          },
        });
      } catch {
        // Rasm yuborilmasa, faqat text
        await bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: keyboard,
          },
        });
      }
    } else {
      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    }
  } catch (error) {
    console.error('Mahsulot tafsilotlarini ko\'rsatishda xato:', error);
    await bot.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

// Savatga qo'shish
async function addToCart(chatId: number, userId: number, productId: number) {
  try {
    const product = await dbStorage.getProduct(productId);

    if (!product) {
      await bot.sendMessage(chatId, '❌ Mahsulot topilmadi.');
      return;
    }

    const session = getSession(userId);

    if (session.cart.has(productId)) {
      const item = session.cart.get(productId)!;
      item.quantity += 1;
      await bot.sendMessage(chatId, `✅ ${product.name} miqdori oshirildi! (${item.quantity} dona)`);
    } else {
      session.cart.set(productId, { product, quantity: 1 });
      await bot.sendMessage(chatId, `✅ ${product.name} savatga qo'shildi!`);
    }

    // Savatchani ko'rsatish
    setTimeout(() => showCart(chatId, userId), 1000);
  } catch (error) {
    console.error('Savatga qo\'shishda xato:', error);
    await bot.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

// Miqdorni o'zgartirish
async function updateQuantity(chatId: number, userId: number, productId: number, action: string) {
  try {
    const session = getSession(userId);

    if (!session.cart.has(productId)) {
      return;
    }

    const item = session.cart.get(productId)!;

    if (action === 'plus') {
      item.quantity += 1;
    } else if (action === 'minus') {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        session.cart.delete(productId);
      }
    }

    await showCart(chatId, userId);
  } catch (error) {
    console.error('Miqdorni o\'zgartirishda xato:', error);
  }
}

// Savatdan o'chirish
async function removeFromCart(chatId: number, userId: number, productId: number) {
  try {
    const session = getSession(userId);
    session.cart.delete(productId);

    await bot.sendMessage(chatId, '🗑 Mahsulot savatchadan o\'chirildi.');
    setTimeout(() => showCart(chatId, userId), 500);
  } catch (error) {
    console.error('Savatchadan o\'chirishda xato:', error);
  }
}

// Savatchani ko'rsatish
async function showCart(chatId: number, userId: number) {
  try {
    const session = getSession(userId);

    if (session.cart.size === 0) {
      await bot.sendMessage(chatId, '🛒 Savatchingiz bo\'sh.\n\nMahsulot qo\'shish uchun "🛍 Katalog"ga o\'ting.');
      return;
    }

    let message = '🛒 *Savatingiz:*\n\n';
    let total = 0;

    const keyboard: any[] = [];

    session.cart.forEach((item, productId) => {
      const itemTotal = item.product.price * item.quantity;
      total += itemTotal;

      message += `📦 *${item.product.name}*\n`;
      message += `   💰 ${item.product.price} so'm x ${item.quantity} = ${itemTotal} so'm\n\n`;

      keyboard.push([
        { text: '➖', callback_data: `qty_minus_${productId}` },
        { text: `${item.quantity} dona`, callback_data: 'noop' },
        { text: '➕', callback_data: `qty_plus_${productId}` },
        { text: '🗑', callback_data: `del_${productId}` },
      ]);
    });

    message += `\n💵 *Jami: ${total} so'm*`;

    keyboard.push([{ text: '✅ Buyurtma berish', callback_data: 'checkout' }]);
    keyboard.push([{ text: '🛍 Katalogga qaytish', callback_data: 'back_to_catalog' }]);

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } catch (error) {
    console.error('Savatchani ko\'rsatishda xato:', error);
    await bot.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

// Buyurtma jarayonini boshlash
async function startCheckout(chatId: number, userId: number) {
  try {
    const session = getSession(userId);

    if (session.cart.size === 0) {
      await bot.sendMessage(chatId, '❌ Savatingiz bo\'sh!');
      return;
    }

    session.checkoutStep = 'phone';

    await bot.sendMessage(
      chatId,
      `📞 *Buyurtma berish*\n\n` +
      `Iltimos, telefon raqamingizni yuboring:\n` +
      `Masalan: +998901234567`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Buyurtma boshlashda xato:', error);
  }
}

// Text xabarlarni eshitish (telefon va manzil uchun)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from!.id;
  const text = msg.text;

  if (!text || text.startsWith('/') || text.startsWith('🛍') || text.startsWith('🛒') || text.startsWith('📦') || text.startsWith('ℹ️')) {
    // Still persist simple text messages that are not bot commands
    if (text && !text.startsWith('/')) {
      try {
        const telegramIdStr = String(userId);
        let customer = await dbStorage.getCustomerByTelegramId(telegramIdStr);
        if (!customer) {
          customer = await dbStorage.createCustomer({
            telegramId: telegramIdStr,
            firstName: msg.from?.first_name || null,
            lastName: msg.from?.last_name || null,
            username: msg.from?.username || null,
            phoneNumber: null,
            address: null,
            photoUrl: null,
          });
        }
        await dbStorage.createMessage({
          customerId: customer.id,
          sender: 'customer',
          text: text,
        });
      } catch (e) {
        console.error('Failed to persist incoming message:', e);
      }
    }
    return;
  }

  const session = getSession(userId);

  if (session.checkoutStep === 'phone') {
    session.tempPhone = text;
    session.checkoutStep = 'address';

    await bot.sendMessage(
      chatId,
      `📍 *Manzil*\n\n` +
      `Iltimos, yetkazib berish manzilini yuboring:\n` +
      `Masalan: Toshkent sh., Chilonzor tumani, 12-kvartal, 34-uy`,
      { parse_mode: 'Markdown' }
    );
  } else if (session.checkoutStep === 'address') {
    session.tempAddress = text;
    await confirmOrder(chatId, userId);
  }
});

// Buyurtmani tasdiqlash
async function confirmOrder(chatId: number, userId: number) {
  try {
    const session = getSession(userId);

    if (!session.tempPhone || !session.tempAddress) {
      await bot.sendMessage(chatId, '❌ Ma\'lumotlar to\'liq emas.');
      return;
    }

    // Buyurtma ma'lumotlarini tayyorlash
    let message = '✅ *Buyurtmangiz:*\n\n';
    let total = 0;
    const items: any[] = [];

    session.cart.forEach((item) => {
      const itemTotal = item.product.price * item.quantity;
      total += itemTotal;

      message += `📦 ${item.product.name}\n`;
      message += `   ${item.quantity} x ${item.product.price} = ${itemTotal} so'm\n\n`;

      items.push({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      });
    });

    message += `💵 *Jami: ${total} so'm*\n\n`;
    message += `📞 Telefon: ${session.tempPhone}\n`;
    message += `📍 Manzil: ${session.tempAddress}\n\n`;
    message += `Buyurtmani tasdiqlaysizmi?`;

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Ha, tasdiqlash', callback_data: 'confirm_order' },
            { text: '❌ Bekor qilish', callback_data: 'cancel_order' },
          ],
        ],
      },
    });
  } catch (error) {
    console.error('Buyurtmani tasdiqlashda xato:', error);
    await bot.sendMessage(chatId, '❌ Xatolik yuz berdi.');
  }
}

// Buyurtmani tasdiqlash callback
bot.on('callback_query', async (query) => {
  const chatId = query.message!.chat.id;
  const userId = query.from.id;
  const data = query.data!;

  if (data === 'confirm_order') {
    try {
      const session = getSession(userId);
      const firstName = query.from.first_name || '';
      const lastName = query.from.last_name || '';
      const username = query.from.username || '';
      const fullName = `${firstName} ${lastName}`.trim() || username || 'Noma\'lum';

      // Buyurtmani yaratish
      const items: any[] = [];
      let total = 0;
      let productsDetails: { name: string; quantity: number; price: number }[] = [];

      session.cart.forEach((item) => {
        items.push({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          productName: item.product.name,
        });
        total += item.product.price * item.quantity;
        
        productsDetails.push({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        });
      });

      // Create or get customer
      let customer = await dbStorage.getCustomerByTelegramId(String(userId));
      if (!customer) {
        customer = await dbStorage.createCustomer({
          telegramId: String(userId),
          firstName,
          lastName,
          username,
          phoneNumber: session.tempPhone || null,
          address: null,
          photoUrl: null,
        });
      }

      const order = await dbStorage.createOrder({
        customerId: customer.id,
        totalAmount: total,
        status: 'new',
        deliveryAddress: session.tempAddress!,
        phoneNumber: session.tempPhone!,
        paymentMethod: 'card',
        deliveryMethod: 'delivery',
        paymentStatus: 'pending',
      });

      // Create order items
      for (const item of items) {
        await dbStorage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          productName: item.productName,
        });
      }

      await bot.sendMessage(
        chatId,
        `✅ *Buyurtma qabul qilindi!*\n\n` +
        `📋 Buyurtma raqami: #${order.id}\n` +
        `💵 Summa: ${total} so'm\n\n` +
        `Tez orada operator siz bilan bog'lanadi.\n\n` +
        `Rahmat! 🎉`,
        { parse_mode: 'Markdown', ...getMainMenuKeyboard() }
      );

      // Admin/Guruhga xabar yuborish - faqat nom va buyurtma raqami
      const adminChatId = process.env.ADMIN_CHAT_ID;
      const adminGroupId = process.env.ADMIN_GROUP_ID;
      
      if (adminChatId) {
        let adminMessage = `📦 Yangi buyurtma #${order.id}\n👤 ${fullName}`;
        try {
          await bot.sendMessage(adminChatId, adminMessage);
        } catch (error) {
          console.error('Adminga xabar yuborishda xato:', error);
          console.log('Admin Chat ID:', adminChatId);
        }
      }

      if (adminGroupId) {
        let groupMessage = `📦 Yangi buyurtma #${order.id}\n👤 ${fullName}`;
        try {
          await bot.sendMessage(adminGroupId, groupMessage);
        } catch (error) {
          console.error('Guruhga xabar yuborishda xato:', error);
          console.log('Admin Group ID:', adminGroupId);
        }
      }
      
      // Savatchani tozalash
      session.cart.clear();
      session.checkoutStep = undefined;
      session.tempPhone = undefined;
      session.tempAddress = undefined;
    } catch (error) {
      console.error('Buyurtma yaratishda xato:', error);
      await bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
    }
  } else if (data === 'cancel_order') {
    const session = getSession(userId);
    session.checkoutStep = undefined;
    session.tempPhone = undefined;
    session.tempAddress = undefined;

    await bot.sendMessage(chatId, '❌ Buyurtma bekor qilindi.', getMainMenuKeyboard());
  }

  await bot.answerCallbackQuery(query.id);
});

console.log('🤖 Telegram bot ishga tushdi!');
console.log('Bot username: @fesh777_bot');
