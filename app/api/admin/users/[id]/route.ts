import { type NextRequest, NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import { getUsersCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromSession(request)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, limit, customKey, amount } = await request.json()
    const users = await getUsersCollection()

    switch (action) {
      case "ban":
        await users.updateOne({ _id: new ObjectId(params.id) }, { $set: { banned: true } })
        break
      case "unban":
        await users.updateOne({ _id: new ObjectId(params.id) }, { $set: { banned: false } })
        break
      case "setLimit":
        await users.updateOne({ _id: new ObjectId(params.id) }, { $set: { limit: Number.parseInt(limit) } })
        break
      case "addLimit":
        const currentUser = await users.findOne({ _id: new ObjectId(params.id) })
        const currentLimit = currentUser?.limit || 100
        const newLimit = currentLimit + Number.parseInt(amount)
        await users.updateOne({ _id: new ObjectId(params.id) }, { $set: { limit: newLimit } })
        break
      case "subtractLimit":
        const currentUserSub = await users.findOne({ _id: new ObjectId(params.id) })
        const currentLimitSub = currentUserSub?.limit || 100
        const newLimitSub = Math.max(0, currentLimitSub - Number.parseInt(amount))
        await users.updateOne({ _id: new ObjectId(params.id) }, { $set: { limit: newLimitSub } })
        break
      case "setCustomKey":
        await users.updateOne({ _id: new ObjectId(params.id) }, { $set: { apiKey: customKey } })
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromSession(request)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await getUsersCollection()
    await users.deleteOne({ _id: new ObjectId(params.id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
