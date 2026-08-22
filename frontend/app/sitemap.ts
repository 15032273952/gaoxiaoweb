/**
 * 机器可读站点地图 /sitemap.xml
 */

import type { MetadataRoute } from "next";
import { getArticles, getNotices } from "@/lib/cms";
import { navItems } from "@/lib/nav";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticPaths = new Set<string>(["/", "/search", "/site-map", "/faculty", "/organization"]);
  for (const item of navItems) {
    staticPaths.add(item.href);
    item.children?.forEach((c) => staticPaths.add(c.href));
  }

  const [articles, notices] = await Promise.all([
    getArticles().catch(() => []),
    getNotices().catch(() => []),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [...staticPaths].map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.6,
  }));

  const newsEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/news/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const noticeEntries: MetadataRoute.Sitemap = notices.map((n) => ({
    url: `${base}/notices/${n.slug}`,
    lastModified: n.publishedAt ? new Date(n.publishedAt) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...newsEntries, ...noticeEntries];
}
