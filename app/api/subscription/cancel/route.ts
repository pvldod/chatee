import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"
import { cancelSubscription } from "@/lib/subscription-service"
import prisma from "@/lib/db"

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ success: false, message: "Subscription ID is required" }, { status: 400 })
    }

    // Check if subscription belongs to user
    const subscription = await prisma.subscription.findUnique({
      where: {
        id: subscriptionId,
        userId: user.id,
      },
    })

    if (!subscription) {
      return NextResponse.json({ success: false, message: "Subscription not found" }, { status: 404 })
    }

    await cancelSubscription(subscriptionId)

    return NextResponse.json({
      success: true,
      message: "Subscription will be canceled at the end of the billing period",
    })
  } catch (error) {
    console.error("Subscription cancellation error:", error)
    return NextResponse.json({ success: false, message: "Failed to cancel subscription" }, { status: 500 })
  }
}
