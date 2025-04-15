import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { generateChatResponse, searchSimilarDocuments } from "@/lib/ai-service"

export async function POST(request: Request) {
  try {
    const { chatbotId, sessionId, message, history = [] } = await request.json()

    if (!chatbotId || !sessionId || !message) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Get chatbot
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      include: {
        user: true,
      },
    })

    if (!chatbot) {
      return NextResponse.json({ success: false, message: "Chatbot not found" }, { status: 404 })
    }

    // Check if user has active subscription
    if (chatbot.user.subscriptionStatus !== "active" && chatbot.user.subscriptionStatus !== "trial") {
      return NextResponse.json({ success: false, message: "Subscription inactive" }, { status: 403 })
    }

    // Get or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        chatbotId,
        sessionId,
      },
      include: {
        messages: true,
      },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          chatbotId,
          sessionId,
          metadata: {
            userAgent: request.headers.get("user-agent") || "",
            ipAddress: request.headers.get("x-forwarded-for") || "",
            referrer: request.headers.get("referer") || "",
          },
          messages: {
            create: [
              {
                role: "system",
                content: chatbot.welcomeMessage,
              },
            ],
          },
        },
        include: {
          messages: true,
        },
      })
    }

    // Add user message to conversation
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    })

    // Get knowledge bases for this chatbot
    const knowledgeBases = await prisma.knowledgeBase.findMany({
      where: {
        chatbotId,
        status: "active",
      },
    })

    // Search for relevant documents
    const documentIds = await searchSimilarDocuments(message, 5)
    const relevantDocuments = await prisma.document.findMany({
      where: {
        id: {
          in: documentIds,
        },
        knowledgeBase: {
          chatbotId,
        },
      },
    })

    // Prepare messages for AI
    const messagesForAI = [...history, { role: "user", content: message }]

    // Generate response
    const aiResponse = await generateChatResponse(messagesForAI, relevantDocuments)

    // Add AI response to conversation
    const responseMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: aiResponse,
      },
    })

    // Update usage statistics
    await prisma.usage.upsert({
      where: {
        id: `${chatbot.userId}_${chatbotId}_${new Date().toISOString().slice(0, 7)}`, // YYYY-MM
      },
      update: {
        messageCount: { increment: 1 },
        tokenCount: { increment: message.length + aiResponse.length },
      },
      create: {
        id: `${chatbot.userId}_${chatbotId}_${new Date().toISOString().slice(0, 7)}`,
        userId: chatbot.userId,
        chatbotId,
        messageCount: 1,
        tokenCount: message.length + aiResponse.length,
        period: new Date().toISOString().slice(0, 7), // YYYY-MM
      },
    })

    return NextResponse.json({
      success: true,
      message: responseMessage,
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ success: false, message: "Failed to process chat" }, { status: 500 })
  }
}
