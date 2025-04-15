import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import prisma from "@/lib/db"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-min-32-chars-long!!")

export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    // Verify token using jose
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.userId as string

    if (!userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 401 })
  }
}
