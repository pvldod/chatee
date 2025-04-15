import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getAuthUser } from "@/lib/auth-utils"

export async function GET() {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const chatbots = await prisma.chatbot.findMany({
      where: { userId: user.id },
      include: {
        knowledgeBases: true,
      },
    })

    return NextResponse.json(chatbots)
  } catch (error) {
    console.error("Error fetching chatbots:", error)
    return NextResponse.json(
      { error: "Failed to fetch chatbots" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check subscription limits
    const userChatbots = await prisma.chatbot.count({
      where: { userId: user.id },
    })

    console.log(`User ${user.id} has ${userChatbots} chatbots`)

    if (userChatbots >= 3) {
      return NextResponse.json(
        { error: "Dosáhli jste maximálního počtu chatbotů (3) pro free verzi. Pro vytvoření dalších chatbotů si prosím upgradujte účet." },
        { status: 403 }
      )
    }

    const data = await request.json()
    const chatbot = await prisma.chatbot.create({
      data: {
        name: data.name,
        description: data.description || "",
        welcomeMessage: data.welcomeMessage || "Hi there! How can I help you today?",
        appearance: data.appearance || {
          primaryColor: "#000000",
          textColor: "#ffffff",
          fontFamily: "Inter",
          logoUrl: null
        },
        settings: data.settings || {
          enableAttachments: false,
          enableHistory: true,
          enableFeedback: true,
          enableTranscripts: false
        },
        userId: user.id,
        knowledgeBases: {
          create: {
            name: "Default Knowledge Base",
            type: "GENERAL",
            status: "ACTIVE",
            metadata: {
              sources: [],
              lastUpdated: new Date().toISOString(),
              documentCount: 0
            }
          },
        },
      },
      include: {
        knowledgeBases: true,
      },
    })

    return NextResponse.json(chatbot)
  } catch (error) {
    console.error("Error creating chatbot:", error)
    return NextResponse.json(
      { error: "Failed to create chatbot" },
      { status: 500 }
    )
  }
}
