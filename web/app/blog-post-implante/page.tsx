import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Implante dói? O que esperar em cada etapa",
  description:
    "Entenda como funciona o tratamento com implante dental, etapa por etapa, e o que esperar de dor e recuperação.",
  alternates: { canonical: "/blog-post-implante" },
};

export default function BlogPostImplantePage() {
  return <LegacyPage page="blog-post-implante" />;
}
