import { users, services, orders, notifications } from "@shared/schema";
import type { User, InsertUser, Service, Order, Notification, InsertNotification } from "@shared/schema";
import { db, sql } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserCount(): Promise<number>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllServices(): Promise<Service[]>;
  createService(service: Omit<Service, "id">): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order>;
  updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getAdminUsers(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  sessionStore: session.Store;
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: Omit<InsertNotification, "id" | "createdAt">): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  getOrder(id: number): Promise<Order | undefined>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  async getUserCount(): Promise<number> {
    try {
      const [result] = await db.select({
        count: sql<number>`cast(count(*) as integer)`,
      }).from(users);
      return result?.count || 0;
    } catch (error) {
      console.error('Error counting users:', error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const [newUser] = await db.insert(users).values(user).returning();
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getAllServices(): Promise<Service[]> {
    try {
      return await db.select().from(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async createService(service: Omit<Service, "id">): Promise<Service> {
    try {
      const [newService] = await db.insert(services).values(service).returning();
      return newService;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async updateService(id: number, updates: Partial<Service>): Promise<Service | undefined> {
    try {
      const [updatedService] = await db
        .update(services)
        .set(updates)
        .where(eq(services.id, id))
        .returning();
      return updatedService;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  async createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order> {
    try {
      const [newOrder] = await db
        .insert(orders)
        .values({
          userId: order.userId,
          serviceId: order.serviceId,
          status: order.status,
          totalPrice: order.totalPrice,
          requirements: order.requirements ? JSON.stringify(order.requirements) : null,
        })
        .returning();
      return {
        ...newOrder,
        requirements: newOrder.requirements ? JSON.parse(newOrder.requirements) : null
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    try {
      const orderUpdates: any = { ...updates };
      if (updates.requirements) {
        orderUpdates.requirements = JSON.stringify(updates.requirements);
      }

      const [updatedOrder] = await db
        .update(orders)
        .set(orderUpdates)
        .where(eq(orders.id, id))
        .returning();

      if (!updatedOrder) return undefined;

      return {
        ...updatedOrder,
        requirements: updatedOrder.requirements ? JSON.parse(updatedOrder.requirements) : null
      };
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    try {
      const userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId));

      return userOrders.map(order => ({
        ...order,
        requirements: order.requirements ? JSON.parse(order.requirements) : null
      }));
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const allOrders = await db.select().from(orders);
      return allOrders.map(order => ({
        ...order,
        requirements: order.requirements ? 
          // Safely try to parse JSON, fallback to the string if parsing fails
          (() => {
            try {
              return JSON.parse(order.requirements);
            } catch (e) {
              console.warn(`Failed to parse requirements for order ${order.id}:`, e);
              return order.requirements;
            }
          })() 
          : null
      }));
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  }

  async getAdminUsers(): Promise<User[]> {
    try {
      return await db
        .select()
        .from(users)
        .where(eq(users.is_admin, true));
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    try {
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async createNotification(notification: Omit<InsertNotification, "id" | "createdAt">): Promise<Notification> {
    try {
      const [newNotification] = await db
        .insert(notifications)
        .values(notification)
        .returning();
      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markNotificationAsRead(id: number): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ status: "read" })
        .where(eq(notifications.id, id));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
  async getOrder(id: number): Promise<Order | undefined> {
    try {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, id));

      if (!order) return undefined;

      return {
        ...order,
        requirements: order.requirements ? JSON.parse(order.requirements) : null
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();