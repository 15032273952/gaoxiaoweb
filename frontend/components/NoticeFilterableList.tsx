"use client";

/**
 * 通知公告列表（客户端筛选）：级别、分页。
 * 静态导出后 query 过滤在浏览器内进行，数据由服务端页面传入。
 */

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { NoticeListItem } from "@/lib/types";
import { NoticeList } from "@/components/NoticeList";
import { Pagination } from "@/components/Pagination";
import { NOTICE_LEVELS, parseNoticeLevel, parsePage } from "@/lib/labels";

const PAGE_SIZE = 20;

function noticesHref(level?: string, page?: number) {
  const params = new URLSearchParams();
  if (level) params.set("level", level);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/notices?${qs}` : "/notices";
}

function chipClass(active: boolean) {
  return active
    ? "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-thu-purple text-white shadow-2xs"
    : "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-white border border-zinc-200 text-zinc-700 hover:border-thu-purple hover:text-thu-purple transition-colors";
}

export function NoticeFilterableList({ notices }: { notices: NoticeListItem[] }) {
  const searchParams = useSearchParams();
  const level = parseNoticeLevel(searchParams.get("level") ?? undefined);
  const page = parsePage(searchParams.get("page") ?? undefined);

  const filtered = useMemo(
    () => (level ? notices.filter((n) => n.level === level) : notices),
    [notices, level],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      {/* 级别筛选：全部 / 校级 / 部门，支持移动端横向滑动 */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <Link href="/notices" className={chipClass(!level)}>
          全部级别
        </Link>
        {NOTICE_LEVELS.map((l) => (
          <Link key={l.value} href={noticesHref(l.value)} className={chipClass(level === l.value)}>
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
    </>
  );
}
