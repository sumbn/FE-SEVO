'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { getContent } from "@/lib/content"

export default function Header() {
  const [content, setContent] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    getContent().then(setContent)
  }, [])

  let globalData: {
    logo_text?: string
    logo?: { text?: string; src?: string }
    nav_menu?: any[]
    nav_ctas?: any[]
  } = { logo_text: "SEVO" }

  try {
    if (content?.global) {
      globalData = typeof content.global === 'string' ? JSON.parse(content.global) : content.global
    }
  } catch (e) {
    console.error("Failed to parse global content in Header", e)
  }

  const logoText = globalData.logo?.text || globalData.logo_text || "SEVO"
  const logoImage = globalData.logo?.src

  // Default Menu if CMS is empty
  const defaultMenu = [
    {
      label: "ĐÀO TẠO",
      type: "dropdown",
      items: [
        { label: "Lập trình chuyên sâu", sublabel: "Từ Zero đến Hero", href: "/courses/dev", color: "neon-blue" },
        { label: "Ngoại ngữ công nghệ", sublabel: "IELTS & Giao tiếp IT", href: "/courses/lang", color: "neon-pink" },
        { label: "Lịch khai giảng", href: "/schedule", icon: "calendar" }
      ]
    },
    {
      label: "DỊCH VỤ PHẦN MỀM",
      type: "dropdown",
      items: [
        { label: "Giải pháp Web/App", sublabel: "Custom Development", href: "/services/web-app" },
        { label: "Chuyển đổi số", sublabel: "Automation & Cloud", href: "/services/digital-transformation" },
        { label: "Tư vấn công nghệ", sublabel: "Architecture & Strategy", href: "/services/consulting" }
      ]
    },
    { label: "Về SEVO", href: "/about" },
    { label: "Blog", href: "/blog" }
  ]

  const menuItems = globalData.nav_menu || defaultMenu
  const ctas = globalData.nav_ctas || [
    { label: "Học viên", href: "/admin/login", variant: "glass", icon: "user" },
    { label: "Tư vấn Dự án", href: "#contact", variant: "primary" }
  ]

  // Robust visibility filter: item.visible is either undefined (assumed ON) or true.
  // Explicitly hidden only if visible === false.
  const filterVisible = (items: any[]) => items.filter((item: any) => item.visible !== false)

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[#050b14]/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
      <nav className="container mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* LEFT: LOGO */}
          <div className="shrink-0">
            <Link href="/" className="flex flex-col items-start group transition-transform hover:scale-105">
              {logoImage ? (
                <img src={logoImage} alt={logoText} className="h-8 w-auto mb-0.5 object-contain" />
              ) : (
                <span className="text-2xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                  {logoText.slice(0, -2)}<span className="text-neon-pink">{logoText.slice(-2)}</span>
                </span>
              )}
              <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-blue-400 -mt-1 opacity-80">Tech Ecosystem</span>
            </Link>
          </div>

          {/* CENTER: PRIMARY NAV (Desktop) */}
          <ul className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {filterVisible(menuItems).map((item, idx) => {
              if (item.type === 'dropdown') {
                const subItems = filterVisible(item.items || [])
                return (
                  <li key={idx} className="relative group/dropdown">
                    <button className="flex items-center gap-1.5 text-gray-300 group-hover/dropdown:text-white font-semibold transition-all text-xs uppercase tracking-widest py-2">
                      {item.label}
                      <svg className="w-3.5 h-3.5 transition-transform group-hover/dropdown:rotate-180 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </button>

                    <div className="absolute top-full left-0 mt-1 w-64 bg-[#0d1625]/95 backdrop-blur-3xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 transform origin-top scale-95 group-hover/dropdown:scale-100 overflow-hidden">
                      <div className="p-2 space-y-1">
                        {subItems.map((sub: any, sIdx: number) => (
                          <Link
                            key={sIdx}
                            href={sub.href || "#"}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all group/item ${sub.icon ? 'border-t border-white/5 mt-1' : ''}`}
                          >
                            {sub.color ? (
                              <div className={`w-2 h-2 rounded-full ${sub.color === 'neon-blue' ? 'bg-neon-blue shadow-[0_0_8px_var(--color-neon-blue)]' : 'bg-neon-pink shadow-[0_0_8px_var(--color-neon-pink)]'}`}></div>
                            ) : sub.icon === 'calendar' ? (
                              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                            ) : null}
                            <div className="flex-1">
                              <div className="font-bold">{sub.label}</div>
                              {sub.sublabel && <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{sub.sublabel}</div>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </li>
                )
              }
              return (
                <li key={idx}>
                  <Link href={item.href || "#"} className="text-gray-300 hover:text-white font-semibold transition-colors text-xs uppercase tracking-widest">
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* RIGHT: CTA/AUTH */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {filterVisible(ctas).map((cta, idx) => (
              <Link
                key={idx}
                href={cta.href || "#"}
                className={`flex items-center gap-2 px-5 md:px-6 py-2.5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-[0.15em] transition-all border ${cta.variant === 'glass'
                  ? 'hidden sm:flex glass-panel text-gray-300 hover:text-white border-white/5 hover:border-white/20'
                  : 'relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 border-blue-400/30'
                  }`}
              >
                {cta.icon === 'user' && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                )}
                <span className="relative z-10">{cta.label}</span>
                {cta.variant !== 'glass' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </Link>
            ))}

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white p-2 glass-panel rounded-lg border border-white/10 active:scale-90 transition-transform"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-6 animate-in slide-in-from-top duration-300">
            <ul className="space-y-4">
              {filterVisible(menuItems).map((item, idx) => (
                <li key={idx} className="space-y-2">
                  <div className="text-neon-pink text-[10px] font-black tracking-widest uppercase opacity-50 px-2">{item.label}</div>
                  {item.items ? (
                    <div className="grid gap-2 pl-2">
                      {filterVisible(item.items).map((sub: any, sIdx: number) => (
                        <Link
                          key={sIdx}
                          href={sub.href || "#"}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-bold text-white">{sub.label}</div>
                            {sub.sublabel && <div className="text-[9px] text-gray-500 uppercase tracking-tighter">{sub.sublabel}</div>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      onClick={() => setIsMenuOpen(false)}
                      className="block p-3 rounded-xl bg-white/5 border border-white/5 text-sm font-bold text-gray-300 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}
