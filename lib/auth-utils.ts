import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import prisma from "./db"

export async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    console.log("No token found")
    return null
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    console.log("JWT payload:", payload)
    const userId = payload.userId as string

    if (!userId) {
      console.error("No userId in token payload:", payload)
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      console.error("No user found with id:", userId)
      return null
    }

    // Don't return the password
    const { password, ...userWithoutPassword } = user

    return userWithoutPassword
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}
