import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    // Here you would typically store the email in a database
    console.log("Email subscription received:", email)

    return NextResponse.json({
      success: true,
      message: "Subscription successful",
    })
  } catch (error) {
    console.error("Error processing subscription:", error)
    return NextResponse.json({ success: false, message: "Failed to process subscription" }, { status: 500 })
  }
}
