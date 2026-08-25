/**
 * CmsPage - 静态内容页（"关于我们"、"教育教学"、"招生就业"等单页）
 *
 * 学习要点：
 * 1. 为什么是服务端组件（没有 "use client"）？—— 需要 await getPageBySlug() 读取数据。
 * 2. 本组件把"取数"（getPageBySlug）和"渲染"（面包屑 + 标题 + 正文 + 附件）
 *    放在同一个文件里。因为只有本组件使用这套逻辑，无需再拆成 Shell/View 两层，
 *    减少文件跳转，更易读。
 * 3. 各单页（about/admissions/education 等）只需声明 metadata 并调用本组件，
 *    无需重复取数逻辑。
 * 4. 正文 bodyHtml 是可信 HTML，经 dangerouslySetInnerHTML 渲染（勿粘贴外部来源）。
 */

import { getPageBySlug } from "@/lib/content";
import { AttachmentList } from "@/components/AttachmentList";
import { Breadcrumb, type BreadcrumbItem } from "@/components/Breadcrumb";

export async function CmsPage({
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
