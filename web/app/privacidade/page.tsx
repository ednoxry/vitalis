import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade e tratamento de dados pessoais da Clínica Vitalis, conforme a LGPD.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacidadePage() {
  return <LegacyPage page="privacidade" />;
}
