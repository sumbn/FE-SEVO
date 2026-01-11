import { AnimatedSection } from '@/components/ui/AnimatedSection'

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
  const isDark = variant === 'dark'

  return (
    <section className={`py-24 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <AnimatedSection className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">
            {subtitle}
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            {title}
          </h3>
          {description && (
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {description}
            </p>
          )}
        </AnimatedSection>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <AnimatedSection key={index} delay={index * 100} className="h-full">
              <div className={`p-8 rounded-2xl h-full border ${isDark
                  ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                  : 'bg-gray-50 border-gray-100 hover:border-blue-200 hover:shadow-lg'
                } transition-colors duration-300`}>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6 text-white text-2xl font-bold">
                  {feature.icon || (index + 1)}
                </div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
