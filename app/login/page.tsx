"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, Github } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const callbackUrl = searchParams.get("redirect") || "/playground"

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(callbackUrl)
    }
  }, [status, session, router, callbackUrl])

  // Handle NextAuth errors
  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      setError("Authentication failed. Please try again.")
    }
  }, [searchParams])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    try {
      // Try NextAuth credentials first
      const result = await signIn("credentials", {
        username: formData.get("username") as string,
        password: formData.get("password") as string,
        redirect: false,
      })

      if (result?.error) {
        // If NextAuth fails, try the original API
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.get("username"),
            password: formData.get("password"),
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Login failed")
        }

        // For original API login, redirect manually
        router.push(callbackUrl)
      } else if (result?.ok) {
        // NextAuth success
        router.push(callbackUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "github") => {
    setSocialLoading(provider)
    setError(null)

    try {
      const result = await signIn(provider, {
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError(`${provider} login failed. Please try again.`)
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (err) {
      setError(`${provider} login failed. Please try again.`)
    } finally {
      setSocialLoading(null)
    }
  }

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Log in</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="w-full font-medium"
              onClick={() => handleSocialLogin("github")}
              disabled={isLoading || socialLoading !== null}
            >
              {socialLoading === "github" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}
              GitHub
            </Button>
            <Button
              variant="outline"
              className="w-full font-medium"
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading || socialLoading !== null}
            >
              {socialLoading === "google" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
              )}
              Google
            </Button>
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Enter your username"
                required
                disabled={isLoading || socialLoading !== null}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                placeholder="Enter your password"
                type="password"
                required
                disabled={isLoading || socialLoading !== null}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              disabled={isLoading || socialLoading !== null}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
