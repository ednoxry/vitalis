/* Service Worker — cache básico (network-first para HTML, cache-first para estáticos) */
const CACHE = "vitalis-v4";
const ASSETS = [
  "index.html", "servicos.html", "sobre.html", "blog.html", "blog-post.html",
  "blog-post-implante.html", "blog-post-infantil.html",
  "contato.html", "agendamento.html", "cliente.html", "privacidade.html", "admin.html",
  "/assets/css/style.css", "/assets/js/main.js",
  "/favicon.svg", "/og.svg", "/img/tooth-fallback.svg", "manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then(async (c) => {
        await Promise.allSettled(ASSETS.map((u) => c.add(u)));
        return self.skipWaiting();
      })
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.headers.get("accept")?.includes("text/html")) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match("index.html")))
    );
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
