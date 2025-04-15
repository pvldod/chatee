import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"
import prisma from "@/lib/db"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const { question, answer } = await request.json()

    if (!question || !answer) {
      return NextResponse.json({ success: false, message: "Question and answer are required" }, { status: 400 })
    }

    // Create a knowledge base for Q&A pairs if it doesn't exist
    let knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        chatbotId: params.id,
        type: "qa",
      },
    })

    if (!knowledgeBase) {
      knowledgeBase = await prisma.knowledgeBase.create({
        data: {
          chatbotId: params.id,
          name: "Q&A Pairs",
          description: "Custom question and answer pairs",
          type: "qa",
          status: "active",
          metadata: {},
        },
      })
    }

    // Create a document for the Q&A pair
    const document = await prisma.document.create({
      data: {
        knowledgeBaseId: knowledgeBase.id,
        title: question,
        content: answer,
        metadata: {
          type: "qa",
          question,
          answer,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Q&A pair added successfully",
      document,
    })
  } catch (error) {
    console.error("Error adding Q&A pair:", error)
    return NextResponse.json({ success: false, message: "Failed to add Q&A pair" }, { status: 500 })
  }
} 