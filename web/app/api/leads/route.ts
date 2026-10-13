import {
  badRequest,
  clientKey,
  json,
  looksLikeSpam,
  rateLimit,
  serverError,
} from "@/lib/api-helpers";
import { leadClinicEmail, sendEmail } from "@/lib/email";
import { toLeadRow } from "@/lib/leads";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { insertLead } from "@/lib/supabase/repository";
import { formatZodError, leadSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!rateLimit(`lead:${clientKey(request)}`)) {
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

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return badRequest(formatZodError(parsed.error));

  const row = toLeadRow(parsed.data);
  const supabase = createSupabaseAdminClient();

  let id: string | null = null;
  if (supabase) {
    try {
      const created = await insertLead(supabase, row);
      id = created.id;
    } catch (error) {
      return serverError(error instanceof Error ? error.message : "Falha ao salvar lead");
    }
  }

  await sendEmail(leadClinicEmail(row));

  return json({ ok: true, id, persisted: Boolean(id) }, { status: id ? 201 : 202 });
}
