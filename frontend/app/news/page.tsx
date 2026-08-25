/**
 * 新闻列表页（静态壳）
 *
 * 学习要点（"静态壳 + 客户端筛选"模式）：
 * 1. 本页面是服务端组件：构建期用 getArticles() 读取全部新闻数据。
 * 2. 但"分类/年份/分页筛选"在客户端进行（NewsFilterableList 是客户端组件），
 *    因为静态导出没有服务端运行时，无法在服务端处理 ?category=xxx 查询参数。
 * 3. 数据量增长到数千条前，这种浏览器端筛选方案足够用，无需改回服务端方案。
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
