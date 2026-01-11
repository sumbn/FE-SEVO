import { getContent } from "@/lib/content";
import Hero from "@/components/hero";
import About from "@/components/about";
import Contact from "@/components/contact";

export default async function HomePage() {
  const content = await getContent();

  return (
    <main className="flex flex-col gap-24">
      <Hero content={content} />
      <About content={content} />
      <Contact content={content} />
    </main>
  );
}
