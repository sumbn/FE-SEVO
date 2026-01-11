import { getContent } from "@/lib/content"
import { SectionRenderer } from "@/components/SectionRenderer"

export default async function HomePage() {
  const content = await getContent()

  // Parse layout configuration or use default
  let layout = []
  try {
    if (content.homepage_layout) {
      layout = JSON.parse(content.homepage_layout)
    }
  } catch (e) {
    console.error("Failed to parse homepage_layout:", e)
  }

  // Fallback if no layout defined
  if (!layout.length) {
    layout = [
      { id: "hero", type: "Hero" },
      { id: "about", type: "About" },
      { id: "contact", type: "Contact" }
    ]
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
