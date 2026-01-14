import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { getContent } from "@/lib/content"

export const dynamic = "force-dynamic"

const inter = Inter({ subsets: ["latin", "vietnamese"] })

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const content = await getContent(locale)
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

import { ClientProviders } from "@/components/providers/ClientProviders"
import { getDictionary } from "@/lib/dictionaries"

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const dictionary = await getDictionary(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <ClientProviders locale={locale} dictionary={dictionary}>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}

