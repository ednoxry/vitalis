import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Contato — Endereço, telefone e WhatsApp",
  description:
    "Fale com a Clínica Vitalis: endereço na Av. Paulista, telefone, e-mail e WhatsApp para agendar sua avaliação.",
  alternates: { canonical: "/contato" },
};

export default function ContatoPage() {
  return <LegacyPage page="contato" />;
}
