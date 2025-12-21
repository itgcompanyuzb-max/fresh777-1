import { db } from "./db";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  customers, type Customer, type InsertCustomer,
  admins, type Admin, type InsertAdmin,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  cartItems, type CartItem, type InsertCartItem,
  reviews, type Review, type InsertReview,
  broadcasts, type Broadcast, type InsertBroadcast,
  settings, type Setting, type InsertSetting,
  messages, type Message, type InsertMessage,
  likes, type Like, type InsertLike,
  banners, type Banner, type InsertBanner,
} from "@shared/schema";

export interface IStorage {
  // Users (legacy)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByTelegramId(telegramId: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;

  // Admins
  getAdmins(): Promise<Admin[]>;
  getAdmin(id: number): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updateAdmin(id: number, admin: Partial<InsertAdmin>): Promise<Admin | undefined>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  deleteOrderItems(orderId: number): Promise<boolean>;

  // Messages (admin chat)
  getMessagesByCustomer(customerId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Order Items
  getOrderItems(orderId: number): Promise<(OrderItem & { product?: Product })[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // Cart Items
  getCartItems(customerId: number): Promise<(CartItem & { product: Product })[]>;
  getCartItem(customerId: number, productId: number): Promise<CartItem | undefined>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(customerId: number): Promise<boolean>;
  getCartCount(customerId: number): Promise<number>;

  // Reviews
  getProductReviews(productId: number): Promise<(Review & { customer: Customer | null })[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Broadcasts
  getBroadcasts(): Promise<Broadcast[]>;
  createBroadcast(broadcast: InsertBroadcast): Promise<Broadcast>;

  // Settings
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;

  // Banners
  getBanners(): Promise<any[]>;
  createBanner(banner: any): Promise<any>;
  updateBanner(id: number, banner: Partial<any>): Promise<any | undefined>;
  deleteBanner(id: number): Promise<boolean>;

  // Stats
  getStats(): Promise<{
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalRevenue: number;
    recentOrders: Order[];
    topProducts: { product: Product; orderCount: number }[];
  }>;
}

class DatabaseStorage implements IStorage {
  // Users (legacy)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.sortOrder);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const productList = await db.select().from(products).orderBy(desc(products.id));
    return productList.map(product => ({
      ...product,
      images: this.parseImages(product.images)
    }));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return undefined;
    
    return {
      ...product,
      images: this.parseImages(product.images)
    };
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const productList = await db.select().from(products)
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
      .orderBy(desc(products.id));
    
    return productList.map(product => ({
      ...product,
      images: this.parseImages(product.images)
    }));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const productList = await db.select().from(products)
      .where(and(eq(products.isFeatured, true), eq(products.isActive, true)))
      .orderBy(desc(products.id));
    
    return productList.map(product => ({
      ...product,
      images: this.parseImages(product.images)
    }));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const productData = {
      ...product,
      images: JSON.stringify(product.images || [])
    };
    
    const [created] = await db.insert(products).values(productData).returning();
    return {
      ...created,
      images: this.parseImages(created.images)
    };
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const updateData = {
      ...product,
      ...(product.images && { images: JSON.stringify(product.images) })
    };
    
    const [updated] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    if (!updated) return undefined;
    
    return {
      ...updated,
      images: this.parseImages(updated.images)
    };
  }

  private parseImages(images: any): string[] {
    try {
      if (typeof images === 'string') {
        return JSON.parse(images);
      }
      if (Array.isArray(images)) {
        return images;
      }
      return [];
    } catch {
      return [];
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    await db.delete(products).where(eq(products.id, id));
    return true;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByTelegramId(telegramId: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.telegramId, telegramId));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return updated;
  }

  // Admins
  async getAdmins(): Promise<Admin[]> {
    return db.select().from(admins);
  }

  async getAdmin(id: number): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [created] = await db.insert(admins).values(admin).returning();
    return created;
  }

  async updateAdmin(id: number, admin: Partial<InsertAdmin>): Promise<Admin | undefined> {
    const [updated] = await db.update(admins).set(admin).where(eq(admins.id, id)).returning();
    return updated;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    return db.select().from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set(order).where(eq(orders.id, id)).returning();
    return updated;
  }

  async deleteOrder(id: number): Promise<boolean> {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return true;
  }

  async deleteOrderItems(orderId: number): Promise<boolean> {
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    return true;
  }

  // Messages
  async getMessagesByCustomer(customerId: number): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.customerId, customerId)).orderBy(desc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  // Likes
  async getLikesByCustomer(customerId: number): Promise<Like[]> {
    return db.select().from(likes).where(eq(likes.customerId, customerId)).orderBy(desc(likes.createdAt));
  }

  async addLike(customerId: number, productId: number): Promise<Like> {
    const [created] = await db.insert(likes).values({ customerId, productId }).returning();
    return created;
  }

  async removeLike(customerId: number, productId: number): Promise<boolean> {
    await db.delete(likes).where(and(eq(likes.customerId, customerId), eq(likes.productId, productId)));
    return true;
  }

  // Order Items
  async getOrderItems(orderId: number): Promise<(OrderItem & { product?: Product })[]> {
    const items = await db.select({
      orderItem: orderItems,
      product: products,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

    return items.map(item => ({
      ...item.orderItem,
      product: item.product ? {
        ...item.product,
        images: this.parseImages(item.product.images)
      } : undefined,
    }));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [created] = await db.insert(orderItems).values(item).returning();
    return created;
  }

  // Cart Items
  async getCartItems(customerId: number): Promise<(CartItem & { product: Product })[]> {
    const items = await db.select({
      cartItem: cartItems,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.customerId, customerId));

    return items.map(item => ({
      ...item.cartItem,
      product: {
        ...item.product,
        images: this.parseImages(item.product.images)
      },
    }));
  }

  async getCartItem(customerId: number, productId: number): Promise<CartItem | undefined> {
    const [item] = await db.select().from(cartItems)
      .where(and(eq(cartItems.customerId, customerId), eq(cartItems.productId, productId)));
    return item;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const existing = await this.getCartItem(item.customerId, item.productId);
    if (existing) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existing.quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(cartItems).values(item).returning();
    return created;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: number): Promise<boolean> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
    return true;
  }

  async clearCart(customerId: number): Promise<boolean> {
    await db.delete(cartItems).where(eq(cartItems.customerId, customerId));
    return true;
  }

  async getCartCount(customerId: number): Promise<number> {
    const items = await db.select({ quantity: cartItems.quantity })
      .from(cartItems)
      .where(eq(cartItems.customerId, customerId));
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Reviews
  async getProductReviews(productId: number): Promise<(Review & { customer: Customer | null })[]> {
    const result = await db.select({
      review: reviews,
      customer: customers,
    })
    .from(reviews)
    .leftJoin(customers, eq(reviews.customerId, customers.id))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));

    return result.map(r => ({
      ...r.review,
      customer: r.customer,
    }));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }

  // Broadcasts
  async getBroadcasts(): Promise<Broadcast[]> {
    return db.select().from(broadcasts).orderBy(desc(broadcasts.sentAt));
  }

  async createBroadcast(broadcast: InsertBroadcast): Promise<Broadcast> {
    const customerCount = await db.select({ count: sql<number>`count(*)` }).from(customers);
    const [created] = await db.insert(broadcasts).values({
      ...broadcast,
      recipientCount: customerCount[0]?.count || 0,
    }).returning();
    return created;
  }

  // Settings
  async getSetting(key: string): Promise<string | null> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting?.value || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const existing = await this.getSetting(key);
    if (existing !== null) {
      await db.update(settings).set({ value }).where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value });
    }
  }

  // Stats
  async getStats(): Promise<{
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalRevenue: number;
    recentOrders: Order[];
    topProducts: { product: Product; orderCount: number }[];
    monthlyRevenue: { month: string; revenue: number }[];
    monthlyOrders: { month: string; count: number }[];
    ordersToday: number;
    revenueToday: number;
    ordersByStatus: { status: string; count: number }[];
    revenueByDay: { date: string; revenue: number }[];
  }> {
    const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [customerCount] = await db.select({ count: sql<number>`count(*)` }).from(customers);
    const [revenueResult] = await db.select({ 
      total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` 
    }).from(orders);

    const recentOrders = await db.select().from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    const topProductsResult = await db.select({
      productId: orderItems.productId,
      orderCount: sql<number>`count(*)`,
    })
    .from(orderItems)
    .groupBy(orderItems.productId)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

    const topProducts: { product: Product; orderCount: number }[] = [];
    for (const item of topProductsResult) {
      const product = await this.getProduct(item.productId);
      if (product) {
        topProducts.push({ product, orderCount: item.orderCount });
      }
    }

    // Today's stats
    const today = new Date().toISOString().split('T')[0];
    const [todayOrders] = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(sql`DATE(${orders.createdAt}) = ${today}`);

    const [todayRevenue] = await db.select({
      total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
    })
    .from(orders)
    .where(sql`DATE(${orders.createdAt}) = ${today}`);

    // Orders by status
    const ordersByStatusData = await db.select({
      status: orders.status,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .groupBy(orders.status);

    // Revenue by day (last 7 days)
    const revenueByDayData = await db.select({
      date: sql<string>`DATE(${orders.createdAt})`,
      revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
    })
    .from(orders)
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(sql`DATE(${orders.createdAt}) DESC`)
    .limit(7);

    // Monthly revenue (last 12 months)
    const monthlyRevenueData = await db.select({
      month: sql<string>`strftime('%Y-%m', ${orders.createdAt})`,
      revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
    })
    .from(orders)
    .groupBy(sql`strftime('%Y-%m', ${orders.createdAt})`)
    .orderBy(sql`strftime('%Y-%m', ${orders.createdAt})`)
    .limit(12);

    // Monthly orders count
    const monthlyOrdersData = await db.select({
      month: sql<string>`strftime('%Y-%m', ${orders.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .groupBy(sql`strftime('%Y-%m', ${orders.createdAt})`)
    .orderBy(sql`strftime('%Y-%m', ${orders.createdAt})`)
    .limit(12);

    return {
      totalProducts: productCount?.count || 0,
      totalOrders: orderCount?.count || 0,
      totalCustomers: customerCount?.count || 0,
      totalRevenue: revenueResult?.total || 0,
      recentOrders,
      topProducts,
      monthlyRevenue: monthlyRevenueData,
      monthlyOrders: monthlyOrdersData,
      ordersToday: todayOrders?.count || 0,
      revenueToday: todayRevenue?.total || 0,
      ordersByStatus: ordersByStatusData,
      revenueByDay: revenueByDayData,
    };
  }

  // Banners
  async getBanners(): Promise<Banner[]> {
    return await db.select().from(banners).where(eq(banners.isActive, true)).orderBy(banners.sortOrder);
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const result = await db.insert(banners).values(banner).returning();
    return result[0];
  }

  async updateBanner(id: number, banner: Partial<InsertBanner>): Promise<Banner | undefined> {
    const result = await db.update(banners).set(banner).where(eq(banners.id, id)).returning();
    return result[0];
  }

  async deleteBanner(id: number): Promise<boolean> {
    const result = await db.delete(banners).where(eq(banners.id, id));
    return !!result;
  }
}

// Export storage instance with specific name to avoid caching issues
export const dbStorage = new DatabaseStorage();

