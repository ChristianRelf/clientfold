import type { MetadataRoute } from "next";
import { AUDIENCES, SEO_LANDERS } from "@/lib/marketing/content";
import { CASE_STUDIES } from "@/lib/marketing/customers";
import { supportArticles } from "@/lib/support/articles";

const APP_URL = process.env.APP_URL ?? "https://useclientfold.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = ["", "/features", "/pricing", "/demo", "/waitlist", "/about", "/integrations", "/contact", "/support", "/legal", "/terms", "/privacy", "/cookies", "/acceptable-use", "/accessibility", "/refunds", "/security"];
  const audiencePaths = Object.keys(AUDIENCES).map((s) => `/for/${s}`);
  const landerPaths = Object.keys(SEO_LANDERS).map((s) => `/${s}`);
  const customerPaths = CASE_STUDIES.map((c) => `/customers/${c.slug}`);
  const supportPaths = supportArticles.map((article) => `/support/${article.slug}`);

  return [...staticPaths, ...audiencePaths, ...landerPaths, ...customerPaths, ...supportPaths].map((path) => ({
    url: `${APP_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
