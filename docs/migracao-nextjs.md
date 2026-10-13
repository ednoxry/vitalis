# Migração para Next.js + Supabase + Payload — Marco 1

Status: **Frentes A, B, C (código) e D concluídas**; integrações ativam com credenciais e
Payload CMS fica para o Marco 2. Ver `docs/backend-supabase.md`.

## Decisões

| Tema | Decisão |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Backend/BaaS | Supabase (Postgres, Auth, Storage, RLS) |
| CMS | Payload CMS v3 (embarcado no Next, reusa o Postgres) |
| Notificações | Resend (e-mail) + WhatsApp Cloud API (fallback click-to-chat) |
| 3D | three.js como ilha `next/dynamic` / `ssr:false` |
| Idioma | PT-BR |
| Pagamentos | Fora de escopo |

## Estrutura

- O site estático original permanece intacto na raiz (`*.html`, `assets/`, `public/`).
- A nova aplicação vive em `web/` (app Next independente).
- **Ponte de migração**: `web/lib/legacy.ts` + `web/components/LegacyPage.tsx` renderizam no
  servidor o `<main>` das páginas estáticas (copiadas para `web/legacy/`), já com links limpos,
  imagens com caminho absoluto e `<tbody>` normalizado. As seções serão substituídas por
  componentes React alimentados pelo Payload, uma a uma.
- Chrome global (header, footer, widgets, LGPD, PWA) já é React: `web/components/Site*.tsx`.
- Interações vanilla portadas para `web/lib/interactions.js` (bundle do Next) e iniciadas
  por `web/components/SiteInteractions.tsx` (dynamic import no cliente).

## Rotas (301 dos `.html` para URLs limpas)

`/` · `/servicos` · `/sobre` · `/blog` · `/blog-post` · `/blog-post-implante` ·
`/blog-post-infantil` · `/contato` · `/agendamento` · `/cliente` · `/privacidade` ·
`/admin` (demo, será substituído pelo Payload) · `not-found` · `robots.txt` · `sitemap.xml`.

## Comandos

```bash
cd web
npm run dev        # desenvolvimento
npm run build      # build de produção
npm run start      # servir build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run test       # Vitest (unit)
npm run test:e2e   # Playwright (smoke + axe + redirects)
```

## Qualidade / CI

- ESLint 9 (flat) + Prettier.
- Vitest (jsdom) para utilidades (`transformLegacyHtml`, config do site).
- Playwright: status 200 das rotas, redirects, links de WhatsApp e **axe** (WCAG 2.1 AA,
  sem violações sérias/críticas) na home.
- GitHub Actions: `.github/workflows/ci.yml` (lint → typecheck → unit → build → e2e).

## Verificação desta fase

- `next build`: 17 rotas estáticas + 4 rotas de API, sem erros de lint/typecheck.
- Unit (Vitest): **27/27**; E2E (Playwright: smoke + APIs + axe): **24/24**.
- Verificação em navegador (prod): **45/45** checagens (rotas, `main#main`, interações,
  console limpo, tema, WhatsApp, menu mobile).
- Acessibilidade: axe sem violações sérias/críticas na home.
- Corrigidos na migração: `import.meta.env` (Vite) → `process.env`, `<tr>` sem `<tbody>`,
  emojis decorativos `role="img"` sem nome acessível, CSP liberando o mapa OpenStreetMap.

## Frentes C e D (backend + segurança)

Implementadas em código com **fallback gracioso** (o site roda sem credenciais):

- Camada Supabase (`lib/supabase/*`), esquema + RLS (`supabase/migrations/0001_init.sql`).
- Domínio testável: `lib/availability.ts` (slots/conflito), `lib/leads.ts` (UTM/protocolo),
  `lib/validation.ts` (zod), `lib/email.ts` (Resend), `lib/whatsapp.ts` (click-to-chat).
- APIs: `/api/health`, `/api/availability`, `/api/leads`, `/api/appointments`.
- `components/BackendForms.tsx` envia os formulários legados para as APIs sem alterar a UX.
- CSP + headers de segurança e honeypot/rate limit (Frente D).

## Próximos passos (Marco 2)

1. Payload CMS v3 embutido (`/admin`) reusando o Postgres do Supabase (conteúdo editável).
2. Supabase Auth (área do paciente) + Storage.
3. KPIs/dashboards e `next/image` (AVIF/WebP) nas imagens de conteúdo.
4. WhatsApp Cloud API com templates; Lighthouse CI e observabilidade (Sentry/web-vitals).
