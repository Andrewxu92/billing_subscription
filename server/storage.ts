import {
  users,
  subscriptionPlans,
  userSubscriptions,
  paymentTransactions,
  userProjects,
  aiUsage,
  type User,
  type UpsertUser,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type UserSubscription,
  type InsertUserSubscription,
  type PaymentTransaction,
  type InsertPaymentTransaction,
  type UserProject,
  type InsertUserProject,
  type InsertAiUsage,
  type AiUsage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Subscription plan operations
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  
  // User subscription operations
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: string, updates: Partial<UserSubscription>): Promise<UserSubscription>;
  getUserSubscriptionWithPlan(userId: string): Promise<(UserSubscription & { plan: SubscriptionPlan }) | undefined>;
  
  // Payment transaction operations
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  getPaymentTransaction(airwallexPaymentIntentId: string): Promise<PaymentTransaction | undefined>;
  updatePaymentTransaction(id: string, updates: Partial<PaymentTransaction>): Promise<PaymentTransaction>;
  getUserPaymentTransactions(userId: string): Promise<PaymentTransaction[]>;
  
  // User project operations
  getUserProjects(userId: string): Promise<UserProject[]>;
  createUserProject(project: InsertUserProject): Promise<UserProject>;
  updateUserProject(id: string, updates: Partial<UserProject>): Promise<UserProject>;
  deleteUserProject(id: string, userId: string): Promise<void>;
  
  // AI usage tracking
  trackAiUsage(usage: InsertAiUsage): Promise<AiUsage>;
  getUserAiUsage(userId: string, month: number, year: number): Promise<AiUsage[]>;
  getUserAiUsageTotal(userId: string, month: number, year: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Subscription plan operations
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }

  // User subscription operations
  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .orderBy(desc(userSubscriptions.createdAt));
    return subscription;
  }

  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const [newSubscription] = await db.insert(userSubscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateUserSubscription(id: string, updates: Partial<UserSubscription>): Promise<UserSubscription> {
    const [updatedSubscription] = await db
      .update(userSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userSubscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  async getUserSubscriptionWithPlan(userId: string): Promise<(UserSubscription & { plan: SubscriptionPlan }) | undefined> {
    const [result] = await db
      .select()
      .from(userSubscriptions)
      .leftJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .where(eq(userSubscriptions.userId, userId))
      .orderBy(desc(userSubscriptions.createdAt));
    
    if (!result || !result.subscription_plans) return undefined;
    
    return {
      ...result.user_subscriptions,
      plan: result.subscription_plans,
    };
  }

  // Payment transaction operations
  async createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const [newTransaction] = await db.insert(paymentTransactions).values(transaction).returning();
    return newTransaction;
  }

  async getPaymentTransaction(airwallexPaymentIntentId: string): Promise<PaymentTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.airwallexPaymentIntentId, airwallexPaymentIntentId));
    return transaction;
  }

  async updatePaymentTransaction(id: string, updates: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    const [updatedTransaction] = await db
      .update(paymentTransactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(paymentTransactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async getUserPaymentTransactions(userId: string): Promise<PaymentTransaction[]> {
    return await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.userId, userId))
      .orderBy(desc(paymentTransactions.createdAt));
  }

  // User project operations
  async getUserProjects(userId: string): Promise<UserProject[]> {
    return await db
      .select()
      .from(userProjects)
      .where(eq(userProjects.userId, userId))
      .orderBy(desc(userProjects.lastModified));
  }

  async createUserProject(project: InsertUserProject): Promise<UserProject> {
    const [newProject] = await db.insert(userProjects).values(project).returning();
    return newProject;
  }

  async updateUserProject(id: string, updates: Partial<UserProject>): Promise<UserProject> {
    const [updatedProject] = await db
      .update(userProjects)
      .set({ ...updates, lastModified: new Date() })
      .where(eq(userProjects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteUserProject(id: string, userId: string): Promise<void> {
    await db
      .delete(userProjects)
      .where(and(eq(userProjects.id, id), eq(userProjects.userId, userId)));
  }

  // AI usage tracking
  async trackAiUsage(usage: InsertAiUsage): Promise<AiUsage> {
    const [newUsage] = await db.insert(aiUsage).values(usage).returning();
    return newUsage;
  }

  async getUserAiUsage(userId: string, month: number, year: number): Promise<AiUsage[]> {
    return await db
      .select()
      .from(aiUsage)
      .where(
        and(
          eq(aiUsage.userId, userId),
          eq(aiUsage.month, month),
          eq(aiUsage.year, year)
        )
      );
  }

  async getUserAiUsageTotal(userId: string, month: number, year: number): Promise<number> {
    const usage = await this.getUserAiUsage(userId, month, year);
    return usage.reduce((total, record) => total + record.creditsUsed, 0);
  }
}

export const storage = new DatabaseStorage();
