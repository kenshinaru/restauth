"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Heart, Clock, Loader2, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { CONFIG } from "@/config/setting"

interface PaymentData {
  token: string
  state: string
  payment: {
    method: string
    breakdown: {
      order_amount: number
      service_fee: number
      amount_due: number
    }
    qris_url: string
  }
  timestamps: {
    created_at: string
    expires_at: string
  }
}

const EWALLET_METHODS = [
  {
    id: "DANA",
    name: "DANA",
    description: "Transfer via DANA",
    color: "bg-blue-500",
    accountNumber: CONFIG.EWALLET.DANA,
    accountName: CONFIG.EWALLET.AN,
    instructions: [
      "Buka aplikasi DANA",
      "Pilih 'Kirim' atau 'Transfer'",
      "Masukkan nomor tujuan",
      "Masukkan jumlah sesuai total bayar",
      "Konfirmasi transfer",
    ],
  },
  {
    id: "OVO",
    name: "OVO",
    description: "Transfer via OVO",
    color: "bg-purple-500",
    accountNumber: CONFIG.EWALLET.OVO,
    accountName: CONFIG.EWALLET.AN,
    instructions: [
      "Buka aplikasi OVO",
      "Pilih 'Transfer'",
      "Masukkan nomor tujuan",
      "Masukkan jumlah sesuai total bayar",
      "Konfirmasi transfer",
    ],
  },
  {
    id: "GOPAY",
    name: "GoPay",
    description: "Transfer via GoPay",
    color: "bg-green-500",
    accountNumber: CONFIG.EWALLET.GOPAY,
    accountName: CONFIG.EWALLET.AN,
    instructions: [
      "Buka aplikasi Gojek",
      "Pilih 'GoPay' > 'Kirim'",
      "Masukkan nomor tujuan",
      "Masukkan jumlah sesuai total bayar",
      "Konfirmasi transfer",
    ],
  },
]

