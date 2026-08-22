/**
 * 校园新闻 RSS 2.0：/feed.xml
 */

import { getArticles, getSiteSetting } from "@/lib/cms";
import { getSiteUrl } from "@/lib/site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const base = getSiteUrl();
  const [setting, articles] = await Promise.all([
    getSiteSetting().catch(() => null),
    getArticles().catch(() => []),
  ]);
  const siteName = setting?.siteName ?? "高校官网";
  const items = articles.slice(0, 30).map((a) => {
    const link = `${base}/news/${a.slug}`;
    const date = a.publishedAt ? new Date(a.publishedAt).toUTCString() : "";
    return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      ${date ? `<pubDate>${date}</pubDate>` : ""}
      <description>${escapeXml(a.summary || a.title)}</description>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteName)} 校园新闻</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(`${siteName}官方网站新闻订阅`)}</description>
    <language>zh-CN</language>
${items.join("\n")}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
