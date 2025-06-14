"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Copy, CircleCheck, Crown, Zap, TriangleAlert, Plus, Minus } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRICING } from "@/config/pricing" 

interface User {
  _id: string
  name: string
  email: string
  username: string
  role: "admin" | "user"
  apiKey: string
  usage: number
  limit?: number
  banned?: boolean
  premium?: boolean
  expired?: number
  createdAt: string
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newLimit, setNewLimit] = useState("")
  const [limitAmounts, setLimitAmounts] = useState<Record<string, string>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")
  const [upgrading, setUpgrading] = useState(false)
  const [customApiKeys, setCustomApiKeys] = useState<Record<string, string>>({})
  const [isSettingKey, setIsSettingKey] = useState<Record<string, boolean>>({})
  const [copiedKeys, setCopiedKeys] = useState<Record<string, boolean>>({})
  const [hasApiKeyChanges, setHasApiKeyChanges] = useState<Record<string, boolean>>({})
  const [statusMessages, setStatusMessages] = useState<
    Record<string, Record<string, { type: "success" | "error" | null; message: string }>>
  >({})

  // Update planOptions to use the new PRICING.LIST array
  const planOptions = PRICING.LIST.map((plan) => ({
    label: plan.name,
    value: plan.key, // Use the plan key as the value
  }))

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)

        // Initialize custom API keys with current values
        const initialKeys: Record<string, string> = {}
        data.users.forEach((user: User) => {
          initialKeys[user._id] = user.apiKey
        })
        setCustomApiKeys(initialKeys)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string, limit?: number, amount?: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, limit, amount }),
      })

      if (response.ok) {
        fetchUsers()
        setDialogOpen(false)
        setNewLimit("")
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const handleLimitChange = async (userId: string, operation: "add" | "subtract") => {
    const amount = Number.parseInt(limitAmounts[userId] || "0")
    if (isNaN(amount) || amount <= 0) {
      setStatusMessages({
        ...statusMessages,
        [userId]: {
          ...statusMessages[userId],
          limit: { type: "error", message: "Please enter a valid number" },
        },
      })
      return
    }

    const user = users.find((u) => u._id === userId)
    const currentLimit = user?.limit || 100

    if (operation === "subtract" && amount > currentLimit) {
      setStatusMessages({
        ...statusMessages,
        [userId]: {
          ...statusMessages[userId],
          limit: { type: "error", message: "Cannot subtract more than current limit" },
        },
      })
      return
    }

    try {
      const action = operation === "add" ? "addLimit" : "subtractLimit"
      await handleUserAction(userId, action, undefined, amount)

      const operationText = operation === "add" ? "Added" : "Subtracted"
      setStatusMessages({
        ...statusMessages,
        [userId]: {
          ...statusMessages[userId],
          limit: {
            type: "success",
            message: `${operationText} ${amount} ${operation === "add" ? "to" : "from"} limit`,
          },
        },
      })
      setLimitAmounts({ ...limitAmounts, [userId]: "" })
    } catch (error) {
      setStatusMessages({
        ...statusMessages,
        [userId]: {
          ...statusMessages[userId],
          limit: { type: "error", message: "Failed to update limit" },
        },
      })
    }
  }

  const copyToClipboard = (userId: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKeys({ ...copiedKeys, [userId]: true })
    setTimeout(() => {
      setCopiedKeys({ ...copiedKeys, [userId]: false })
    }, 2000)
  }

  const handleSetCustomApiKey = async (userId: string) => {
    const customKey = customApiKeys[userId]
    if (!customKey || customKey.length < 6) {
      setStatusMessages({
        ...statusMessages,
        [userId]: {
          ...statusMessages[userId],
          apiKey: { type: "error", message: "Custom key must be at least 6 characters" },
        },
      })
      return
    }

    setIsSettingKey({ ...isSettingKey, [userId]: true })
    setStatusMessages({
      ...statusMessages,
      [userId]: {
        ...statusMessages[userId],
        apiKey: { type: null, message: "" },
      },
    })

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setCustomKey", customKey }),
      })

      if (response.ok) {
        fetchUsers()
        setHasApiKeyChanges({ ...hasApiKeyChanges, [userId]: false })
        setStatusMessages({
          ...statusMessages,
          [userId]: {
            ...statusMessages[userId],
            apiKey: { type: "success", message: "API key updated successfully" },
          },
        })
      } else {
        const error = await response.json()
        setStatusMessages({
          ...statusMessages,
          [userId]: {
            ...statusMessages[userId],
            apiKey: { type: "error", message: error.error || "Failed to update API key" },
          },
        })
      }
    } catch (error) {
      console.error("Failed to update API key:", error)
      setStatusMessages({
        ...statusMessages,
        [userId]: {
          ...statusMessages[userId],
          apiKey: { type: "error", message: "Failed to update API key" },
        },
      })
    } finally {
      setIsSettingKey({ ...isSettingKey, [userId]: false })
    }
  }

  const handleUpgradeUser = async (userId: string, planKey: string) => {
    setUpgrading(true)
    setStatusMessages({
      ...statusMessages,
      [userId]: {
        ...statusMessages[userId],
        plan: { type: null, message: "" },
      },
    })

    const selectedPlan = PRICING.LIST.find((p) => p.key === planKey)
    if (!selectedPlan) {
      setStatusMessages({
        ...statusMessages,
        [userId]: {
          ...statusMessages[userId],
          plan: { type: "error", message: "Selected plan not found" },
        },
      })
      setUpgrading(false)
      return
    }

    try {
      const response = await fetch("/api/admin/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, days: selectedPlan.days }), // Pass the days from the selected plan
      })

      if (response.ok) {
        fetchUsers()
        setSelectedPlan("")
        setStatusMessages({
          ...statusMessages,
          [userId]: {
            ...statusMessages[userId],
            plan: { type: "success", message: `Upgraded to ${selectedPlan.name}` },
          },
        })
      } else {
        setStatusMessages({
          ...statusMessages,
          [userId]: {
            ...statusMessages[userId],
            plan: { type: "error", message: "Failed to upgrade user" },
          },
        })
      }
    } catch (error) {
      console.error("Failed to upgrade user:", error)
      setStatusMessages({
        ...statusMessages,
        [userId]: {
          ...statusMessages[userId],
          plan: { type: "error", message: "Failed to upgrade user" },
        },
      })
    } finally {
      setUpgrading(false)
    }
  }

  const formatLimit = (limit?: number) => {
    if (!limit) return "100"
    if (limit === 999999) return "Unlimited"
    return limit.toLocaleString()
  }

  const getPlanBadge = (user: User) => {
    if (!user.premium || !user.expired || user.expired <= Date.now()) {
      return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Free</Badge>
    }

    const daysLeft = Math.ceil((user.expired - Date.now()) / (1000 * 60 * 60 * 24))

    // Find the plan that matches the user's current premium status (by duration or limit if possible)
    // This is a simplified mapping. A more robust solution might store the plan key on the user object.
    const userPlan = PRICING.LIST.find(
      (plan) => plan.days === daysLeft || (plan.limit === user.limit && plan.unlimited === user.premium),
    )

    let badgeContent
    if (userPlan) {
      let icon = null
      if (userPlan.key === "celestial" || userPlan.key === "immortal") {
        icon = <Crown className="w-3 h-3" />
      } else if (userPlan.key === "leviathan") {
        icon = <Zap className="w-3 h-3" />
      }
      badgeContent = (
        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 flex items-center gap-1">
          {icon}
          {userPlan.name} ({daysLeft} days)
        </Badge>
      )
    } else {
      // Fallback if no specific plan matches, or for older premium users
      badgeContent = (
        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Premium ({daysLeft} days)</Badge>
      )
    }
    return badgeContent
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {loading && (
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
      )}

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.map((user) => (
              <Card key={user._id} className="bg-black border-white/10 p-4">
                <div className="space-y-4">
                  {/* Header with name, role, and status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <h3 className="text-base font-medium text-white">{user.name}</h3>
                        <Badge
                          className={`text-xs ${
                            user.role === "admin"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <Badge
                      className={`${
                        !user.banned
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {!user.banned ? "active" : "nonactive"}
                    </Badge>
                  </div>

                  {/* API Key Section */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-white">API Key</h4>
                      {statusMessages[user._id]?.apiKey?.type && (
                        <div
                          className={`flex items-center space-x-1 ${
                            statusMessages[user._id].apiKey.type === "success" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {statusMessages[user._id].apiKey.type === "success" ? (
                            <CircleCheck className="h-3 w-3" />
                          ) : (
                            <TriangleAlert className="h-3 w-3" />
                          )}
                          <span className="text-xs">{statusMessages[user._id].apiKey.message}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          value={customApiKeys[user._id] || ""}
                          onChange={(e) => {
                            setCustomApiKeys({ ...customApiKeys, [user._id]: e.target.value })
                            setHasApiKeyChanges({ ...hasApiKeyChanges, [user._id]: e.target.value !== user.apiKey })
                            setStatusMessages({
                              ...statusMessages,
                              [user._id]: {
                                ...statusMessages[user._id],
                                apiKey: { type: null, message: "" },
                              },
                            })
                          }}
                          className="text-xs bg-black border-white/10 h-8 pr-8"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(user._id, user.apiKey)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-6 w-6 text-gray-400 hover:text-white"
                        >
                          {copiedKeys[user._id] ? <CircleCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetCustomApiKey(user._id)}
                        disabled={isSettingKey[user._id] || !hasApiKeyChanges[user._id]}
                        className="h-8 border-white/10 text-gray-300 hover:bg-black hover:text-white disabled:opacity-50"
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  {/* Usage Limit Section */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-white">Usage Limit</h4>
                      {statusMessages[user._id]?.limit?.type && (
                        <div
                          className={`flex items-center space-x-1 ${
                            statusMessages[user._id].limit.type === "success" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {statusMessages[user._id].limit.type === "success" ? (
                            <CircleCheck className="h-3 w-3" />
                          ) : (
                            <TriangleAlert className="h-3 w-3" />
                          )}
                          <span className="text-xs">{statusMessages[user._id].limit.message}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="bg-black border border-white/10 rounded-md p-1.5 text-xs text-gray-300">
                        {user.usage} / {formatLimit(user.limit)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          placeholder="10"
                          value={limitAmounts[user._id] || ""}
                          onChange={(e) => {
                            setLimitAmounts({ ...limitAmounts, [user._id]: e.target.value })
                            setStatusMessages({
                              ...statusMessages,
                              [user._id]: {
                                ...statusMessages[user._id],
                                limit: { type: null, message: "" },
                              },
                            })
                          }}
                          className="flex-1 h-8 bg-black border-white/10 text-white text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLimitChange(user._id, "add")}
                          className="h-8 w-8 p-0 border-green-500/20 text-green-400 hover:bg-green-500/10"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLimitChange(user._id, "subtract")}
                          className="h-8 w-8 p-0 border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Plan Section */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-white">Plan</h4>
                      {statusMessages[user._id]?.plan?.type && (
                        <div
                          className={`flex items-center space-x-1 ${
                            statusMessages[user._id].plan.type === "success" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {statusMessages[user._id].plan.type === "success" ? (
                            <CircleCheck className="h-3 w-3" />
                          ) : (
                            <TriangleAlert className="h-3 w-3" />
                          )}
                          <span className="text-xs">{statusMessages[user._id].plan.message}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">{getPlanBadge(user)}</div>
                      <div className="flex items-center gap-2">
                        <Select onValueChange={(value) => setSelectedPlan(value)}>
                          <SelectTrigger className="w-full h-8 bg-black border-white/10 text-xs">
                            <SelectValue placeholder="Select Plan" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-white/10 text-white">
                            {planOptions.map((plan) => (
                              <SelectItem key={plan.value} value={plan.value} className="text-xs">
                                {plan.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectedPlan && handleUpgradeUser(user._id, selectedPlan)}
                          disabled={!selectedPlan || upgrading}
                          className="h-8 border-white/10 text-gray-300 hover:bg-black hover:text-white text-xs"
                        >
                          {upgrading ? "..." : "Upgrade"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    {user.banned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserAction(user._id, "unban")}
                        className="flex-1 h-8 border-green-500/20 text-green-400 hover:bg-green-500/10 text-xs"
                      >
                        Unban User
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserAction(user._id, "ban")}
                        className="flex-1 h-8 border-white/10 text-gray-300 hover:bg-black hover:text-white text-xs"
                      >
                        Ban User
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user._id)}
                      className="flex-1 h-8 border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {users.length === 0 && <div className="text-center py-8 text-gray-400">No users found</div>}
        </div>
      </div>

      <Footer />
    </div>
  )
}
