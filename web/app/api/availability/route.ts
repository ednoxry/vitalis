import { badRequest, json } from "@/lib/api-helpers";
import { buildDayAvailability, DEFAULT_AVAILABILITY } from "@/lib/availability";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fetchAvailabilityRules, fetchBookedIntervals } from "@/lib/supabase/repository";
import { nowInClinicTz } from "@/lib/time";
import { availabilityQuerySchema, formatZodError } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = availabilityQuerySchema.safeParse({
    date: url.searchParams.get("date"),
    procedimento: url.searchParams.get("procedimento") ?? undefined,
  });
  if (!parsed.success) return badRequest(formatZodError(parsed.error));

  const { date } = parsed.data;
  const supabase = createSupabaseAdminClient();
  const rules = supabase ? await fetchAvailabilityRules(supabase) : DEFAULT_AVAILABILITY;
  const booked = supabase ? await fetchBookedIntervals(supabase, date) : [];
  const slots = buildDayAvailability({ rules, date, booked, now: nowInClinicTz() });

  return json({
    ok: true,
    date,
    slots,
    source: supabase ? "supabase" : "default",
  });
}
