"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2, AlertCircle, CheckCircle2, RefreshCw, Infinity, Zap, Crown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PRICING } from "@/config/pricing"


type PlanType = string 
type PaymentStatus = {
  state: string
  transaction_time: string
  planUpdated?: boolean
}


export default function PricingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [error, setError] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [token, setToken] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [paymentStartTime, setPaymentStartTime] = useState<number | null>(null)
  const [confirmPlan, setConfirmPlan] = useState<PlanType | null>(null)

  // Find the selected plan object from the PRICING.LIST array
  const selectedPlanObject = selectedPlan ? PRICING.LIST.find((p) => p.key === selectedPlan) : null
  const confirmPlanObject = confirmPlan ? PRICING.LIST.find((p) => p.key === confirmPlan) : null

  // Check user authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      }
    }
    checkAuth()
  }, [])

  // Handle plan selection
  const handlePlanSelect = (planKey: PlanType) => {
    if (!user) {
      router.push(`/login?from=${encodeURIComponent("/pricing")}`)
      return
    }
    setConfirmPlan(planKey)
  }

  // Initialize payment
  const initializePayment = async (planKey: PlanType) => {
    const plan = PRICING.LIST.find((p) => p.key === planKey)
    if (!plan) {
      setError("Selected plan not found.")
      return
    }
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/gateway?amount=${plan.price}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment")
      }

      setSelectedPlan(planKey)
      setQrCode(data.qris_url)
      setToken(data.id)
      setPaymentStartTime(Date.now())
      setCountdown(180) // 3 minutes
      startStatusCheck(data.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize payment")
    } finally {
      setLoading(false)
      setConfirmPlan(null)
    }
  }

  // Start status checking
  const startStatusCheck = (paymentToken: string) => {
    if (statusCheckInterval) clearInterval(statusCheckInterval)

    const interval = setInterval(() => {
      checkPaymentStatus(paymentToken)
    }, 7000)

    setStatusCheckInterval(interval)
  }

  // Check payment status
  const checkPaymentStatus = async (paymentToken: string) => {
    if (checkingStatus || !paymentStartTime) return

    // Check if expired
    if (Date.now() - paymentStartTime > 180000) {
      cleanup()
      setError("Payment session expired. Please try again.")
      return
    }

    try {
      setCheckingStatus(true)
      const response = await fetch(`/api/gateway/status?token=${paymentToken}&startTime=${paymentStartTime}`)
      const data = await response.json()

      if (!response.ok) {
        cleanup()
        setError("Payment session expired. Please try again.")
        return
      }

      setPaymentStatus(data)

      if (data.state === "SUCCESS") {
        await completePayment(paymentToken, data.transaction_time)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check payment status")
    } finally {
      setCheckingStatus(false)
    }
  }

  // Complete payment
  const completePayment = async (paymentToken: string, transactionTime: string) => {
    if (!selectedPlan || !user) return

    const plan = PRICING.LIST.find((p) => p.key === selectedPlan)
    if (!plan) {
      setError("Selected plan not found during completion.")
      return
    }

    try {
      console.log("[Payment Complete] Sending request:", {
        userId: user._id || user.id,
        plan: selectedPlan, // Send the plan key
        days: plan.days, // Send the days for the backend
        paymentToken,
        transactionTime,
      })

      const response = await fetch("/api/gateway/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id || user.id,
          plan: selectedPlan,
          days: plan.days, // Pass days to the backend
          paymentToken,
          transactionTime,
        }),
      })

      const data = await response.json()
      console.log("[Payment Complete] Response:", data)

      if (response.ok && data.status) {
        setPaymentStatus((prev) => (prev ? { ...prev, planUpdated: true } : null))

        if (statusCheckInterval) {
          clearInterval(statusCheckInterval)
          setStatusCheckInterval(null)
        }

        setTimeout(() => {
          cleanup()
          window.location.href = "/profile"
        }, 3000)
      } else {
        throw new Error(data.error || "Failed to update plan")
      }
    } catch (err) {
      console.error("[Payment Complete] Error:", err)
      setError(err instanceof Error ? err.message : "Failed to update plan")
    }
  }

  // Cleanup function
  const cleanup = () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval)
      setStatusCheckInterval(null)
    }
    setSelectedPlan(null)
    setPaymentStatus(null)
    setCountdown(null)
    setQrCode("")
    setToken("")
    setError("")
    setPaymentStartTime(null)
  }

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev !== null && prev > 0) return prev - 1
        clearInterval(interval)
        cleanup()
        return 0
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [countdown])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) clearInterval(statusCheckInterval)
    }
  }, [statusCheckInterval])

  const getPricePerDay = (price: number, days: number) => {
    if (days === 0) return 0 // Avoid division by zero
    return Math.round(price / days)
  }

  const formatLimit = (limit: number) => {
    if (limit === 999999) return "Unlimited"
    return limit.toLocaleString()
  }

  const getPlanIcon = (planKey: string) => {
    switch (planKey) {
      case "celestial":
      case "immortal":
        return <Crown className="w-5 h-5 text-yellow-500" />
      case "leviathan":
        return <Zap className="w-4 h-4 text-purple-500" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Pricing Plans</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Choose your subscription duration. Plans from 60 days and above include unlimited requests.
          </p>
        </div>

        {/* Payment Section */}
        {selectedPlanObject && ( // Use selectedPlanObject here
          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Complete Payment
                {getPlanIcon(selectedPlanObject.key)}
              </CardTitle>
              <CardDescription>
                {selectedPlanObject.name} - {formatLimit(selectedPlanObject.limit)} requests for{" "}
                {selectedPlanObject.duration}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {selectedPlanObject.name}
                      {getPlanIcon(selectedPlanObject.key)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatLimit(selectedPlanObject.limit)} requests • {selectedPlanObject.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Rp {selectedPlanObject.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Payment Method</span>
                    <span>QRIS</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status</span>
                    <Badge variant={paymentStatus?.state === "SUCCESS" ? "default" : "secondary"}>
                      {paymentStatus?.state === "SUCCESS" ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                  {paymentStatus?.state !== "SUCCESS" && countdown !== null && countdown > 0 && (
                    <div
                      className={`flex justify-between text-sm ${countdown <= 10 ? "text-red-500 animate-pulse" : "text-muted-foreground"}`}
                    >
                      <span>Expires in</span>
                      <span>
                        {Math.floor(countdown / 60)
                          .toString()
                          .padStart(2, "0")}
                        :{(countdown % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  )}
                  {paymentStatus?.transaction_time && (
                    <div className="flex justify-between text-sm">
                      <span>Date</span>
                      <span>{new Date(paymentStatus.transaction_time).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-64 h-64 border rounded-lg overflow-hidden bg-white">
                    <Image
                      src={qrCode || "/placeholder.svg"}
                      alt="QRIS Payment Code"
                      fill
                      className="object-contain p-4"
                      unoptimized
                    />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Scan this QR code using your mobile banking or e-wallet app
                  </p>
                </div>
              )}

              {/* Status Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {paymentStatus?.state === "SUCCESS" && (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <div className="flex flex-col gap-2 w-full">
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      {paymentStatus.planUpdated ? (
                        <>
                          Payment successful! Your subscription has been activated.
                          <br />
                          <span className="text-sm text-muted-foreground">Redirecting to profile in 3 seconds...</span>
                        </>
                      ) : (
                        "Payment received, activating your subscription..."
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => token && checkPaymentStatus(token)}
                  disabled={checkingStatus || !token || paymentStatus?.state === "SUCCESS"}
                  className="w-full"
                >
                  {checkingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking Payment...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Check Payment Status
                    </>
                  )}
                </Button>

                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={cleanup} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => selectedPlan && initializePayment(selectedPlan)}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "New QR Code"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PRICING.LIST.map(
            (
              plan, // Iterate directly over the array
            ) => (
              <Card
                key={plan.key} // Use plan.key as the key
                className={`flex flex-col relative ${
                  plan.isPopular
                    ? "border-blue-500 shadow-lg scale-105 z-10"
                    : plan.key === "celestial" || plan.key === "immortal"
                      ? "border-yellow-500 shadow-lg"
                      : plan.key === "leviathan"
                        ? "border-purple-500 shadow-md"
                        : "border-border hover:border-primary transition-colors"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}

                {plan.key === "celestial" ||
                  (plan.key === "immortal" && !plan.isPopular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <Badge className="bg-yellow-500 text-black">Elite</Badge>
                    </div>
                  ))}

                {plan.key === "leviathan" && !plan.isPopular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-purple-500 text-white">Pro</Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="text-xl flex items-center justify-center gap-2">
                    {plan.name}
                    {getPlanIcon(plan.key)}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {plan.unlimited ? (
                        <Infinity className="w-4 h-4" />
                      ) : (
                        <span className="font-medium">{formatLimit(plan.limit)}</span>
                      )}
                      <span>{plan.unlimited ? "Unlimited" : "Requests"}</span>
                    </div>
                    Active for {plan.duration}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">Rp {plan.price.toLocaleString()}</span>
                    <div className="text-sm text-muted-foreground mt-1">
                      ~Rp {getPricePerDay(plan.price, plan.days).toLocaleString()}/day
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-2 text-sm">
                    {plan.features?.map(
                      (
                        feature, // Use plan.features directly
                      ) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ),
                    )}
                  </ul>

                  <Button
                    className="w-full"
                    variant={
                      plan.isPopular
                        ? "default"
                        : plan.key === "celestial" || plan.key === "immortal"
                          ? "secondary"
                          : plan.key === "leviathan"
                            ? "secondary"
                            : "outline"
                    }
                    onClick={() => handlePlanSelect(plan.key as PlanType)}
                    disabled={selectedPlan !== null || confirmPlan !== null}
                  >
                    {user ? "Select Plan" : "Login to Order"}
                  </Button>
                </CardContent>
              </Card>
            ),
          )}
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={!!confirmPlan} onOpenChange={(open) => !open && setConfirmPlan(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                Confirm Subscription
                {confirmPlanObject && getPlanIcon(confirmPlanObject.key)}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                {confirmPlanObject && ( // Use confirmPlanObject here
                  <>
                    <div className="flex justify-between items-center border-b pb-2">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          {confirmPlanObject.name}
                          {getPlanIcon(confirmPlanObject.key)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatLimit(confirmPlanObject.limit)} requests • Active for {confirmPlanObject.duration}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rp {confirmPlanObject.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Features included:</p>
                      <ul className="text-sm space-y-1">
                        {confirmPlanObject.features?.map(
                          (
                            feature, // Use confirmPlanObject.features
                          ) => (
                            <li key={feature} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                    <p className="text-sm">
                      By continuing, you agree to purchase this subscription. Payment is required to activate your plan.
                    </p>
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmPlan && initializePayment(confirmPlan)}>
                Continue to Payment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a custom plan?</h2>
          <p className="text-muted-foreground mb-6">
            Contact us for custom subscription periods, higher limits, and enterprise solutions.
          </p>
          <Button asChild variant="outline">
            <Link href="https://wa.me/6281310994964?text=Hi,%20I%20need%20a%20custom%20API%20subscription">
              Contact Sales
            </Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
