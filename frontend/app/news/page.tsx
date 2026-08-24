/**
 * 新闻列表页（静态壳）：分类、年份、分页筛选在客户端进行。
 */

import { Suspense } from "react";
import { getArticles } from "@/lib/content";
import { NewsFilterableList } from "@/components/NewsFilterableList";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "校园新闻",
  description: "高校校园新闻、学术动态与媒体报道。",
};

export default async function NewsPage() {
  const articles = await getArticles().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Breadcrumb items={[{ label: "新闻公告", href: "/news" }, { label: "校园新闻" }]} />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 font-serif-title text-zinc-900">校园新闻</h1>
      <Suspense fallback={<p className="text-sm text-zinc-400">正在加载新闻列表…</p>}>
        <NewsFilterableList articles={articles} />
      </Suspense>
    </div>
  );
}
