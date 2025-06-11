import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CONFIG } from "@/config/setting"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: CONFIG.APP.TITLE,
  description: CONFIG.APP.DESCRIPTION,
  icons: {
    icon: "/favicon.ico",
  },
  keywords: ["api", "documentation", "tiktok", "downloader", "social media"],
  authors: [{ name: CONFIG.API.CREATOR }],
  openGraph: {
    title: CONFIG.APP.TITLE,
    description: CONFIG.APP.DESCRIPTION,
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
