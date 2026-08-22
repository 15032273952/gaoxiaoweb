/**
 * NewsCard - 新闻卡片组件
 * 
 * 用于在新闻列表中显示单条新闻的摘要信息。
 * 优化点：
 * 1. 响应式图文尺寸适配（移动端更紧凑、防止文字挤压）
 * 2. 融入分类专属色彩胶囊徽章（青黛/琉金/霜紫等）
 * 3. 增强质感：微阴影、触控微缩动效、优雅边框过渡
 */

import type { ArticleListItem } from "@/lib/types";
import { articleCategoryLabel, articleCategoryBadgeClass, formatDate } from "@/lib/labels";
import Link from "next/link";

export function NewsCard({ article }: { article: ArticleListItem }) {
  const badgeClass = articleCategoryBadgeClass(article.category);

  return (
    <article className="group bg-white flex gap-3.5 sm:gap-4 p-3.5 sm:p-4 border border-zinc-150/80 rounded-xl hover:border-thu-purple/30 hover:shadow-md transition-all duration-200 active-press">
      {/* 封面图区域（可选，自适应比例） */}
      {article.coverUrl && (
        <Link
          href={`/news/${article.slug}`}
          className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 overflow-hidden rounded-lg bg-zinc-100"
        >
          <img
            src={article.coverUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
      )}

      {/* 内容区域 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* 文章标题链接 */}
          <Link
            href={`/news/${article.slug}`}
            className="block text-sm sm:text-base font-semibold text-zinc-900 group-hover:text-thu-purple line-clamp-2 transition-colors leading-snug"
          >
            {article.isPinned && (
              <span className="inline-block mr-1.5 text-[11px] sm:text-xs text-white bg-gradient-to-r from-thu-gold to-thu-gold-dark px-1.5 py-0.5 rounded font-normal align-middle shadow-2xs">
                置顶
              </span>
            )}
            {article.title}
          </Link>

          {/* 摘要说明（仅在中大屏或有内容时展示） */}
          {article.summary && (
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 line-clamp-1 sm:line-clamp-2 leading-relaxed">
              {article.summary}
            </p>
          )}
        </div>

        {/* 底部信息条：分类彩色标签 + 日期 */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-400">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${badgeClass}`}
          >
            {articleCategoryLabel(article.category)}
          </span>
          <span className="text-[11px] sm:text-xs text-zinc-400 font-mono">
            {formatDate(article.publishedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}
