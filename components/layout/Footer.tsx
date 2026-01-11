import { getContent } from "@/lib/content"

export default async function Footer() {
  const content = await getContent()

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{content.site_name || "Trung Tâm Giáo Dục Công Nghệ"}</h3>
            <p className="text-gray-400 max-w-sm">{content.site_description || "Học lập trình cho trẻ em - Phát triển tư duy logic và sáng tạo"}</p>
          </div>
          <div className="space-y-3 text-gray-400">
            <h4 className="text-lg font-semibold text-white mb-2">Liên hệ</h4>
            {(() => {
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const contactInfo = content.contact_info ? JSON.parse(content.contact_info) : []
                if (Array.isArray(contactInfo)) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  return contactInfo.map((item: any, idx: number) => (
                    <p key={idx}>{item.icon} {item.label}: {item.value}</p>
                  ))
                }
              } catch (e) {
                console.error("Failed to parse contact_info", e)
              }
              // Fallback
              return (
                <>
                  <p>📞 Phone: {content.contact_phone || "..."}</p>
                  <p>📧 Email: {content.contact_email || "..."}</p>
                </>
              )
            })()}
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2025 Trung Tâm Giáo Dục Công Nghệ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}