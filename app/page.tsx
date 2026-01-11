import { getContent } from "@/lib/content"
import { SectionRenderer } from "@/components/SectionRenderer"

export default async function HomePage() {
  const content = await getContent()
  console.log("HomePage Content Keys:", Object.keys(content))
  if (content.hero) console.log("Hero raw:", content.hero.substring(0, 50))

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
    <main className="flex flex-col">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {layout.map((section: any) => (
        <SectionRenderer
          key={section.id}
          section={section}
          content={content}
        />
      ))}
    </main>
  )
}
