"use client";

/**
 * 新闻列表（客户端筛选）：分类、年份、分页。
 * 静态导出后 query 过滤在浏览器内进行，数据由服务端页面传入。
 */

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ArticleListItem } from "@/lib/types";
import { NewsCard } from "@/components/NewsCard";
import { Pagination } from "@/components/Pagination";
import {
  ARTICLE_CATEGORIES,
  parseArticleCategory,
  parsePage,
  parseYear,
} from "@/lib/labels";

const PAGE_SIZE = 12;

function newsHref(category?: string, year?: number, page?: number) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (year) params.set("year", String(year));
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/news?${qs}` : "/news";
}

function chipClass(active: boolean) {
  return active
    ? "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-thu-purple text-white shadow-2xs"
    : "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-white border border-zinc-200 text-zinc-700 hover:border-thu-purple hover:text-thu-purple transition-colors";
}

export function NewsFilterableList({ articles }: { articles: ArticleListItem[] }) {
  const searchParams = useSearchParams();
  const category = parseArticleCategory(searchParams.get("category") ?? undefined);
  const year = parseYear(searchParams.get("year") ?? undefined);
  const page = parsePage(searchParams.get("page") ?? undefined);

  const years = useMemo(
    () =>
      [...new Set(
        articles
          .map((a) => new Date(a.publishedAt).getFullYear())
          .filter((y) => Number.isFinite(y)),
      )].sort((a, b) => b - a),
    [articles],
  );

  const filtered = useMemo(
    () =>
      articles.filter((a) => {
        if (category && a.category !== category) return false;
        if (year && new Date(a.publishedAt).getFullYear() !== year) return false;
        return true;
      }),
    [articles, category, year],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      {/* 移动端横向无阻滑动筛选栏 */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <Link href={newsHref(undefined, year)} className={chipClass(!category)}>
          全部新闻
        </Link>
        {ARTICLE_CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={newsHref(c.value, year)}
            className={chipClass(category === c.value)}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {years.length > 1 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          <Link href={newsHref(category)} className={chipClass(!year)}>
            全部年份
          </Link>
          {years.map((y) => (
            <Link key={y} href={newsHref(category, y)} className={chipClass(year === y)}>
              {y}年
            </Link>
          ))}
        </div>
      )}

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
              hrefFor={(p) => newsHref(category, year, p)}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-zinc-150 text-zinc-400 text-sm">
          暂无符合条件的新闻
        </div>
      )}
    </>
  );
}
