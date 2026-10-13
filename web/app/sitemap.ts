import type { MetadataRoute } from "next";
import { CLINIC } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{ path: string; priority: number }> = [
    { path: "", priority: 1 },
    { path: "/servicos", priority: 0.9 },
    { path: "/sobre", priority: 0.8 },
    { path: "/blog", priority: 0.7 },
    { path: "/blog-post", priority: 0.6 },
    { path: "/blog-post-implante", priority: 0.6 },
    { path: "/blog-post-infantil", priority: 0.6 },
    { path: "/contato", priority: 0.8 },
    { path: "/agendamento", priority: 0.9 },
    { path: "/privacidade", priority: 0.3 },
  ];

  return routes.map(({ path, priority }) => ({
    url: `${CLINIC.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  }));
}
