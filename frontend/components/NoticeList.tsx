/**
 * NoticeList - 通知列表组件
 *
 * 优化点：
 * 1. 左侧日期方块（Date Badge）设计，提升列表辨识度
 * 2. 置顶与级别标签专属色彩区分（朱砂红/文脉金）
 * 3. 移动端更宽敞的触控区域与平滑交互
 */

import type { NoticeListItem } from "@/lib/types";
import { noticeLevelLabel, noticeLevelBadgeClass } from "@/lib/labels";
import Link from "next/link";

export function NoticeList({
  notices,
  showLevel = false,
}: {
  notices: NoticeListItem[];
  showLevel?: boolean;
}) {
  if (notices.length === 0) {
    return (
      <div className="text-zinc-400 text-sm py-6 text-center bg-zinc-50/50 rounded-lg">
        暂无通知公告
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100">
      {notices.map((notice) => {
        const date = new Date(notice.publishedAt);
        const hasDate = !Number.isNaN(date.getTime());
        const month = hasDate ? `${date.getMonth() + 1}`.padStart(2, "0") : "--";
        const day = hasDate ? `${date.getDate()}`.padStart(2, "0") : "--";
        const year = hasDate ? date.getFullYear() : "";

        return (
          <li key={notice.id} className="py-3 first:pt-2 last:pb-2">
            <Link
              href={`/notices/${notice.slug}`}
              className="group flex items-center gap-3 sm:gap-4 transition-colors active-press rounded-lg p-1.5 -mx-1.5 hover:bg-thu-purple-50"
            >
              {/* 左侧紧凑日期方块 */}
              <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 bg-thu-purple-light/80 border border-thu-purple/10 rounded-lg flex flex-col items-center justify-center text-center group-hover:bg-thu-purple group-hover:text-white transition-colors duration-200">
                <span className="text-[13px] sm:text-sm font-bold font-mono leading-none group-hover:text-white text-thu-purple-dark">
                  {month}-{day}
                </span>
                <span className="text-[10px] text-zinc-400 group-hover:text-white/80 leading-tight mt-0.5 font-mono">
                  {year}
                </span>
              </div>

              {/* 标题与标签 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {notice.isTop && (
                    <span className="inline-block text-[11px] text-white bg-thu-red px-1.5 py-0.2 rounded font-normal shadow-2xs">
                      置顶
                    </span>
                  )}
                  {showLevel && notice.level && (
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[11px] font-medium border ${noticeLevelBadgeClass(
                        notice.level,
                      )}`}
                    >
                      {noticeLevelLabel(notice.level)}
                    </span>
                  )}
                  {notice.noticeNo && (
                    <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                      {notice.noticeNo}
                    </span>
                  )}
                </div>

                <div className="text-sm font-medium text-zinc-800 group-hover:text-thu-purple line-clamp-1 transition-colors mt-0.5">
                  {notice.title}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}