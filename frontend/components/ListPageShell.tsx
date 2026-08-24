/**
 * 列表页统一样式壳：容器 + 面包屑 + 标题 + Suspense 包裹客户端筛选列表。
 * 客户端列表组件内部 useSearchParams，静态导出下必须用 Suspense 包裹。
 */

import { Suspense } from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/Breadcrumb";

export function ListPageShell({
  title,
  crumbs,
  fallback,
  children,
}: {
  title: string;
  crumbs: BreadcrumbItem[];
  fallback: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Breadcrumb items={crumbs} />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 font-serif-title text-zinc-900">{title}</h1>
      <Suspense fallback={<p className="text-sm text-zinc-400">{fallback}</p>}>{children}</Suspense>
    </div>
  );
}
