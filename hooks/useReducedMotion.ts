'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has enabled "reduce motion" in OS settings
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    }
    // Fallback for older browsers
    else {
      mediaQuery.addListener(listener)
      return () => mediaQuery.removeListener(listener)
    }
  }, [])

  return prefersReducedMotion
}
