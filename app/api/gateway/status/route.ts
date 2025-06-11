import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import Payment from "@/data/payment"
import { CONFIG } from "@/config/setting"

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const user = await getUserFromSession(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get token and startTime from query params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    const startTime = searchParams.get("startTime")

    if (!token) {
      return NextResponse.json({ error: "Payment token is required" }, { status: 400 })
    }

    // Check if payment session has expired
    if (startTime && Date.now() - Number(startTime) > 180000) {
      return NextResponse.json({ error: "Payment session expired" }, { status: 400 })
    }

    // Check payment status using the payment library with proper parameters
    const paymentResult = await Payment.checkPay(CONFIG.PAYMENT.OK_MERCHANT, CONFIG.PAYMENT.OK_APIKEY, token)

    if (!paymentResult.status) {
      return NextResponse.json({ error: paymentResult.msg || "Failed to check payment status" }, { status: 500 })
    }

    const paymentData = paymentResult.data

    // Return payment status
    return NextResponse.json({
      state: paymentData.state === "Settlement" ? "SUCCESS" : "PENDING",
      id: token,
      payment_type: paymentData.pay_method || "QRIS",
      total_price: paymentData.total_price,
      transaction_time: paymentData.paid_at || new Date().toISOString(),
    })
  } catch (error) {
    console.error("Payment status check error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check payment status" },
      { status: 500 },
    )
  }
}
