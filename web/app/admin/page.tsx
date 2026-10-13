import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Painel do sistema (demo)",
  description: "Painel de demonstração — será substituído pelo CMS Payload.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <LegacyPage page="admin" />;
}
