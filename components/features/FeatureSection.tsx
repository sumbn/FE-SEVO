import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { AnimatedSlideSection } from '@/components/ui/AnimatedSlideSection'

interface FeatureItem {
  title: string
  description: string
  icon?: string
}

interface FeatureSectionProps {
  title: string
  subtitle: string
  description?: string
  features: FeatureItem[]
  variant?: 'light' | 'dark'
}

export function FeatureSection({
  title,
  subtitle,
  description,
  features,
  variant = 'light'
}: FeatureSectionProps) {
  // Glassmorphism design similar to registration form
  return (
    <section className="py-16 my-6 mx-4 md:mx-8 lg:mx-16 bg-slate-900/40 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10">
      <div className="container mx-auto px-6">
        {/* Header */}
        <AnimatedSection className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-blue-400 font-semibold tracking-wide uppercase text-sm mb-3">
            {subtitle}
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {title}
          </h3>
          {description && (
            <p className="text-xl text-white/80">
              {description}
            </p>
          )}
        </AnimatedSection>

        {/* Features Grid with Alternating Slide Animation */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <AnimatedSlideSection
              key={index}
              delay={index * 100}
              direction={index % 2 === 0 ? 'left' : 'right'}
              className="h-full"
            >
              <div className="p-8 rounded-2xl h-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-500/30 backdrop-blur-sm rounded-lg flex items-center justify-center mb-6 text-blue-300 text-2xl font-bold border border-blue-400/30">
                  {feature.icon || (index + 1)}
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                <p className="text-white/80">
                  {feature.description}
                </p>
              </div>
            </AnimatedSlideSection>
          ))}
        </div>
      </div>
    </section>
  )
}
