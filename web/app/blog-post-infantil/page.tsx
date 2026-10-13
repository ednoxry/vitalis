import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Quando levar a criança ao dentista pela 1ª vez",
  description:
    "Saiba a idade ideal para a primeira consulta odontológica infantil e como preparar a criança.",
  alternates: { canonical: "/blog-post-infantil" },
};

export default function BlogPostInfantilPage() {
  return <LegacyPage page="blog-post-infantil" />;
}
