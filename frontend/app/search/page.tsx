/**
 * 站内搜索结果页 - /search?q=
 * 静态导出：页面为静态壳，检索在客户端进行（见 SearchPanel）。
 */

import { Suspense } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SearchPanel } from "@/components/SearchPanel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "站内搜索",
  description: "检索校园新闻、通知公告、师资与部门信息。",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb items={[{ label: "站内搜索" }]} />
      <h1 className="text-2xl font-bold mb-6 font-serif-title">站内搜索</h1>
      <Suspense fallback={<p className="mt-6 text-sm text-zinc-400">正在加载检索…</p>}>
        <SearchPanel formId="search-page-q" />
      </Suspense>
    </div>
  );
}
