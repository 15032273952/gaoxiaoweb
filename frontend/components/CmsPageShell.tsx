/**
 * 静态内容页壳：按 slug 读取 content/pages.json，交给 CmsPageView 渲染。
 * 各"关于我们/教育教学"等单页只需声明 metadata 并调用本组件，无需重复取数。
 */

import { getPageBySlug } from "@/lib/content";
import { CmsPageView } from "@/components/CmsPageView";
import type { BreadcrumbItem } from "@/components/Breadcrumb";

export async function CmsPageShell({
  slug,
  title,
  crumbs,
  attachmentTitle,
}: {
  slug: string;
  title: string;
  crumbs: BreadcrumbItem[];
  attachmentTitle?: string;
}) {
  const page = await getPageBySlug(slug).catch(() => null);
  return <CmsPageView title={title} crumbs={crumbs} page={page} attachmentTitle={attachmentTitle} />;
}
