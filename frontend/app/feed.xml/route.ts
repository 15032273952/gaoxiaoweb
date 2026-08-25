/**
 * 校园新闻 RSS 2.0：/feed.xml
 *
 * 学习要点：
 * 1. 这是一个 Route Handler（路由处理器），用 GET() 函数响应 /feed.xml 请求。
 * 2. export const dynamic = "force-static"：强制在构建期生成静态 feed.xml。
 *    因为本项目是 output: "export" 全静态导出，没有服务端运行时，
 *    不加这行会导致静态导出失败。
 * 3. escapeXml：RSS 是 XML 格式，标题里的 & < > " 必须转义，否则 XML 解析报错。
 */

import { getArticles, getSiteSetting } from "@/lib/content";
import { getSiteUrl } from "@/lib/site";

// 静态导出：构建期生成静态 feed.xml
export const dynamic = "force-static";

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
