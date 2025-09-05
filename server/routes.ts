import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { createPaymentIntentSchema } from "@shared/schema";
import { z } from "zod";

// Airwallex API configuration
const AIRWALLEX_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "https://api.airwallex.com"
    : "https://api-demo.airwallex.com";

const AIRWALLEX_CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID;
const AIRWALLEX_API_KEY = process.env.AIRWALLEX_API_KEY;

// Airwallex API helpers
async function getAirwallexToken(): Promise<string> {
  if (!AIRWALLEX_CLIENT_ID || !AIRWALLEX_API_KEY) {
    throw new Error("Airwallex credentials not configured");
  }

  const response = await fetch(
    `${AIRWALLEX_BASE_URL}/api/v1/authentication/authenticate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: AIRWALLEX_CLIENT_ID,
        api_key: AIRWALLEX_API_KEY,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to authenticate with Airwallex: ${response.status} ${errorText}`,
    );
  }

  const data = await response.json();
  return data.token;
}

async function createAirwallexPaymentIntent(
  amount: number,
  currency: string,
  orderId: string,
  customerId?: string,
) {
  const token = await getAirwallexToken();

  const payload: any = {
    amount: amount,
    currency: currency,
    merchant_order_id: orderId,
    order: {
      type: "physical_goods",
      products: [
        {
          name: "PhotoPro Subscription",
          quantity: 1,
          unit_price: amount,
        },
      ],
    },
  };

  if (customerId) {
    payload.customer_id = customerId;
  }

  const response = await fetch(
    `${AIRWALLEX_BASE_URL}/api/v1/pa/payment_intents/create`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create payment intent");
  }

  return await response.json();
}