export default function DonatePage() {
  const [amount, setAmount] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [expandedEwallet, setExpandedEwallet] = useState<string | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleAmountChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "")
    setAmount(numericValue)
  }

  const openEwalletApp = (method: (typeof EWALLET_METHODS)[0]) => {
    // Try to open the app via deep link
    window.location.href = method.deeplink

    // Fallback to app store/play store after a delay if app doesn't open
    setTimeout(() => {
      const isAndroid = /Android/i.test(navigator.userAgent)
      const fallbackUrl = isAndroid
        ? `https://play.google.com/store/search?q=${method.name}&c=apps`
        : `https://apps.apple.com/search?term=${method.name}`

      if (document.hasFocus()) {
        window.open(fallbackUrl, "_blank")
      }
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Nomor rekening berhasil disalin",
    })
  }

  const toggleEwallet = (methodId: string) => {
    setExpandedEwallet(expandedEwallet === methodId ? null : methodId)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Auto generate QRIS when amount changes
  useEffect(() => {
    if (amount && Number.parseInt(amount) >= 1000) {
      const timeoutId = setTimeout(() => {
        generatePayment()
      }, 500) // Debounce 500ms

      return () => clearTimeout(timeoutId)
    } else {
      setPaymentData(null)
    }
  }, [amount])

  const generatePayment = async () => {
    if (!amount || Number.parseInt(amount) < 1000) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/donate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseInt(amount),
          method: "QRIS",
        }),
      })

      const result = await response.json()

      if (result.status) {
        setPaymentData(result.data)
      } else {
        toast({
          title: "Error",
          description: result.msg || "Gagal generate QRIS",
          variant: "destructive",
        })
        setPaymentData(null)
      }
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentData(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {pageLoading && (
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
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-pink-500 mr-2" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Support Our Project
              </h1>
            </div>
            <p className="text-gray-400 text-lg">Bantu kami mengembangkan layanan API yang lebih baik</p>
          </div>

          {/* QRIS Card */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">QRIS Payment</h2>
            <Card className="shadow-2xl border border-white/10 bg-black backdrop-blur-sm">
              <CardContent className="p-6">
                <p className="text-gray-400 text-sm mb-6">
                  Scan QR code dengan aplikasi bank atau e-wallet favorit Anda
                </p>
                {/* Custom Amount */}
                <div>
                  <Label htmlFor="amount" className="text-sm font-medium text-gray-300">
                    Masukkan Jumlah Donasi
                  </Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                    <Input
                      id="amount"
                      type="text"
                      placeholder="0"
                      value={amount ? Number.parseInt(amount).toLocaleString("id-ID") : ""}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="pl-10 text-right bg-black border-white/10 text-white focus:border-gray-500 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum donasi Rp 1.000</p>
                </div>

                {/* QRIS Display */}
                {amount && Number.parseInt(amount) >= 1000 && (
                  <div className="mt-6">
                    <Separator className="bg-gray-800 mb-6" />
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                          <span className="ml-2 text-gray-400">Generating QRIS...</span>
                        </div>
                      ) : paymentData ? (
                        <div className="space-y-4">
                          {/* Payment Info Card */}
                          <Card className="bg-black border-white/10">
                            <CardContent className="p-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-400">Jumlah</p>
                                  <p className="font-medium text-white">
                                    {formatCurrency(paymentData.payment.breakdown.order_amount)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Biaya Admin</p>
                                  <p className="font-medium text-white">
                                    {formatCurrency(paymentData.payment.breakdown.service_fee)}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-gray-400">Total Bayar</p>
                                  <p className="font-bold text-lg text-green-400">
                                    {formatCurrency(paymentData.payment.breakdown.amount_due)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* QR Code */}
                          <div className="flex justify-center">
                            <div className="bg-white p-4 rounded-lg shadow-lg">
                              <Image
                                src={paymentData.payment.qris_url || "/placeholder.svg"}
                                alt="QRIS Code"
                                width={250}
                                height={250}
                                className="rounded-lg"
                              />
                            </div>
                          </div>

                          {/* Expiry Info */}
                          <div className="flex items-center justify-center text-sm text-gray-400">
                            <Clock className="h-4 w-4 mr-1" />
                            Expires at: {paymentData.timestamps.expires_at}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* E-Wallet Cards */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">E-Wallet Payment</h2>
            <div className="space-y-4">
              {EWALLET_METHODS.map((method) => (
                <Card key={method.id} className="border-white/10 bg-black overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header - Always visible */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-900/30 transition-colors"
                      onClick={() => toggleEwallet(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${method.color} rounded-full flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">{method.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{method.name}</h3>
                            <p className="text-sm text-gray-400">{method.description}</p>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          {expandedEwallet === method.id ? (
                            <svg
                              className="w-5 h-5 transform rotate-180 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedEwallet === method.id && (
                      <div className="border-t border-white/10 p-4 bg-gray-900/20">
                        <div className="space-y-4">
                          {/* Account Details */}
                          <div className="bg-black/50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-400">Nomor {method.name}</p>
                                <p className="font-mono text-white font-semibold">{method.accountNumber}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(method.accountNumber)}
                                className="border-white/20 text-white hover:bg-white/10"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Atas Nama (A/N)</p>
                              <p className="font-semibold text-white">{method.accountName}</p>
                            </div>
                          </div>

                          {/* Transfer Instructions */}
                          <div>
                            <p className="text-sm font-medium text-gray-300 mb-2">Cara Transfer:</p>
                            <ol className="space-y-1">
                              {method.instructions.map((instruction, index) => (
                                <li key={index} className="text-sm text-gray-400 flex">
                                  <span className="text-gray-500 mr-2">{index + 1}.</span>
                                  <span>{instruction}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Amount Display */}
                          {amount && Number.parseInt(amount) >= 1000 && paymentData && (
                            <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3">
                              <p className="text-sm text-gray-400">Jumlah yang harus ditransfer:</p>
                              <p className="text-lg font-bold text-green-400">
                                {formatCurrency(paymentData.payment.breakdown.amount_due)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Thank You Message */}
          <Card className="mt-8 bg-black border-white/10">
            <CardContent className="p-6 text-center">
              <Heart className="h-6 w-6 text-pink-500 mx-auto mb-2" />
              <p className="text-gray-300">Terima kasih atas dukungan Anda! 🙏</p>
              <p className="text-sm text-gray-500 mt-1">
                Setiap donasi membantu kami mengembangkan layanan yang lebih baik
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
