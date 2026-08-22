/**
 * 通知公告列表页 - 支持级别筛选与分页
 */

import { getNotices } from "@/lib/cms";
import { NoticeList } from "@/components/NoticeList";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Pagination } from "@/components/Pagination";
import { NOTICE_LEVELS, parseNoticeLevel, parsePage } from "@/lib/labels";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "通知公告",
  description: "高校通知公告列表。",
};

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{ level?: string | string[]; page?: string | string[] }>;
};

/** 生成带筛选参数的通知列表链接 */
function noticesHref(level?: string, page?: number) {
  const params = new URLSearchParams();
  if (level) params.set("level", level);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/notices?${qs}` : "/notices";
}

export default async function NoticesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const level = parseNoticeLevel(sp.level);
  const page = parsePage(sp.page);
  const notices = await getNotices().catch(() => []);
  const filtered = level ? notices.filter((n) => n.level === level) : notices;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Breadcrumb items={[{ label: "新闻公告", href: "/news" }, { label: "通知公告" }]} />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 font-serif-title text-zinc-900">通知公告</h1>

      {/* 级别筛选：全部 / 校级 / 部门，支持移动端横向滑动 */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <Link
          href="/notices"
          className={
            !level
              ? "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-thu-purple text-white shadow-2xs"
              : "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-white border border-zinc-200 text-zinc-700 hover:border-thu-purple hover:text-thu-purple transition-colors"
          }
        >
          全部级别
        </Link>
        {NOTICE_LEVELS.map((l) => (
          <Link
            key={l.value}
            href={noticesHref(l.value)}
            className={
              level === l.value
                ? "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-thu-purple text-white shadow-2xs"
                : "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-white border border-zinc-200 text-zinc-700 hover:border-thu-purple hover:text-thu-purple transition-colors"
            }
          >
            {l.label}
          </Link>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="bg-white border border-zinc-150/80 rounded-xl p-4 sm:p-6 shadow-2xs">
          <p className="mb-4 text-xs sm:text-sm text-zinc-400">共 {filtered.length} 条通知</p>
          <NoticeList notices={slice} showLevel />
          <div className="mt-8 border-t border-zinc-100 pt-6">
            <Pagination
              page={safePage}
              totalPages={totalPages}
              hrefFor={(p) => noticesHref(level, p)}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-zinc-150 text-zinc-400 text-sm">
          暂无匹配的通知公告
        </div>
      )}
    </div>
  );
}
