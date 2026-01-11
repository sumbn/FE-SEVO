import { ContentMap } from "@/types/content";

export default function About({ content }: { content: ContentMap }) {
  return (
    <section className="max-w-4xl mx-auto px-4">
      <h2 className="text-3xl font-semibold">
        {content.about_title || "About"}
      </h2>

      <p className="mt-6 text-gray-700 leading-7 whitespace-pre-line">
        {content.about_text || ""}
      </p>
    </section>
  );
}
