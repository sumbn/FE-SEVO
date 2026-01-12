'use client'

import dynamic from 'next/dynamic'
import { ContentMap } from "@/types/content"

// Load 3D background only on client side (removed from here, handled globally)
// const TechBackground = dynamic(() => import('./ui/TechBackground'), { ssr: false })

export default function Hero({ content }: { content: ContentMap }) {
  // Access the hero object (it might be a JSON string from API or parsed object depending on fetcher)
  // Our fetcher usually returns strings, so we parse it.
  let heroData = { title: '', subtitle: '', ctas: [] }
  try {
    if (content && content.hero) {
      heroData = typeof content.hero === 'string' ? JSON.parse(content.hero) : content.hero
    } else {
      // console.warn("Hero content missing from content prop", content)
    }
  } catch (e) {
    console.error("Failed to parse hero content", e)
  }

  // Optional: Return null or error UI if critical data is missing
  if (!heroData) {
    return null
  }

  // Default content (High-tech redesign)
  const defaultHero = {
    title: "Làm chủ kỹ năng số -\nBứt phá sự nghiệp tương lai.",
    subtitle: "Hệ sinh thái đào tạo thực chiến: Lập trình, Ngoại ngữ & Sáng tạo nội dung. Trang bị tư duy, rèn luyện kỹ năng để tự tin gia nhập thị trường lao động toàn cầu.",
    ctas: [
      { label: "Tìm khóa học phù hợp →", link: "#courses", variant: "primary" },
      { label: "Xem video giới thiệu ▷", link: "#intro", variant: "outline" }
    ],
    showTrustBar: true,
    trustBarText: "Hơn 5.000 học viên đã tốt nghiệp | Đối tác tuyển dụng",
    trustBarLogos: [
      { src: "/logos/partner1.png", alt: "Partner 1" },
      { src: "/logos/partner2.png", alt: "Partner 2" },
      { src: "/logos/partner3.png", alt: "Partner 3" },
      { src: "/logos/partner4.png", alt: "Partner 4" }
    ],
    showVisual: true
  }

  // Merge CMS data on top of defaults
  const heroContent = {
    ...defaultHero,
    ...heroData
  }

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center px-4 overflow-hidden pt-20">

      <div className="container mx-auto max-w-7xl relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Text Content */}
        <div className="space-y-8 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] whitespace-pre-wrap leading-tight">
            {heroContent.title.split('\n').map((line, i) => (
              <span key={i} className="block">
                {line.split(' ').map((word, w) => (
                  (i === 0 && w >= 2) || (i === 1 && w <= 1) ? // Highlight specific words logic (heuristic)
                    <span key={w} className="text-neon-gradient px-1">{word} </span> :
                    <span key={w}>{word} </span>
                ))}
              </span>
            ))}
          </h1>

          <p className="text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light tracking-wide">
            {heroContent.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
            {heroContent.ctas.map((cta: any, idx: number) => (
              <a
                key={idx}
                href={cta.link || "#"}
                className={`relative group px-8 py-4 text-base rounded-full font-bold transition-all duration-300 overflow-hidden ${cta.variant === 'outline'
                  ? 'glass-panel text-white hover:bg-white/10 hover:border-white/40'
                  : 'bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-pink)] text-white shadow-[0_0_20px_rgba(188,19,254,0.5)] hover:shadow-[0_0_30px_rgba(188,19,254,0.7)] hover:scale-105'
                  }`}
              >
                <span className="relative z-10">{cta.label}</span>
              </a>
            ))}
          </div>

          {/* Trust Bar (Desktop placement) */}
          {heroContent.showTrustBar && (
            <div className="pt-8 border-t border-white/10 mt-8 hidden lg:block">
              <p className="text-sm text-blue-200/60 mb-3 uppercase tracking-wider font-semibold">{heroContent.trustBarText}</p>
              <div className="flex gap-6 opacity-70 grayscale hover:grayscale-0 transition-all duration-500 items-center">
                {heroContent.trustBarLogos && heroContent.trustBarLogos.length > 0 ? (
                  heroContent.trustBarLogos.map((logo: any, idx: number) => (
                    // If src exists, render img, else render placeholder
                    logo.src && !logo.src.includes('placeholder') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={idx} src={logo.src} alt={logo.alt || 'Partner'} className="h-8 w-auto object-contain" />
                    ) : (
                      <div key={idx} className="h-8 w-24 bg-white/20 rounded-md backdrop-blur-sm animate-pulse" />
                    )
                  ))
                ) : (
                  /* Fallback placeholders if list is empty */
                  <>
                    <div className="h-8 w-24 bg-white/20 rounded-md backdrop-blur-sm animate-pulse" />
                    <div className="h-8 w-24 bg-white/20 rounded-md backdrop-blur-sm animate-pulse delay-75" />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visual Collage */}
        {heroContent.showVisual && (
          <div className="relative hidden lg:block perspective-1000">
            {/* Main Image with 3D tilt effect */}
            <div className="relative z-10 transform rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out preserve-3d">
              <div className="rounded-3xl overflow-hidden border-2 border-white/10 shadow-[0_0_50px_rgba(0,243,255,0.2)] bg-black/50 backdrop-blur-xl">
                {/* Using the generated hero collage placeholder */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero-collage.png"
                  alt="Sevo Ecosystem Collage"
                  className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent mix-blend-overlay" />
              </div>

              {/* Floating Elements for depth */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--color-neon-purple)] rounded-full blur-[50px] opacity-40 animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--color-neon-blue)] rounded-full blur-[60px] opacity-30 animate-pulse delay-1000" />
            </div>
          </div>
        )}
      </div>

      {/* Trust Bar (Mobile placement) */}
      {heroContent.showTrustBar && (
        <div className="container mx-auto px-4 pt-12 pb-8 lg:hidden text-center border-t border-white/10 mt-8">
          <p className="text-xs text-blue-200/60 mb-4 uppercase tracking-wider font-semibold">{heroContent.trustBarText?.split('|')[0] || "Hơn 5.000 học viên"}</p>
          <div className="flex justify-center gap-4 flex-wrap opacity-60">
            {heroContent.trustBarLogos && heroContent.trustBarLogos.length > 0 ? (
              heroContent.trustBarLogos.map((logo: any, idx: number) => (
                logo.src && !logo.src.includes('placeholder') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={idx} src={logo.src} alt={logo.alt || 'Partner'} className="h-6 w-auto object-contain" />
                ) : (
                  <div key={idx} className="h-6 w-20 bg-white/20 rounded-md animate-pulse" />
                )
              ))
            ) : (
              <>
                <div className="h-6 w-20 bg-white/20 rounded-md animate-pulse" />
                <div className="h-6 w-20 bg-white/20 rounded-md animate-pulse" />
                <div className="h-6 w-20 bg-white/20 rounded-md animate-pulse" />
              </>
            )}
          </div>
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce hidden lg:block">
        <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
