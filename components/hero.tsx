import { ContentMap } from "@/types/content"

export default function Hero({ content }: { content: ContentMap }) {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold max-w-3xl">
        {content.hero_title}
      </h1>

      <p className="mt-6 text-lg text-gray-600 max-w-2xl">
        {content.hero_subtitle}
      </p>
    </section>
  )
}
