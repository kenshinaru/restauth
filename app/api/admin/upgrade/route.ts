import { type NextRequest, NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import { getUsersCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, days } = await request.json()
    const users = await getUsersCollection()

    // Calculate expiration date
    const currentDate = new Date()
    const expirationDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000)

    // Update user to premium
    await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          premium: true,
          expired: expirationDate.getTime(),
          limit: 999999,
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Upgrade user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
