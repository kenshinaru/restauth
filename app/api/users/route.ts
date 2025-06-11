import { type NextRequest, NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession(request)

    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role || "user",
        apikey: user.apiKey,
        usage: user.usage,
        banned: user.banned,
        premium: user.premium,
        expired: user.expired,
        limit: user.limit,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ message: "Failed to get user data" }, { status: 500 })
  }
}
