import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import { insertServiceSchema, insertCategorySchema, insertBookingSchema } from "@shared/schema";
import crypto from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  try {
    await seedDatabase();
  } catch (error) {
    console.error("Database seed failed during startup:", error);
  }

  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/services", async (_req, res) => {
    const services = await storage.getServices();
    res.json(services);
  });

  app.get("/api/services/:id", async (req, res) => {
    const service = await storage.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ error: "Not found" });
    res.json(service);
  });

  app.get("/api/cities", async (_req, res) => {
    const citiesList = await storage.getCities();
    res.json(citiesList);
  });

  app.get("/api/reviews/recent", async (_req, res) => {
    const recentReviews = await storage.getRecentReviews(6);
    res.json(recentReviews);
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const parsed = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(parsed);
      res.json(booking);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/contact", async (req, res) => {
    res.json({ success: true, message: "Message received" });
  });

  app.post("/api/payments/create-order", async (req, res) => {
    const { bookingId } = req.body;
    const booking = await storage.getBookingById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(500).json({ error: "Payment gateway not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." });
    }

    try {
      const orderData = {
        amount: booking.totalAmount * 100,
        currency: "INR",
        receipt: bookingId,
      };

      const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");
      const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(orderData),
      });

      const order = await orderRes.json();

      if (!orderRes.ok) {
        return res.status(500).json({ error: "Failed to create payment order" });
      }

      await storage.updateBooking(bookingId, { razorpayOrderId: order.id } as any);

      res.json({
        razorpayOrderId: order.id,
        razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
      });
    } catch (e: any) {
      res.status(500).json({ error: "Payment service error" });
    }
  });

  app.post("/api/payments/verify", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeySecret) {
      return res.status(500).json({ error: "Payment not configured" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await storage.updateBooking(bookingId, {
        paymentStatus: "paid",
        paymentId: razorpay_payment_id,
        status: "confirmed",
      } as any);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid signature" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    const username = (req.body.username || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();
    const user = await storage.getUserByUsername(username);
    if (user && user.role === "admin" && user.password === password) {
      (req.session as any).adminId = user.id;
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/admin/check", (req, res) => {
    if ((req.session as any)?.adminId) {
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {});
    res.json({ success: true });
  });

  const requireAdmin = (req: any, res: any, next: any) => {
    if ((req.session as any)?.adminId) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.get("/api/admin/bookings", requireAdmin, async (_req, res) => {
    const allBookings = await storage.getBookings();
    res.json(allBookings);
  });

  app.patch("/api/admin/bookings/:id", requireAdmin, async (req, res) => {
    const { status, paymentStatus } = req.body;
    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const booking = await storage.updateBooking(req.params.id, req.body);
    if (!booking) return res.status(404).json({ error: "Not found" });
    res.json(booking);
  });

  app.delete("/api/admin/bookings/:id", requireAdmin, async (req, res) => {
    await storage.deleteBooking(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/services", requireAdmin, async (_req, res) => {
    const allServices = await storage.getAllServices();
    res.json(allServices);
  });

  app.post("/api/admin/services", requireAdmin, async (req, res) => {
    try {
      const parsed = insertServiceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues.map(i => i.message).join(", ") });
      }
      const service = await storage.createService(parsed.data);
      res.json(service);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.patch("/api/admin/services/:id", requireAdmin, async (req, res) => {
    const service = await storage.updateService(req.params.id, req.body);
    if (!service) return res.status(404).json({ error: "Not found" });
    res.json(service);
  });

  app.delete("/api/admin/services/:id", requireAdmin, async (req, res) => {
    await storage.deleteService(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const parsed = insertCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues.map(i => i.message).join(", ") });
      }
      const cat = await storage.createCategory(parsed.data);
      res.json(cat);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.patch("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    const cat = await storage.updateCategory(req.params.id, req.body);
    if (!cat) return res.status(404).json({ error: "Not found" });
    res.json(cat);
  });

  app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    await storage.deleteCategory(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/reviews", requireAdmin, async (_req, res) => {
    const allReviews = await storage.getReviews();
    res.json(allReviews);
  });

  app.delete("/api/admin/reviews/:id", requireAdmin, async (req, res) => {
    await storage.deleteReview(req.params.id);
    res.json({ success: true });
  });

  return httpServer;
}
