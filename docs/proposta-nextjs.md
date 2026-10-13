# Proposta — Migração para Next.js + Supabase + Payload CMS

> Clínica Vitalis · da entrega estática para uma plataforma web real, editável e integrada.

## 1. Contexto

O site atual é um conjunto de páginas HTML estáticas (Vite + JS vanilla) já otimizado para
SEO, acessibilidade (WCAG 2.1 AA) e conversão, mas com limitações de operação:

- Conteúdo/agenda são "fake" (dados de demonstração em `localStorage`).
- Sem back-end: formulários não persistem, não há área do paciente nem painel real.
- Deploy/manutenção manual; sem testes automatizados nem observabilidade.

## 2. Objetivo

Migrar para uma aplicação **Next.js (App Router + TypeScript)** com **Supabase** (Postgres/Auth/
Storage/RLS) e **Payload CMS v3**, preservando o visual e o desempenho já entregues, e
habilitando: conteúdo editável, agendamento real e área do paciente.

Decisões confirmadas com o cliente: **só PT-BR**, **sem pagamentos online**, roadmap em **2 marcos**,
MVP **real** (não apenas protótipo).

## 3. Arquitetura

```
Vercel
 ├─ Next.js (App Router, TS, RSC) ── site público + /admin (Payload) + rotas de API
 │     ├── three.js (ilha isolada, dynamic import, ssr:false)
│     └── Payload CMS v3 (embutido, admin em /admin)
└── Supabase
     ├── Postgres (compartilhado com o Payload via db-postgres)
     ├─ Auth (paciente) + RLS
     ├── Storage (imagens, documentos)
     └─ Edge Functions (webhooks/agendamento, se necessário)

Serviços: Resend (e-mail) · WhatsApp Cloud API (fallback click-to-chat)
Observabilidade: Sentry + GA4 + web-vitals
```

**Modelo de dados (Supabase):** `profiles`, `leads` (+UTM), `appointments`,
`availability_rules`, `consents`, `notifications`.

## 3.1 Estratégia de migração (incremental, sem "big bang")

- O site estático atual permanece publicável durante toda a migração.
- O app Next vive em `web/` e hoje serve todas as rotas via **ponte SSR** que reusa o markup
  legado (mesma aparência/SEO), a ser substituída seção a seção por componentes React
  alimentados pelo Payload.
- URLs limpas com **301** dos `.html`; `robots.txt`, `sitemap.xml` e JSON-LD (`Dentist`, `FAQPage`).

## 4. Escopo

### Marco 1 — Plataforma (base + back-end real)

| Frente | Entregáveis |
| --- | --- |
| A. Migração Next | App Router/TS, 15 rotas + 301, PWA, metadata/JSON-LD/sitemap, assets, CSS |
| B. Qualidade/CI | ESLint/Prettier, Vitest, Playwright (smoke + axe + redirects), GitHub Actions, budgets Lighthouse CI, Sentry + GA4 + web-vitals |
| C. Back-end real | Supabase Auth + RLS; Payload básico (`/admin`); agendamento (slots, conflito, confirmar/cancelar); leads + KPIs; Resend; WhatsApp click-to-chat |
| D. Segurança/LGPD | CSP/headers, honeypot/Turnstile, consentimento e política de dados |

### Marco 2 — Operação e conteúdo

- Payload completo (conteúdo editável: serviços, equipe, blog, depoimentos, FAQ).
- Imagens otimizadas com `next/image` (AVIF/WebP).
- Dashboards no admin (agenda, leads, KPIs).
- WhatsApp Cloud API com templates e confirmações automáticas.

## 5. Não objetivos

- Pagamentos online e i18n multi-idioma (fora de escopo nesta fase).

## 6. Critérios de aceite

- `next build` sem erros; lint e typecheck limpos (0 erros).
- Testes unitários e E2E verdes; **axe sem violações sérias/críticas** (WCAG 2.1 AA).
- Paridade visual e de SEO com o site estático (200 nas rotas, JSON-LD, sitemap).
- Fluxo de agendamento persistido no Supabase com confirmações por e-mail/WhatsApp.
- Painel `/admin` (Payload) permitindo edição de conteúdo sem deploy.

## 7. Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Regressão visual na migração | Ponte SSR + testes de paridade/E2E + axe |
| Custo/latência de back-end | RLS + índices; cache ISR; budgets de performance |
| LGPD/segurança | Consentimento, CSP, minimização de dados, auditoria de acessos |

## 8. Status atual

Marco 1 — **Frente A e B concluídas** (app Next de pé, testes e CI verdes). Frentes C e D em
andamento. Ver `docs/checklist-nextjs.md` e `docs/migracao-nextjs.md`.
