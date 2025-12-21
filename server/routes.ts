import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { dbStorage as storage } from "./storage";
import { telegramBot, sendMessageToUser } from "./telegram-bot";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  insertCategorySchema, 
  insertProductSchema, 
  insertOrderSchema,
  insertOrderItemSchema,
  insertCartItemSchema,
  insertReviewSchema,
  insertBroadcastSchema,
  insertAdminSchema,
  insertCustomerSchema,
  insertBannerSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ==================== FILE UPLOAD ====================
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for file uploads
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
      cb(null, filename);
    }
  });

  const upload = multer({
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      console.log('File filter check:', file.mimetype);
      // Check if file is an image
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        console.log('File rejected - not an image:', file.mimetype);
        cb(new Error('Only image files are allowed'), false);
      }
    }
  });

  // Upload endpoint with error handling
  app.post("/api/admin/upload", (req: Request, res: Response) => {
    const uploadMiddleware = upload.array('images', 10);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: "File too large. Maximum 5MB allowed." });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: "Too many files. Maximum 10 files allowed." });
          }
        }
        return res.status(400).json({ error: err.message });
      }

      try {
        console.log('Upload request received');
        console.log('Request files:', req.files);
        
        const files = req.files as Express.Multer.File[];
        
        if (!files || files.length === 0) {
          console.log('No files uploaded');
          return res.status(400).json({ error: "No files uploaded" });
        }

        console.log(`Processing ${files.length} files`);
        const urls: string[] = [];
        
        for (const file of files) {
          console.log('Processing file:', {
            originalname: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size
          });
          
          // Return URL relative to public path  
          const url = `/uploads/${file.filename}`;
          urls.push(url);
          console.log('Generated URL:', url);
        }

        console.log('Upload successful, URLs:', urls);
        res.json({ urls });
      } catch (error) {
        console.error('Upload processing error:', error);
        res.status(500).json({ error: "Failed to process uploaded files" });
      }
    });
  });

  // Test endpoint to check if upload endpoint is reachable
  app.get("/api/admin/upload-test", (req: Request, res: Response) => {
    res.json({ message: "Upload endpoint is reachable", uploadsDir });
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Add CORS headers for images
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
  });
  
  // Helper function to parse images from JSON string to array
  const parseProductImages = (product: any) => {
    if (product && typeof product.images === 'string') {
      try {
        product.images = JSON.parse(product.images);
      } catch {
        product.images = [];
      }
    }
    return product;
  };
  
  // ==================== CATEGORIES ====================
  
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  app.post("/api/admin/categories", async (req: Request, res: Response) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Category creation error:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.patch("/api/admin/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, data);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if category has products
      const categoryProducts = await storage.getProductsByCategory(id);
      if (categoryProducts.length > 0) {
        return res.status(400).json({ 
          error: "Bu kategoriyada mahsulotlar mavjud. Avval mahsulotlarni o'chiring yoki boshqa kategoriyaga o'tkazing." 
        });
      }
      
      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      console.error("Category deletion error:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // ==================== PRODUCTS ====================

  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      const parsedProducts = products.map(parseProductImages);
      res.json(parsedProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Admin: fetch all products (including inactive)
  app.get("/api/admin/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      const parsedProducts = products.map(parseProductImages);
      res.json(parsedProducts);
    } catch (error) {
      console.error("Failed to fetch admin products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req: Request, res: Response) => {
    try {
      const products = await storage.getFeaturedProducts();
      const parsedProducts = products.map(parseProductImages);
      res.json(parsedProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      const reviews = await storage.getProductReviews(id);
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;
      const parsedProduct = parseProductImages(product);
      res.json({ ...parsedProduct, reviews, averageRating });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/admin/products", async (req: Request, res: Response) => {
    try {
      // Convert images array to JSON string if needed
      if (req.body.images && Array.isArray(req.body.images)) {
        req.body.images = JSON.stringify(req.body.images);
      }
      
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Product validation error:", error.errors);
        return res.status(400).json({ error: error.errors });
      }
      console.error("Product creation error:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/admin/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Convert images array to JSON string if needed
      if (req.body.images && Array.isArray(req.body.images)) {
        req.body.images = JSON.stringify(req.body.images);
      }
      
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, data);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Product validation error:", error.errors);
        return res.status(400).json({ error: error.errors });
      }
      console.error("Product update error:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // ==================== CUSTOMERS ====================

  app.get("/api/admin/customers", async (req: Request, res: Response) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req: Request, res: Response) => {
    try {
      const { telegramId, firstName, lastName, phoneNumber, username } = req.body;
      
      if (!telegramId) {
        return res.status(400).json({ error: "Telegram ID required" });
      }

      // Check if customer already exists
      let customer = await storage.getCustomerByTelegramId(telegramId);
      if (customer) {
        // Update existing customer
        const updated = await storage.updateCustomer(customer.id, {
          firstName: firstName || customer.firstName,
          lastName: lastName || customer.lastName,
          phoneNumber: phoneNumber || customer.phoneNumber,
          username: username || customer.username,
        });
        return res.json(updated);
      }

      // Create new customer
      customer = await storage.createCustomer({
        telegramId,
        firstName: firstName || null,
        lastName: lastName || null,
        phoneNumber: phoneNumber || null,
        username: username || null,
        address: null,
        photoUrl: null,
      });

      res.status(201).json(customer);
    } catch (error) {
      console.error("Customer creation error:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  app.get("/api/customers/me", async (req: Request, res: Response) => {
    try {
      const telegramId = req.headers["x-telegram-id"] as string;
      if (!telegramId) {
        return res.status(401).json({ error: "Telegram ID required" });
      }
      let customer = await storage.getCustomerByTelegramId(telegramId);
      if (!customer) {
        const firstName = req.headers["x-telegram-firstname"] as string;
        const lastName = req.headers["x-telegram-lastname"] as string;
        const username = req.headers["x-telegram-username"] as string;
        customer = await storage.createCustomer({
          telegramId,
          firstName: firstName || null,
          lastName: lastName || null,
          username: username || null,
          phoneNumber: null,
          address: null,
          photoUrl: null,
        });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to get customer" });
    }
  });

  app.patch("/api/customers/me", async (req: Request, res: Response) => {
    try {
      const telegramId = req.headers["x-telegram-id"] as string;
      if (!telegramId) {
        return res.status(401).json({ error: "Telegram ID required" });
      }
      const customer = await storage.getCustomerByTelegramId(telegramId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      const data = insertCustomerSchema.partial().parse(req.body);
      const updated = await storage.updateCustomer(customer.id, data);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  app.get("/api/customers/search", async (req: Request, res: Response) => {
    try {
      const phone = req.query.phone as string;
      if (!phone) {
        return res.status(400).json({ error: "Phone number required" });
      }

      const customers = await storage.getCustomers();
      
      // Normalize phone number - remove all non-digit characters
      const normalizePhone = (p: string) => p.replace(/\D/g, '');
      const searchPhone = normalizePhone(phone.trim());
      
      const customer = customers.find((c) => {
        if (!c.phoneNumber) return false;
        return normalizePhone(c.phoneNumber) === searchPhone;
      });

      if (!customer) {
        return res.status(404).json(null);
      }

      // Update current Telegram user to link with this customer
      const telegramId = req.headers["x-telegram-id"] as string;
      if (telegramId && customer.id) {
        await storage.updateCustomer(customer.id, {
          telegramId: telegramId,
        });
      }

      res.json(customer);
    } catch (error) {
      console.error("Search customer error:", error);
      res.status(500).json({ error: "Failed to search customer" });
    }
  });

  // ==================== ORDERS ====================

  app.get("/api/admin/orders", async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrders();
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          const customer = await storage.getCustomer(order.customerId);
          return { ...order, items, customer };
        })
      );
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/orders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const items = await storage.getOrderItems(id);
      const customer = await storage.getCustomer(order.customerId);
      res.json({ ...order, items, customer });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.patch("/api/admin/orders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, paymentStatus } = req.body;
      
      const order = await storage.updateOrder(id, { status, paymentStatus });
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Order update error:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.delete("/api/admin/orders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Delete order items first
      await storage.deleteOrderItems(id);
      
      // Then delete the order
      const deleted = await storage.deleteOrder(id);
      if (!deleted) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json({ success: true, message: "Order deleted" });
    } catch (error) {
      console.error("Order delete error:", error);
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      const telegramId = req.headers["x-telegram-id"] as string;
      if (!telegramId) {
        return res.status(401).json({ error: "Telegram ID required" });
      }
      const customer = await storage.getCustomerByTelegramId(telegramId);
      if (!customer) {
        return res.json([]);
      }
      const orders = await storage.getOrdersByCustomer(customer.id);
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return { ...order, items };
        })
      );
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const telegramId = req.headers["x-telegram-id"] as string;
      if (!telegramId) {
        return res.status(401).json({ error: "Telegram ID required" });
      }
      let customer = await storage.getCustomerByTelegramId(telegramId);
      if (!customer) {
        customer = await storage.createCustomer({
          telegramId,
          firstName: null,
          lastName: null,
          username: null,
          phoneNumber: req.body.phoneNumber || null,
          address: req.body.deliveryAddress || null,
          photoUrl: null,
        });
      }

      const { items, ...orderData } = req.body;

      // Calculate total price from items
      let totalPrice = 0;
      for (const item of items || []) {
        totalPrice += (parseInt(item.price || 0) || 0) * (item.quantity || 1);
      }

      const deliveryFeeValue = parseFloat(orderData.deliveryFee || 0) || 0;

      // Create order using schema field names (`totalAmount`, `deliveryFee`)
      const order = await storage.createOrder({
        ...orderData,
        customerId: customer.id,
        totalAmount: totalPrice,
        deliveryFee: deliveryFeeValue,
      });

      for (const item of items || []) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          productName: item.productName,
          productImage: item.productImage || null,
        });
      }

      await storage.clearCart(customer.id);

      // Send Telegram notification if user has telegramId
      if (customer.telegramId && telegramBot) {
        try {
          // Get order items for notification
          const orderItems = await storage.getOrderItems(order.id);
          
          await telegramBot.notifyOrderCreated(
            parseInt(customer.telegramId),
            order.id.toString(),
            {
              total: totalPrice,
              deliveryFee: deliveryFeeValue,
              phoneNumber: orderData.phoneNumber,
              deliveryMethod: orderData.deliveryMethod,
              deliveryAddress: orderData.deliveryAddress,
              paymentMethod: orderData.paymentMethod,
              notes: orderData.notes,
              items: orderItems,
              customerUsername: customer.username,
              customerFirstName: customer.firstName,
              customerLastName: customer.lastName,
            }
          );
        } catch (notificationError) {
          console.error('Failed to send Telegram notification:', notificationError);
          // Don't fail the order if notification fails
        }
      }

      res.status(201).json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // ==================== CART ====================

  app.get("/api/cart", async (req: Request, res: Response) => {
    try {
      const telegramId = req.headers["x-telegram-id"] as string;
      if (!telegramId) {
        return res.json([]);
      }
      const customer = await storage.getCustomerByTelegramId(telegramId);
      if (!customer) {
        return res.json([]);
      }
      const items = await storage.getCartItems(customer.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.get("/api/cart/count", async (req: Request, res: Response) => {
    try {
      const telegramId = req.headers["x-telegram-id"] as string;
      if (!telegramId) {
        return res.json({ count: 0 });
      }
      const customer = await storage.getCustomerByTelegramId(telegramId);
      if (!customer) {
        return res.json({ count: 0 });
      }
      const count = await storage.getCartCount(customer.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart count" });
    }
  });

  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      const telegramId = req.headers["x-telegram-id"] as string;
      if (!telegramId) {
        return res.status(401).json({ error: "Telegram ID required" });
      }
      let customer = await storage.getCustomerByTelegramId(telegramId);
      if (!customer) {
        customer = await storage.createCustomer({
          telegramId,
          firstName: null,
          lastName: null,
          username: null,
          phoneNumber: null,
          address: null,
          photoUrl: null,
        });
      }
      const { productId, quantity } = req.body;
      const item = await storage.addToCart({
        customerId: customer.id,
        productId,
        quantity: quantity || 1,
      });
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      if (quantity <= 0) {
        await storage.removeFromCart(id);
        return res.status(204).send();
      }
      const item = await storage.updateCartItem(id, quantity);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from cart" });
    }
  });

  // ==================== REVIEWS ====================

  app.get("/api/products/:id/reviews", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/products/:id/reviews", async (req: Request, res: Response) => {
    try {
      const telegramId = req.headers["x-telegram-id"] as string;
      if (!telegramId) {
        return res.status(401).json({ error: "Telegram ID required" });
      }
      const customer = await storage.getCustomerByTelegramId(telegramId);
      if (!customer) {
        return res.status(401).json({ error: "Customer not found" });
      }
      const productId = parseInt(req.params.id);
      const { rating, comment } = req.body;
      const review = await storage.createReview({
        productId,
        customerId: customer.id,
        rating,
        comment,
      });
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // ==================== BROADCASTS ====================

  app.get("/api/admin/broadcasts", async (req: Request, res: Response) => {
    try {
      const broadcasts = await storage.getBroadcasts();
      res.json(broadcasts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch broadcasts" });
    }
  });

  app.post("/api/admin/broadcasts", async (req: Request, res: Response) => {
    try {
      const data = insertBroadcastSchema.parse(req.body);
      const broadcast = await storage.createBroadcast(data);
      res.status(201).json(broadcast);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create broadcast" });
    }
  });

  // ==================== ADMIN CHAT / MESSAGES ====================

  // Fetch messages for a given customer
  app.get('/api/admin/messages', async (req: Request, res: Response) => {
    try {
      const customerId = parseInt(req.query.customerId as string);
      if (isNaN(customerId)) {
        return res.status(400).json({ error: 'customerId query parameter required' });
      }
      const messages = await storage.getMessagesByCustomer(customerId);
      res.json(messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Send a message from admin to a customer (stores message and forwards to Telegram)
  app.post('/api/admin/messages/send', async (req: Request, res: Response) => {
    try {
      const { customerId, text } = req.body;
      if (!customerId || !text) {
        return res.status(400).json({ error: 'customerId and text are required' });
      }

      const customer = await storage.getCustomer(customerId);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });

      // Persist message as from admin
      const message = await storage.createMessage({
        customerId: customer.id,
        sender: 'admin',
        text,
      });

      // Attempt to forward to Telegram (don't fail the request if sending fails)
      if (customer.telegramId) {
        try {
          await sendMessageToUser(customer.telegramId, text);
        } catch (err) {
          console.error('Failed to forward admin message to Telegram:', err);
        }
      }

      res.status(201).json(message);
    } catch (error) {
      console.error('Failed to send admin message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // ==================== LIKES ====================

  // Get liked products for current customer
  app.get('/api/likes', async (req: Request, res: Response) => {
    try {
      const telegramId = req.headers['x-telegram-id'] as string;
      if (!telegramId) return res.status(401).json({ error: 'Telegram ID required' });
      const customer = await storage.getCustomerByTelegramId(telegramId);
      if (!customer) return res.json([]);
      const likes = await storage.getLikesByCustomer(customer.id);
      // join product details
      const products = await Promise.all(likes.map(async (l) => await storage.getProduct(l.productId)));
      res.json(products.filter(Boolean));
    } catch (error) {
      console.error('Failed to fetch likes:', error);
      res.status(500).json({ error: 'Failed to fetch likes' });
    }
  });

  // Toggle like for current customer
  app.post('/api/likes', async (req: Request, res: Response) => {
    try {
      const telegramId = req.headers['x-telegram-id'] as string;
      if (!telegramId) return res.status(401).json({ error: 'Telegram ID required' });
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ error: 'productId required' });
      const customer = await storage.getCustomerByTelegramId(telegramId);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });

      // Check if already liked
      const existing = (await storage.getLikesByCustomer(customer.id)).find(l => l.productId === Number(productId));
      if (existing) {
        await storage.removeLike(customer.id, Number(productId));
        return res.json({ liked: false });
      }
      await storage.addLike(customer.id, Number(productId));
      res.json({ liked: true });
    } catch (error) {
      console.error('Failed to toggle like:', error);
      res.status(500).json({ error: 'Failed to toggle like' });
    }
  });

  // ==================== CUSTOMER MESSAGES (from WebApp) ====================

  app.post('/api/messages', async (req: Request, res: Response) => {
    try {
      const telegramId = req.headers['x-telegram-id'] as string;
      if (!telegramId) return res.status(401).json({ error: 'Telegram ID required' });
      const { text, phoneNumber, name } = req.body;
      if (!text) return res.status(400).json({ error: 'text required' });

      let customer = await storage.getCustomerByTelegramId(telegramId);
      if (!customer) {
        customer = await storage.createCustomer({
          telegramId,
          firstName: name || null,
          lastName: null,
          username: null,
          phoneNumber: phoneNumber || null,
          address: null,
          photoUrl: null,
        });
      } else {
        // update phone/name if provided
        const updateData: any = {};
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (name) updateData.firstName = name;
        if (Object.keys(updateData).length > 0) await storage.updateCustomer(customer.id, updateData);
      }

      const message = await storage.createMessage({
        customerId: customer.id,
        sender: 'customer',
        text,
      });

      // notify admin group
      const adminChatId = process.env.ADMIN_CHAT_ID;
      if (adminChatId) {
        const adminMsg = `💬 Yangi savol\nMijoz: ${customer.firstName || customer.username || '—'} (telegramId: ${customer.telegramId})\nTelefon: ${customer.phoneNumber || '—'}\n\n${text}`;
        try {
          await sendMessageToUser(adminChatId, adminMsg);
        } catch (err) {
          console.error('Failed to notify admin of customer message:', err);
        }
      }

      res.status(201).json(message);
    } catch (error) {
      console.error('Failed to create customer message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // ==================== ADMIN AUTH ====================

  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const admin = await storage.getAdminByUsername(username);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (!admin.isActive) {
        return res.status(403).json({ error: "Account disabled" });
      }
      const { password: _, ...adminWithoutPassword } = admin;
      res.json({ admin: adminWithoutPassword, token: `admin-${admin.id}` });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ==================== ADMIN STATS ====================

  app.get("/api/admin/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/stats/customers", async (req: Request, res: Response) => {
    try {
      const customers = await storage.getCustomers();
      res.json({ totalCustomers: customers.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer stats" });
    }
  });

  // Delivery Settings
  app.get("/api/admin/delivery-settings", async (req: Request, res: Response) => {
    try {
      const standardFeeStr = await storage.getSetting("standardDeliveryFee");
      const expressFeeStr = await storage.getSetting("expressDeliveryFee");
      const thresholdStr = await storage.getSetting("freeDeliveryThreshold");

      const settings = {
        standardDeliveryFee: standardFeeStr ? parseFloat(standardFeeStr) : 15000,
        expressDeliveryFee: expressFeeStr ? parseFloat(expressFeeStr) : 25000,
        freeDeliveryThreshold: thresholdStr ? parseFloat(thresholdStr) : 200000,
      };

      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch delivery settings" });
    }
  });

  app.post("/api/admin/delivery-settings", async (req: Request, res: Response) => {
    try {
      const { standardDeliveryFee, expressDeliveryFee, freeDeliveryThreshold } = req.body;

      console.log("Received delivery settings:", {
        standardDeliveryFee,
        expressDeliveryFee,
        freeDeliveryThreshold,
        types: {
          standardDeliveryFee: typeof standardDeliveryFee,
          expressDeliveryFee: typeof expressDeliveryFee,
          freeDeliveryThreshold: typeof freeDeliveryThreshold,
        },
      });

      // Convert strings to numbers if needed
      const stdFee = typeof standardDeliveryFee === "string" ? parseFloat(standardDeliveryFee) : standardDeliveryFee;
      const expFee = typeof expressDeliveryFee === "string" ? parseFloat(expressDeliveryFee) : expressDeliveryFee;
      const threshold = typeof freeDeliveryThreshold === "string" ? parseFloat(freeDeliveryThreshold) : freeDeliveryThreshold;

      if (isNaN(stdFee) || isNaN(expFee) || isNaN(threshold)) {
        return res.status(400).json({ error: "Invalid settings - values must be numbers" });
      }

      await storage.setSetting("standardDeliveryFee", String(stdFee));
      await storage.setSetting("expressDeliveryFee", String(expFee));
      await storage.setSetting("freeDeliveryThreshold", String(threshold));

      res.json({
        standardDeliveryFee: stdFee,
        expressDeliveryFee: expFee,
        freeDeliveryThreshold: threshold,
      });
    } catch (error) {
      console.error("Update delivery settings error:", error);
      res.status(500).json({ error: "Failed to update delivery settings" });
    }
  });

  // ==================== BANNERS ====================

  app.get("/api/banners", async (req: Request, res: Response) => {
    try {
      const banners = await storage.getBanners();
      res.json(banners);
    } catch (error) {
      console.error("Get banners error:", error);
      res.status(500).json({ error: "Failed to get banners" });
    }
  });

  app.post("/api/admin/banners", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image required" });
      }

      const { title, description, sortOrder } = req.body;
      const imageUrl = `/uploads/${req.file.filename}`;

      const banner = await storage.createBanner({
        imageUrl,
        title: title || null,
        description: description || null,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        isActive: true,
      });

      res.status(201).json(banner);
    } catch (error) {
      console.error("Create banner error:", error);
      res.status(500).json({ error: "Failed to create banner" });
    }
  });

  app.delete("/api/admin/banners/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBanner(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: "Banner not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete banner error:", error);
      res.status(500).json({ error: "Failed to delete banner" });
    }
  });

  return httpServer;
}
