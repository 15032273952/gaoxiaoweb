/**
 * 面包屑导航：首页 > 栏目 > 当前页
 */

import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="面包屑" className="print-hidden mb-5 text-sm text-zinc-400">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className="hover:text-thu-purple transition-colors">
            首页
          </Link>
        </li>
        {items.map((item) => (
          <li key={`${item.href ?? ""}-${item.label}`} className="flex items-center gap-1">
            <span aria-hidden="true">/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-thu-purple transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-zinc-600">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
