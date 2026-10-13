const read = (value: string | undefined): string | undefined =>
  value && value.trim().length > 0 ? value.trim() : undefined;

/**
 * Configuração de ambiente. Variáveis `NEXT_PUBLIC_*` são embutidas no bundle
 * do cliente pelo Next; as demais ficam disponíveis apenas no servidor.
 */
export const env = {
  supabaseUrl: read(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: read(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceRoleKey: read(process.env.SUPABASE_SERVICE_ROLE_KEY),
  resendApiKey: read(process.env.RESEND_API_KEY),
  emailFrom: read(process.env.EMAIL_FROM) ?? "Clínica Vitalis <nao-responda@clinicavitalis.com.br>",
  clinicNotifyEmail: read(process.env.CLINIC_NOTIFY_EMAIL) ?? "contato@clinicavitalis.com.br",
  whatsapp: read(process.env.NEXT_PUBLIC_CLINIC_WHATSAPP) ?? "5541999990000",
  siteUrl: read(process.env.NEXT_PUBLIC_SITE_URL) ?? "https://www.clinicavitalis.com.br",
  timezone: read(process.env.CLINIC_TIMEZONE) ?? "America/Sao_Paulo",
} as const;

export const isSupabaseConfigured = (): boolean => Boolean(env.supabaseUrl && env.supabaseAnonKey);

export const isSupabaseAdminConfigured = (): boolean =>
  Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);

export const isEmailConfigured = (): boolean => Boolean(env.resendApiKey);
