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
  return {
    title: content.site_title || "Trung Tâm Giáo Dục Công Nghệ",
    description: content.site_description || "Học lập trình cho trẻ em - Phát triển tư duy logic và sáng tạo",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
