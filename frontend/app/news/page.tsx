/**
 * 新闻列表页 - 支持分类筛选与分页
 */

import { getArticles } from "@/lib/cms";
import { NewsCard } from "@/components/NewsCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Pagination } from "@/components/Pagination";
import {
  ARTICLE_CATEGORIES,
  parseArticleCategory,
  parsePage,
} from "@/lib/labels";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "新闻列表 - 高校官网",
  description: "高校校园新闻、学术动态与媒体报道。",
};

const PAGE_SIZE = 12;

type Props = {
  searchParams: Promise<{ category?: string | string[]; page?: string | string[] }>;
};

function newsHref(category?: string, page?: number) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/news?${qs}` : "/news";
}

export default async function NewsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const category = parseArticleCategory(sp.category);
  const page = parsePage(sp.page);
  const articles = await getArticles().catch(() => []);
  const filtered = category
    ? articles.filter((a) => a.category === category)
    : articles;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb items={[{ label: "新闻公告", href: "/news" }, { label: "校园新闻" }]} />
      <h1 className="text-2xl font-bold mb-6 font-serif-title">校园新闻</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/news"
          className={
            !category
              ? "px-3 py-1.5 text-sm rounded bg-thu-purple text-white"
              : "px-3 py-1.5 text-sm rounded border border-zinc-200 hover:border-thu-purple hover:text-thu-purple"
          }
        >
          全部
        </Link>
        {ARTICLE_CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={newsHref(c.value)}
            className={
              category === c.value
                ? "px-3 py-1.5 text-sm rounded bg-thu-purple text-white"
                : "px-3 py-1.5 text-sm rounded border border-zinc-200 hover:border-thu-purple hover:text-thu-purple"
            }
          >
            {c.label}
          </Link>
        ))}
      </div>

      {slice.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-zinc-400">共 {filtered.length} 条</p>
          <div className="grid md:grid-cols-2 gap-4">
            {slice.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            hrefFor={(p) => newsHref(category, p)}
          />
        </>
      ) : (
        <p className="text-zinc-400 text-sm py-8">该分类暂无新闻</p>
      )}
    </div>
  );
}
