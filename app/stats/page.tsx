"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { FolderCode, Users, Zap, HardDrive, MemoryStick, Cpu, RefreshCw, Clock, TrendingUp } from "lucide-react"

interface StatsData {
  visitors: {
    total: number
    today: number
    online: number
  }
  requests: {
    total: number
    today: number
    perSecond: number
  }
  system: {
    cpu: {
      usage: number
      cores: number
    }
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
    uptime: number
  }
  history: Array<{
    time: string
    cpu: number
    memory: number
    requests: number
  }>
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/stats")
      const data = await response.json()

      if (data.status) {
        setStats(data.data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
        <div className="flex flex-col items-center space-y-2">
          <Image src="/logo.png" alt="Arincy API Logo" width={170} height={170} priority />
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-bounce"></div>
          </div>
        </div>
      </div>
    )
  }


  if (!stats) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg font-semibold text-red-400 mb-2">Failed to load statistics</p>
              <p className="text-sm text-gray-400">Please try refreshing the page</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
              System Statistics
            </h1>
            <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">Real-time monitoring dashboard</p>
          </div>
          <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-400">
            <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Visitor & Request Stats - Mobile Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-black border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                <Users className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-blue-400" />
                <span className="hidden sm:inline">Total Visitors</span>
                <span className="sm:hidden">Visitors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg md:text-2xl font-bold">{formatNumber(stats.visitors.total)}</div>
              <p className="text-xs text-gray-400 mt-1">
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                  Today: {formatNumber(stats.visitors.today)}
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                <FolderCode className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-green-400" />
                <span className="hidden sm:inline">Online Users</span>
                <span className="sm:hidden">Endpoint</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg md:text-2xl font-bold">{stats.visitors.online}</div>
              <p className="text-xs text-gray-400 mt-1">
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">5 Category</Badge>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                <Zap className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-yellow-400" />
                <span className="hidden sm:inline">Total Requests</span>
                <span className="sm:hidden">Requests</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg md:text-2xl font-bold">{formatNumber(stats.requests.total)}</div>
              <p className="text-xs text-gray-400 mt-1">
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                  Today: {formatNumber(stats.requests.today)}
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-purple-400" />
                <span className="hidden sm:inline">Requests/sec</span>
                <span className="sm:hidden">Req/s</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg md:text-2xl font-bold">{stats.requests.perSecond.toFixed(1)}</div>
              <p className="text-xs text-gray-400 mt-1">
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">Real-time</Badge>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Stats - Mobile Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-black border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                <Cpu className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-yellow-400" />
                <span className="hidden sm:inline">CPU Usage</span>
                <span className="sm:hidden">CPU</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg md:text-2xl font-bold">{stats.system.cpu.usage.toFixed(1)}%</div>
              <Progress value={stats.system.cpu.usage} className="mt-2 h-1 md:h-2" />
              <p className="text-xs text-gray-400 mt-1">{stats.system.cpu.cores} cores</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                <MemoryStick className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-purple-400" />
                <span className="hidden sm:inline">Memory</span>
                <span className="sm:hidden">RAM</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg md:text-2xl font-bold">{stats.system.memory.percentage.toFixed(1)}%</div>
              <Progress value={stats.system.memory.percentage} className="mt-2 h-1 md:h-2" />
              <p className="text-xs text-gray-400 mt-1">
                {formatBytes(stats.system.memory.used)} / {formatBytes(stats.system.memory.total)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                <HardDrive className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-orange-400" />
                <span className="hidden sm:inline">Disk Usage</span>
                <span className="sm:hidden">Disk</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg md:text-2xl font-bold">{stats.system.disk.percentage.toFixed(1)}%</div>
              <Progress value={stats.system.disk.percentage} className="mt-2 h-1 md:h-2" />
              <p className="text-xs text-gray-400 mt-1">
                {formatBytes(stats.system.disk.used)} / {formatBytes(stats.system.disk.total)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-green-400" />
                Uptime
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg md:text-2xl font-bold">{formatUptime(stats.system.uptime)}</div>
              <p className="text-xs text-gray-400 mt-1">
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">Running</Badge>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart - Mobile Optimized */}
        <Card className="bg-black border-white/10">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Performance History</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              CPU and Memory usage over time (last 30 data points)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                cpu: {
                  label: "CPU Usage",
                  color: "hsl(var(--chart-1))",
                },
                memory: {
                  label: "Memory Usage",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[200px] md:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.history}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    domain={[0, 100]}
                    width={30}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="hsl(var(--chart-1))"
                    fillOpacity={1}
                    fill="url(#colorCpu)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="hsl(var(--chart-2))"
                    fillOpacity={1}
                    fill="url(#colorMemory)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
