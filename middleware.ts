import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Add paths that should be protected by authentication
const protectedPaths = [
  "/dashboard",
  "/dashboard/chatbots",
  "/dashboard/settings",
  "/api/chatbots",
  "/api/user",
  "/api/knowledge-base",
  "/api/subscription"
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  if (!isProtectedPath) return NextResponse.next()

  // Get the auth token
  const token = request.cookies.get("auth_token")?.value
  if (!token) {
    console.log("No token found in middleware")
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    console.log("JWT payload in middleware:", payload)

    // Check if userId exists in payload
    const userId = payload.userId
    if (!userId) {
      console.error("No userId in token payload:", payload)
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Add userId to request headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", userId as string)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error("Token verification failed:", error)
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/chatbots/:path*",
    "/api/user/:path*", 
    "/api/knowledge-base/:path*",
    "/api/subscription/:path*"
  ]
}
