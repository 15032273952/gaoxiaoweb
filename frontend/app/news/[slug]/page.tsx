/**
 * 新闻详情页：分类、作者、面包屑、相关阅读
 *
 * 学习要点：
 * 1. 动态路由 [slug]：URL 形如 /news/xxx，xxx 就是 slug 参数。
 * 2. generateStaticParams：静态导出下，必须在这里列出所有可能的 slug，
 *    构建期才会为每篇文章预生成一个 HTML 页面（否则动态路由无法静态导出）。
 * 3. params 是 Promise：Next.js 16 中动态路由参数是异步的，必须 await。
 * 4. notFound()：slug 不存在时返回 404 页面。
 */

import { getArticleBySlug, getArticles } from "@/lib/content";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ArticleToolbar } from "@/components/ArticleToolbar";
import { PrevNextNav } from "@/components/PrevNextNav";
import { AttachmentList } from "@/components/AttachmentList";
import { articleCategoryLabel, formatDate } from "@/lib/labels";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = await getArticles().catch(() => []);
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) return { title: "新闻详情 - 高校官网" };
  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.summary,
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) notFound();

  const all = await getArticles().catch(() => []);
  const related = all
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => {
      const sameCat = Number(b.category === article.category) - Number(a.category === article.category);
      if (sameCat !== 0) return sameCat;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .slice(0, 4);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: "校园新闻", href: "/news" },
          { label: article.title },
        ]}
      />
      <ArticleToolbar />
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-3 font-serif-title">{article.title}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
          <Link
            href={`/news?category=${encodeURIComponent(article.category)}`}
            className="hover:text-thu-purple"
          >
            {articleCategoryLabel(article.category)}
          </Link>
          <span>{formatDate(article.publishedAt)}</span>
          {article.authors && <span>作者：{article.authors}</span>}
        </div>
      </header>

      {article.coverUrl && (
        <div className="mb-8 overflow-hidden rounded-lg">
          <img
            src={article.coverUrl}
            alt={article.title}
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      <div
        className="prose prose-zinc max-w-none article-body"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      <AttachmentList items={article.attachments} />

      <PrevNextNav
        items={all.map((a) => ({ slug: a.slug, title: a.title }))}
        currentSlug={article.slug}
        basePath="/news"
      />

      {related.length > 0 && (
        <section className="mt-10 border-t border-zinc-200 pt-6">
          <h2 className="text-lg font-semibold mb-3 font-serif-title">相关阅读</h2>
          <ul className="space-y-2">
            {related.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/news/${a.slug}`}
                  className="text-sm text-zinc-700 hover:text-thu-purple"
                >
                  {a.title}
                  <span className="ml-2 text-xs text-zinc-400">{formatDate(a.publishedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
