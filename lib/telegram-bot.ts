import { Telegraf } from "telegraf"
import { message } from "telegraf/filters"
import { neon } from "@neondatabase/serverless"
import { generateChatResponse } from "./ai-service"

// Initialize database connection
const sql = neon(process.env.DATABASE_URL || "")

// Initialize bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "")

// Store active user sessions
const sessions: Record<number, { userId: string; chatbotId: string; conversationId: string }> = {}

// Setup bot commands
export function setupBot() {
  // Start command
  bot.start(async (ctx) => {
    const telegramUserId = ctx.from.id

    try {
      // Check if user exists in our database
      const user = await sql`
        SELECT * FROM "User" WHERE "email" = ${`telegram:${telegramUserId}@telegram.com`} LIMIT 1
      `

      if (user.length === 0) {
        // Create a new user for this Telegram user
        const newUser = await sql`
          INSERT INTO "User" (
            "id", 
            "name", 
            "email", 
            "password", 
            "role", 
            "subscriptionStatus", 
            "createdAt", 
            "updatedAt"
          ) 
          VALUES (
            ${"usr_" + Math.random().toString(36).substring(2, 15)}, 
            ${ctx.from.first_name || "Telegram User"}, 
            ${`telegram:${telegramUserId}@telegram.com`}, 
            ${"telegram-auth"}, 
            ${"user"}, 
            ${"trial"}, 
            ${new Date()}, 
            ${new Date()}
          )
          RETURNING *
        `

        // Create a default chatbot for this user
        const chatbot = await sql`
          INSERT INTO "Chatbot" (
            "id",
            "userId",
            "name",
            "welcomeMessage",
            "appearance",
            "settings",
            "status",
            "createdAt",
            "updatedAt"
          )
          VALUES (
            ${"bot_" + Math.random().toString(36).substring(2, 15)},
            ${newUser[0].id},
            ${"Telegram Bot"},
            ${"Hi there! How can I help you today?"},
            ${{ primaryColor: "#d0ff00", textColor: "#ffffff" }},
            ${{ enableAttachments: false, enableHistory: true, enableFeedback: true }},
            ${"active"},
            ${new Date()},
            ${new Date()}
          )
          RETURNING *
        `

        // Store session
        sessions[telegramUserId] = {
          userId: newUser[0].id,
          chatbotId: chatbot[0].id,
          conversationId: "",
        }

        await ctx.reply("Welcome! I've created an account for you. You can now start chatting with me!")
      } else {
        // Get user's chatbot
        const chatbot = await sql`
          SELECT * FROM "Chatbot" WHERE "userId" = ${user[0].id} LIMIT 1
        `

        if (chatbot.length === 0) {
          await ctx.reply("No chatbot found for your account. Please contact support.")
          return
        }

        // Store session
        sessions[telegramUserId] = {
          userId: user[0].id,
          chatbotId: chatbot[0].id,
          conversationId: "",
        }

        await ctx.reply(`Welcome back, ${ctx.from.first_name || "friend"}! How can I help you today?`)
      }
    } catch (error) {
      console.error("Error in start command:", error)
      await ctx.reply("Sorry, there was an error starting our conversation. Please try again later.")
    }
  })

  // Help command
  bot.help((ctx) => {
    ctx.reply(`
Here are the available commands:
/start - Start or restart the bot
/help - Show this help message
/status - Check your account status

Just send me a message and I'll respond to your questions!
    `)
  })

  // Status command
  bot.command("status", async (ctx) => {
    const telegramUserId = ctx.from.id

    if (!sessions[telegramUserId]) {
      await ctx.reply("Please use /start to initialize your session first.")
      return
    }

    try {
      const user = await sql`
        SELECT * FROM "User" WHERE "id" = ${sessions[telegramUserId].userId} LIMIT 1
      `

      if (user.length === 0) {
        await ctx.reply("User not found. Please use /start to reinitialize your session.")
        return
      }

      await ctx.reply(`
Account Status:
Name: ${user[0].name}
Subscription: ${user[0].subscriptionStatus || "None"}
Trial ends: ${user[0].trialEndsAt ? new Date(user[0].trialEndsAt).toLocaleDateString() : "N/A"}
      `)
    } catch (error) {
      console.error("Error in status command:", error)
      await ctx.reply("Sorry, there was an error checking your status. Please try again later.")
    }
  })

  // Handle text messages
  bot.on(message("text"), async (ctx) => {
    const telegramUserId = ctx.from.id
    const messageText = ctx.message.text

    if (!sessions[telegramUserId]) {
      await ctx.reply("Please use /start to initialize your session first.")
      return
    }

    try {
      const session = sessions[telegramUserId]

      // Create or get conversation
      let conversationId = session.conversationId
      if (!conversationId) {
        const conversation = await sql`
          INSERT INTO "Conversation" (
            "id",
            "chatbotId",
            "sessionId",
            "metadata",
            "createdAt",
            "updatedAt"
          )
          VALUES (
            ${"conv_" + Math.random().toString(36).substring(2, 15)},
            ${session.chatbotId},
            ${`telegram:${telegramUserId}`},
            ${{ platform: "telegram", telegramUserId }},
            ${new Date()},
            ${new Date()}
          )
          RETURNING *
        `

        conversationId = conversation[0].id
        sessions[telegramUserId].conversationId = conversationId
      }

      // Store user message
      await sql`
        INSERT INTO "Message" (
          "id",
          "conversationId",
          "role",
          "content",
          "timestamp"
        )
        VALUES (
          ${"msg_" + Math.random().toString(36).substring(2, 15)},
          ${conversationId},
          ${"user"},
          ${messageText},
          ${new Date()}
        )
      `

      // Get conversation history
      const messages = await sql`
        SELECT * FROM "Message" 
        WHERE "conversationId" = ${conversationId}
        ORDER BY "timestamp" ASC
        LIMIT 10
      `

      // Format messages for AI
      const formattedMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Generate AI response
      const aiResponse = await generateChatResponse(formattedMessages)

      // Store AI response
      await sql`
        INSERT INTO "Message" (
          "id",
          "conversationId",
          "role",
          "content",
          "timestamp"
        )
        VALUES (
          ${"msg_" + Math.random().toString(36).substring(2, 15)},
          ${conversationId},
          ${"assistant"},
          ${aiResponse},
          ${new Date()}
        )
      `

      // Send response to user
      await ctx.reply(aiResponse)

      // Update usage statistics
      await sql`
        INSERT INTO "Usage" (
          "id",
          "userId",
          "chatbotId",
          "messageCount",
          "tokenCount",
          "period",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${"usg_" + Math.random().toString(36).substring(2, 15)},
          ${session.userId},
          ${session.chatbotId},
          ${1},
          ${messageText.length + aiResponse.length},
          ${new Date().toISOString().slice(0, 7)}, -- YYYY-MM
          ${new Date()},
          ${new Date()}
        )
        ON CONFLICT ("id") DO UPDATE
        SET 
          "messageCount" = "Usage"."messageCount" + 1,
          "tokenCount" = "Usage"."tokenCount" + ${messageText.length + aiResponse.length},
          "updatedAt" = ${new Date()}
      `
    } catch (error) {
      console.error("Error handling message:", error)
      await ctx.reply("Sorry, there was an error processing your message. Please try again later.")
    }
  })

  return bot
}

// Function to start the bot
export async function startBot() {
  try {
    const botInstance = setupBot()
    await botInstance.launch()
    console.log("Telegram bot started successfully")

    // Enable graceful stop
    process.once("SIGINT", () => botInstance.stop("SIGINT"))
    process.once("SIGTERM", () => botInstance.stop("SIGTERM"))

    return botInstance
  } catch (error) {
    console.error("Failed to start Telegram bot:", error)
    throw error
  }
}
