import type { MetadataRoute } from "next";
import { CLINIC } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/cliente"],
      },
    ],
    sitemap: `${CLINIC.url}/sitemap.xml`,
  };
}
