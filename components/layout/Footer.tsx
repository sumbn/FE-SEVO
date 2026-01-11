import { getContent } from "@/lib/content"

export default async function Footer() {
  const content = await getContent()

  // Parse Global Data
  let globalData = { site_name: 'Trung Tâm Giáo Dục Công Nghệ', logo_text: '', contact_info: [] }
  try {
    if (content.global) {
      globalData = typeof content.global === 'string' ? JSON.parse(content.global) : content.global
    }
  } catch (e) {
    console.error("Failed to parse global content", e)
  }

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{globalData.site_name}</h3>
            {/* Description placeholder or move to global later if needed */}
            <p className="text-gray-400 max-w-sm">Học lập trình cho trẻ em - Phát triển tư duy logic và sáng tạo</p>
          </div>
          <div className="space-y-3 text-gray-400">
            <h4 className="text-lg font-semibold text-white mb-2">Liên hệ</h4>
            {(() => {
              if (Array.isArray(globalData.contact_info) && globalData.contact_info.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return globalData.contact_info.map((item: any, idx: number) => (
                  <p key={idx}>{item.icon} {item.label}: {item.value}</p>
                ))
              }
              // If empty, show nothing
              return null
            })()}
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {globalData.site_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}