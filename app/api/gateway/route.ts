import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import Payment from "@/lib/payment"
import { CONFIG } from "@/config/setting"

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const user = await getUserFromSession(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get amount from query params
    const { searchParams } = new URL(request.url)
    const amount = searchParams.get("amount")

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Create payment using the payment library with qrisData
    const paymentResult = await Payment.createPay(CONFIG.PAYMENT.QRIS_DATA, Number(amount))

    if (!paymentResult.status || !paymentResult.data) {
      return NextResponse.json({ error: paymentResult.msg || "Failed to create payment" }, { status: 500 })
    }

    const paymentData = paymentResult.data

    return NextResponse.json({
      state: "PENDING",
      id: paymentData.token,
      qris_url: paymentData.qris_url,
      amount: paymentData.total_price,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initialize payment" },
      { status: 500 },
    )
  }
}
