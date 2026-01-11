import { ContentMap } from "@/types/content"
import { FeatureSection } from "./features/FeatureSection"

export default function About({ content }: { content: ContentMap }) {
  // Parse dynamic features from CMS
  let features = []
  try {
    if (content.about_features) {
      features = JSON.parse(content.about_features)
      if (Array.isArray(features)) {
        features = features.filter((item: any) => item.visible !== false)
      }
    }
  } catch (e) {
    console.error("Failed to parse about_features:", e)
  }

  // Fallback if no features or parsing failed
  if (features.length === 0) {
    features = [
      { title: "Sứ mệnh", description: "Đang cập nhật...", icon: "🚀" },
      { title: "Tầm nhìn", description: "Đang cập nhật...", icon: "🔭" },
    ]
  }

  // If there's main text, we can show it above the features using a custom layout or just let feature section handle it
  // Since FeatureSection supports description, we can use that for the main text
  // BUT the user might want the text AND the cards. 
  // Let's render the text in an AnimatedSection first, then the features below.

  return (
    <div id="about">
      {/* Use FeatureSection directly to replace the old layout as requested */}
      {/* "Tại sao section về chúng tôi nó lại không thành 1 ô chữ nhật vậy" -> FeatureSection is the rectangle layout the user liked */}
      <FeatureSection
        title={content.about_title || "Về chúng tôi"}
        subtitle="Giới thiệu chung"
        description={content.about_text || ""}
        features={features}
        variant="light" // Or 'dark' if preferred, maybe alternate
      />
    </div>
  )
}
