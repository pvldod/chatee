import { startBot } from "../lib/telegram-bot"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

async function main() {
  try {
    await startBot()
    console.log("Bot started in polling mode")
  } catch (error) {
    console.error("Failed to start bot:", error)
    process.exit(1)
  }
}

main().catch(console.error)
