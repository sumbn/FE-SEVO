'use client'

import { FeatureSection } from './features/FeatureSection'
import { TestimonialSection } from './features/TestimonialSection'
import { AnimatedSection } from './ui/AnimatedSection'
import { Card3D, SlideDirection } from './ui/Card3D'
import Hero from './hero'
import About from './about'
import Contact from './contact'

// Slide direction pattern for visual variety
const SLIDE_DIRECTIONS: SlideDirection[] = [
  'bottom-right',
  'bottom-left',
  'top-right',
  'top-left',
  'bottom-center'
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SectionRenderer({ section, content, sectionIndex = 0 }: { section: any, content: any, sectionIndex?: number }) {
  if (section.visible === false) return null

  // Get slide direction based on section index (cycling through pattern)
  const slideDirection = SLIDE_DIRECTIONS[sectionIndex % SLIDE_DIRECTIONS.length]

  // Helper to safely parse JSON content and filter hidden items
  const parseJSON = (key: string, backup: any[]) => {
    try {
      const parsed = content[key] ? JSON.parse(content[key]) : backup
      if (Array.isArray(parsed)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return parsed.filter((item: any) => item.visible !== false)
      }
      return parsed
    } catch (e) {
      console.error(`Failed to parse ${key}:`, e)
      return backup
    }
  }

  switch (section.type) {
    case 'Hero':
      // Hero keeps its own 3D background, no card wrapper
      return <Hero content={content} />

    case 'About':
      return (
        <Card3D slideFrom={slideDirection}>
          <About content={content} />
        </Card3D>
      )

    case 'Contact':
      return (
        <Card3D slideFrom={slideDirection}>
          <Contact content={content} />
        </Card3D>
      )

    case 'Features': {
      const features = section.sourceKey ? parseJSON(section.sourceKey, []) : []
      return (
        <Card3D slideFrom={slideDirection}>
          <FeatureSection
            title={section.title}
            subtitle={section.subtitle}
            description={section.description}
            features={features}
            variant={section.variant || 'light'}
          />
        </Card3D>
      )
    }

    case 'Testimonials': {
      const testimonials = section.sourceKey ? parseJSON(section.sourceKey, []) : []
      return (
        <Card3D slideFrom={slideDirection}>
          <TestimonialSection
            title={section.title}
            testimonials={testimonials}
          />
        </Card3D>
      )
    }

    default:
      console.warn(`Unknown section type: ${section.type}`)
      return null
  }
}
