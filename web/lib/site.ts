export const CLINIC = {
  name: "Clínica Vitalis",
  whatsapp: "5541999990000",
  url: "https://www.clinicavitalis.com.br",
  phoneDisplay: "(11) 99999-0000",
  phoneTel: "+5511999990000",
  email: "contato@clinicavitalis.com.br",
  address: {
    street: "Av. Paulista, 1000 — Sala 501",
    locality: "São Paulo",
    region: "SP",
    postalCode: "01310-100",
  },
} as const;

export type NavItem = { href: string; label: string };

export const NAV: NavItem[] = [
  { href: "/", label: "Início" },
  { href: "/servicos", label: "Tratamentos" },
  { href: "/sobre", label: "A Clínica" },
  { href: "/blog", label: "Blog" },
  { href: "/contato", label: "Contato" },
];

export const MOBILE_NAV: NavItem[] = [...NAV, { href: "/agendamento", label: "Agendar avaliação" }];

/** Mapa das páginas legadas (bridge de migração) → rota limpa. */
export const LEGACY_ROUTES: Record<string, string> = {
  "index.html": "/",
  "servicos.html": "/servicos",
  "sobre.html": "/sobre",
  "blog.html": "/blog",
  "blog-post.html": "/blog-post",
  "blog-post-implante.html": "/blog-post-implante",
  "blog-post-infantil.html": "/blog-post-infantil",
  "contato.html": "/contato",
  "agendamento.html": "/agendamento",
  "cliente.html": "/cliente",
  "admin.html": "/admin",
  "privacidade.html": "/privacidade",
};

export function whatsappLink(message: string): string {
  return `https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent(message)}`;
}
