import { createClient } from "@supabase/supabase-js";
import { env, isSupabaseAdminConfigured } from "../env";

/**
 * Cliente com service role (ignora RLS). Uso restrito ao servidor:
 * gravação de leads/agendamentos e leituras administrativas.
 */
export function createSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured()) return null;
  return createClient(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
