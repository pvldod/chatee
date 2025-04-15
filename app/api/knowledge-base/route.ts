import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"
import prisma from "@/lib/db"
import { processWebsite, processDocument } from "@/lib/ai-service"

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const formData = await request.formData()
    const chatbotId = formData.get("chatbotId") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const type = formData.get("type") as string

    if (!chatbotId || !name || !type) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Check if chatbot exists and belongs to user
    const chatbot = await prisma.chatbot.findUnique({
      where: {
        id: chatbotId,
        userId: user.id,
      },
    })

    if (!chatbot) {
      return NextResponse.json({ success: false, message: "Chatbot not found" }, { status: 404 })
    }

    // Check subscription limits
    const existingKnowledgeBases = await prisma.knowledgeBase.count({
      where: { chatbotId },
    })

    let maxKnowledgeBases = 1 // Free tier
    if (user.subscriptionTier === "starter") {
      maxKnowledgeBases = 3
    } else if (user.subscriptionTier === "professional") {
      maxKnowledgeBases = 10
    } else if (user.subscriptionTier === "enterprise") {
      maxKnowledgeBases = 50
    }

    if (existingKnowledgeBases >= maxKnowledgeBases) {
      return NextResponse.json(
        {
          success: false,
          message: `Your plan allows a maximum of ${maxKnowledgeBases} knowledge bases per chatbot. Please upgrade to create more.`,
        },
        { status: 403 },
      )
    }

    let metadata: any = {}

    // Process based on type
    if (type === "website") {
      const websiteUrl = formData.get("websiteUrl") as string
      if (!websiteUrl) {
        return NextResponse.json({ success: false, message: "Website URL is required" }, { status: 400 })
      }

      metadata = {
        websiteUrls: [websiteUrl],
      }

      // Create knowledge base
      const knowledgeBase = await prisma.knowledgeBase.create({
        data: {
          chatbotId,
          name,
          description,
          type,
          status: "processing",
          metadata,
        },
      })

      // Process website in background
      processWebsite(websiteUrl).then(async (contents) => {
        // Create documents
        for (const content of contents) {
          await prisma.document.create({
            data: {
              knowledgeBaseId: knowledgeBase.id,
              title: `Content from ${websiteUrl}`,
              content,
              url: websiteUrl,
            },
          })
        }

        // Update knowledge base status
        await prisma.knowledgeBase.update({
          where: { id: knowledgeBase.id },
          data: {
            status: "active",
            metadata: {
              ...metadata,
              documentCount: contents.length,
            },
          },
        })
      })

      return NextResponse.json({
        success: true,
        knowledgeBase,
      })
    } else if (type === "document") {
      const file = formData.get("file") as File
      if (!file) {
        return NextResponse.json({ success: false, message: "File is required" }, { status: 400 })
      }

      metadata = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }

      // Create knowledge base
      const knowledgeBase = await prisma.knowledgeBase.create({
        data: {
          chatbotId,
          name,
          description,
          type,
          status: "processing",
          metadata,
        },
      })

      // Process document in background
      const buffer = Buffer.from(await file.arrayBuffer())
      processDocument(buffer, file.name).then(async (content) => {
        // Create document
        await prisma.document.create({
          data: {
            knowledgeBaseId: knowledgeBase.id,
            title: file.name,
            content,
          },
        })

        // Update knowledge base status
        await prisma.knowledgeBase.update({
          where: { id: knowledgeBase.id },
          data: {
            status: "active",
            metadata: {
              ...metadata,
              documentCount: 1,
            },
          },
        })
      })

      return NextResponse.json({
        success: true,
        knowledgeBase,
      })
    } else if (type === "qa") {
      const questions = JSON.parse(formData.get("questions") as string)
      if (!questions || !Array.isArray(questions)) {
        return NextResponse.json({ success: false, message: "Questions are required" }, { status: 400 })
      }

      metadata = {
        qaCount: questions.length,
      }

      // Create knowledge base
      const knowledgeBase = await prisma.knowledgeBase.create({
        data: {
          chatbotId,
          name,
          description,
          type,
          status: "active",
          metadata,
        },
      })

      // Create documents for each Q&A pair
      for (const qa of questions) {
        await prisma.document.create({
          data: {
            knowledgeBaseId: knowledgeBase.id,
            title: qa.question,
            content: qa.answer,
          },
        })
      }

      return NextResponse.json({
        success: true,
        knowledgeBase,
      })
    }

    return NextResponse.json({ success: false, message: "Invalid knowledge base type" }, { status: 400 })
  } catch (error) {
    console.error("Error creating knowledge base:", error)
    return NextResponse.json({ success: false, message: "Failed to create knowledge base" }, { status: 500 })
  }
}
