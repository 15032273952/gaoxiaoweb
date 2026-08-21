/**
 * PrevNextNav - 详情页上一篇/下一篇导航（服务端组件）
 *
 * 传入按同一排序规则排好的列表与当前 slug，计算相邻文章并渲染。
 * 打印时隐藏（print-hidden）。
 */

import Link from "next/link";

type NavItem = {
  slug: string;
  title: string;
};

export function PrevNextNav({
  items,
  currentSlug,
  basePath,
}: {
  /** 完整有序列表（与列表页排序一致） */
  items: NavItem[];
  /** 当前详情页 slug */
  currentSlug: string;
  /** 详情页路径前缀，如 "/news" */
  basePath: string;
}) {
  const index = items.findIndex((i) => i.slug === currentSlug);
  if (index === -1) return null;

  const prev = index > 0 ? items[index - 1] : null;
  const next = index < items.length - 1 ? items[index + 1] : null;
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="上一篇/下一篇"
      className="print-hidden mt-10 grid gap-3 border-t border-zinc-200 pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`${basePath}/${prev.slug}`}
          className="group rounded border border-zinc-100 px-4 py-3 hover:border-thu-purple transition-colors"
        >
          <span className="block text-xs text-zinc-400">上一篇</span>
          <span className="mt-1 block text-sm text-zinc-700 line-clamp-1 group-hover:text-thu-purple">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      {next ? (
        <Link
          href={`${basePath}/${next.slug}`}
          className="group rounded border border-zinc-100 px-4 py-3 text-right hover:border-thu-purple transition-colors"
        >
          <span className="block text-xs text-zinc-400">下一篇</span>
          <span className="mt-1 block text-sm text-zinc-700 line-clamp-1 group-hover:text-thu-purple">
            {next.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
