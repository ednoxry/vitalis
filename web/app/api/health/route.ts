import { isEmailConfigured, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/env";
import { json } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export function GET() {
  return json({
    ok: true,
    service: "clinica-vitalis-web",
    integrations: {
      supabase: isSupabaseConfigured(),
      supabaseAdmin: isSupabaseAdminConfigured(),
      email: isEmailConfigured(),
    },
    time: new Date().toISOString(),
  });
}
