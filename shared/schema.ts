import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Categories
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Products
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  categoryId: integer("category_id").references(() => categories.id),
  images: text("images").notNull().default("[]"), // JSON string
  stock: integer("stock").notNull().default(0),
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
  isFeatured: integer("is_featured", { mode: 'boolean' }).notNull().default(false),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  reviews: many(reviews),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
}));

// Custom insert schema that accepts images as array and converts to string
export const insertProductSchema = createInsertSchema(products)
  .omit({ id: true })
  .extend({
    images: z.union([z.string(), z.array(z.string())]).optional().default("[]"),
  });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Customers (Telegram users)
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  telegramId: text("telegram_id").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  username: text("username"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  photoUrl: text("photo_url"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  reviews: many(reviews),
  cartItems: many(cartItems),
}));

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Admins
export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("operator"),
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
});

export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

// Orders
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  status: text("status").notNull().default("new"),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  deliveryMethod: text("delivery_method").notNull(),
  deliveryAddress: text("delivery_address"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  deliveryFee: real("delivery_fee").notNull().default(0),
  totalAmount: real("total_amount").notNull(),
  phoneNumber: text("phone_number").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Items
export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Cart Items
export const cartItems = sqliteTable("cart_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  customer: one(customers, {
    fields: [cartItems.customerId],
    references: [customers.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// Reviews
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").references(() => products.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  customer: one(customers, {
    fields: [reviews.customerId],
    references: [customers.id],
  }),
}));

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Broadcasts
export const broadcasts = sqliteTable("broadcasts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  sentAt: text("sent_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  recipientCount: integer("recipient_count").notNull().default(0),
});

export const insertBroadcastSchema = createInsertSchema(broadcasts).omit({ id: true, sentAt: true });
export type InsertBroadcast = z.infer<typeof insertBroadcastSchema>;
export type Broadcast = typeof broadcasts.$inferSelect;

// Messages (admin <-> customer chat)
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  sender: text("sender").notNull(), // 'admin' or 'customer'
  text: text("text").notNull(),
  meta: text("meta"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  customer: one(customers, {
    fields: [messages.customerId],
    references: [customers.id],
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Likes
export const likes = sqliteTable("likes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const likesRelations = relations(likes, ({ one }) => ({
  customer: one(customers, {
    fields: [likes.customerId],
    references: [customers.id],
  }),
  product: one(products, {
    fields: [likes.productId],
    references: [products.id],
  }),
}));

export const insertLikeSchema = createInsertSchema(likes).omit({ id: true, createdAt: true });
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likes.$inferSelect;

// Settings
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value"),
});

export const insertSettingSchema = createInsertSchema(settings).omit({ id: true });
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

// Keep legacy users table for compatibility
export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
// Banners (Carousel)
export const banners = sqliteTable("banners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imageUrl: text("image_url").notNull(),
  title: text("title"),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertBannerSchema = createInsertSchema(banners).omit({ id: true, createdAt: true });
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof banners.$inferSelect;