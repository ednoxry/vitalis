# Back-end real (Frentes C e D) — Supabase + Resend + WhatsApp

Status: **implementado no código, ativação pendente de credenciais.**
O site funciona normalmente sem variáveis de ambiente (fallback gracioso); ao preencher
`web/.env.local`, as integrações passam a valer automaticamente.

## Variáveis de ambiente

Copie `web/.env.example` para `web/.env.local` e preencha:

| Variável | Uso | Obrigatória |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | para persistir |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave pública (RLS) | para persistir |
| `SUPABASE_SERVICE_ROLE_KEY` | escrita server-side (ignora RLS) | para persistir |
| `RESEND_API_KEY` | e-mail transacional | para notificar |
| `EMAIL_FROM` | remetente verificado no Resend | não |
| `CLINIC_NOTIFY_EMAIL` | destino dos avisos internos | não |
| `NEXT_PUBLIC_CLINIC_WHATSAPP` | WhatsApp em formato internacional | não |
| `CLINIC_TIMEZONE` | fuso dos horários (padrão `America/Sao_Paulo`) | não |
| `DATABASE_URI` / `PAYLOAD_SECRET` | Payload CMS (Marco 2) | Marco 2 |

> `SUPABASE_SERVICE_ROLE_KEY` só é lida no servidor (Route Handlers) — nunca chega ao bundle
> do cliente.

## Banco de dados

Aplicar `web/supabase/migrations/0001_init.sql` (via `supabase db push` ou SQL Editor).
Cria: `profiles`, `availability_rules`, `leads`, `appointments`, `waitlist`, índices,
trigger de `updated_at`, criação automática de perfil e **RLS**:

- `availability_rules`: leitura pública; escrita apenas equipe/admin.
- `leads` / `waitlist`: apenas equipe/admin.
- `appointments`: paciente vê os próprios (por e-mail do JWT); equipe vê tudo.
- `profiles`: usuário edita o próprio; equipe/admin veem tudo.

Seed: seg–sex 08–19h, sáb 08–13h, slots de 30 min.

## Camada de código

| Arquivo | Papel |
| --- | --- |
| `lib/env.ts` | leitura/guarda das variáveis + `isSupabaseConfigured()`, `isSupabaseAdminConfigured()`, `isEmailConfigured()` |
| `lib/supabase/client.ts` | cliente browser (`createBrowserClient`, respeita RLS) |
| `lib/supabase/server.ts` | cliente server com cookies de sessão |
| `lib/supabase/admin.ts` | cliente service-role (server-only) |
| `lib/supabase/repository.ts` | leituras/escritas de `availability_rules`, `appointments`, `leads` |
| `lib/availability.ts` | funções puras de slots/regras/conflito (testadas) |
| `lib/leads.ts` | normalização + UTM + protocolo |
| `lib/email.ts` | Resend (no-op sem chave) + templates |
| `lib/whatsapp.ts` | link click-to-chat + mensagens |
| `lib/validation.ts` | schemas zod (leads, agendamento, disponibilidade) + honeypot |
| `lib/api-helpers.ts` | respostas JSON, honeypot, rate limit em memória |
| `lib/time.ts` | data/hora no fuso da clínica |

## APIs

| Rota | Método | Descrição |
| --- | --- | --- |
| `/api/health` | GET | status + integrações ativas |
| `/api/availability?date=YYYY-MM-DD` | GET | slots do dia (regras + reservas + passado) |
| `/api/leads` | POST | grava lead com UTM, notifica a clínica |
| `/api/appointments` | POST | valida slot, grava agendamento, gera protocolo, envia e-mails e link de WhatsApp |

Comportamento sem Supabase: `/api/availability` usa as regras padrão; `/api/leads` e
`/api/appointments` validam, geram protocolo e retornam sucesso (`persisted: false`) —
mantendo o demo funcional.

Proteções: honeypot (`_gotcha`) e tempo mínimo (`_elapsed`), rate limit (20 req/min por IP),
validação zod (422) e conflito/passado (409).

## Front-end

`components/BackendForms.tsx` (ilha cliente, montada no layout) escuta os formulários legados
`[data-contact-form]` e `[data-stepper-form]` em fase de captura e envia para as APIs, **sem
alterar** a UX/validação já existente em `lib/interactions.js`. O protocolo retornado é anexado
ao resumo de sucesso do agendamento.

## Segurança / LGPD (Frente D)

- CSP e headers no `next.config.mjs` (CSP, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, HSTS em produção). `frame-src` libera Turnstile e o mapa OSM.
- Honeypot nos formulários; consentimento LGPD (checkbox `required`) exigido no cliente e
  no servidor (`consent: z.literal(true)`).
- Página de privacidade estática em `/privacidade` (dinâmica via Payload no Marco 2).
