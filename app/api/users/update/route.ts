import { type NextRequest, NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import { getUsersCollection } from "@/lib/mongodb"

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromSession(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, username } = await request.json()

    if (!name || !email || !username) {
      return NextResponse.json({ error: "Name, email, and username are required" }, { status: 400 })
    }

    const users = await getUsersCollection()

    // Check if email is already taken by another user
    const existingEmailUser = await users.findOne({
      email,
      _id: { $ne: user._id },
    })

    if (existingEmailUser) {
      return NextResponse.json({ error: "Email already taken" }, { status: 400 })
    }

    // Check if username is already taken by another user
    const existingUsernameUser = await users.findOne({
      username,
      _id: { $ne: user._id },
    })

    if (existingUsernameUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 })
    }

    await users.updateOne({ _id: user._id }, { $set: { name, email, username } })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
