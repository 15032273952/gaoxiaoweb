/**
 * 列表筛选胶囊条：chipClass 样式 + ChipBar 横向滑动容器 + FilterChip 胶囊链接。
 * 供新闻/通知/师资等列表页复用。
 */

import Link from "next/link";

/** 筛选胶囊选中/未选中样式 */
export function chipClass(active: boolean): string {
  return active
    ? "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-thu-purple text-white shadow-2xs"
    : "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-white border border-zinc-200 text-zinc-700 hover:border-thu-purple hover:text-thu-purple transition-colors";
}

/** 胶囊条容器：移动端横向无阻滑动，桌面换行 */
export function ChipBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
      {children}
    </div>
  );
}

/** 单个筛选胶囊链接 */
export function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={chipClass(active)}>
      {children}
    </Link>
  );
}
