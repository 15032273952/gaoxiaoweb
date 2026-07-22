/**
 * 新闻详情页 - app/news/[slug]/page.tsx
 * 
 * 路由：/news/[slug]（如 /news/2024-campus-news-001）
 * 功能：显示单条新闻的完整内容
 * 
 * 动态路由 [slug]：
 * - [slug] 是 Next.js App Router 的动态路由参数
 * - 会匹配 /news/任意值 的 URL
 */

// 导入 CMS 数据获取函数
import { getArticleBySlug } from "@/lib/cms";

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
 * 动态生成每个新闻详情页的标题和描述
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // 获取文章详情
  const article = await getArticleBySlug(slug).catch(() => null);
  
  // 未找到文章，返回默认标题
  if (!article) return { title: "新闻详情 - 高校官网" };
  
  // 返回动态元数据
  // seoTitle 优先，其次使用 article.title
  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.summary,
  };
}

/**
 * 新闻详情页组件
 */
export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  
  // 获取文章详情
  const article = await getArticleBySlug(slug).catch(() => null);

  // 未找到文章，显示 404 页面
  if (!article) notFound();

  return (
    // <article>: HTML5 语义化标签，表示文章内容
    <article className="mx-auto max-w-3xl px-4 py-8">
      {/* 文章头部 */}
      <header className="mb-8">
        {/* 文章标题 */}
        <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
        
        {/* 发布日期 */}
        <div className="text-sm text-zinc-400">
          {new Date(article.publishedAt).toLocaleDateString("zh-CN")}
        </div>
      </header>

      {/* 正文内容 */}
      {/* dangerouslySetInnerHTML: 直接渲染 HTML（来自 CMS 的可信内容） */}
      <div
        className="prose prose-zinc max-w-none"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      {/* 附件下载区域（可选） */}
      {article.attachments.length > 0 && (
        <section className="mt-8 border-t border-zinc-200 pt-6">
          <h2 className="text-lg font-semibold mb-3">附件下载</h2>
          <ul className="space-y-2">
            {article.attachments.map((att, i) => (
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
