import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"
import { createCheckoutSession } from "@/lib/subscription-service"

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json({ success: false, message: "Plan ID is required" }, { status: 400 })
    }

    const checkoutUrl = await createCheckoutSession(user.id, planId)

    return NextResponse.json({
      success: true,
      url: checkoutUrl,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ success: false, message: "Failed to create checkout session" }, { status: 500 })
  }
}
