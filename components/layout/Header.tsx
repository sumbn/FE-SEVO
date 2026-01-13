import Link from "next/link"
import { getContent } from "@/lib/content"

export default async function Header() {
  const content = await getContent()

  let globalData: { logo_text?: string; logo?: { text?: string; src?: string } } = { logo_text: "Tech Center" }
  try {
    if (content.global) {
      globalData = typeof content.global === 'string' ? JSON.parse(content.global) : content.global
    }
  } catch (e) {
    console.error("Failed to parse global content in Header", e)
  }

  const logoText = globalData.logo?.text || globalData.logo_text || "Tech Center"
  const logoImage = globalData.logo?.src

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/5 shadow-2xl">
      <nav className="container mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* LEFT: LOGO */}
          <div className="shrink-0">
            <Link href="/" className="flex flex-col items-start group transition-transform hover:scale-105">
              {logoImage && (
                <img src={logoImage} alt={logoText} className="h-8 w-auto mb-0.5 object-contain" />
              )}
              {logoText && (
                <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 leading-tight tracking-tight">
                  {logoText}
                </span>
              )}
            </Link>
          </div>

          {/* CENTER: PRIMARY NAV */}
          <ul className="hidden lg:flex items-center space-x-8">
            <li>
              <Link href="/" className="text-gray-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wider">
                Trang chủ
              </Link>
            </li>

            {/* DROPDOWN: KHÓA HỌC */}
            <li className="relative group/dropdown">
              <button className="flex items-center gap-1 text-gray-300 group-hover/dropdown:text-white font-medium transition-colors text-sm uppercase tracking-wider">
                Khóa học
                <svg className="w-4 h-4 transition-transform group-hover/dropdown:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 transform origin-top scale-95 group-hover/dropdown:scale-100 overflow-hidden">
                <Link href="/courses/dev" className="block px-5 py-3 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 transition-colors">Lập trình</Link>
                <Link href="/courses/lang" className="block px-5 py-3 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 transition-colors">Ngoại ngữ</Link>
                <Link href="/admin/courses" className="block px-5 py-3 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 border-t border-white/5 font-semibold">Edit</Link>
              </div>
            </li>

            <li><Link href="/schedule" className="text-gray-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wider">Lịch khai giảng</Link></li>
            <li><Link href="/about" className="text-gray-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wider">Về chúng tôi</Link></li>
            <li><Link href="/blog" className="text-gray-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wider">Blog</Link></li>
          </ul>

          {/* RIGHT: CTA/AUTH */}
          <div className="flex items-center space-x-4 md:space-x-6">
            <Link href="/admin/login" className="hidden sm:block text-gray-400 hover:text-white text-sm font-semibold transition-colors uppercase tracking-widest">
              Đăng nhập
            </Link>

            <Link
              href="#contact"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 md:px-7 py-2.5 rounded-full font-bold text-xs md:text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:scale-105 active:scale-95 transition-all border border-blue-400/20"
            >
              Tư vấn lộ trình
            </Link>

            {/* Mobile Toggle Placeholder */}
            <button className="lg:hidden text-white p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}