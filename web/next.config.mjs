const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co${isDev ? " ws: http: https:" : ""}`,
  "frame-src 'self' https://challenges.cloudflare.com https://www.openstreetmap.org",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

if (!isDev) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: import.meta.dirname,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/servicos.html", destination: "/servicos", permanent: true },
      { source: "/sobre.html", destination: "/sobre", permanent: true },
      { source: "/blog.html", destination: "/blog", permanent: true },
      { source: "/blog-post.html", destination: "/blog-post", permanent: true },
      {
        source: "/blog-post-implante.html",
        destination: "/blog-post-implante",
        permanent: true,
      },
      {
        source: "/blog-post-infantil.html",
        destination: "/blog-post-infantil",
        permanent: true,
      },
      { source: "/contato.html", destination: "/contato", permanent: true },
      { source: "/agendamento.html", destination: "/agendamento", permanent: true },
      { source: "/cliente.html", destination: "/cliente", permanent: true },
      { source: "/admin.html", destination: "/admin", permanent: true },
      { source: "/privacidade.html", destination: "/privacidade", permanent: true },
    ];
  },
};

export default nextConfig;
