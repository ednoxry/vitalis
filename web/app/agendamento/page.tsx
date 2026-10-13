import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Agendar avaliação",
  description:
    "Agende online a sua avaliação na Clínica Vitalis em poucos passos. Confirmação por WhatsApp.",
  alternates: { canonical: "/agendamento" },
};

export default function AgendamentoPage() {
  return <LegacyPage page="agendamento" />;
}
