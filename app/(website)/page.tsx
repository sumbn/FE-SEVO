import { getContent } from "@/lib/content"
import { SectionRenderer } from "@/components/SectionRenderer"
import { ClientBackground3D } from "@/components/ui/ClientBackground3D"

export default async function HomePage() {
  const content = await getContent()
  console.log("HomePage Content Keys:", Object.keys(content))
  if (content.hero) console.log("Hero raw:", typeof content.hero === 'string' ? content.hero.substring(0, 50) : '[object]')

  // Parse layout configuration or use default
  let layout = []
  try {
    if (content.homepage_layout) {
      layout = JSON.parse(content.homepage_layout)
    }
  } catch (e) {
    console.error("Failed to parse homepage_layout:", e)
  }

  // Fallback if no layout defined -> Show nothing (User requested clean state)
  if (!layout.length) {
    // layout = [] 
  }

  return (
    <>
      {/* Full-page 3D Background */}
      <ClientBackground3D />

      {/* Content Layer */}
      <main className="relative z-10 flex flex-col">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {layout.map((section: any, index: number) => (
          <SectionRenderer
            key={section.id}
            section={section}
            content={content}
            sectionIndex={index}
          />
        ))}
      </main>
    </>
  )
}
