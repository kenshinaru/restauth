import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

export async function POST(request: NextRequest) {
  try {
    // Check if user has NextAuth session
    const session = await getServerSession(authOptions)

    const response = NextResponse.json({ success: true })

    // Clear custom session cookie
    response.cookies.set("user_session", "", {
      expires: new Date(0),
      path: "/",
    })

    // If NextAuth session exists, redirect to NextAuth signout
    if (session) {
      return NextResponse.json({
        success: true,
        redirectToSignOut: true,
      })
    }

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
