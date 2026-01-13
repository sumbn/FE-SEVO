import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { getContent } from "@/lib/content"

export const dynamic = "force-dynamic"

const inter = Inter({ subsets: ["latin", "vietnamese"] })

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent()
  let globalData = { site_name: "SEVO Education", site_description: "Learning digital skills for the future" }
  try {
    if (content.global) {
      globalData = typeof content.global === 'string' ? JSON.parse(content.global) : content.global
    }
  } catch (e) {
    console.error("Failed to parse global content in RootLayout", e)
  }
  return {
    title: globalData.site_name || "SEVO Education",
    description: globalData.site_description || "Learning digital skills for the future",
  }
}

import { AuthProvider } from "@/components/providers/AuthProvider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
