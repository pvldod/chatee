import { NextResponse } from "next/server"
import type { Telegraf } from "telegraf"
import { setupBot } from "@/lib/telegram-bot"

// Initialize bot
let bot: Telegraf | null = null

export async function POST(request: Request) {
  try {
    // Initialize bot if not already initialized
    if (!bot) {
      bot = setupBot()
    }

    // Get update from Telegram
    const update = await request.json()

    // Process update
    await bot.handleUpdate(update)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing Telegram webhook:", error)
    return NextResponse.json({ success: false, message: "Failed to process webhook" }, { status: 500 })
  }
}
