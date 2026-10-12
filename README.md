# Clínica Vitalis — Site Institucional Premium

> **Atenção:** projeto de **demonstração comercial / portfólio**. Não há backend real —
> leads, login do paciente e agendamento são simulados via `localStorage`.

Site institucional premium de uma clínica odontológica, construído como vitrine do que
um projeto de alto valor entrega em **design, conversão e profissionalismo**. Produzido
com **HTML + CSS + JS vanilla** (sem bibliotecas de runtime) e **Vite** para build.

Patrocinado (abaixo) na home: **⭐ 4,9 no Google · +15 anos de experiência**.

---

## Índice

- [Destaques](#destaques)
- [Páginas](#páginas)
- [Funcionalidades](#funcionalidades)
- [Design e animações](#design-e-animações)
- [Acessibilidade e SEO](#acessibilidade-e-seo)
- [PWA](#pwa)
- [Stack](#stack)
- [Executar](#executar)
- [Estrutura](#estrutura)
- [Credenciais de demonstração](#credenciais-de-demonstração)
- [Créditos e licença](#créditos-e-licença)

---

## Destaques

- **11 páginas** estáticas, todas responsivas (celular, tablet, notebook e PC)
- **Fotos reais** (Pexels) com `srcset` em **3 tamanhos** por imagem (sm/md/lg)
- **Agendamento em 3 passos** com calendário interativo, horários por período e **recibo imprimível**
- **Área do paciente** simulada (login com paciente de exemplo)
- **Painel administrativo** com leads, KPIs, gráfico e **exportação CSV**
- **Antes/depois** do mesmo paciente (via filtro "dentes amarelados")
- **LGPD** (banner de cookies) e **PWA** (instalável, offline-first)
- **Muitas animações** para mouse e touch (ripple, magnético, reveal com stagger, marquee…)
- **JSON-LD**, `sitemap.xml` e `robots.txt` para SEO

---

## Páginas

| Rota             | Descrição                                                            |
|------------------|----------------------------------------------------------------------|
| `/`              | Home — hero, resultados, serviços, por que escolher, equipe, depoimentos, blog |
| `/servicos.html` | Tratamentos com fotos temáticas (implante, orto, clareamento, lentes…) |
| `/sobre.html`    | A clínica, equipe e estrutura                                         |
| `/agendamento.html` | Agendamento em 3 passos, calculadora de parcelas e FAQ               |
| `/cliente.html`  | Área do paciente (demonstração)                                       |
| `/admin.html`    | Painel de leads e indicadores (senha `vitalis`)                        |
| `/blog.html`     | Lista de artigos                                                       |
| `/blog-post.html`| Artigo individual                                                      |
| `/contato.html`  | Contato, mapa, horários e redes                                         |
| `/privacidade.html` | Política de privacidade (LGPD)                                       |
| `/404.html`      | Página não encontrada                                                  |

---

## Funcionalidades

### Agendamento (`agendamento.html` + `main.js`)
- Stepper em 3 etapas (serviço → data/horário → dados) com validação
- **Calendário interativo**: grade mensal, navegação até o mês atual, domingos e datas
  passadas bloqueadas, sábados sem horário noturno, horários já passados ocultos
- Seleção por período (Manhã / Tarde / Noite)
- Resumo final com **botão de recibo imprimível** e envio para WhatsApp
- Registro de lead no painel administrativo

### Painel administrativo (`admin.html`)
- Login de demonstração (senha `vitalis`)
- KPIs (leads, conversão em avanços, origem), gráfico em **Canvas**
- Tabela de leads com origem, canal e data; **exportação CSV** e botão **limpar dados**

### Área do paciente (`cliente.html`)
- "Entrar como paciente de exemplo" — simula acesso com dados pré-cadastrados

### Leads e UTM
- `main.js` expõe em `window`: `vitalisTrack`, `vitalisLeads`, `vitalisLead`, `vitalisToast`
- Captura cliques de WhatsApp e envios de formulário com origem/UTM

### Captura e conversão
- CTA de WhatsApp em todo o site (float animado, hero, cards, contato)
- Formulário de contato com toasts de confirmação

---

## Design e animações

- **Sistema de design** via variáveis CSS: cores `--brand`, `--accent`, tema **claro/escuro**
- Tipografia: Inter, com hierarquia `clamp()` responsiva
- **Antes/depois** por slider arrastável com a **mesma foto** (antes = filtro amarelado)

### Camada de motion (mouse + touch)
- **Ripple** em botões/ícones (`pointerdown` — funciona com dedo e mouse)
- **Efeito magnético** nos CTAs principais (só pointer fino)
- **Brilho** que percorre o botão no hover / **gradiente vivo** e **pulso** em touch
- **Tilt 3D** no hero e **marquee** infinito na faixa de convênios
- **Reveal ao scroll** com variantes (`zoom`, `flip`, `left`, `right`) e **stagger** em cascata
- **Barra de progresso** do scroll, header que encolhe, underline animado no menu
- Cards com hover lift, ícones que giram, inputs com anel de foco

> Tudo respeita `prefers-reduced-motion`.

---

## Acessibilidade e SEO

- HTML semântico (header/main/footer/nav/section), `aria-label` e `alt` descritivos
- Foco visível (`:focus-visible`) e navegação via tabulação
- **JSON-LD** `Dentist` / `MedicalClinic` na home
- `sitemap.xml`, `robots.txt`, `og.svg` e breadcrumbs nas páginas internas
- Contraste alto, temas light/dark e larguras mínimas testadas

---

## PWA

- `manifest.webmanifest` (nome, ícones, tema)
- `sw.js` — service worker com **cache offline** (prefixo `vitalis-`)
- `main.js` registra o SW, atualiza o cache em builds e evita "double install"

---

## Stack

- **Vite 8** (`^8.3.4`) — dev server + build
- **HTML5** + **CSS3** (grid, variáveis, animações, media queries `hover`/`pointer`)
- **JavaScript vanilla** (ES modules, sem dependências de runtime)
- **Canvas API** (gráfico do painel) e **`localStorage`** (leads, tema, LGPD, dados do paciente)

---

## Executar

Pré-requisito: Node.js 20+ e npm.

```bash
npm install
npm run dev      # desenvolvimento → http://localhost:5173
npm run build    # build de produção → dist/
npm run preview  # pré-visualizar o build  → http://localhost:4173
npm run serve    # igual ao preview
```

Verificação básica de qualidade:

```bash
node --check assets/js/main.js    # sintaxe do JS
npm run build                     # build limpo
```

---

## Estrutura

```
clinica-vitalis/
├── index.html                  # Home
├── servicos.html               # Tratamentos
├── sobre.html                  # A clínica e equipe
├── agendamento.html            # Fluxo de agendamento (3 passos)
├── cliente.html                # Área do paciente (demo)
├── admin.html                  # Painel administrativo (demo)
├── blog.html / blog-post.html  # Blog
├── contato.html                # Contato
├── privacidade.html            # LGPD
├── 404.html
├── assets/
│   ├── css/style.css           # Todo o estilo (design system + animações)
│   └── js/main.js              # Módulos em JS vanilla (sem dependências)
├── public/
│   ├── img/                    # Fotos Pexels — <key>-{sm,md,lg}.jpg
│   ├── favicon.svg             # Favicon
│   ├── og.svg                  # Imagem para compartilhamento
│   ├── manifest.webmanifest    # PWA manifest
│   ├── sw.js                   # Service worker (cache offline)
│   ├── robots.txt              # SEO
│   └── sitemap.xml             # SEO
├── dist/                       # Build de produção (gerado)
└── package.json
```

### Imagens

As fotos seguem o padrão `{chave}-{sm|md|lg}.jpg` e são consumidas via `srcset`:

| Chave                     | Descrição                    | Formato   |
|---------------------------|------------------------------|-----------|
| `hero-portrait`           | Foto do hero                 | 4:5       |
| `ba-teeth`                | Antes/depois (resultados)    | 16:10     |
| `svc-*` (6)               | Cards de tratamentos         | 4:3       |
| `team-1..4`               | Equipe                       | 1:1       |
| `clinic-1..4`             | Estrutura                    | 1:1       |
| `quote-1..3`              | Depoimentos                  | 1:1       |

---

## Credenciais de demonstração

| Área      | Acesso                                                        |
|-----------|---------------------------------------------------------------|
| `/admin`  | Senha: `vitalis`                                              |
| `/cliente`| Botão "Entrar como paciente de exemplo"                        |

---

## Créditos e licença

- **Fotos:** [Pexels](https://pexels.com) (licença Pexels — livres para uso comercial sem atribuição obrigatória).
- **Marca** (`favicon.svg`, `og.svg`): de autoria própria.
- **Conteúdo:** textos, avaliações (4,9/5), marcas citadas (Invisalign®, Straumann® etc.) e
  dados de pacientes são **fictícios**, apenas para demonstração.
- Projeto mantido como **portfólio comercial**. Uso sob sua responsabilidade.

---

Feito como demonstração comercial de sites premium para clínicas odontológicas.# vitalis
