"use client";

/**
 * NoticeTicker - 最新通知竖向轮播条
 *
 * 全宽横条：左侧朱砂红「最新公告」徽标（脉冲圆点），中间逐条上滚轮播，
 * 右侧「全部通知」入口。纯 CSS keyframes 循环（首条克隆实现无缝衔接），
 * prefers-reduced-motion 下静止显示第一条。
 */

import Link from "next/link";
import type { NoticeListItem } from "@/lib/types";
import { noticeLevelBadgeClass } from "@/lib/labels";

const ROW_HEIGHT_REM = 2.25; /* 与容器行高一致 */
const VISIBLE_MS_PER_ROW = 3.2; /* 每条停留秒数 */

export function NoticeTicker({ notices }: { notices: NoticeListItem[] }) {
  if (notices.length === 0) return null;

  const loop = notices.slice(0, 6);
  // 克隆首条接到尾部，滚动到底后瞬移回起点形成无缝循环
  const rows = [...loop, loop[0]];
  const duration = `${rows.length * VISIBLE_MS_PER_ROW}s`;

  return (
    <section aria-label="最新通知" className="w-full border-y border-thu-purple/10 bg-white/80 backdrop-blur-xs">
      <div className="mx-auto max-w-6xl px-4 flex items-stretch">
        {/* 左侧徽标 */}
        <div className="flex-shrink-0 flex items-center gap-2 py-2 pr-4 mr-4 border-r border-zinc-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-thu-red opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-thu-red" />
          </span>
          <span className="text-sm font-bold font-serif-title text-thu-red whitespace-nowrap">最新通知</span>
        </div>

        {/* 中间轮播区 */}
        <div className="relative flex-1 overflow-hidden min-w-0" style={{ height: `${ROW_HEIGHT_REM}rem` }}>
          <ul
            className="absolute inset-x-0"
            style={
              {
                "--th": `${ROW_HEIGHT_REM}rem`,
                animation: `thu-ticker ${duration} linear infinite`,
              } as React.CSSProperties
            }
          >
            {rows.map((n, i) => (
              <li
                key={`${n.id}-${i}`}
                aria-hidden={i === rows.length - 1 || undefined}
                style={{ height: `${ROW_HEIGHT_REM}rem` }}
                className="flex items-center gap-2.5"
              >
                <span
                  className={`flex-shrink-0 text-[11px] px-1.5 py-0.5 rounded border ${
                    noticeLevelBadgeClass(n.level)
                  }`}
                >
                  {n.level === "school" ? "校级" : "部门"}
                </span>
                <Link
                  href={`/notices/${n.slug}`}
                  className="text-sm text-zinc-700 hover:text-thu-purple transition-colors truncate"
                >
                  {n.title}
                </Link>
                <span className="ml-auto hidden sm:block flex-shrink-0 text-[11px] font-mono text-zinc-400">
                  {new Date(n.publishedAt).toLocaleDateString("zh-CN")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 右侧入口 */}
        <Link
          href="/notices"
          className="flex-shrink-0 ml-4 pl-4 border-l border-zinc-100 flex items-center text-xs text-zinc-400 hover:text-thu-purple transition-colors whitespace-nowrap"
        >
          全部 &gt;
        </Link>
      </div>
    </section>
  );
}
