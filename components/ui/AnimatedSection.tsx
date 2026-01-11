'use client'

import { useInView } from '@/hooks/useInView'
import { ReactNode } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number // Delay in ms
}

export function AnimatedSection({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${isInView
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10'
        } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
