import parse from "html-react-parser";
import { getLegacyMain } from "@/lib/legacy";

/**
 * Ponte de migração: renderiza o corpo (main) da página legada estática como
 * elementos React no servidor (SEO-friendly). Será substituído, seção a seção,
 * por componentes React alimentados pelo Payload CMS.
 */
export default function LegacyPage({ page }: { page: string }) {
  return <main id="main">{parse(getLegacyMain(page))}</main>;
}
