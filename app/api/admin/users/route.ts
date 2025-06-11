import { type NextRequest, NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import { getUsersCollection } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession(request)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await getUsersCollection()
    const allUsers = await users
      .find(
        {},
        {
          projection: {
            password: 0, // Exclude password from response
          },
        },
      )
      .toArray()

    return NextResponse.json({ users: allUsers })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
