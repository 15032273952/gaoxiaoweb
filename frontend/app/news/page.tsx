/**
 * 新闻列表页 - app/news/page.tsx
 * 
 * 路由：/news
 * 功能：显示所有新闻文章列表
 * 
 * 页面布局：
 * - 两列网格布局（移动端单列）
 * - 每篇文章以卡片形式展示
 */

// 导入 CMS 数据获取函数
import { getArticles } from "@/lib/cms";

// 导入新闻卡片组件
import { NewsCard } from "@/components/NewsCard";

// 导入 Metadata 类型
import type { Metadata } from "next";

/**
 * 页面 SEO 元数据
 */
export const metadata: Metadata = {
  title: "新闻列表 - 高校官网",
  description: "高校校园新闻、学术动态与媒体报道。",
};

/**
 * 新闻列表页组件
 */
export default async function NewsPage() {
  // 获取所有已发布的文章
  const articles = await getArticles().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 页面标题 */}
      <h1 className="text-2xl font-bold mb-6">新闻</h1>
      
      {/* 判断是否有文章 */}
      {articles.length > 0 ? (
        // 网格布局：移动端单列，中等屏幕以上两列
        // gap-4: 网格项之间 1rem 间距
        <div className="grid md:grid-cols-2 gap-4">
          {/* 遍历渲染每篇文章的新闻卡片 */}
          {articles.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        // 无文章时显示占位提示
        <p className="text-zinc-400 text-sm py-8">暂无新闻</p>
      )}
    </div>
  );
}
