import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Áreas autenticadas e administrativas nunca devem ser indexadas.
        disallow: ["/app", "/app/", "/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
