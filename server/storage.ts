import {
  users, serviceCategories, services, bookings, reviews, cities,
  type User, type InsertUser,
  type ServiceCategory, type InsertCategory,
  type Service, type InsertService,
  type Booking, type InsertBooking,
  type Review, type InsertReview,
  type City, type InsertCity,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getCategories(): Promise<ServiceCategory[]>;
  getCategoryById(id: string): Promise<ServiceCategory | undefined>;
  createCategory(cat: InsertCategory): Promise<ServiceCategory>;
  updateCategory(id: string, cat: Partial<InsertCategory>): Promise<ServiceCategory | undefined>;
  deleteCategory(id: string): Promise<void>;

  getServices(): Promise<Service[]>;
  getAllServices(): Promise<Service[]>;
  getServiceById(id: string): Promise<Service | undefined>;
  createService(svc: InsertService): Promise<Service>;
  updateService(id: string, svc: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<void>;

  getBookings(): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, data: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<void>;

  getReviews(): Promise<Review[]>;
  getRecentReviews(limit?: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  deleteReview(id: string): Promise<void>;

  getCities(): Promise<City[]>;
  createCity(city: InsertCity): Promise<City>;

  getStats(): Promise<{
    totalBookings: number;
    totalRevenue: number;
    totalServices: number;
    totalReviews: number;
    recentBookings: Booking[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(data: InsertUser) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async getCategories() {
    return db.select().from(serviceCategories).orderBy(serviceCategories.sortOrder);
  }

  async getCategoryById(id: string) {
    const [cat] = await db.select().from(serviceCategories).where(eq(serviceCategories.id, id));
    return cat;
  }

  async createCategory(data: InsertCategory) {
    const [cat] = await db.insert(serviceCategories).values(data).returning();
    return cat;
  }

  async updateCategory(id: string, data: Partial<InsertCategory>) {
    const [cat] = await db.update(serviceCategories).set(data).where(eq(serviceCategories.id, id)).returning();
    return cat;
  }

  async deleteCategory(id: string) {
    await db.delete(serviceCategories).where(eq(serviceCategories.id, id));
  }

  async getServices() {
    return db.select().from(services).where(eq(services.active, true));
  }

  async getAllServices() {
    return db.select().from(services);
  }

  async getServiceById(id: string) {
    const [svc] = await db.select().from(services).where(eq(services.id, id));
    return svc;
  }

  async createService(data: InsertService) {
    const [svc] = await db.insert(services).values(data).returning();
    return svc;
  }

  async updateService(id: string, data: Partial<InsertService>) {
    const [svc] = await db.update(services).set(data).where(eq(services.id, id)).returning();
    return svc;
  }

  async deleteService(id: string) {
    await db.delete(services).where(eq(services.id, id));
  }

  async getBookings() {
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBookingById(id: string) {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(data: InsertBooking) {
    const [booking] = await db.insert(bookings).values(data).returning();
    return booking;
  }

  async updateBooking(id: string, data: Partial<InsertBooking>) {
    const [booking] = await db.update(bookings).set(data).where(eq(bookings.id, id)).returning();
    return booking;
  }

  async deleteBooking(id: string) {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  async getReviews() {
    return db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async getRecentReviews(limit = 6) {
    return db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(limit);
  }

  async createReview(data: InsertReview) {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
  }

  async deleteReview(id: string) {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  async getCities() {
    return db.select().from(cities).where(eq(cities.active, true)).orderBy(cities.name);
  }

  async createCity(data: InsertCity) {
    const [city] = await db.insert(cities).values(data).returning();
    return city;
  }

  async getStats() {
    const allBookings = await db.select().from(bookings);
    const allServices = await db.select().from(services);
    const allReviews = await db.select().from(reviews);
    const recentBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(5);

    const totalRevenue = allBookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return {
      totalBookings: allBookings.length,
      totalRevenue,
      totalServices: allServices.length,
      totalReviews: allReviews.length,
      recentBookings,
    };
  }
}

export const storage = new DatabaseStorage();
