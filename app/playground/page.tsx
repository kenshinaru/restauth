"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Heart, Play, Activity, Gauge, Globe, ChevronDown, ChevronRight, Loader2, Lock } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { CONFIG } from "@/config/setting"
import { ENDPOINT_CATEGORIES, type EndpointConfig } from "@/config/endpoints"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import Image from "next/image"

export default function HomePage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig | null>(null)
  const [paramValues, setParamValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [apiKey, setApiKey] = useState("")
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [tempApiKey, setTempApiKey] = useState("")

  const baseUrl = CONFIG.getBaseUrl()


  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Group endpoints by category directly
  const endpointsByCategory = ENDPOINT_CATEGORIES.reduce(
    (acc, category) => {
      acc[category.category] = category.endpoints
      return acc
    },
    {} as Record<string, EndpointConfig[]>,
  )

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey)
    setShowApiKeyDialog(false)
    setTempApiKey("")
  }

  const handleCancelApiKey = () => {
    setShowApiKeyDialog(false)
    setTempApiKey("")
  }

  const handleProcess = async () => {
    if (!selectedEndpoint) return

    // Check if all required parameters are filled
    const missingParams = selectedEndpoint.params.filter((param) => !paramValues[param]?.trim())
    if (missingParams.length > 0) {
      alert(`Please fill in all required parameters: ${missingParams.join(", ")}`)
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const queryParams = new URLSearchParams()
      selectedEndpoint.params.forEach((param) => {
        if (paramValues[param]?.trim()) {
          queryParams.append(param, paramValues[param].trim())
        }
      })

      const apiUrl = `${baseUrl}/api${selectedEndpoint.path}?${queryParams.toString()}`
      const headers: Record<string, string> = {}

      if (apiKey) {
        headers["X-API-Key"] = apiKey
      }

      const response = await fetch(apiUrl, { headers })
      const data = await response.json()

      setResult(data)
    } catch (error) {
      setResult({ error: "Failed to make request" })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentUrl = () => {
    if (!selectedEndpoint) return ""

    const queryParams = new URLSearchParams()
    selectedEndpoint.params.forEach((param) => {
      if (paramValues[param]?.trim()) {
        queryParams.append(param, paramValues[param].trim())
      }
    })

    return `${baseUrl}/api${selectedEndpoint.path}?${queryParams.toString()}`
  }

  const getPlaceholderText = (paramName: string) => {
    switch (paramName.toLowerCase()) {
      case "url":
        return "Enter URL here..."
      case "username":
        return "Enter username here..."
      case "id":
        return "Enter ID here..."
      case "q":
        return "Enter search query here..."
      case "session":
        return "Enter session ID here..."
      case "system":
        return "Enter system prompt here..."
      case "file":
        return "Enter file URL or path here..."
      default:
        return `Enter ${paramName} here...`
    }
  }

  const getParamDescription = (paramName: string) => {
    switch (paramName.toLowerCase()) {
      case "url":
        return "The URL to process with this endpoint"
      case "username":
        return "The username to process with this endpoint"
      case "id":
        return "The ID to process with this endpoint"
      case "q":
        return "The search query to process with this endpoint"
      case "session":
        return "Session ID for maintaining conversation context"
      case "system":
        return "System prompt to guide the AI behavior"
      case "file":
        return "File URL or path to process"
      default:
        return `The ${paramName} to process with this endpoint`
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Loading Overlay */}
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
      <Navbar />

      {/* Hero Section - Mobile Optimized */}
      <section className="py-10 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
            Documentation
          </h2>
          <p className="text-base md:text-xl text-gray-400 mb-6 md:mb-8 max-w-2xl mx-auto">{CONFIG.APP.DESCRIPTION}</p>

          {/* Rate Limit & Base URL Info - Mobile Optimized */}
          <div className="bg-black border border-white/10 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Gauge className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">Rate Limit :</span>
                  <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs">
                    {CONFIG.RATE_LIMIT.MESSAGE}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">Base URL :</span>
                </div>
              </div>
              <div className="bg-black p-3 rounded border border-white/10 relative">
                <code className="text-sm text-green-400 break-all">{baseUrl}</code>
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(baseUrl)} className="h-6 w-6 p-0">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            <Link href="/donate" passHref>
              <Badge className="bg-pink-500/10 text-pink-400 border-pink-500/20 text-xs">
                <Heart className="h-3 w-3 mr-1" />
                Donate
              </Badge>
            </Link>
            <Badge
              className="bg-green-500/10 text-green-400 border-green-500/20 text-xs cursor-pointer hover:bg-green-500/20"
              onClick={() => setShowApiKeyDialog(true)}
            >
              <Lock className="h-3 w-3 mr-1" />
              Authentication
            </Badge>
            <Link href="/stats" passHref>
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Statistic
              </Badge>
            </Link>
          </div>
        </div>
      </section>

      {/* API Documentation - Mobile Optimized */}
      <div className="container mx-auto px-4 pb-20">
        <Tabs defaultValue={Object.keys(endpointsByCategory)[0]} className="w-full">
          {/* Mobile-friendly tabs */}
          <div className="overflow-x-auto">
            <TabsList
              className="grid bg-black border border-white/10 min-w-max w-full"
              style={{ gridTemplateColumns: `repeat(${Object.keys(endpointsByCategory).length}, minmax(0, 1fr))` }}
            >
              {Object.keys(endpointsByCategory).map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-blue-600 text-xs md:text-sm px-2 md:px-4 capitalize"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {Object.entries(endpointsByCategory).map(([category, endpoints]) => (
            <TabsContent key={category} value={category} className="space-y-4 md:space-y-6 mt-4 md:mt-6">
              {endpoints.map((endpoint, index) => (
                <EndpointCard
                  key={index}
                  endpoint={endpoint}
                  baseUrl={baseUrl}
                  onTryIt={() => {
                    setSelectedEndpoint(endpoint)
                    setParamValues({})
                  }}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Process Modal - Fixed Width with Scrollable JSON */}
      <Dialog
        open={!!selectedEndpoint}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEndpoint(null)
            setResult(null)
            setParamValues({})
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] bg-black border-white/10 flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center space-x-2">
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs px-2 py-1">
                {selectedEndpoint?.method.toUpperCase()}
              </Badge>
              <code className="text-sm font-mono text-blue-400">/api{selectedEndpoint?.path}</code>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Test this API endpoint with the required parameters
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0">
            {selectedEndpoint && (
              <div className="space-y-4 md:space-y-6 p-1">
                {/* Parameters Form */}
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold">Parameters</h3>
                  <div className="space-y-4">
                    {selectedEndpoint.params.map((param) => (
                      <div key={param} className="space-y-2">
                        <Label className="flex items-center space-x-2">
                          <span className="text-sm md:text-base">{param}</span>
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">Required</Badge>
                        </Label>
                        <Input
                          placeholder={getPlaceholderText(param)}
                          value={paramValues[param] || ""}
                          onChange={(e) => setParamValues((prev) => ({ ...prev, [param]: e.target.value }))}
                          className="bg-black border-white/10"
                        />
                        <p className="text-xs md:text-sm text-gray-400">{getParamDescription(param)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Process Button */}
                <Button
                  onClick={handleProcess}
                  disabled={loading || selectedEndpoint.params.some((param) => !paramValues[param]?.trim())}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Process
                    </>
                  )}
                </Button>

                {/* Copy URL Button */}
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(getCurrentUrl())}
                  disabled={selectedEndpoint.params.some((param) => !paramValues[param]?.trim())}
                  className="w-full border-white/10 hover:bg-white/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>

                {/* Response with Syntax Highlighting - Fixed Container */}
                {result && (
                  <div className="space-y-2">
                    <h3 className="text-base md:text-lg font-semibold">Response</h3>
                    <div className="w-full border border-white/10 rounded-lg overflow-hidden">
                      <div className="max-h-96 overflow-auto">
                        <SyntaxHighlighter
                          language="json"
                          style={atomDark}
                          customStyle={{
                            margin: 0,
                            padding: "1rem",
                            background: "transparent",
                            fontSize: "0.875rem",
                            lineHeight: "1.25rem",
                            maxWidth: "100%",
                            wordBreak: "break-all",
                            whiteSpace: "pre-wrap",
                          }}
                          wrapLines={true}
                          wrapLongLines={true}
                        >
                          {JSON.stringify(result, null, 2)}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="w-[95vw] max-w-md bg-black border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>API Key</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">Enter your API key to authenticate requests</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apikey">API Key</Label>
              <Input
                id="apikey"
                type="password"
                placeholder="Enter your API key..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="bg-black border-white/10"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSaveApiKey} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Save
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelApiKey}
                className="flex-1 border-white/10 hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}

function EndpointCard({
  endpoint,
  baseUrl,
  onTryIt,
}: {
  endpoint: EndpointConfig
  baseUrl: string
  onTryIt: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const getParamTypeDescription = (paramName: string) => {
    switch (paramName.toLowerCase()) {
      case "url":
        return "URL to process"
      case "username":
        return "Username to process"
      case "id":
        return "ID to process"
      case "q":
        return "Search query to process"
      case "session":
        return "Session ID for context"
      case "system":
        return "System prompt for AI"
      case "file":
        return "File URL or path"
      default:
        return `${paramName} to process`
    }
  }

  return (
    <Card className="bg-black border-white/10 hover:border-white/20 transition-colors">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="pb-3 md:pb-4 cursor-pointer hover:bg-white/5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs px-2 py-1">
                  {endpoint.method.toUpperCase()}
                </Badge>
                <code className="text-sm font-mono text-blue-400">/api{endpoint.path}</code>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="mt-2">
              <CardTitle className="text-base md:text-lg capitalize">{endpoint.name}</CardTitle>
              <CardDescription className="text-sm md:text-base text-gray-400">
                Process {endpoint.params.join(", ")} using the {endpoint.path.replace("/", "")} endpoint
              </CardDescription>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-3 md:space-y-4 pt-0">
            {/* Parameters */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm md:text-base">Parameters:</h4>
              <div className="space-y-1">
                {endpoint.params.map((param) => (
                  <div
                    key={param}
                    className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs md:text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <code className="text-blue-400">{param}</code>
                      <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20 text-xs">string</Badge>
                      <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">Required</Badge>
                    </div>
                    <span className="text-gray-400">- {getParamTypeDescription(param)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Process Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={onTryIt} className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                  <Play className="h-4 w-4 mr-2" />
                  Try it
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
