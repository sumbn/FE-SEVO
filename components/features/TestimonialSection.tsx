import { AnimatedSection } from '@/components/ui/AnimatedSection'

interface Testimonial {
  name: string
  role: string
  content: string
  avatar?: string
}

interface TestimonialSectionProps {
  title: string
  testimonials: Testimonial[]
}

export function TestimonialSection({ title, testimonials }: TestimonialSectionProps) {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <AnimatedSection key={index} delay={index * 100}>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    {/* Placeholder avatar if none provided */}
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xl">
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.role}</p>
                  </div>
                </div>
                <div className="flex-grow">
                  <p className="text-gray-600 italic leading-relaxed">
                    "{item.content}"
                  </p>
                </div>
                <div className="mt-6 flex text-yellow-400">
                  {'★'.repeat(5)}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
