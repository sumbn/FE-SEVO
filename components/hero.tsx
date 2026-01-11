
import { ContentMap } from "@/types/content"

export default function Hero({ content }: { content: ContentMap }) {
  // Access the hero object (it might be a JSON string from API or parsed object depending on fetcher)
  // Our fetcher usually returns strings, so we parse it.
  let heroData = { title: '', subtitle: '', ctas: [] }
  try {
    if (content && content.hero) {
      heroData = typeof content.hero === 'string' ? JSON.parse(content.hero) : content.hero
    } else {
      // console.warn("Hero content missing from content prop", content)
    }
  } catch (e) {
    console.error("Failed to parse hero content", e)
  }

  // Optional: Return null or error UI if critical data is missing
  if (!heroData) {
    return null
  }

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 whitespace-pre-wrap">
          {heroData.title}
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed whitespace-pre-wrap">
          {heroData.subtitle}
        </p>

        {heroData.ctas && heroData.ctas.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {heroData.ctas.map((cta: any, idx: number) => (
              <a
                key={idx}
                href={cta.link || "#"}
                className={`px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 ${cta.variant === 'outline'
                    ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  }`}
              >
                {cta.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
