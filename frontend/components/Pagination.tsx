/**
 * 列表分页：用查询参数翻页，保持当前筛选条件
 */

import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = visiblePages(page, totalPages);

  return (
    <nav aria-label="分页" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          className="px-3 py-1.5 text-sm border border-zinc-200 rounded bg-white hover:border-thu-purple/50 hover:text-thu-purple hover:bg-thu-purple-50 transition-colors"
        >
          上一页
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm text-zinc-300 bg-white/60 border border-zinc-100 rounded">上一页</span>
      )}

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-1 text-zinc-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={
              p === page
                ? "px-3 py-1.5 text-sm rounded text-white shadow-sm bg-gradient-to-r from-thu-purple to-thu-purple-dark"
                : "px-3 py-1.5 text-sm border border-zinc-200 rounded bg-white hover:border-thu-purple/50 hover:text-thu-purple hover:bg-thu-purple-50 transition-colors"
            }
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          className="px-3 py-1.5 text-sm border border-zinc-200 rounded bg-white hover:border-thu-purple/50 hover:text-thu-purple hover:bg-thu-purple-50 transition-colors"
        >
          下一页
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm text-zinc-300 bg-white/60 border border-zinc-100 rounded">下一页</span>
      )}
    </nav>
  );
}

function visiblePages(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current, current - 1, current + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  for (let i = 0; i < nums.length; i++) {
    if (i > 0 && nums[i] - nums[i - 1] > 1) out.push("…");
    out.push(nums[i]);
  }
  return out;
}
