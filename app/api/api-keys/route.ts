import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"
import prisma from "@/lib/db"
import crypto from "crypto"

export async function GET(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Nejste přihlášeni" }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: user.id,
        revoked: false,
      },
    })

    return NextResponse.json({
      success: true,
      apiKeys: apiKeys.map(key => ({
        ...key,
        key: key.key.slice(0, 8) + "..." + key.key.slice(-4), // Mask the key
      })),
    })
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json({ success: false, message: "Nepodařilo se načíst API klíče" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Nejste přihlášeni" }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ success: false, message: "Název je povinný" }, { status: 400 })
    }

    // Generate a random API key
    const key = `sk_${crypto.randomBytes(32).toString("hex")}`

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name,
        key,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiration
      },
    })

    return NextResponse.json({
      success: true,
      apiKey: {
        ...apiKey,
        key, // Return the full key only once
      },
    })
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json({ success: false, message: "Nepodařilo se vytvořit API klíč" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Nejste přihlášeni" }, { status: 401 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, message: "ID API klíče je povinné" }, { status: 400 })
    }

    // Revoke the API key (soft delete)
    await prisma.apiKey.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        revoked: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "API klíč byl úspěšně zrušen",
    })
  } catch (error) {
    console.error("Error revoking API key:", error)
    return NextResponse.json({ success: false, message: "Nepodařilo se zrušit API klíč" }, { status: 500 })
  }
} 