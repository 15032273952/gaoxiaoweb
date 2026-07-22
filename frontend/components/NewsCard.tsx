/**
 * NewsCard - 新闻卡片组件
 * 
 * 用于在新闻列表中显示单条新闻的摘要信息。
 * 包含：封面图（可选）、标题、摘要（可选）、发布日期。
 * 
 * 使用方法：
 * <NewsCard article={article} />
 */

// 导入新闻列表项类型
import type { ArticleListItem } from "@/lib/types";

// 导入 Next.js Link 组件
import Link from "next/link";

/**
 * 新闻卡片组件
 * 
 * @param article - 文章数据（ArticleListItem 类型）
 * @returns JSX 元素
 */
export function NewsCard({ article }: { article: ArticleListItem }) {
  return (
    // <article>: HTML5 语义化标签，表示独立的内容块（如文章）
    // flex gap-4: 水平布局，图片和内容之间 1rem 间距
    // p-4: 内边距 1rem
    // border: 边框
    // border-zinc-200: 边框颜色浅灰
    // rounded-lg: 大圆角
    // hover:shadow-sm: 悬停时添加轻微阴影
    // transition-shadow: 阴影过渡动画
    <article className="flex gap-4 p-4 border border-zinc-200 rounded-lg hover:shadow-sm transition-shadow">
      
      {/* 封面图区域（可选，有图片时才显示） */}
      {/* flex-shrink-0: 不允许缩小 */}
      {/* w-24 h-24: 固定 6rem x 6rem 尺寸 */}
      {article.coverUrl && (
        <div className="flex-shrink-0 w-24 h-24">
          {/* eslint-disable-next-line: 禁用 Next.js 图片检查（原因同 BannerCarousel） */}
          <img
            src={article.coverUrl}
            alt={article.title}
            className="w-full h-full object-cover rounded"  // rounded: 小圆角
          />
        </div>
      )}

      {/* 内容区域 */}
      {/* flex-1: 占据剩余空间 */}
      {/* min-w-0: 允许内容收缩（配合 line-clamp 截断文本） */}
      <div className="flex-1 min-w-0">
        {/* 文章标题链接 */}
        <Link
          href={`/news/${article.slug}`}  // 点击跳转到新闻详情页
          className="text-base font-medium text-zinc-900 hover:text-blue-700 line-clamp-2"
          // line-clamp-2: 最多显示 2 行，超出省略
        >
          {/* 置顶标记（可选） */}
          {article.isPinned && (
            <span className="inline-block mr-2 text-xs text-red-600 font-normal">[置顶]</span>
          )}
          {/* 文章标题 */}
          {article.title}
        </Link>

        {/* 文章摘要（可选，有内容时才显示） */}
        {/* mt-1: 与标题 0.25rem 间距 */}
        {/* text-sm: 小字号 */}
        {/* text-zinc-500: 次要文字颜色 */}
        {/* line-clamp-2: 最多显示 2 行 */}
        {article.summary && (
          <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
            {article.summary}
          </p>
        )}

        {/* 发布日期 */}
        {/* mt-2: 与摘要 0.5rem 间距 */}
        {/* text-xs: 最小字号 */}
        {/* text-zinc-400: 更浅的灰色 */}
        <div className="mt-2 text-xs text-zinc-400">
          {/* 将 ISO 日期字符串转换为中文格式日期 */}
          {new Date(article.publishedAt).toLocaleDateString("zh-CN")}
        </div>
      </div>
    </article>
  );
}
