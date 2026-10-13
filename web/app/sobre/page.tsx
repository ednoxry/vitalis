import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "A Clínica — Estrutura e Especialistas",
  description:
    "Conheça a Clínica Vitalis: equipe de especialistas, estrutura moderna e tecnologia de ponta em odontologia.",
  alternates: { canonical: "/sobre" },
};

export default function SobrePage() {
  return <LegacyPage page="sobre" />;
}
