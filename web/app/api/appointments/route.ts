import {
  badRequest,
  clientKey,
  json,
  looksLikeSpam,
  rateLimit,
  serverError,
} from "@/lib/api-helpers";
import { buildDayAvailability, DEFAULT_AVAILABILITY } from "@/lib/availability";
import { appointmentClientEmail, appointmentClinicEmail, sendEmail } from "@/lib/email";
import { toAppointmentRecord } from "@/lib/leads";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  fetchAvailabilityRules,
  fetchBookedIntervals,
  insertAppointment,
} from "@/lib/supabase/repository";
import { nowInClinicTz } from "@/lib/time";
import { appointmentSchema, formatZodError } from "@/lib/validation";
import { bookingWhatsappMessage, whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!rateLimit(`appt:${clientKey(request)}`)) {
    return json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest({ _: "JSON inválido" });
  }

  if (looksLikeSpam(body as Record<string, unknown>)) {
    return json({ ok: true, spam: true });
  }

  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) return badRequest(formatZodError(parsed.error));

  const record = toAppointmentRecord(parsed.data);
  const now = nowInClinicTz();
  if (record.data < now.date) {
    return json(
      { ok: false, error: "slot_unavailable", message: "Data no passado." },
      { status: 409 },
    );
  }
  const supabase = createSupabaseAdminClient();
  const rules = supabase ? await fetchAvailabilityRules(supabase) : DEFAULT_AVAILABILITY;
  const booked = supabase ? await fetchBookedIntervals(supabase, record.data) : [];
  const slots = buildDayAvailability({ rules, date: record.data, booked, now });
  if (!slots.some((s) => s.start === record.horario && s.available)) {
    return json(
      { ok: false, error: "slot_unavailable", message: "Horário indisponível." },
      { status: 409 },
    );
  }

  let id: string | null = null;

  if (supabase) {
    try {
      const created = await insertAppointment(supabase, record);
      id = created.id;
    } catch (error) {
      return serverError(error instanceof Error ? error.message : "Falha ao agendar");
    }
  }

  await Promise.all([
    sendEmail(appointmentClientEmail(record)),
    sendEmail(appointmentClinicEmail(record)),
  ]);

  return json(
    {
      ok: true,
      id,
      protocol: record.protocol,
      persisted: Boolean(id),
      whatsapp: whatsappLink(bookingWhatsappMessage(record)),
    },
    { status: id ? 201 : 202 },
  );
}
