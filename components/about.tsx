import { ContentMap } from "@/types/content"
import { FeatureSection } from "./features/FeatureSection"

export default function About({ content }: { content: ContentMap }) {
  let aboutData = { title: '', text: '', features: [] }
  try {
    if (content.about) {
      aboutData = typeof content.about === 'string' ? JSON.parse(content.about) : content.about
    }
  } catch (e) {
    console.error("Failed to parse about content", e)
  }

  const features = Array.isArray(aboutData.features)
    ? aboutData.features.filter((item: any) => item.visible !== false)
    : []

  return (
    <div id="about">
      {/* Use FeatureSection directly to replace the old layout as requested */}
      <FeatureSection
        title={aboutData.title || ""}
        subtitle="Giới thiệu chung"
        description={aboutData.text || ""}
        features={features}
        variant="light"
      />
    </div>
  )
}
