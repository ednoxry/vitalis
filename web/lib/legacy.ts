import { readFileSync } from "node:fs";
import { join } from "node:path";

const LEGACY_DIR = join(process.cwd(), "legacy");

const ATTR_MAP: Array<[RegExp, string]> = [
  [/\bsrcset=/g, "srcSet="],
  [/\bimagesrcset=/g, "imageSrcSet="],
  [/\bimagesizes=/g, "imageSizes="],
  [/\bfetchpriority=/g, "fetchPriority="],
  [/\bcrossorigin=/g, "crossOrigin="],
];

/**
 * Transforma o HTML legado (estático) em HTML seguro para o parser React:
 * remove scripts, reescreve links `.html` → rotas limpas, prefixa `img/`
 * com `/` e normaliza atributos específicos do React.
 */
export function transformLegacyHtml(html: string): string {
  let out = html.replace(/<script[\s\S]*?<\/script>/gi, "");

  out = out.replace(/href="index\.html"/g, 'href="/"');
  out = out.replace(/href="([a-z0-9-]+)\.html(#[^"]*)?"/g, 'href="/$1$2"');

  out = out.replace(/="img\//g, '="/img/');
  out = out.replace(/(\s)img\//g, "$1/img/");

  for (const [re, rep] of ATTR_MAP) out = out.replace(re, rep);

  out = out.replace(/<table(\s[^>]*)?>([\s\S]*?)<\/table>/gi, (_m, attrs = "", inner) => {
    const hasSections = /<(thead|tbody|tfoot)\b/i.test(inner);
    const body = hasSections ? inner : `<tbody>${inner}</tbody>`;
    return `<table${attrs}>${body}</table>`;
  });

  return out;
}

/** Extrai o conteúdo interno de `<main>` de uma página legada. */
export function getLegacyMain(page: string): string {
  const file = join(LEGACY_DIR, `${page}.html`);
  const full = readFileSync(file, "utf8");
  const match = full.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return transformLegacyHtml(match ? match[1] : "");
}
