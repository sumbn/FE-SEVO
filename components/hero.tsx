'use client'

import dynamic from 'next/dynamic'
import { ContentMap } from "@/types/content"

// Load 3D background only on client side
const TechBackground = dynamic(() => import('./ui/TechBackground'), { ssr: false })

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

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0">
        <TechBackground />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-8 pt-10">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white drop-shadow-2xl whitespace-pre-wrap bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-100">
          {heroData.title}
        </h1>

        <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed whitespace-pre-wrap drop-shadow-md font-light">
          {heroData.subtitle}
        </p>

        {heroData.ctas && heroData.ctas.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {heroData.ctas.map((cta: any, idx: number) => (
              <a
                key={idx}
                href={cta.link || "#"}
                className={`px-8 py-4 text-base rounded-full font-bold transition-all transform hover:scale-105 duration-300 ${cta.variant === 'outline'
                    ? 'border-2 border-white/30 text-white hover:bg-white/10 hover:border-white backdrop-blur-md'
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl hover:shadow-blue-500/30'
                  }`}
              >
                {cta.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
