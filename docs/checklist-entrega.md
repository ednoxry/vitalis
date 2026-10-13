# Checklist de Entrega — Site Premium

> Checklist de qualidade usado antes de publicar e na entrega final ao cliente.
> Marque todos os itens antes do go-live.

---

## 1. Conteúdo e páginas

- [ ] 11 páginas publicadas e navegação completa (home, tratamentos, clínica, blog, contato, agendamento, área do paciente, privacidade, 404, admin)
- [ ] Textos revisados (sem erros de gramática, sem "Lorem", sem dados fictícios aparentes)
- [ ] Imagens reais e otimizadas por página; `alt` descritivo e `title` coerente
- [ ] Metadados (`title`, `description`, `canonical`) únicos por página
- [ ] Favicon, `og.svg` e PWA manifest corretos

## 2. Conversão e funcionalidades

- [ ] Agendamento em 3 passos funciona (validação, calendário, horários, sucesso)
- [ ] Recibo/comprovante imprime corretamente
- [ ] WhatsApp com mensagem pré-preenchida em todos os CTAs e no float
- [ ] Formulário de contato envia e registra lead
- [ ] Painel `/admin` exibe leads, KPIs, gráfico, CSV e limpeza
- [ ] Área do paciente ("entrar como paciente de exemplo") funciona
- [ ] Calculadora de parcelas e FAQ/breadcrumbs presentes

## 3. Responsividade (11 páginas)

- [ ] Sem overflow horizontal em: 360, 390, 414, 600, 768, 820, 1024, 1280, 1440
- [ ] Menu mobile abre/fecha e navega
- [ ] Fontes, imagens e botões legíveis no celular; toque = ativo/target ≥ 44px
- [ ] `srcset`/`sizes` corretos (celular/tablet/desktop/retina)

## 4. Performance e PWA

- [ ] `npm run build` sem erros; `dist/` gerado
- [ ] Imagens servidas em tamanho certo com `loading="lazy"` (exceto LCP)
- [ ] PageSpeed ≥ 90 móvel / ≥ 95 desktop (ideal: 95+/100)
- [ ] Service worker registrado; recarrega offline
- [ ] Sem console errors no devtools

## 5. SEO

- [ ] JSON-LD válido: Dentist/MedicalBusiness, FAQPage, BreadcrumbList, Article, OfferCatalog
- [ ] `sitemap.xml` e `robots.txt` publicados
- [ ] URLs canônicas definidas; `og.svg` com marca
- [ ] Google Analytics / GA4 e Google Business Profile configurados (produção)

## 6. Acessibilidade (WCAG 2.1 AA)

- [ ] Contraste adequado (ferramenta de contraste sem violações em texto normal)
- [ ] Navegação completa por teclado (`:focus-visible` visível)
- [ ] `prefers-reduced-motion` respeitado (animações desligam)
- [ ] `aria-label` em ícones-só-botão; formulários com `<label>`; alertas/toggles anunciados
- [ ] Título de página e idioma (`lang="pt-BR"`) corretos

## 7. LGPD e confiança

- [ ] Banner de cookies / LGPD com aceite persistido
- [ ] Política de privacidade completa (bases legais, direitos, DPO, cookies)
- [ ] Selos LGPD, WCAG e HTTPS visíveis no rodapé
- [ ] Formulários com aceite LGPD obrigatório

## 8. Entrega ao cliente

- [ ] DOMÍNIO apontado + SSL (HTTPS) ativo e zerado em *mixed content*
- [ ] Manual de uso e treinamento em vídeo entregues
- [ ] Ambiente de produção separado do dev; acesso documentado
- [ ] 30 dias de suporte combinado; agenda de reunião de pós-go-live

---

### Como validar rápido (comandos)

```bash
npm run build && npm run preview
node --check assets/js/main.js          # sintaxe JS
# validação de imagem responsiva e overflow: abrir no navegador em 360/768/1440
```

> Referencie este checklist também na reunião de go-live — ele vira o **aceite do cliente**.