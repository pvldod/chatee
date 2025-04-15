import { NextResponse } from "next/server"
import { handleWebhook } from "@/lib/subscription-service"
import Stripe from "stripe"

// Initialize Stripe only if the API key is available
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null

export async function POST(request: Request) {
  try {
    // If Stripe is not configured, return a success response
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn("Stripe not configured. Skipping webhook processing.")
      return NextResponse.json({ success: true, message: "Stripe not configured" })
    }

    const body = await request.text()
    const signature = request.headers.get("stripe-signature") || ""

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err: any) {
      return NextResponse.json({ success: false, message: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    // Handle the event
    await handleWebhook(event)

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error("Stripe webhook error:", error)
    return NextResponse.json({ success: false, message: "Webhook handler failed" }, { status: 500 })
  }
}
