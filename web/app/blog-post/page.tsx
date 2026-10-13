import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Como cuidar do sorriso após o clareamento",
  description:
    "Veja os cuidados essenciais após o clareamento dental para manter o resultado por mais tempo.",
  alternates: { canonical: "/blog-post" },
};

export default function BlogPostPage() {
  return <LegacyPage page="blog-post" />;
}
