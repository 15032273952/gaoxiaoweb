"use client";

/**
 * 站内搜索面板（客户端）
 * 静态导出后 searchParams 不在服务端可用，检索改为：构建期把索引打进
 * 客户端 bundle（content/*.json 体量很小），浏览器内本地过滤，行为不变。
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { searchSite, type SiteSearchHit } from "@/lib/content";
import { SearchForm } from "@/components/SearchForm";

const KIND_LABEL = {
  news: "新闻",
  notice: "通知",
  faculty: "师资",
  department: "部门",
} as const;

export function SearchPanel({ formId }: { formId: string }) {
  const searchParams = useSearchParams();
  const q = useMemo(() => (searchParams.get("q") ?? "").trim(), [searchParams]);
  const [hits, setHits] = useState<SiteSearchHit[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    // null = 检索中；[] = 已完成且无结果（本地过滤瞬时完成，无需 loading UI）
    searchSite(q).then((result) => {
      if (cancelled) return;
      setHits(result);
    });
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <>
      <SearchForm defaultQuery={q} id={formId} />

      {q ? (
        hits !== null && (
          <p className="mt-6 mb-4 text-sm text-zinc-500">
            “{q}” 共 {hits.length} 条结果
          </p>
        )
      ) : (
        <p className="mt-6 text-sm text-zinc-400">请输入关键词，可检索新闻、通知、师资与部门。</p>
      )}

      {q && hits !== null && hits.length === 0 && (
        <p className="text-zinc-500 text-sm">未找到相关内容，可尝试更短的关键词。</p>
      )}

      {hits !== null && hits.length > 0 && (
        <ul className="divide-y divide-zinc-100 border-t border-zinc-100">
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.href}-${hit.title}`} className="py-4">
              <Link href={hit.href} className="group block">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-thu-purple-light text-thu-purple-dark">
                    {KIND_LABEL[hit.kind]}
                  </span>
                  <span className="font-medium text-zinc-900 group-hover:text-thu-purple transition-colors">
                    {hit.title}
                  </span>
                </div>
                {hit.snippet && (
                  <p className="text-sm text-zinc-500 line-clamp-2">{hit.snippet}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
