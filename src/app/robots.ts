import type { MetadataRoute } from "next";

const APP_URL = process.env.APP_URL ?? "https://clientfold.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Never index the private app, client portals, internal tools or auth.
        disallow: ["/home", "/waiting", "/projects", "/clients", "/inbox", "/invoices", "/files", "/settings", "/internal", "/portal", "/login", "/signup", "/api"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
