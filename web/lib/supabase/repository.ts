import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_AVAILABILITY } from "../availability";
import type { AvailabilityRule, BookedInterval, LeadRow } from "../types";

export const APPOINTMENT_BLOCK_MINUTES = 30;

type Row = Record<string, unknown>;

const hhmm = (value: unknown): string => {
  const text = String(value ?? "");
  return text.length >= 5 ? text.slice(0, 5) : text;
};

export async function fetchAvailabilityRules(sb: SupabaseClient): Promise<AvailabilityRule[]> {
  const { data, error } = await sb
    .from("availability_rules")
    .select("weekday,start_time,end_time,slot_minutes,is_active");
  if (error || !data || data.length === 0) return DEFAULT_AVAILABILITY;
  return (data as Row[]).map((r) => ({
    weekday: Number(r.weekday),
    start: hhmm(r.start_time),
    end: hhmm(r.end_time),
    slotMinutes: Number(r.slot_minutes ?? 30),
    isActive: Boolean(r.is_active),
  }));
}

export async function fetchBookedIntervals(
  sb: SupabaseClient,
  date: string,
): Promise<BookedInterval[]> {
  const { data, error } = await sb
    .from("appointments")
    .select("horario,duration_minutes")
    .eq("data", date)
    .in("status", ["solicitado", "confirmado"]);
  if (error || !data) return [];
  return (data as Row[]).map((r) => {
    const start = hhmm(r.horario);
    const duration = Number(r.duration_minutes ?? APPOINTMENT_BLOCK_MINUTES);
    const [h, m] = start.split(":").map(Number);
    const endMinutes = h * 60 + m + duration;
    const end = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(
      endMinutes % 60,
    ).padStart(2, "0")}`;
    return { start, end };
  });
}

export interface PersistedAppointment {
  id: string;
  created_at: string;
}

export async function insertAppointment(
  sb: SupabaseClient,
  record: {
    nome: string;
    telefone: string;
    email: string;
    procedimento: string;
    data: string;
    horario: string;
    unidade: string;
    obs?: string;
    protocol: string;
    consent: boolean;
  },
): Promise<PersistedAppointment> {
  const { data, error } = await sb
    .from("appointments")
    .insert({
      nome: record.nome,
      telefone: record.telefone,
      email: record.email,
      procedimento: record.procedimento,
      data: record.data,
      horario: record.horario,
      unidade: record.unidade,
      obs: record.obs ?? null,
      protocol: record.protocol,
      consent: record.consent,
      status: "solicitado",
      duration_minutes: APPOINTMENT_BLOCK_MINUTES,
    })
    .select("id,created_at")
    .single();
  if (error) throw new Error(error.message);
  return data as PersistedAppointment;
}

export async function insertLead(sb: SupabaseClient, row: LeadRow): Promise<{ id: string }> {
  const { data, error } = await sb
    .from("leads")
    .insert({
      nome: row.nome,
      telefone: row.telefone,
      email: row.email,
      assunto: row.assunto,
      mensagem: row.mensagem,
      canal: row.canal,
      origem: row.origem,
      utm: row.utm,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data as { id: string };
}
