/**
 * 通知详情页 - app/notices/[slug]/page.tsx
 * 
 * 路由：/notices/[slug]（如 /notices/2024-001）
 * 功能：显示单条通知的完整内容
 * 
 * 动态路由 [slug]：
 * - [slug] 是 Next.js App Router 的动态路由参数
 * - 会匹配 /notices/任意值 的 URL
 */

// 导入 CMS 数据获取函数
import { getNoticeBySlug } from "@/lib/cms";

// 导入 Next.js 的 notFound 函数（处理 404）
import { notFound } from "next/navigation";

// 导入 Metadata 类型
import type { Metadata } from "next";

/**
 * 动态路由参数类型
 * 
 * Next.js 15+ 使用 Promise 包裹 params
 */
type Props = { params: Promise<{ slug: string }> };

/**
 * 静态路径生成（output: export 必需）
 *
 * 返回 slug 数组。SSG 模式下需为每个 slug 预渲染。
 * POC 阶段返回空数组，由运行时 fallback 处理。
 */
export async function generateStaticParams() {
  return [];
}

/**
 * 生成页面 SEO 元数据
 *
 * 动态生成每个通知详情页的标题和描述
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 解构获取 slug 参数
  const { slug } = await params;
  
  // 获取通知详情
  const notice = await getNoticeBySlug(slug).catch(() => null);
  
  // 未找到通知，返回默认标题
  if (!notice) return { title: "通知详情 - 高校官网" };
  
  // 返回动态元数据
  // seoTitle 优先，其次使用 notice.title
  return {
    title: notice.seoTitle ?? notice.title,
    description: notice.seoDescription ?? notice.summary,
  };
}

/**
 * 通知详情页组件
 */
export default async function NoticeDetailPage({ params }: Props) {
  const { slug } = await params;
  
  // 获取通知详情
  const notice = await getNoticeBySlug(slug).catch(() => null);

  // 未找到通知，显示 404 页面
  if (!notice) notFound();

  return (
    // <article>: HTML5 语义化标签，表示文章内容
    <article className="mx-auto max-w-3xl px-4 py-8">
      {/* 文章头部 */}
      <header className="mb-8">
        {/* 文章标题 */}
        <h1 className="text-2xl font-bold mb-2">{notice.title}</h1>
        
        {/* 文章元信息：日期、文号、级别 */}
        {/* text-sm: 小字号 */}
        {/* text-zinc-400: 灰色文字 */}
        {/* space-x-4: 水平排列，间距 1rem */}
        <div className="text-sm text-zinc-400 space-x-4">
          {/* 发布日期：转换为中文格式 */}
          <span>{new Date(notice.publishedAt).toLocaleDateString("zh-CN")}</span>
          {/* 文号（可选） */}
          {notice.noticeNo && <span>文号：{notice.noticeNo}</span>}
          {/* 通知级别（可选，如"普通"、"重要"） */}
          {notice.level && <span>级别：{notice.level}</span>}
        </div>
      </header>

      {/* 正文内容 */}
      <div
        className="prose prose-zinc max-w-none"
        dangerouslySetInnerHTML={{ __html: notice.contentHtml }}
      />

      {/* 附件下载区域 */}
      {notice.attachments.length > 0 && (
        <section className="mt-8 border-t border-zinc-200 pt-6">
          <h2 className="text-lg font-semibold mb-3">附件下载</h2>
          <ul className="space-y-2">
            {notice.attachments.map((att, i) => (
              <li key={i}>
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline text-sm"
                >
                  {/* 附件名称 */}
                  {att.name}
                  {/* 显示文件大小（可选） */}
                  {att.size ? ` (${(att.size / 1024).toFixed(1)} KB)` : ""}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
