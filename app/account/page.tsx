"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Settings, Key, RefreshCw, X, Loader2, Check, TriangleAlert } from "lucide-react"
import Image from "next/image"

interface UserData {
  name: string
  email: string
  username: string
  apikey: string
  premium?: boolean
  expired?: number
}

export default function AccountPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [customKey, setCustomKey] = useState("")
  const [settingCustomKey, setSettingCustomKey] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const [apiKeyStatus, setApiKeyStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })
  const [profileStatus, setProfileStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })
  const [hasApiKeyChanged, setHasApiKeyChanged] = useState(false)
  const [originalApiKey, setOriginalApiKey] = useState("")

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const data = await response.json()
          setUserData(data.user)
          setOriginalApiKey(data.user.apikey)
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setProfileStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData?.name,
          email: userData?.email,
          username: userData?.username,
        }),
      })

      if (response.ok) {
        setProfileStatus({ type: "success", message: "Profile updated successfully!" })
      } else {
        const error = await response.json()
        setProfileStatus({ type: "error", message: error.error || "Failed to update profile" })
      }
    } catch (error) {
      console.error("Update failed:", error)
      setProfileStatus({ type: "error", message: "Failed to update profile" })
    } finally {
      setUpdating(false)
    }
  }

  const handleRegenerateApiKey = async () => {
    setShowConfirmModal(false)
    setRegenerating(true)

    try {
      const response = await fetch("/api/users/apikey/regenerate", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setUserData((prev) => (prev ? { ...prev, apikey: data.apikey } : null))
        alert("API key regenerated successfully!")
      } else {
        alert("Failed to regenerate API key")
      }
    } catch (error) {
      console.error("Regeneration failed:", error)
      alert("Failed to regenerate API key")
    } finally {
      setRegenerating(false)
    }
  }

  const handleSetCustomKey = async () => {
    if (!customKey || customKey.length < 6) {
      alert("Custom key must be at least 6 characters")
      return
    }

    setSettingCustomKey(true)

    try {
      const response = await fetch("/api/users/apikey/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customKey }),
      })

      if (response.ok) {
        const data = await response.json()
        setUserData((prev) => (prev ? { ...prev, apikey: data.apikey } : null))
        setCustomKey("")
        alert("Custom API key set successfully!")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to set custom key")
      }
    } catch (error) {
      console.error("Custom key failed:", error)
      alert("Failed to set custom key")
    } finally {
      setSettingCustomKey(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordStatus({ type: null, message: "" })

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords do not match" })
      return
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "Password must be at least 6 characters" })
      return
    }

    setChangingPassword(true)

    try {
      const response = await fetch("/api/users/apikey/change", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        setPasswordStatus({ type: "success", message: "Password changed successfully!" })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        const error = await response.json()
        setPasswordStatus({ type: "error", message: error.error || "Failed to change password" })
      }
    } catch (error) {
      console.error("Password change failed:", error)
      setPasswordStatus({ type: "error", message: "Failed to change password" })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleChangeApiKey = async () => {
    setRegenerating(true)
    setApiKeyStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/users/apikey/regenerate", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setUserData((prev) => (prev ? { ...prev, apikey: data.apikey } : null))
        setOriginalApiKey(data.apikey)
        setHasApiKeyChanged(false)
        setApiKeyStatus({ type: "success", message: "API key regenerated successfully!" })
      } else {
        setApiKeyStatus({ type: "error", message: "Failed to regenerate API key" })
      }
    } catch (error) {
      console.error("Regeneration failed:", error)
      setApiKeyStatus({ type: "error", message: "Failed to regenerate API key" })
    } finally {
      setRegenerating(false)
    }
  }

  const handleCustomApiKeyChange = async (newApiKey: string) => {
    if (!newApiKey || newApiKey.length < 6) {
      setApiKeyStatus({ type: "error", message: "Custom key must be at least 6 characters" })
      return
    }

    setSettingCustomKey(true)
    setApiKeyStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/users/apikey/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customKey: newApiKey }),
      })

      if (response.ok) {
        const data = await response.json()
        setUserData((prev) => (prev ? { ...prev, apikey: data.apikey } : null))
        setOriginalApiKey(data.apikey)
        setHasApiKeyChanged(false)
        setApiKeyStatus({ type: "success", message: "Custom API key set successfully!" })
      } else {
        const error = await response.json()
        setApiKeyStatus({ type: "error", message: error.error || "Failed to set custom key" })
      }
    } catch (error) {
      console.error("Custom key failed:", error)
      setApiKeyStatus({ type: "error", message: "Failed to set custom key" })
    } finally {
      setSettingCustomKey(false)
    }
  }

  const handleSubmitApiKey = async () => {
    if (userData?.apikey) {
      await handleCustomApiKeyChange(userData.apikey)
    }
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-black border border-white/10 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Confirm API Key Regeneration</h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to regenerate your API key? This will invalidate your current key and may break
              existing integrations.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={handleRegenerateApiKey}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={regenerating}
              >
                {regenerating ? "Regenerating..." : "Yes, Regenerate"}
              </Button>
              <Button
                onClick={() => setShowConfirmModal(false)}
                variant="outline"
                className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-500/10"
                disabled={regenerating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Account Settings</h1>

          <div className="space-y-6">
            {/* Profile Settings */}
            <Card className="bg-black border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Profile Settings</span>
                  </div>
                  {profileStatus.type && (
                    <div
                      className={`flex items-center space-x-1 ${profileStatus.type === "success" ? "text-green-400" : "text-red-400"}`}
                    >
                      {profileStatus.type === "success" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <TriangleAlert className="h-4 w-4" />
                      )}
                      <span className="text-sm">{profileStatus.message}</span>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>Update your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={userData?.name || ""}
                      onChange={(e) => setUserData((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                      className="bg-gray-900 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData?.email || ""}
                      onChange={(e) => setUserData((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                      className="bg-gray-900 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={userData?.username || ""}
                      onChange={(e) => setUserData((prev) => (prev ? { ...prev, username: e.target.value } : null))}
                      className="bg-gray-900 border-white/10"
                    />
                    <p className="text-xs text-gray-400">Username must be unique</p>
                  </div>

                  <Button type="submit" disabled={updating} className="w-full bg-blue-600 hover:bg-blue-700">
                    {updating ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="bg-black border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>Change Password</span>
                  </div>
                  {passwordStatus.type && (
                    <div
                      className={`flex items-center space-x-1 ${passwordStatus.type === "success" ? "text-green-400" : "text-red-400"}`}
                    >
                      {passwordStatus.type === "success" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <TriangleAlert className="h-4 w-4" />
                      )}
                      <span className="text-sm">{passwordStatus.message}</span>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-gray-900 border-white/10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-gray-900 border-white/10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-gray-900 border-white/10"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={changingPassword} className="w-full bg-blue-600 hover:bg-blue-700">
                    {changingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* API Key Management */}
            <Card className="bg-black border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>API Key Management</span>
                  </div>
                  {apiKeyStatus.type && (
                    <div
                      className={`flex items-center space-x-1 ${apiKeyStatus.type === "success" ? "text-green-400" : "text-red-400"}`}
                    >
                      {apiKeyStatus.type === "success" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <TriangleAlert className="h-4 w-4" />
                      )}
                      <span className="text-sm">{apiKeyStatus.message}</span>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>Manage your API authentication key</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current API Key</Label>
                  <div className="relative">
                    <Input
                      value={userData?.apikey || ""}
                      onChange={(e) => {
                        if (userData?.premium && userData?.expired && userData.expired > Date.now()) {
                          setUserData((prev) => (prev ? { ...prev, apikey: e.target.value } : null))
                          setHasApiKeyChanged(e.target.value !== originalApiKey)
                          setApiKeyStatus({ type: null, message: "" })
                        }
                      }}
                      readOnly={!(userData?.premium && userData?.expired && userData.expired > Date.now())}
                      type="text"
                      className="bg-gray-900 border-white/10 pr-10"
                    />
                    <button
                      onClick={handleChangeApiKey}
                      disabled={regenerating || settingCustomKey}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      type="button"
                    >
                      {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </button>
                  </div>
                  {hasApiKeyChanged && userData?.premium && userData?.expired && userData.expired > Date.now() && (
                    <Button
                      onClick={handleSubmitApiKey}
                      disabled={settingCustomKey}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {settingCustomKey ? "Saving..." : "Save API Key"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
