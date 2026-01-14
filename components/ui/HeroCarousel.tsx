'use client'

import { useState, useEffect, useCallback } from 'react'

interface CarouselImage {
  src: string
  alt?: string
  visible?: boolean
}

interface HeroCarouselProps {
  images: CarouselImage[]
  autoPlayInterval?: number
  showControls?: boolean
  showIndicators?: boolean
}

export default function HeroCarousel({
  images = [],
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Filter visible images only
  const visibleImages = images.filter(img => img.visible !== false && img.src)

  const goToNext = useCallback(() => {
    if (visibleImages.length <= 1) return
    setCurrentIndex(prev => (prev + 1) % visibleImages.length)
  }, [visibleImages.length])

  const goToPrev = useCallback(() => {
    if (visibleImages.length <= 1) return
    setCurrentIndex(prev => (prev - 1 + visibleImages.length) % visibleImages.length)
  }, [visibleImages.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (visibleImages.length <= 1 || isHovered || autoPlayInterval <= 0) return

    const timer = setInterval(goToNext, autoPlayInterval)
    return () => clearInterval(timer)
  }, [visibleImages.length, isHovered, autoPlayInterval, goToNext])

  // Reset index if it's out of bounds
  useEffect(() => {
    if (currentIndex >= visibleImages.length) {
      setCurrentIndex(Math.max(0, visibleImages.length - 1))
    }
  }, [visibleImages.length, currentIndex])

  if (visibleImages.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl flex items-center justify-center border border-white/10">
        <p className="text-white/40 text-sm">No images available</p>
      </div>
    )
  }

  return (
    <div
      className="relative w-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image Container */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-white/10 shadow-[0_0_50px_rgba(0,243,255,0.2)] bg-black/50 backdrop-blur-xl">
        <div className="relative aspect-[4/3] overflow-hidden">
          {visibleImages.map((image, index) => (
            <div
              key={`${index}-${image.src}`}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentIndex
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-105 z-0'
                }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt || `Slide ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent mix-blend-overlay pointer-events-none z-20" />
        </div>

        {/* Navigation Arrows */}
        {showControls && visibleImages.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dot Indicators */}
      {showIndicators && visibleImages.length > 1 && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {visibleImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/40 hover:bg-white/60'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Floating Elements for depth */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--color-neon-purple)] rounded-full blur-[50px] opacity-40 animate-pulse pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--color-neon-blue)] rounded-full blur-[60px] opacity-30 animate-pulse delay-1000 pointer-events-none" />
    </div>
  )
}
