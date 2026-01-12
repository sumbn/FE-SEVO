import { useEffect, useState, useRef } from 'react';

/**
 * Hook to track scroll progress of an element
 * Returns a value between 0 and 1 based on how much the element has scrolled into view
 */
export function useScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate when element starts entering viewport (bottom of element touches bottom of screen)
      // to when it's fully visible (top of element reaches top of screen)
      const elementHeight = rect.height;
      const scrollStart = windowHeight;
      const scrollEnd = -elementHeight;
      const scrollRange = scrollStart - scrollEnd;
      
      // Current position relative to viewport bottom
      const currentPosition = rect.top;
      
      // Calculate progress (0 = not started, 1 = fully scrolled past)
      const rawProgress = (scrollStart - currentPosition) / scrollRange;
      
      // Clamp between 0 and 1
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));
      
      setProgress(clampedProgress);
    };

    // Initial check
    handleScroll();

    // Listen to scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return { ref, progress };
}
