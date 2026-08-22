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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Breadcrumb items={[{ label: "新闻公告", href: "/news" }, { label: "校园新闻" }]} />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 font-serif-title text-zinc-900">校园新闻</h1>

      {/* 移动端横向无阻滑动筛选栏 */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <Link
          href="/news"
          className={
            !category
              ? "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-thu-purple text-white shadow-2xs"
              : "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-white border border-zinc-200 text-zinc-700 hover:border-thu-purple hover:text-thu-purple transition-colors"
          }
        >
          全部新闻
        </Link>
        {ARTICLE_CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={newsHref(c.value)}
            className={
              category === c.value
                ? "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-thu-purple text-white shadow-2xs"
                : "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-white border border-zinc-200 text-zinc-700 hover:border-thu-purple hover:text-thu-purple transition-colors"
            }
          >
            {c.label}
          </Link>
        ))}
      </div>

      {slice.length > 0 ? (
        <>
          <div className="mb-4 flex items-center justify-between text-xs sm:text-sm text-zinc-400">
            <span>共 {filtered.length} 篇相关资讯</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {slice.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
          <div className="mt-8">
            <Pagination
              page={safePage}
              totalPages={totalPages}
              hrefFor={(p) => newsHref(category, p)}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-zinc-150 text-zinc-400 text-sm">
          该分类下暂无新闻
        </div>
      )}
    </div>
  );
}
