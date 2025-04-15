"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-service"
import { useToast } from "@/hooks/use-toast"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push("/login?from=pricing")
      return
    }

    setIsLoading(planId)
    try {
      const response = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const data = await response.json()
      window.location.href = data.url
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Choose the plan that works best for your needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card className="border-zinc-800">
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Perfect for small businesses just getting started.</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${SUBSCRIPTION_PLANS.starter.price}</span>
                  <span className="text-gray-400 ml-2">/ month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {SUBSCRIPTION_PLANS.starter.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-[#d0ff00] mr-2 mt-1">
                        <Check size={16} />
                      </span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleSubscribe(SUBSCRIPTION_PLANS.starter.id)}
                  disabled={isLoading === SUBSCRIPTION_PLANS.starter.id}
                >
                  {isLoading === SUBSCRIPTION_PLANS.starter.id ? "Processing..." : "Get Started"}
                </Button>
              </CardFooter>
            </Card>

            {/* Professional Plan */}
            <Card className="border-[#d0ff00] relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#d0ff00] text-black px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <CardDescription>Ideal for growing businesses with more traffic.</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${SUBSCRIPTION_PLANS.professional.price}</span>
                  <span className="text-gray-400 ml-2">/ month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {SUBSCRIPTION_PLANS.professional.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-[#d0ff00] mr-2 mt-1">
                        <Check size={16} />
                      </span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-[#d0ff00] text-black hover:bg-opacity-90"
                  onClick={() => handleSubscribe(SUBSCRIPTION_PLANS.professional.id)}
                  disabled={isLoading === SUBSCRIPTION_PLANS.professional.id}
                >
                  {isLoading === SUBSCRIPTION_PLANS.professional.id ? "Processing..." : "Get Started"}
                </Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-zinc-800">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For large businesses with high volume needs.</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${SUBSCRIPTION_PLANS.enterprise.price}</span>
                  <span className="text-gray-400 ml-2">/ month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {SUBSCRIPTION_PLANS.enterprise.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-[#d0ff00] mr-2 mt-1">
                        <Check size={16} />
                      </span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleSubscribe(SUBSCRIPTION_PLANS.enterprise.id)}
                  disabled={isLoading === SUBSCRIPTION_PLANS.enterprise.id}
                >
                  {isLoading === SUBSCRIPTION_PLANS.enterprise.id ? "Processing..." : "Get Started"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold mb-4">Need a custom plan?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              If you have specific requirements or need a custom solution, we're here to help.
            </p>
            <Button variant="outline" onClick={() => router.push("/contact")}>
              Contact Sales
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
