import { type NextRequest, NextResponse } from "next/server"
import { ENDPOINT_CATEGORIES } from "@/config/endpoints"
import { checkIpRateLimit } from "@/lib/limiter"
import { getScraper } from "@/lib/scraper-loader"
import { CONFIG } from "@/config/setting"
import { trackRequest } from "@/lib/analytics"
import { validateApiKey, incrementApiUsage, hasReachedDailyLimit } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
  }

  try {
    const path = "/" + params.path.join("/")

    // Get API key from request
    const apiKey = request.headers.get("X-API-Key") || request.nextUrl.searchParams.get("apikey")

    // Validate API key
    if (!apiKey) {
      return NextResponse.json(
        {
          creator: CONFIG.API.CREATOR,
          status: false,
          msg: "API key is required",
        },
        { status: 401, headers },
      )
    }

    // Check if API key is valid
    const user = await validateApiKey(apiKey)
    if (!user) {
      return NextResponse.json(
        {
          creator: CONFIG.API.CREATOR,
          status: false,
          msg: "Invalid API key",
        },
        { status: 401, headers },
      )
    }

    // Check if user has reached daily limit
    const reachedLimit = await hasReachedDailyLimit(apiKey)
    if (reachedLimit) {
      return NextResponse.json(
        {
          creator: CONFIG.API.CREATOR,
          status: false,
          msg: "Daily API limit reached (100 requests per day)",
        },
        { status: 429, headers },
      )
    }

    // Track this API request
    await trackRequest(request, path)

    const { searchParams } = new URL(request.url)

    const endpoint = ENDPOINT_CATEGORIES.flatMap((cat) => cat.endpoints).find((ep) => ep.path === path)

    if (!endpoint) {
      return NextResponse.json(
        {
          creator: CONFIG.API.CREATOR,
          status: false,
          msg: `Endpoint '${path}' not found`,
        },
        { status: 404, headers },
      )
    }

    const rate = checkIpRateLimit(request)

    if (!rate.allowed) {
      return NextResponse.json(
        {
          creator: CONFIG.API.CREATOR,
          status: false,
          msg: `Rate limit exceeded. ${CONFIG.RATE_LIMIT.MESSAGE} Try again in ${Math.ceil((rate.resetTime - Date.now()) / 1000)}s`,
        },
        {
          status: 429,
          headers: {
            ...headers,
            "X-RateLimit-Limit": rate.total.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(rate.resetTime / 1000).toString(),
          },
        },
      )
    }

    const paramKeys = endpoint.params
    const paramValues: string[] = []

    for (const key of paramKeys) {
      const value = searchParams.get(key)
      if (!value) {
        return NextResponse.json(
          {
            creator: CONFIG.API.CREATOR,
            status: false,
            msg: `${key} parameter is required`,
          },
          { status: 400, headers },
        )
      }
      paramValues.push(value)
    }

    const scraper = await getScraper(endpoint.execute)
    if (!scraper) {
      return NextResponse.json(
        {
          creator: CONFIG.API.CREATOR,
          status: false,
          msg: `Scraper '${endpoint.execute}' not found`,
        },
        { status: 501, headers },
      )
    }

    try {
      // Increment API usage
      await incrementApiUsage(apiKey)

      const result = await scraper(...paramValues)
      return NextResponse.json(
        {
          creator: CONFIG.API.CREATOR,
          ...result,
        },
        { headers },
      )
    } catch (error) {
      console.error("Scraper error:", error)
      return NextResponse.json(
        {
          creator: CONFIG.API.CREATOR,
          status: false,
          msg: error instanceof Error ? error.message : "Unknown scraper error",
        },
        { status: 500, headers },
      )
    }
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      {
        creator: CONFIG.API.CREATOR,
        status: false,
        msg: "Internal server error",
      },
      {
        status: 500,
        headers,
      },
    )
  }
}

export async function OPTIONS(_: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    },
  })
}
