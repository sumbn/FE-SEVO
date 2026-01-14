import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export default async function WebsiteLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <>
      <Header />
      <div className="flex-grow">
        {children}
      </div>
      <Footer locale={locale} />
    </>
  )
}
