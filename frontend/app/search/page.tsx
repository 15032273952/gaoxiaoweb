/**
 * 站内搜索结果页 - /search?q=
 */

import { Breadcrumb } from "@/components/Breadcrumb";
import { SearchForm } from "@/components/SearchForm";
import { searchSite } from "@/lib/cms";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

const KIND_LABEL = {
  news: "新闻",
  notice: "通知",
  faculty: "师资",
  department: "部门",
} as const;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  return {
    title: q ? `搜索：${q}` : "站内搜索",
    description: "检索校园新闻、通知公告、师资与部门信息。",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const hits = q ? await searchSite(q) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb items={[{ label: "站内搜索" }]} />
      <h1 className="text-2xl font-bold mb-6 font-serif-title">站内搜索</h1>
      <SearchForm defaultQuery={q} id="search-page-q" />

      {q ? (
        <p className="mt-6 mb-4 text-sm text-zinc-500">
          “{q}” 共 {hits.length} 条结果
        </p>
      ) : (
        <p className="mt-6 text-sm text-zinc-400">请输入关键词，可检索新闻、通知、师资与部门。</p>
      )}

      {q && hits.length === 0 && (
        <p className="text-zinc-500 text-sm">未找到相关内容，可尝试更短的关键词。</p>
      )}

      {hits.length > 0 && (
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
    </div>
  );
}
