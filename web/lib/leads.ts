import type { AppointmentInput, AppointmentRecord, LeadRow } from "./types";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
] as const;

/** Extrai parâmetros de campanha da query string. */
export function utmFromSearch(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const out: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}

export function onlyDigits(value: string): string {
  return (value || "").replace(/\D/g, "");
}

/** Protocolo legível: VIT-AAAAMMDD-XXXX (hex). */
export function makeProtocol(date = new Date()): string {
  const stamp = [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("");
  const rand = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");
  return `VIT-${stamp}-${rand}`;
}

export interface LeadRowInput {
  nome: string;
  telefone: string;
  email: string;
  assunto?: string;
  mensagem?: string;
  canal?: "contato" | "agendamento" | "whatsapp";
  origem?: string;
  utm?: Record<string, string>;
}

/** Monta a linha persistida de um lead (normalizada). */
export function toLeadRow(input: LeadRowInput): LeadRow {
  return {
    nome: input.nome.trim(),
    telefone: onlyDigits(input.telefone),
    email: input.email.trim().toLowerCase(),
    assunto: input.assunto?.trim() || null,
    mensagem: input.mensagem?.trim() || null,
    canal: input.canal ?? "contato",
    origem: input.origem?.trim() || null,
    utm: input.utm ?? {},
    status: "novo",
  };
}

export function toAppointmentRecord(input: AppointmentInput): AppointmentRecord {
  return { ...input, protocol: makeProtocol(), status: "solicitado" };
}
