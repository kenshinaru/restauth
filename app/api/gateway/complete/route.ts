import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import { getUsersCollection, getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { PRICING } from "@/config/pricing" 

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const authUser = await getUserFromSession(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    console.log("[Payment Complete] Request body:", body)

    // The 'plan' here refers to the plan's 'key' (e.g., "phoenix", "dragon")
    const { userId, plan: planKey, paymentToken, transactionTime } = body

    // Validate required fields
    if (!userId || !planKey || !paymentToken) {
      console.error("[Payment Complete] Missing fields:", { userId, planKey, paymentToken })
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: { userId: !!userId, planKey: !!planKey, paymentToken: !!paymentToken },
        },
        { status: 400 },
      )
    }

    // Validate user has permission (either admin or updating own account)
    if (authUser.role !== "admin" && authUser._id.toString() !== userId) {
      console.error("[Payment Complete] Permission denied:", {
        authUserId: authUser._id.toString(),
        requestUserId: userId,
        authUserRole: authUser.role,
      })
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get plan configuration from the array
    const planConfig = PRICING.LIST.find((p) => p.key === planKey)
    if (!planConfig) {
      console.error("[Payment Complete] Invalid plan key:", planKey)
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Calculate expiration date using days from planConfig
    const now = new Date()
    const expirationDate = new Date(now.getTime() + planConfig.days * 24 * 60 * 60 * 1000)

    console.log("[Payment Complete] Updating user:", {
      userId,
      planKey,
      limit: planConfig.limit,
      expirationDate: expirationDate.toISOString(),
    })

    const users = await getUsersCollection()
    const updateData: any = {
      premium: true,
      expired: expirationDate.getTime(),
      limit: planConfig.limit,
      usage: 0, 
      updatedAt: now,
    }

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: updateData,
      },
    )

    if (result.modifiedCount === 0) {
      console.error("[Payment Complete] Failed to update user:", result)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    const db = await getDatabase()
    const transactions = db.collection("transactions")
    await transactions.insertOne({
      userId: new ObjectId(userId),
      planKey, 
      planName: planConfig.name, 
      durationDays: planConfig.days,
      paymentToken,
      amount: planConfig.price,
      limit: planConfig.limit,
      unlimited: planConfig.unlimited,
      transactionTime: transactionTime || now.toISOString(),
      expirationDate,
      createdAt: now,
    })

    console.log("[Payment Complete] Success:", { userId, planKey, limit: planConfig.limit })

    return NextResponse.json({
      status: true,
      message: "Plan updated successfully",
      planKey,
      planName: planConfig.name,
      limit: planConfig.limit,
      unlimited: planConfig.unlimited,
      expirationDate,
    })
  } catch (error) {
    console.error("Payment completion error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete payment" },
      { status: 500 },
    )
  }
}
