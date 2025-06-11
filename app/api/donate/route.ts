import { type NextRequest, NextResponse } from "next/server"
import { CONFIG } from "@/config/setting"

const QRIS_ID =
  "00020101021126570011ID.DANA.WWW011893600915379082632602097908263260303UMI51440014ID.CO.QRIS.WWW0215ID10243587265020303UMI5204549953033605802ID5913KENSHIN STORE6015Kab. Purwakarta61054111663046251"

export async function POST(request: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const body = await request.json()
    const { amount, method = "QRIS" } = body

    // Validate amount
    if (!amount || typeof amount !== "number" || amount < 1000) {
      return NextResponse.json(
        {
          creator: CONFIG.API.CREATOR,
          status: false,
          msg: "Amount harus berupa angka dan minimal 1000",
        },
        { status: 400, headers },
      )
    }

    // Call external API with GET method
    const apiUrl = `https://eclair1-gateway.hf.space/api/payment/create?id=${encodeURIComponent(QRIS_ID)}&amount=${amount}`

    const apiResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!apiResponse.ok) {
      throw new Error(`API responded with status: ${apiResponse.status}`)
    }

    const result = await apiResponse.json()

    if (result.status) {
      return NextResponse.json(
        {
          creator: CONFIG.API.CREATOR,
          status: true,
          msg: result.msg,
          data: result.data,
        },
        { headers },
      )
    } else {
      return NextResponse.json(
        {
          creator: CONFIG.API.CREATOR,
          status: false,
          msg: result.msg || "Gagal generate QRIS",
        },
        { status: 400, headers },
      )
    }
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json(
      {
        creator: CONFIG.API.CREATOR,
        status: false,
        msg: "Terjadi kesalahan saat membuat pembayaran",
      },
      { status: 500, headers },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
