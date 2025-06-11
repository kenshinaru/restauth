import { NextResponse } from "next/server"
import { getUsersCollection } from "@/lib/mongodb"

export async function GET() {
  try {
    const users = await getUsersCollection()

    // Reset usage for all users
    const result = await users.updateMany({}, { $set: { usage: 0 } })

    return NextResponse.json({
      status: true,
      message: "Usage reset successful",
      usersUpdated: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error resetting usage:", error)
    return NextResponse.json(
      {
        status: false,
        message: "Failed to reset usage",
      },
      { status: 500 },
    )
  }
}
