# Checklist — Migração Next.js (Marco 1)

Legenda: ✅ concluído · 🚧 em andamento · ⬜ pendente

## Fase A — Scaffold e migração

- [x] Scaffold Next.js (`web/`): `package.json`, `tsconfig.json`, `next.config.mjs`,
  `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `.gitignore`
- [x] Instalar dependências (Next, React, three, Vitest, Playwright, axe, ESLint, Prettier)
- [x] Copiar assets para `web/public/` (img, fonts, favicon, og, manifest, `sw.js`)
- [x] Portar tokens/CSS (`assets/css/style.css` → `app/globals.css`)
- [x] Layout compartilhado (`app/layout.tsx` + Header/Footer/Widgets) com metadata e JSON-LD
- [x] Home em `app/page.tsx` (ponte SSR do markup legado + JSON-LD `Dentist`/`FAQPage`)
- [x] Rotas e **301** dos `.html`; `robots.txt`, `sitemap.xml`, `not-found`
- [x] Interações vanilla portadas (`lib/interactions.js`, `lib/tooth3d.js`) + ilha 3D
- [x] Assets de tema sem FOUC (script inline no `<head>`)
- [x] PWA (service worker registrado em produção)

## Frente B — Qualidade / CI

- [x] ESLint 9 (flat) + Prettier (`format`/`format:check`)
- [x] Vitest (unit: `transformLegacyHtml`, config, domínio) — **27/27**
- [x] Playwright (smoke de rotas, redirects, WhatsApp, APIs, **axe WCAG 2.1 AA**) — **24/24**
- [x] Verificação em navegador em produção — **45/45**
- [x] GitHub Actions (`lint → typecheck → unit → build → e2e`) — `.github/workflows/ci.yml`
- [ ] Lighthouse CI com budgets (Fase C)
- [ ] Sentry + GA4 + web-vitals (Fase C)

## Frente C — Back-end real (Supabase + Payload)

- [x] Schema Supabase + RLS (`web/supabase/migrations/0001_init.sql`) — código pronto, aplicar no projeto
- [ ] Supabase Auth (área do paciente) + Storage
- [ ] Payload CMS v3 embutido (`/admin`) reusando o Postgres do Supabase (Marco 2)
- [x] Agendamento real: slots, detecção de conflito, geração de protocolo (API)
- [x] Leads com UTM + notificação (KPIs no admin ficam para o Marco 2)
- [x] Resend (confirmações por e-mail) + WhatsApp click-to-chat (fallback sem credenciais)
- [ ] Substituir a ponte SSR por componentes React alimentados pelo Payload (seção a seção)

## Frente D — Segurança / LGPD

- [x] CSP e headers de segurança (`next.config.mjs`)
- [x] Honeypot + tempo mínimo (Turnstile preparado no CSP)
- [x] Consentimento (cookies) + validação LGPD no agendamento/contato

## Marco 2

- [ ] Payload completo (serviços, equipe, blog, depoimentos, FAQ editáveis)
- [ ] `next/image` (AVIF/WebP) nas imagens de conteúdo
- [ ] Dashboards de agenda/leads/KPIs no admin
- [ ] WhatsApp Cloud API com templates

## Comandos de verificação

```bash
cd web
npm run lint && npm run typecheck && npm run test && npm run build && npm run test:e2e
```

## Números atuais

- Unit (Vitest): **27/27**
- E2E (Playwright: smoke + APIs + axe): **24/24**
- Verificação em navegador (prod): **45/45**
- Build: 17 páginas + 4 rotas de API
