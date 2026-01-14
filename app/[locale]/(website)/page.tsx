import { getContent } from "@/lib/content"
import { SectionRenderer } from "@/components/SectionRenderer"
import { ClientBackground3D } from "@/components/ui/ClientBackground3D"
import { DebugClientLogs } from "@/components/DebugClientLogs"

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  console.log("🚀 [HomePage] Rendering với params:", { locale })
  const content = await getContent(locale)

  // Parse layout configuration or use default
  let layout = []
  try {
    if (content.homepage_layout) {
      layout = JSON.parse(content.homepage_layout)
    }
  } catch (e) {
    console.error("Failed to parse homepage_layout:", e)
  }

  return (
    <>
      <DebugClientLogs />
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

