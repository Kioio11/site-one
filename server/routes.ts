import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "./auth.ts";
import { storage } from "./storage";
import { insertOrderSchema, insertUserSchema, insertNotificationSchema } from "@shared/schema";
import { stripe, syncStripeCatalog, createPaymentIntent, handleStripeWebhook } from "./stripe";
import crypto from "crypto";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Add route to expose Stripe publishable key
  app.get("/api/config/stripe", (req, res) => {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error("Stripe publishable key not found in environment");
      return res.status(500).json({ message: "Stripe configuration error" });
    }
    res.json({ publishableKey });
  });

  // Admin middleware
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!req.user?.is_admin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  };

  // User registration with admin capability
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);

      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Set first user as admin
      const userCount = await storage.getUserCount();
      const isFirstUser = userCount === 0;

      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
        is_admin: isFirstUser // First user gets admin privileges
      });

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed after registration" });
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Registration failed" });
    }
  });

  // Admin User Management Routes
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);

      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
      });

      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to create user"
      });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (userId === req.user?.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await storage.deleteUser(userId);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.updateUser(userId, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to update user"
      });
    }
  });

  // Service management routes
  app.get("/api/admin/services", requireAdmin, async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/services", requireAdmin, async (req, res) => {
    try {
      const service = await storage.createService(req.body);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create service" });
    }
  });

  app.patch("/api/services/:id", requireAdmin, async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      const updates = { ...req.body };

      // Make sure basePrice is always in cents
      if (updates.basePrice !== undefined) {
        updates.basePrice = Math.round(updates.basePrice); // Ensure it's a whole number
      }

      const service = await storage.updateService(serviceId, updates);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Service update error:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to update service",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // Order management routes
  app.patch("/api/orders/:id", requireAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.updateOrder(orderId, req.body);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Create notification for order owner
      const notification = await storage.createNotification({
        userId: order.userId,
        title: "Order Status Updated",
        message: `Your order #${order.id} status has been updated to ${order.status}`,
        status: "unread",
      });

      res.json(order);
    } catch (error) {
      console.error("Order update error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update order" });
    }
  });

  // Admin routes
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    const orders = await storage.getAllOrders();
    res.json(orders);
  });

  // Service routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const orders = req.user.is_admin
      ? await storage.getAllOrders()
      : await storage.getUserOrders(req.user.id);
    res.json(orders);
  });

  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder({
        ...orderData,
        userId: req.user.id,
        status: "pending",
        totalPrice: req.body.totalPrice,
        requirements: JSON.stringify(orderData.requirements || {}),
      });

      // Create notification for admins
      const admins = await storage.getAdminUsers();
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          title: "New Order Received",
          message: `New order #${order.id} has been created`,
          type: "order",
          status: "unread",
          relatedId: order.id,
        });
      }

      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create order" });
    }
  });

  // Notification Routes
  app.get("/api/admin/notifications", requireAdmin, async (req, res) => {
    try {
      const userNotifications = await storage.getNotifications(req.user!.id);
      res.json(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/admin/notifications/:id/read", requireAdmin, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });


  // Payment routes with enhanced authentication and logging
  app.post("/api/payments/create-intent", async (req, res) => {
    console.log('Payment intent request - Auth state:', {
      isAuthenticated: req.isAuthenticated(),
      session: !!req.session,
      user: req.user?.id
    });

    if (!req.isAuthenticated()) {
      console.log('Payment rejected - Not authenticated');
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { amount, items } = req.body;
      console.log('Creating payment intent:', { amount, userId: req.user.id });
      const paymentIntent = await createPaymentIntent(amount, items, req);
      console.log('Payment intent created successfully');
      res.json(paymentIntent);
    } catch (error) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to create payment intent"
      });
    }
  });

  app.post("/api/payments/verify", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { transactionHash, method, amount } = req.body;

      // Store payment record
      await storage.createPayment({
        orderId: `CRYPTO-${Date.now()}`,
        amount: Math.round(amount * 100), // Convert to cents
        status: 'pending',
        paymentProvider: method,
        providerOrderId: transactionHash,
        customerEmail: req.user.email,
        metadata: JSON.stringify({
          cryptoMethod: method,
          transactionHash,
          verificationAttempt: new Date().toISOString()
        })
      });

      res.json({
        message: "Payment verification submitted",
        status: "pending"
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({
        message: 'Failed to verify payment',
        details: error instanceof Error ? error.message : undefined
      });
    }
  });

  app.get("/api/payments/:orderId/status", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const payment = await storage.getPaymentByOrderId(orderId);

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.json({
        status: payment.status,
        orderId: payment.orderId,
        updatedAt: payment.updatedAt,
      });
    } catch (error) {
      console.error("Payment status check error:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to check payment status",
      });
    }
  });

  // Stripe webhook handler
  app.post("/api/webhooks/stripe", async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      await handleStripeWebhook(event);
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook Error:', error);
      res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Sync products with Stripe
  app.post("/api/admin/stripe/sync", requireAdmin, async (req, res) => {
    try {
      const services = await storage.getAllServices();
      await syncStripeCatalog(services);
      res.json({ message: "Products synced with Stripe successfully" });
    } catch (error) {
      console.error('Stripe sync error:', error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to sync products with Stripe"
      });
    }
  });

  // Add order retrieval route
  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Only allow users to see their own orders unless they're admin
      if (order.userId !== req.user.id && !req.user.is_admin) {
        return res.status(403).json({ message: "Not authorized to view this order" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch order"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}