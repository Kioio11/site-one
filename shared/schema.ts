import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  basePrice: integer("base_price").notNull(),
  type: text("type").notNull(),
  features: text("features"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  is_admin: boolean("is_admin").default(false).notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  serviceId: integer("service_id").notNull(),
  status: text("status").notNull(),
  totalPrice: integer("total_price").notNull(),
  requirements: text("requirements"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  status: text("status").default("unread").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).extend({
  email: z.string().email("Invalid email address"),
});

export const orderRequirementsSchema = z.object({
  // Required fields for initial order
  projectName: z.string(),

  // Optional fields to be filled after payment
  brandColors: z.string().optional(),
  logoRequirements: z.string().optional(),
  targetAudience: z.string().optional(),
  additionalNotes: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  companyName: z.string().optional(),
  hostingPreference: z.string().optional(),
  domainName: z.string().optional(),
  technicalContact: z.string().optional(),
  deploymentNotes: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  databaseType: z.string().optional(),
  scalabilityRequirements: z.string().optional(),
  securityRequirements: z.string().optional(),
  aiFeatures: z.string().optional(),
  modelRequirements: z.string().optional(),
  versionControl: z.string().optional(),
  containerization: z.string().optional(),
  projectTimeline: z.string().optional()
});

export const insertOrderSchema = createInsertSchema(orders).extend({
  requirements: orderRequirementsSchema,
});

export const insertNotificationSchema = createInsertSchema(notifications);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Order = typeof orders.$inferSelect & {
  requirements: z.infer<typeof orderRequirementsSchema>;
};

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;