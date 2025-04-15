import { Telegraf } from "telegraf"

async function setupWebhook() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is not set")
    process.exit(1)
  }

  if (!appUrl) {
    console.error("NEXT_PUBLIC_APP_URL is not set")
    process.exit(1)
  }

  const bot = new Telegraf(token)

  try {
    // Set webhook
    const webhookUrl = `${appUrl}/api/telegram/webhook`
    await bot.telegram.setWebhook(webhookUrl)

    // Get webhook info
    const webhookInfo = await bot.telegram.getWebhookInfo()

    console.log("Webhook set successfully:")
    console.log("URL:", webhookInfo.url)
    console.log("Pending update count:", webhookInfo.pending_update_count)
    console.log("Last error:", webhookInfo.last_error_message || "None")
  } catch (error) {
    console.error("Failed to set webhook:", error)
  }
}

setupWebhook().catch(console.error)
