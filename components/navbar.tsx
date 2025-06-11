"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User, DollarSign, Settings, LogOut, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface UserData {
  name: string
  email: string
  username: string
  role: "admin" | "user"
}

export function Navbar() {
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <nav className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Image */}
          <Link href="/playground" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Logo" width={102} height={102} className="rounded-sm" />
          </Link>

          {/* Profile Dropdown */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10">
                  <User className="h-4 w-4" />
                  <span className="sr-only">Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black border-white/10" align="end">
                <div className="flex items-center space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                    <AvatarFallback className="bg-gray-700 text-white">
                      {userData ? getInitials(userData.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-white">
                        {loading ? "Loading..." : userData?.name || "User"}
                      </p>
                      {userData?.role && (
                        <Badge
    className={`text-xs px-1 py-0 ${
      userData.role === "admin"
        ? "bg-red-500/10 text-red-400 border-red-500/20"
        : userData.premium
          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
    }`}
  >
    {userData.role === "admin"
      ? "admin"
      : userData.premium
        ? "premium"
        : "free"}
  </Badge>
)}
                    </div>
                    <p className="text-xs text-gray-400">
                      {loading ? "Loading..." : userData?.email || "user@example.com"}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className="text-white hover:bg-white/10 cursor-pointer">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-white hover:bg-white/10 cursor-pointer">
                  <Link href="/account">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-white hover:bg-white/10 cursor-pointer">
                  <Link href="/pricing">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Pricing</span>
                  </Link>
                </DropdownMenuItem>
                {userData?.role === "admin" && (
                  <DropdownMenuItem asChild className="text-white hover:bg-white/10 cursor-pointer">
                    <Link href="/dashboard">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
