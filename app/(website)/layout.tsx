import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </>
  )
}
