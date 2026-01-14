import { getContent } from "@/lib/content"
import { Mail, Phone, MapPin, Facebook, Instagram, Link as LinkIcon, Globe } from "lucide-react"
import { getDictionary } from "@/lib/dictionaries"
import Link from "../ui/Link"

export default async function Footer({ locale = 'vi' }: { locale?: string }) {
  const content = await getContent(locale)
  const dict = await getDictionary(locale)

  // Map icon keys to Lucide components
  const iconMap: Record<string, React.ReactNode> = {
    envelope: <Mail className="w-4 h-4" />,
    phone: <Phone className="w-4 h-4" />,
    "map-marker": <MapPin className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />,
    link: <LinkIcon className="w-4 h-4" />,
    globe: <Globe className="w-4 h-4" />,
  }

  // Parse Global Data
  let globalData = { site_name: 'SEVO Education', logo_text: '', contact_info: [] }
  try {
    if (content.global) {
      globalData = typeof content.global === 'string' ? JSON.parse(content.global) : content.global
    }
  } catch (e) {
    console.error("Failed to parse global content", e)
  }

  return (
    <footer className="bg-slate-950 text-white py-12 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {globalData.site_name}
            </h3>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              {dict.footer.about_description}
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white/90">{dict.footer.contact}</h4>
            <div className="space-y-4 text-slate-400">
              {(() => {
                if (Array.isArray(globalData.contact_info) && globalData.contact_info.length > 0) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  return globalData.contact_info.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 group transition-colors hover:text-white">
                      <div className="mt-1 text-blue-400">
                        {iconMap[item.icon] || <MapPin className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</span>
                        <span className="text-sm">{item.value}</span>
                      </div>
                    </div>
                  ))
                }
                return null
              })()}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white/90">{dict.footer.information}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-white transition-colors">{dict.footer.about_us}</Link></li>
              <li><Link href="/courses" className="hover:text-white transition-colors">{dict.footer.courses}</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">{dict.footer.privacy_policy}</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">{dict.footer.terms_of_service}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500">
            {dict.footer.copyright.replace('{year}', new Date().getFullYear().toString())}
          </p>
        </div>
      </div>
    </footer>
  )
}
