/**
 * CMS 单页统一模板：面包屑 + 标题 + 正文 + 附件
 * 卡片式容器，标题带底部分隔线，附件链接配图标
 */

import { AttachmentList } from "@/components/AttachmentList";
import { Breadcrumb, type BreadcrumbItem } from "@/components/Breadcrumb";
import type { PageContent } from "@/lib/types";

export function CmsPageView({
  title,
  crumbs,
  page,
  attachmentTitle,
}: {
  title: string;
  crumbs: BreadcrumbItem[];
  page: PageContent | null;
  attachmentTitle?: string;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <Breadcrumb items={crumbs} />
      <div className="bg-white border border-zinc-150/80 rounded-xl p-5 sm:p-8 shadow-2xs">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 font-serif-title text-zinc-900 border-b border-zinc-100 pb-4">
          {title}
        </h1>
        {page ? (
          <>
            <div
              className="prose prose-zinc max-w-none article-body"
              dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
            />
            <AttachmentList items={page.attachments} title={attachmentTitle} />
          </>
        ) : (
          <p className="text-zinc-400 py-8 text-center">暂无内容</p>
        )}
      </div>
    </div>
  );
}
