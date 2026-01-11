import { ContentMap } from "@/types/content";

export default function Contact({ content }: { content: ContentMap }) {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-xl mx-auto px-4 space-y-3 text-gray-700">
        <p>📞 <strong>Phone:</strong> {content.contact_phone}</p>
        <p>📧 <strong>Email:</strong> {content.contact_email}</p>
        <p>📍 <strong>Address:</strong> {content.contact_address}</p>
      </div>
    </section>
  );
}
