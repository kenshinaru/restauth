import { type NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    // Login user
    const user = await loginUser({ username, password })

    // Create session
    const session = {
      id: user.id,
      role: user.role,
      username: user.username,
      name: user.name,
      email: user.email,
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set({
      name: "user_session",
      value: JSON.stringify(session),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    })

    return NextResponse.json(
      { message: "Login successful", user: { name: user.name, username: user.username } },
      { status: 200 },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: error instanceof Error ? error.message : "Login failed" }, { status: 401 })
  }
}
