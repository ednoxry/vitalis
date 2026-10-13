import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Área do Paciente",
  description: "Acompanhe suas consultas e agendamentos na Clínica Vitalis.",
  alternates: { canonical: "/cliente" },
  robots: { index: false, follow: false },
};

export default function ClientePage() {
  return <LegacyPage page="cliente" />;
}
