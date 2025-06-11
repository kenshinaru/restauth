import { type NextRequest, NextResponse } from "next/server"
import { trackVisitor } from "@/lib/analytics"
import { CONFIG } from "@/config/setting"

export async function POST(request: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    await trackVisitor(request)

    return NextResponse.json(
      {
        creator: CONFIG.API.CREATOR,
        status: true,
        msg: "Visitor tracked successfully",
      },
      { headers },
    )
  } catch (error) {
    console.error("Error tracking visitor:", error)
    return NextResponse.json(
      {
        creator: CONFIG.API.CREATOR,
        status: false,
        msg: "Failed to track visitor",
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
