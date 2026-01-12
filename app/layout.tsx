import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export const dynamic = "force-dynamic"

const inter = Inter({ subsets: ["latin", "vietnamese"] })

import { getContent } from "@/lib/content"

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent()

  let globalData = { site_name: "Trung Tâm Giáo Dục Công Nghệ", site_description: "Học lập trình cho trẻ em - Phát triển tư duy logic và sáng tạo" }
  try {
    if (content.global) {
      globalData = typeof content.global === 'string' ? JSON.parse(content.global) : content.global
    }
  } catch (e) {
    console.error("Failed to parse global content in RootLayout", e)
  }

  return {
    title: globalData.site_name || "Trung Tâm Giáo Dục Công Nghệ",
    description: globalData.site_description || "Học lập trình cho trẻ em - Phát triển tư duy logic và sáng tạo",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
