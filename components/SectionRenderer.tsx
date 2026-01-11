'use client'

import { FeatureSection } from './features/FeatureSection'
import { TestimonialSection } from './features/TestimonialSection'
import { AnimatedSection } from './ui/AnimatedSection'
import Hero from './hero'
import About from './about'
import Contact from './contact'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SectionRenderer({ section, content }: { section: any, content: any }) {
  if (section.visible === false) return null

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
      return (
        <AnimatedSection>
          <Hero content={content} />
        </AnimatedSection>
      )

    case 'About':
      return (
        <About content={content} />
      )

    case 'Contact':
      return (
        <AnimatedSection>
          <Contact content={content} />
        </AnimatedSection>
      )

    case 'Features': {
      const features = section.sourceKey ? parseJSON(section.sourceKey, []) : []
      return (
        <FeatureSection
          title={section.title}
          subtitle={section.subtitle}
          description={section.description}
          features={features}
          variant={section.variant || 'light'}
        />
      )
    }

    case 'Testimonials': {
      const testimonials = section.sourceKey ? parseJSON(section.sourceKey, []) : []
      return (
        <TestimonialSection
          title={section.title}
          testimonials={testimonials}
        />
      )
    }

    default:
      console.warn(`Unknown section type: ${section.type}`)
      return null
  }
}
