"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { User, Mail, AtSign, Shield } from "lucide-react"
import Image from "next/image"

interface UserData {
  name: string
  email: string
  username: string
  role: "admin" | "user"
  apikey: string
  usage: number,
  limit: number,
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const data = await response.json()
          setUserData(data.user)
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Profile</h1>

          <Card className="bg-black border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>User Information</span>
              </CardTitle>
              <CardDescription>Your account details and API information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Name</span>
                  </Label>
                  <Input value={userData?.name || ""} readOnly className="bg-gray-900 border-white/10" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <AtSign className="h-4 w-4" />
                    <span>Username</span>
                  </Label>
                  <Input value={userData?.username || ""} readOnly className="bg-gray-900 border-white/10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </Label>
                <Input value={userData?.email || ""} readOnly className="bg-gray-900 border-white/10" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Role</span>
                </Label>
                <div>
                  <Badge
                     className={`${
                        userData?.premium
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                       }`}
                     >
                   {userData?.premium ? "Premium" : "Free"}
                 </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    value={userData?.apikey || ""}
                    readOnly
                    type="text"
                    className="bg-gray-900 border-white/10"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(userData?.apikey || "")}
                    className="border-white/10 hover:bg-white/10"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Usage</Label>
                <div className="text-sm text-gray-400">{userData?.usage || 0} / {userData?.limit >= "999999" ? "Unlimited" : userData?.limit} requests today</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
