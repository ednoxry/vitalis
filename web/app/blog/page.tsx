import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Blog — Saúde bucal e dicas de odontologia",
  description:
    "Artigos sobre saúde bucal, clareamento, implantes, ortodontia e cuidados com o sorriso.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return <LegacyPage page="blog" />;
}
