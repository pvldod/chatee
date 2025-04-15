export interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  subscriptionTier: "free" | "starter" | "professional" | "enterprise" | null
  subscriptionStatus: "active" | "inactive" | "trial" | null
  trialEndsAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  userId: string
  tier: "starter" | "professional" | "enterprise"
  status: "active" | "inactive" | "trial"
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  paymentMethod?: string
  createdAt: Date
  updatedAt: Date
}
