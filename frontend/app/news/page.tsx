/**
 * 新闻列表页（静态壳）：分类、年份、分页筛选在客户端进行。
 */

import { getArticles } from "@/lib/content";
import { NewsFilterableList } from "@/components/NewsFilterableList";
import { ListPageShell } from "@/components/ListPageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "校园新闻",
  description: "高校校园新闻、学术动态与媒体报道。",
};

export default async function NewsPage() {
  const articles = await getArticles().catch(() => []);
  return (
    <ListPageShell
      title="校园新闻"
      crumbs={[{ label: "新闻公告", href: "/news" }, { label: "校园新闻" }]}
      fallback="正在加载新闻列表…"
    >
      <NewsFilterableList articles={articles} />
    </ListPageShell>
  );
}
