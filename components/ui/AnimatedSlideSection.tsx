'use client'

import { useScrollProgress } from '@/hooks/useScrollProgress'
import { ReactNode } from 'react'

interface AnimatedSlideSectionProps {
  children: ReactNode
  className?: string
  delay?: number // Delay in ms (for stagger effect)
  direction?: 'left' | 'right' // Slide from left or right
}

export function AnimatedSlideSection({
  children,
  className = '',
  delay = 0,
  direction = 'left'
}: AnimatedSlideSectionProps) {
  const { ref, progress } = useScrollProgress()

  // Apply delay to progress (for stagger effect)
  const delayFactor = delay / 1000 // Convert ms to seconds
  const adjustedProgress = Math.max(0, Math.min(1, (progress - delayFactor * 0.3) / (1 - delayFactor * 0.3)))

  // Calculate transform based on scroll progress
  const maxTranslate = 80 // Maximum translation in pixels
  const translateX = direction === 'left'
    ? -maxTranslate * (1 - adjustedProgress)
    : maxTranslate * (1 - adjustedProgress)

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: adjustedProgress,
        transform: `translateX(${translateX}px)`,
        transition: 'none', // Remove CSS transitions, we're controlling via scroll
      }}
    >
      {children}
    </div>
  )
}
