import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  email: varchar("email").unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  billingCustomerId: varchar("billing_customer_id"), // Airwallex billing customer ID (bcus_xxx)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }),
  yearlyPrice: decimal("yearly_price", { precision: 10, scale: 2 }),
  lifetimePrice: decimal("lifetime_price", { precision: 10, scale: 2 }),
  features: jsonb("features").notNull(),
  aiCreditsPerMonth: integer("ai_credits_per_month"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").notNull().references(() => subscriptionPlans.id),
  status: varchar("status").notNull(), // active, cancelled, expired, pending
  billingCycle: varchar("billing_cycle"), // monthly, yearly, lifetime
  airwallexCustomerId: varchar("airwallex_customer_id"),
  airwallexSubscriptionId: varchar("airwallex_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment transactions table
export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  subscriptionId: varchar("subscription_id").references(() => userSubscriptions.id),
  airwallexPaymentIntentId: varchar("airwallex_payment_intent_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("USD"),
  status: varchar("status").notNull(), // pending, succeeded, failed, cancelled
  paymentMethod: varchar("payment_method"),
  billingCycle: varchar("billing_cycle"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User projects table
export const userProjects = pgTable("user_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  projectData: jsonb("project_data"),
  lastModified: timestamp("last_modified").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI usage tracking table
export const aiUsage = pgTable("ai_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  subscriptionId: varchar("subscription_id").references(() => userSubscriptions.id),
  featureType: varchar("feature_type").notNull(), // enhance, background_removal, object_removal, etc.
  creditsUsed: integer("credits_used").notNull().default(1),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;

export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;

export type InsertUserProject = typeof userProjects.$inferInsert;
export type UserProject = typeof userProjects.$inferSelect;

export type InsertAiUsage = typeof aiUsage.$inferInsert;
export type AiUsage = typeof aiUsage.$inferSelect;

// Schema validations
export const createUserProjectSchema = createInsertSchema(userProjects).omit({
  id: true,
  userId: true,
  createdAt: true,
  lastModified: true,
});

export const updateUserProjectSchema = createInsertSchema(userProjects).omit({
  id: true,
  userId: true,
  createdAt: true,
}).partial();

export const createPaymentIntentSchema = z.object({
  planId: z.string(),
  billingCycle: z.enum(["monthly", "yearly", "lifetime"]),
});

// Auth schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserType = z.infer<typeof insertUserSchema>;

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export type LoginData = z.infer<typeof loginSchema>;
