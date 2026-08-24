"use client";

/**
 * 通知公告列表（客户端筛选）：级别、分页。
 * 静态导出后 query 过滤在浏览器内进行，数据由服务端页面传入。
 */

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { NoticeListItem } from "@/lib/types";
import { NoticeList } from "@/components/NoticeList";
import { Pagination } from "@/components/Pagination";
import { ChipBar, FilterChip } from "@/components/ChipBar";
import { EmptyState } from "@/components/EmptyState";
import { useClientPaging } from "@/lib/useClientPaging";
import { NOTICE_LEVELS, parseNoticeLevel, parsePage } from "@/lib/labels";

const PAGE_SIZE = 20;

function noticesHref(level?: string, page?: number) {
  const params = new URLSearchParams();
  if (level) params.set("level", level);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/notices?${qs}` : "/notices";
}

export function NoticeFilterableList({ notices }: { notices: NoticeListItem[] }) {
  const searchParams = useSearchParams();
  const level = parseNoticeLevel(searchParams.get("level") ?? undefined);
  const page = parsePage(searchParams.get("page") ?? undefined);

  const filtered = useMemo(
    () => (level ? notices.filter((n) => n.level === level) : notices),
    [notices, level],
  );

  const { totalPages, safePage, slice } = useClientPaging(filtered, page, PAGE_SIZE);

  return (
    <>
      {/* 级别筛选：全部 / 校级 / 部门，支持移动端横向滑动 */}
      <ChipBar>
        <FilterChip href="/notices" active={!level}>
          全部级别
        </FilterChip>
        {NOTICE_LEVELS.map((l) => (
          <FilterChip key={l.value} href={noticesHref(l.value)} active={level === l.value}>
            {l.label}
          </FilterChip>
        ))}
      </ChipBar>

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
        <EmptyState>暂无匹配的通知公告</EmptyState>
      )}
    </>
  );
}
