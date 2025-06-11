import { type NextRequest, NextResponse } from "next/server"
import { getUserFromSession, generateApiKey } from "@/lib/auth"
import { getUsersCollection } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is banned
    if (user.banned) {
      return NextResponse.json({ error: "Account is banned" }, { status: 403 })
    }

    const users = await getUsersCollection()
    const newApiKey = generateApiKey()

    await users.updateOne({ _id: user._id }, { $set: { apiKey: newApiKey } })

    return NextResponse.json({
      success: true,
      apikey: newApiKey,
    })
  } catch (error) {
    console.error("Regenerate API key error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
