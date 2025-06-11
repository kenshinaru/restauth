import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, username, email, password } = body

    // Validate input
    if (!name || !username || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Register user
    const user = await registerUser({ name, username, email, password })

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: { name: user.name, username: user.username, email: user.email },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Registration failed" },
      { status: 400 },
    )
  }
}