async function createAirwallexBillingCustomer(
  email: string,
  firstName?: string,
  lastName?: string,
) {
  const token = await getAirwallexToken();

  const response = await fetch(
    `${AIRWALLEX_BASE_URL}/api/v1/billing/customers/_create`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create billing customer: ${response.status} ${errorText}`,
    );
  }

  return await response.json();
}

async function createAirwallexBillingCheckout(
  customerId: string,
  planId: string,
  billingCycle: string,
  successUrl: string,
  cancelUrl: string,
) {
  const token = await getAirwallexToken();

  // Get plan details to set up the checkout
  const plan = await storage.getSubscriptionPlan(planId);
  if (!plan) {
    throw new Error("Plan not found");
  }

  const amount =
    billingCycle === "yearly" ? plan.yearlyPrice || 0 : plan.monthlyPrice || 0;

  const response = await fetch(
    `${AIRWALLEX_BASE_URL}/api/v1/billing/checkouts/_create`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: customerId,
        amount: (amount || 0) * 100, // Convert to cents
        currency: "USD",
        billing_cycle: billingCycle,
        product_name: plan.name,
        product_description: `PhotoPro ${plan.name} Plan`,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          plan_id: planId,
          billing_cycle: billingCycle,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create billing checkout: ${response.status} ${errorText}`,
    );
  }

  return await response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Initialize subscription plans
  await initializeSubscriptionPlans();

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user subscription info
      const subscriptionInfo =
        await storage.getUserSubscriptionWithPlan(userId);

      // Get current month AI usage
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const aiUsageTotal = await storage.getUserAiUsageTotal(
        userId,
        currentMonth,
        currentYear,
      );

      res.json({
        ...user,
        subscription: subscriptionInfo,
        aiUsageThisMonth: aiUsageTotal,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get subscription plans
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Create payment intent for subscription
  app.post(
    "/api/create-payment-intent",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const user = await storage.getUser(userId);

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const validation = createPaymentIntentSchema.safeParse(req.body);
        if (!validation.success) {
          return res
            .status(400)
            .json({
              message: "Invalid request data",
              errors: validation.error.errors,
            });
        }

        const { planId, billingCycle } = validation.data;

        // Get subscription plan
        const plan = await storage.getSubscriptionPlan(planId);
        if (!plan) {
          return res
            .status(404)
            .json({ message: "Subscription plan not found" });
        }

        // Calculate amount based on billing cycle
        let amount: number;
        switch (billingCycle) {
          case "monthly":
            amount = parseFloat(plan.monthlyPrice || "0");
            break;
          case "yearly":
            amount = parseFloat(plan.yearlyPrice || "0");
            break;
          case "lifetime":
            amount = parseFloat(plan.lifetimePrice || "0");
            break;
          default:
            return res.status(400).json({ message: "Invalid billing cycle" });
        }

        if (amount <= 0) {
          return res.status(400).json({ message: "Invalid plan pricing" });
        }

        // Create Airwallex billing customer
        const customerData = await createAirwallexBillingCustomer(
          user.email || "",
          user.firstName || undefined,
          user.lastName || undefined,
        );
        const billingCustomerId = customerData.id;

        // Create billing checkout page
        const successUrl = `${req.protocol}://${req.get("host")}/payment-success`;
        const cancelUrl = `${req.protocol}://${req.get("host")}/payment-cancel`;

        const checkoutData = await createAirwallexBillingCheckout(
          billingCustomerId,
          planId,
          billingCycle,
          successUrl,
          cancelUrl,
        );

        // Store payment transaction
        await storage.createPaymentTransaction({
          userId,
          airwallexPaymentIntentId: checkoutData.id,
          amount: amount.toString(),
          currency: "USD",
          status: "pending",
          billingCycle,
        });

        res.json({
          checkout_url: checkoutData.url,
          checkout_id: checkoutData.id,
          amount,
          currency: "USD",
          plan_name: plan.name,
          billing_cycle: billingCycle,
        });
      } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ message: "Failed to create payment intent" });
      }
    },
  );

  // Handle payment success webhook/callback
  app.post("/api/payment-webhook", async (req, res) => {
    try {
      // In production, verify webhook signature from Airwallex
      const { event_type, data } = req.body;

      if (event_type === "payment_intent.succeeded") {
        const paymentIntentId = data.object.id;

        // Get payment transaction
        const transaction =
          await storage.getPaymentTransaction(paymentIntentId);
        if (!transaction) {
          return res
            .status(404)
            .json({ message: "Payment transaction not found" });
        }

        // Update transaction status
        await storage.updatePaymentTransaction(transaction.id, {
          status: "succeeded",
          paymentMethod: data.object.payment_method?.type,
        });

        // Create or update user subscription
        const existingSubscription = await storage.getUserSubscription(
          transaction.userId,
        );

        if (existingSubscription) {
          // Update existing subscription
          const currentDate = new Date();
          const periodEnd = new Date(currentDate);

          if (transaction.billingCycle === "monthly") {
            periodEnd.setMonth(currentDate.getMonth() + 1);
          } else if (transaction.billingCycle === "yearly") {
            periodEnd.setFullYear(currentDate.getFullYear() + 1);
          } else if (transaction.billingCycle === "lifetime") {
            periodEnd.setFullYear(currentDate.getFullYear() + 100); // Set far future for lifetime
          }

          await storage.updateUserSubscription(existingSubscription.id, {
            status: "active",
            currentPeriodStart: currentDate,
            currentPeriodEnd: periodEnd,
            airwallexSubscriptionId: data.object.subscription_id,
          });
        } else {
          // Create new subscription
          const currentDate = new Date();
          const periodEnd = new Date(currentDate);

          if (transaction.billingCycle === "monthly") {
            periodEnd.setMonth(currentDate.getMonth() + 1);
          } else if (transaction.billingCycle === "yearly") {
            periodEnd.setFullYear(currentDate.getFullYear() + 1);
          } else if (transaction.billingCycle === "lifetime") {
            periodEnd.setFullYear(currentDate.getFullYear() + 100);
          }

          // Get the plan from the transaction amount
          const plans = await storage.getSubscriptionPlans();
          const plan = plans.find((p) => {
            const planPrice =
              transaction.billingCycle === "monthly"
                ? p.monthlyPrice
                : transaction.billingCycle === "yearly"
                  ? p.yearlyPrice
                  : p.lifetimePrice;
            return planPrice === transaction.amount;
          });

          if (plan) {
            await storage.createUserSubscription({
              userId: transaction.userId,
              planId: plan.id,
              status: "active",
              billingCycle: transaction.billingCycle,
              airwallexSubscriptionId: data.object.subscription_id,
              currentPeriodStart: currentDate,
              currentPeriodEnd: periodEnd,
            });
          }
        }
      } else if (event_type === "payment_intent.failed") {
        const paymentIntentId = data.object.id;
        const transaction =
          await storage.getPaymentTransaction(paymentIntentId);

        if (transaction) {
          await storage.updatePaymentTransaction(transaction.id, {
            status: "failed",
          });
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error handling payment webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Handle payment success page
  app.get("/api/payment-success", isAuthenticated, async (req: any, res) => {
    try {
      const { intent_id } = req.query;

      if (!intent_id) {
        return res.status(400).json({ message: "Payment intent ID required" });
      }

      const transaction = await storage.getPaymentTransaction(
        intent_id as string,
      );
      if (!transaction) {
        return res
          .status(404)
          .json({ message: "Payment transaction not found" });
      }

      res.json({
        success: true,
        transaction,
        message: "Payment processed successfully",
      });
    } catch (error) {
      console.error("Error handling payment success:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Get user projects
  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Create new project
  app.post("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { name, thumbnailUrl, projectData } = req.body;

      const project = await storage.createUserProject({
        userId,
        name,
        thumbnailUrl,
        projectData,
      });

      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Track AI usage
  app.post("/api/ai-usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { featureType, creditsUsed = 1 } = req.body;

      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      // Get user subscription to validate usage
      const subscription = await storage.getUserSubscriptionWithPlan(userId);
      if (!subscription) {
        return res
          .status(403)
          .json({ message: "No active subscription found" });
      }

      // Check current usage against limits
      const currentUsage = await storage.getUserAiUsageTotal(
        userId,
        month,
        year,
      );
      const monthlyLimit = subscription.plan.aiCreditsPerMonth || 0;

      if (monthlyLimit > 0 && currentUsage + creditsUsed > monthlyLimit) {
        return res.status(403).json({
          message: "Monthly AI credit limit exceeded",
          currentUsage,
          limit: monthlyLimit,
        });
      }

      const usage = await storage.trackAiUsage({
        userId,
        subscriptionId: subscription.id,
        featureType,
        creditsUsed,
        month,
        year,
      });

      res.json(usage);
    } catch (error) {
      console.error("Error tracking AI usage:", error);
      res.status(500).json({ message: "Failed to track AI usage" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeSubscriptionPlans() {
  try {
    const existingPlans = await storage.getSubscriptionPlans();

    if (existingPlans.length === 0) {
      // Create default subscription plans
      const plans = [
        {
          name: "Free",
          monthlyPrice: "0.00",
          yearlyPrice: "0.00",
          lifetimePrice: null,
          features: [
            "Basic photo editing tools",
            "5 AI enhancements per month",
            "HD download (up to 1080p)",
            "Basic templates",
          ],
          aiCreditsPerMonth: 5,
        },
        {
          name: "Pro",
          monthlyPrice: "10.00",
          yearlyPrice: "96.00", // 20% discount
          lifetimePrice: "99.00",
          features: [
            "Unlimited AI enhancements",
            "Advanced editing tools",
            "4K downloads",
            "Premium templates & assets",
            "Batch processing",
            "Priority support",
          ],
          aiCreditsPerMonth: null, // Unlimited
        },
        {
          name: "Enterprise",
          monthlyPrice: "25.00",
          yearlyPrice: "240.00", // 20% discount
          lifetimePrice: null,
          features: [
            "Everything in Pro",
            "Team collaboration",
            "Brand kit & assets",
            "Admin dashboard",
            "API access",
            "Dedicated support",
          ],
          aiCreditsPerMonth: null, // Unlimited
        },
      ];

      for (const plan of plans) {
        await storage.createSubscriptionPlan(plan);
      }

      console.log("Subscription plans initialized");
    }
  } catch (error) {
    console.error("Error initializing subscription plans:", error);
  }
}
