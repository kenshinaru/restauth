import clientPromise from "@/lib/mongodb"
import { ENDPOINT_CATEGORIES } from "@/config/endpoints"

interface AnalyticsData {
  totalVisitors: number
  totalRequests: number
  todayVisitors: number
  todayRequests: number
  lastResetDate: string
  visitors: Set<string>
  requests: Array<{
    timestamp: number
    ip: string
    path: string
    userAgent: string
  }>
}

const COLLECTION_NAME = "analytics"
const DOCUMENT_ID = "main"

async function loadAnalytics(): Promise<AnalyticsData> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection(COLLECTION_NAME)

  let doc = await collection.findOne({ _id: DOCUMENT_ID })
  const today = new Date().toDateString()

  if (!doc) {
    const initialData: AnalyticsData = {
      totalVisitors: 0,
      totalRequests: 0,
      todayVisitors: 0,
      todayRequests: 0,
      lastResetDate: today,
      visitors: new Set(),
      requests: [],
    }
    await collection.insertOne({
      _id: DOCUMENT_ID,
      ...initialData,
      visitors: [],
    })
    doc = { ...initialData, visitors: [] }
  }

  // Reset today counters if needed
  if (doc.lastResetDate !== today) {
    doc.todayVisitors = 0
    doc.todayRequests = 0
    doc.lastResetDate = today
    doc.visitors = []
    await collection.updateOne(
      { _id: DOCUMENT_ID },
      {
        $set: {
          todayVisitors: 0,
          todayRequests: 0,
          lastResetDate: today,
          visitors: [],
        },
      }
    )
  }

  return {
    totalVisitors: doc.totalVisitors,
    totalRequests: doc.totalRequests,
    todayVisitors: doc.todayVisitors,
    todayRequests: doc.todayRequests,
    lastResetDate: doc.lastResetDate,
    visitors: new Set(doc.visitors),
    requests: doc.requests || [],
  }
}

async function saveAnalytics(data: AnalyticsData) {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection(COLLECTION_NAME)

  await collection.updateOne(
    { _id: DOCUMENT_ID },
    {
      $set: {
        totalVisitors: data.totalVisitors,
        totalRequests: data.totalRequests,
        todayVisitors: data.todayVisitors,
        todayRequests: data.todayRequests,
        lastResetDate: data.lastResetDate,
        visitors: Array.from(data.visitors),
        requests: data.requests,
      },
    }
  )
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  if (realIP) {
    return realIP
  }

  return "unknown"
}

export async function trackVisitor(request: Request) {
  try {
    const analyticsData = await loadAnalytics()

    const ip = getClientIP(request)
    const userAgent = request.headers.get("user-agent") || "unknown"

    const visitorKey = `${ip}-${new Date().toDateString()}`
    const totalVisitorKey = `total-${ip}`

    if (!analyticsData.visitors.has(visitorKey)) {
      analyticsData.visitors.add(visitorKey)
      analyticsData.todayVisitors++
    }

    if (!analyticsData.visitors.has(totalVisitorKey)) {
      analyticsData.visitors.add(totalVisitorKey)
      analyticsData.totalVisitors++
    }

    await saveAnalytics(analyticsData)
  } catch (error) {
    console.error("Error tracking visitor:", error)
  }
}

export async function trackRequest(request: Request, path: string) {
  try {
    const analyticsData = await loadAnalytics()

    const ip = getClientIP(request)
    const userAgent = request.headers.get("user-agent") || "unknown"

    analyticsData.totalRequests++
    analyticsData.todayRequests++

    analyticsData.requests.push({
      timestamp: Date.now(),
      ip,
      path,
      userAgent,
    })

    if (analyticsData.requests.length > 1000) {
      analyticsData.requests = analyticsData.requests.slice(-1000)
    }

    await saveAnalytics(analyticsData)
  } catch (error) {
    console.error("Error tracking request:", error)
  }
}

const appStartupTime = Date.now()

export async function getAnalytics() {
  try {
    const analyticsData = await loadAnalytics()

    const oneMinuteAgo = Date.now() - 60000
    const recentRequests = analyticsData.requests.filter((req) => req.timestamp > oneMinuteAgo)
    const requestsPerSecond = recentRequests.length / 60
    const totalEndpoints = ENDPOINT_CATEGORIES.reduce((acc, category) => acc + category.endpoints.length, 0)
    const uptime = Math.floor((Date.now() - appStartupTime) / 1000)
    
    return {
      totalVisitors: analyticsData.totalVisitors,
      totalRequests: analyticsData.totalRequests,
      todayVisitors: analyticsData.todayVisitors,
      todayRequests: analyticsData.todayRequests,
      requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
      onlineUsers: totalEndpoints,
      uptime,
    }
  } catch (error) {
    console.error("Error getting analytics:", error)
    return {
      totalVisitors: 0,
      totalRequests: 0,
      todayVisitors: 0,
      todayRequests: 0,
      requestsPerSecond: 0,
      onlineUsers: 15,
      uptime: 0,
    }
  }
}
