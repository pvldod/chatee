"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CreditCard, Calendar, AlertTriangle } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-service"
import type { Subscription } from "@/types/user"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function BillingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    if (user) {
      fetchSubscription()
    }
  }, [user, loading, router])

  const fetchSubscription = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/subscription")
      if (!response.ok) {
        throw new Error("Failed to fetch subscription")
      }
      const data = await response.json()
      setSubscription(data.subscription)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subscription information.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsCanceling(true)
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId: subscription?.id }),
      })

      if (!response.ok) {
        throw new Error("Failed to cancel subscription")
      }

      toast({
        title: "Subscription canceled",
        description: "Your subscription will be canceled at the end of the billing period.",
      })

      // Update subscription status
      if (subscription) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: true,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCanceling(false)
      setIsDialogOpen(false)
    }
  }

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const getPlanDetails = (tier: string) => {
    switch (tier) {
      case "starter":
        return SUBSCRIPTION_PLANS.starter
      case "professional":
        return SUBSCRIPTION_PLANS.professional
      case "enterprise":
        return SUBSCRIPTION_PLANS.enterprise
      default:
        return null
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !subscription ? (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>You don't have an active subscription. Choose a plan to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-yellow-500 mb-4">
              <AlertTriangle size={20} />
              <p>You're currently on a free trial that will expire soon.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpgrade}>View Plans</Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your current subscription plan and status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold">
                    {getPlanDetails(subscription.tier)?.name ||
                      subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}{" "}
                    Plan
                  </h3>
                  <p className="text-gray-400">${getPlanDetails(subscription.tier)?.price || "N/A"} per month</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    subscription.status === "active" ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"
                  }`}
                >
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  {subscription.cancelAtPeriodEnd ? " (Canceling)" : ""}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={16} />
                  <span>Current period ends: {formatDate(subscription.currentPeriodEnd)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <CreditCard size={16} />
                  <span>Payment method: {subscription.paymentMethod || "Credit Card"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleUpgrade}>
                Change Plan
              </Button>
              {!subscription.cancelAtPeriodEnd && (
                <Button variant="destructive" onClick={() => setIsDialogOpen(true)}>
                  Cancel Subscription
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your recent invoices and payment history.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">No billing history available yet.</p>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your
              current billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCanceling}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={isCanceling}>
              {isCanceling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Canceling...
                </>
              ) : (
                "Cancel Subscription"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
