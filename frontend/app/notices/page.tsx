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
  title: "通知公告 - 高校官网",
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb items={[{ label: "新闻公告", href: "/news" }, { label: "通知公告" }]} />
      <h1 className="text-2xl font-bold mb-6 font-serif-title">通知公告</h1>

      {/* 级别筛选：全部 / 校级 / 部门 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/notices"
          className={
            !level
              ? "px-3 py-1.5 text-sm rounded bg-thu-purple text-white"
              : "px-3 py-1.5 text-sm rounded border border-zinc-200 hover:border-thu-purple hover:text-thu-purple"
          }
        >
          全部
        </Link>
        {NOTICE_LEVELS.map((l) => (
          <Link
            key={l.value}
            href={noticesHref(l.value)}
            className={
              level === l.value
                ? "px-3 py-1.5 text-sm rounded bg-thu-purple text-white"
                : "px-3 py-1.5 text-sm rounded border border-zinc-200 hover:border-thu-purple hover:text-thu-purple"
            }
          >
            {l.label}
          </Link>
        ))}
      </div>

      {filtered.length > 0 && (
        <p className="mb-2 text-sm text-zinc-400">共 {filtered.length} 条</p>
      )}
      <NoticeList notices={slice} showLevel />
      <Pagination
        page={safePage}
        totalPages={totalPages}
        hrefFor={(p) => noticesHref(level, p)}
      />
    </div>
  );
}
