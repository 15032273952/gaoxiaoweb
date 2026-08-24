/**
 * 通知公告列表页（静态壳）：级别筛选与分页在客户端进行。
 */

import { Suspense } from "react";
import { getNotices } from "@/lib/content";
import { NoticeFilterableList } from "@/components/NoticeFilterableList";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "通知公告",
  description: "高校通知公告列表。",
};

export default async function NoticesPage() {
  const notices = await getNotices().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Breadcrumb items={[{ label: "新闻公告", href: "/news" }, { label: "通知公告" }]} />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 font-serif-title text-zinc-900">通知公告</h1>
      <Suspense fallback={<p className="text-sm text-zinc-400">正在加载通知列表…</p>}>
        <NoticeFilterableList notices={notices} />
      </Suspense>
    </div>
  );
}
