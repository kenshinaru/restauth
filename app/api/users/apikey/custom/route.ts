import { type NextRequest, NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import { getUsersCollection } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is premium and not expired
    const currentTime = Date.now()
    if (!user.premium || (user.expired && user.expired < currentTime)) {
      return NextResponse.json({ error: "Premium subscription required" }, { status: 403 })
    }

    const { customKey } = await request.json()

    if (!customKey || customKey.length < 6) {
      return NextResponse.json({ error: "Custom key must be at least 6 characters" }, { status: 400 })
    }

    const users = await getUsersCollection()

    // Check if custom key already exists
    const existingUser = await users.findOne({ apiKey: customKey })
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "This API key is already in use" }, { status: 400 })
    }

    // Update user's API key
    await users.updateOne({ _id: user._id }, { $set: { apiKey: customKey } })

    return NextResponse.json({ success: true, apikey: customKey })
  } catch (error) {
    console.error("Custom key error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
