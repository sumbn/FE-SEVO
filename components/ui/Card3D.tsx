'use client'

import { ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export type SlideDirection = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center'

interface Card3DProps {
  children: ReactNode
  slideFrom: SlideDirection
  delay?: number
  className?: string
}

const getTransformClasses = (direction: SlideDirection, isInView: boolean, reducedMotion: boolean) => {
  // If reduced motion, use simple fade
  if (reducedMotion) {
    return isInView
      ? 'opacity-100'
      : 'opacity-0'
  }

  // Base transform values for each direction - reduced offset to stay in viewport
  const transforms = {
    'bottom-right': {
      initial: 'translate-x-[30px] translate-y-[30px] -rotate-y-6 rotate-x-3',
      final: 'translate-x-0 translate-y-0 rotate-y-0 rotate-x-0'
    },
    'bottom-left': {
      initial: 'translate-x-[-30px] translate-y-[30px] rotate-y-6 rotate-x-3',
      final: 'translate-x-0 translate-y-0 rotate-y-0 rotate-x-0'
    },
    'top-right': {
      initial: 'translate-x-[30px] translate-y-[-30px] -rotate-y-6 -rotate-x-3',
      final: 'translate-x-0 translate-y-0 rotate-y-0 rotate-x-0'
    },
    'top-left': {
      initial: 'translate-x-[-30px] translate-y-[-30px] rotate-y-6 -rotate-x-3',
      final: 'translate-x-0 translate-y-0 rotate-y-0 rotate-x-0'
    },
    'bottom-center': {
      initial: 'translate-y-[40px] scale-95',
      final: 'translate-y-0 scale-100'
    }
  }

  const { initial, final } = transforms[direction]

  return isInView
    ? `opacity-100 ${final}`
    : `opacity-0 ${initial}`
}

export function Card3D({ children, slideFrom, delay = 0, className = '' }: Card3DProps) {
  const { ref, isInView } = useInView({ threshold: 0.15, triggerOnce: true })
  const prefersReducedMotion = useReducedMotion()

  const transformClasses = getTransformClasses(slideFrom, isInView, prefersReducedMotion)

  return (
    <div className="perspective-1000 w-full">
      <div
        ref={ref}
        className={`
          preserve-3d
          transition-all duration-[1000ms] ease-out
          ${transformClasses}
          ${className}
        `}
        style={{
          transitionDelay: `${delay}ms`,
          willChange: isInView ? 'auto' : 'transform, opacity'
        }}
      >
        {children}
      </div>
    </div>
  )
}
