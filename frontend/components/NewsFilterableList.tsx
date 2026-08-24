"use client";

/**
 * 新闻列表（客户端筛选）：分类、年份、分页。
 * 静态导出后 query 过滤在浏览器内进行，数据由服务端页面传入。
 */

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ArticleListItem } from "@/lib/types";
import { NewsCard } from "@/components/NewsCard";
import { Pagination } from "@/components/Pagination";
import { ChipBar, FilterChip } from "@/components/ChipBar";
import { EmptyState } from "@/components/EmptyState";
import { useClientPaging } from "@/lib/useClientPaging";
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

  const { totalPages, safePage, slice } = useClientPaging(filtered, page, PAGE_SIZE);

  return (
    <>
      {/* 移动端横向无阻滑动筛选栏 */}
      <ChipBar>
        <FilterChip href={newsHref(undefined, year)} active={!category}>
          全部新闻
        </FilterChip>
        {ARTICLE_CATEGORIES.map((c) => (
          <FilterChip key={c.value} href={newsHref(c.value, year)} active={category === c.value}>
            {c.label}
          </FilterChip>
        ))}
      </ChipBar>

      {years.length > 1 && (
        <ChipBar>
          <FilterChip href={newsHref(category)} active={!year}>
            全部年份
          </FilterChip>
          {years.map((y) => (
            <FilterChip key={y} href={newsHref(category, y)} active={year === y}>
              {y}年
            </FilterChip>
          ))}
        </ChipBar>
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
        <EmptyState>暂无符合条件的新闻</EmptyState>
      )}
    </>
  );
}
