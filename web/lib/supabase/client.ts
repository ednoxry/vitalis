import { createBrowserClient } from "@supabase/ssr";
import { env } from "../env";

/** Cliente Supabase para uso no navegador (respeita RLS). */
export function createSupabaseBrowserClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null;
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
