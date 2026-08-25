/**
 * 列表页统一样式壳：容器 + 面包屑 + 标题 + Suspense 包裹客户端筛选列表。
 *
 * 学习要点（为什么用 Suspense？）：
 * 1. 客户端列表组件（NewsFilterableList 等）内部调用了 useSearchParams()。
 * 2. 在 Next.js 静态导出下，useSearchParams 要求组件被 <Suspense> 包裹，
 *    否则构建会报错（CSR bailout / dynamic = "error"）。
 * 3. <Suspense fallback={...}> 的作用：在客户端组件"水合"完成前，
 *    先显示 fallback 内容（这里是"正在加载…"），避免白屏。
 * 4. 这是静态导出 + 客户端筛选方案的固定搭配，记住这个模式即可。
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
