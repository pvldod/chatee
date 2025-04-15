import Stripe from "stripe"
import prisma from "./db"
import type { User, Subscription } from "@/types/user"

// Initialize Stripe only if the API key is available
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null

export const SUBSCRIPTION_PLANS = {
  starter: {
    name: "Starter",
    id: process.env.STRIPE_STARTER_PLAN_ID || "price_starter",
    price: 29,
    features: ["1 AI chat agent", "5,000 messages per month", "Basic customization", "Email support", "1 team member"],
    limits: {
      chatbots: 1,
      messagesPerMonth: 5000,
      knowledgeBases: 3,
    },
  },
  professional: {
    name: "Professional",
    id: process.env.STRIPE_PROFESSIONAL_PLAN_ID || "price_professional",
    price: 79,
    features: [
      "3 AI chat agents",
      "25,000 messages per month",
      "Advanced customization",
      "Priority support",
      "5 team members",
      "Analytics dashboard",
    ],
    limits: {
      chatbots: 3,
      messagesPerMonth: 25000,
      knowledgeBases: 10,
    },
  },
  enterprise: {
    name: "Enterprise",
    id: process.env.STRIPE_ENTERPRISE_PLAN_ID || "price_enterprise",
    price: 199,
    features: [
      "10 AI chat agents",
      "100,000 messages per month",
      "Full customization",
      "24/7 dedicated support",
      "Unlimited team members",
      "Advanced analytics",
      "Custom integrations",
    ],
    limits: {
      chatbots: 10,
      messagesPerMonth: 100000,
      knowledgeBases: 50,
    },
  },
}

export async function createCustomer(user: User): Promise<string> {
  if (!stripe) {
    console.warn("Stripe not configured. Using mock customer ID.")
    return `mock_customer_${user.id}`
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user.id,
    },
  })

  return customer.id
}

export async function createSubscription(
  userId: string,
  planId: string,
  paymentMethodId: string,
): Promise<Subscription> {
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error("User not found")
  }

  // If Stripe is not configured, create a mock subscription
  if (!stripe) {
    console.warn("Stripe not configured. Creating mock subscription.")

    // Determine tier from plan ID
    let tier: "starter" | "professional" | "enterprise" = "starter"
    if (planId === SUBSCRIPTION_PLANS.professional.id) {
      tier = "professional"
    } else if (planId === SUBSCRIPTION_PLANS.enterprise.id) {
      tier = "enterprise"
    }

    // Create subscription in database
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        tier,
        status: "active",
        stripeCustomerId: `mock_customer_${userId}`,
        stripeSubscriptionId: `mock_subscription_${Date.now()}`,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    // Update user subscription status
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: "active",
      },
    })

    return newSubscription as unknown as Subscription
  }

  // Get or create Stripe customer
  let stripeCustomerId = user.stripeCustomerId

  if (!stripeCustomerId) {
    const customer = await createCustomer(user as unknown as User)
    stripeCustomerId = customer

    // Update user with Stripe customer ID
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId },
    })
  }

  // Attach payment method to customer
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: stripeCustomerId,
  })

  // Set as default payment method
  await stripe.customers.update(stripeCustomerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: planId }],
    expand: ["latest_invoice.payment_intent"],
  })

  // Determine tier from plan ID
  let tier: "starter" | "professional" | "enterprise" = "starter"
  if (planId === SUBSCRIPTION_PLANS.professional.id) {
    tier = "professional"
  } else if (planId === SUBSCRIPTION_PLANS.enterprise.id) {
    tier = "enterprise"
  }

  // Create subscription in database
  const newSubscription = await prisma.subscription.create({
    data: {
      userId,
      tier,
      status: "active",
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })

  // Update user subscription status
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: "active",
    },
  })

  return newSubscription as unknown as Subscription
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  })

  if (!subscription) {
    throw new Error("Subscription not found")
  }

  if (subscription.stripeSubscriptionId && stripe) {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })
  }

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      cancelAtPeriodEnd: true,
    },
  })
}

export async function createCheckoutSession(userId: string, planId: string): Promise<string> {
  // If Stripe is not configured, return a mock URL
  if (!stripe) {
    console.warn("Stripe not configured. Using mock checkout URL.")
    return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=true`
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: planId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?canceled=true`,
    customer_email: user.email,
    metadata: {
      userId,
    },
  })

  return session.url || ""
}

export async function handleWebhook(event: any): Promise<void> {
  // If Stripe is not configured, just log and return
  if (!stripe) {
    console.warn("Stripe not configured. Skipping webhook handling.")
    return
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object
      const userId = session.metadata.userId

      // Determine tier from product
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      const priceId = lineItems.data[0]?.price?.id

      let tier: "starter" | "professional" | "enterprise" = "starter"
      if (priceId === SUBSCRIPTION_PLANS.professional.id) {
        tier = "professional"
      } else if (priceId === SUBSCRIPTION_PLANS.enterprise.id) {
        tier = "enterprise"
      }

      // Create subscription in database
      await prisma.subscription.create({
        data: {
          userId,
          tier,
          status: "active",
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })

      // Update user subscription status
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tier,
          subscriptionStatus: "active",
        },
      })
      break

    case "invoice.payment_succeeded":
      // Handle successful payment
      const invoice = event.data.object
      const subscriptionId = invoice.subscription

      const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      })

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "active",
            currentPeriodStart: new Date(invoice.period_start * 1000),
            currentPeriodEnd: new Date(invoice.period_end * 1000),
          },
        })
      }
      break

    case "invoice.payment_failed":
      // Handle failed payment
      const failedInvoice = event.data.object
      const failedSubscriptionId = failedInvoice.subscription

      const failedSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: failedSubscriptionId },
      })

      if (failedSubscription) {
        await prisma.subscription.update({
          where: { id: failedSubscription.id },
          data: {
            status: "inactive",
          },
        })

        await prisma.user.update({
          where: { id: failedSubscription.userId },
          data: {
            subscriptionStatus: "inactive",
          },
        })
      }
      break

    case "customer.subscription.deleted":
      // Handle subscription cancellation
      const deletedSubscription = event.data.object
      const deletedSubscriptionId = deletedSubscription.id

      const canceledSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: deletedSubscriptionId },
      })

      if (canceledSubscription) {
        await prisma.subscription.update({
          where: { id: canceledSubscription.id },
          data: {
            status: "inactive",
            cancelAtPeriodEnd: false,
          },
        })

        await prisma.user.update({
          where: { id: canceledSubscription.userId },
          data: {
            subscriptionStatus: "inactive",
            subscriptionTier: null,
          },
        })
      }
      break
  }
}
