import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"
import prisma from "@/lib/db"
import { getAuthCookie } from "@/lib/cookies"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const chatbotId = await Promise.resolve(params.id)

    if (!chatbotId) {
      return NextResponse.json({ success: false, message: "Invalid chatbot ID" }, { status: 400 })
    }

    const chatbot = await prisma.chatbot.findUnique({
      where: {
        id: chatbotId,
        userId: user.id,
      },
      include: {
        knowledgeBases: true,
      },
    })

    if (!chatbot) {
      return NextResponse.json({ success: false, message: "Chatbot not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, chatbot })
  } catch (error) {
    console.error("Error fetching chatbot:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch chatbot" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body

    const chatbot = await prisma.chatbot.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        status,
      },
    })

    return NextResponse.json({ chatbot })
  } catch (error) {
    console.error("Error updating chatbot:", error)
    return NextResponse.json(
      { error: "Failed to update chatbot" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    // Check if chatbot exists and belongs to user
    const existingChatbot = await prisma.chatbot.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingChatbot) {
      return NextResponse.json({ success: false, message: "Chatbot not found" }, { status: 404 })
    }

    // Delete chatbot
    await prisma.chatbot.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: "Chatbot deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return NextResponse.json({ success: false, message: "Failed to delete chatbot" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    // Verify chatbot ownership
    const existingChatbot = await prisma.chatbot.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingChatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    // Update chatbot status
    const chatbot = await prisma.chatbot.update({
      where: { id: params.id },
      data: { status: data.status },
      include: {
        knowledgeBases: true,
      },
    })

    return NextResponse.json(chatbot)
  } catch (error) {
    console.error("Error updating chatbot:", error)
    return NextResponse.json(
      { error: "Failed to update chatbot" },
      { status: 500 }
    )
  }
}
