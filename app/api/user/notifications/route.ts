import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"

interface NotificationSettings {
  emailNotifications: {
    newMessages: boolean
    dailyDigest: boolean
    weeklyDigest: boolean
    systemNotifications: boolean
  }
  webNotifications: {
    realTime: boolean
    errors: boolean
    updates: boolean
  }
}

export async function GET(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const settings = user.notificationSettings || {
      emailNotifications: {
        newMessages: true,
        dailyDigest: false,
        weeklyDigest: true,
        systemNotifications: true,
      },
      webNotifications: {
        realTime: true,
        errors: true,
        updates: false,
      },
    }

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error("Error fetching notification settings:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch notification settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const settings: NotificationSettings = await request.json()

    // Update user settings in the database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        notificationSettings: settings,
      },
    })

    return NextResponse.json({
      success: true,
      settings: updatedUser.notificationSettings,
    })
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update notification settings" },
      { status: 500 }
    )
  }
} 