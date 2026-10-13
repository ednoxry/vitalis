import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Tratamentos — Implantes, Ortodontia e Estética",
  description:
    "Implantes, ortodontia, clareamento, lentes de contato e estética dental com especialistas na Clínica Vitalis.",
  alternates: { canonical: "/servicos" },
};

export default function ServicosPage() {
  return <LegacyPage page="servicos" />;
}
