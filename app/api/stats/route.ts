import { NextResponse } from "next/server"
import { CONFIG } from "@/config/setting"
import { getAnalytics } from "@/lib/analytics"

// In-memory storage for system stats history
const systemHistory: Array<{
  time: string
  cpu: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  requests: number
}> = []

// Initialize history with some sample data
if (systemHistory.length === 0) {
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 2 * 60 * 1000) // Every 2 minutes
    const cpu = Math.random() * 80 + 10
    const memoryPercentage = Math.random() * 70 + 20
    const memoryTotal = 8 * 1024 * 1024 * 1024 // 8GB
    const memoryUsed = (memoryPercentage / 100) * memoryTotal
    const diskPercentage = Math.random() * 50 + 30
    const diskTotal = 100 * 1024 * 1024 * 1024 // 100GB
    const diskUsed = (diskPercentage / 100) * diskTotal

    systemHistory.push({
      time: `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`,
      cpu,
      memory: {
        used: Math.floor(memoryUsed),
        total: memoryTotal,
        percentage: memoryPercentage,
      },
      disk: {
        used: Math.floor(diskUsed),
        total: diskTotal,
        percentage: diskPercentage,
      },
      requests: Math.floor(Math.random() * 50 + 10),
    })
  }
}

// Mock system stats functions
function getMockCPUUsage(): number {
  const baseUsage = 25 + Math.sin(Date.now() / 10000) * 15
  const randomVariation = (Math.random() - 0.5) * 20
  return Math.max(5, Math.min(95, baseUsage + randomVariation))
}

function getMockMemoryUsage() {
  const totalMem = 8 * 1024 * 1024 * 1024 // 8GB
  const baseUsage = 0.6 + Math.sin(Date.now() / 15000) * 0.2 // ~40-80% usage
  const usedMem = totalMem * baseUsage

  return {
    used: Math.floor(usedMem),
    total: totalMem,
    percentage: baseUsage * 100,
  }
}

function getMockDiskUsage() {
  const totalDisk = 100 * 1024 * 1024 * 1024 // 100GB
  const usedDisk = 45 * 1024 * 1024 * 1024 + Math.random() * 1024 * 1024 * 100 // ~45GB + some variation

  return {
    used: Math.floor(usedDisk),
    total: totalDisk,
    percentage: (usedDisk / totalDisk) * 100,
  }
}

const startTime = Date.now()

function getUptime(): number {
  return Math.floor((Date.now() - startTime) / 1000)
}

export async function GET() {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    // Get real analytics data
    const analytics = await getAnalytics()

    const cpuUsage = getMockCPUUsage()
    const memoryUsage = getMockMemoryUsage()
    const diskUsage = getMockDiskUsage()
    const uptime = getUptime()

    const now = new Date()
    const newHistoryEntry = {
      time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
      cpu: cpuUsage,
      memory: memoryUsage,
      disk: diskUsage,
      requests: Math.floor(Math.random() * 50 + 10),
    }

    systemHistory.push(newHistoryEntry)
    if (systemHistory.length > 30) {
      systemHistory.shift()
    }

    const chartHistory = systemHistory.map(entry => ({
      time: entry.time,
      cpu: Math.round(entry.cpu * 100) / 100,
      memory: Math.round(entry.memory.percentage * 100) / 100, 
      disk: Math.round(entry.disk.percentage * 100) / 100,
      requests: entry.requests
    }))

    const responseData = {
      visitors: {
        total: analytics.totalVisitors,
        today: analytics.todayVisitors,
        online: analytics.onlineUsers,
      },
      requests: {
        total: analytics.totalRequests,
        today: analytics.todayRequests,
        perSecond: analytics.requestsPerSecond,
      },
      system: {
        cpu: {
          usage: cpuUsage,
          cores: 4, 
        },
        memory: memoryUsage,
        disk: diskUsage,
        uptime: analytics.uptime,
      },
      history: chartHistory, 
    }

    return NextResponse.json(
      {
        creator: CONFIG.API.CREATOR,
        status: true,
        data: responseData,
      },
      { headers },
    )
  } catch (error) {
    console.error("Stats API error:", error)
    return NextResponse.json(
      {
        creator: CONFIG.API.CREATOR,
        status: false,
        msg: "Failed to fetch system statistics",
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
