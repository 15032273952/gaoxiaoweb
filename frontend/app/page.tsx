/**
 * 首页 - app/page.tsx
 * 
 * 这是高校官网的首页（路由：/），展示：
 * 1. 顶部轮播图（Banners）- 展示重要公告或活动
 * 2. 校园要闻列表 - 最新新闻文章
 * 3. 通知公告列表 - 最新通知
 * 
 * 使用 Server Component 模式，数据在服务器端直接获取并渲染
 */

// 导入 UI 组件
import { BannerCarousel } from "@/components/BannerCarousel";   // 轮播图组件
import { NewsCard } from "@/components/NewsCard";               // 新闻卡片组件
import { NoticeList } from "@/components/NoticeList";           // 通知列表组件

// 导入 CMS 数据获取函数（从 lib/cms.ts）
import { getBanners, getArticles, getNotices, getSiteSetting } from "@/lib/cms";

// 导入 Next.js 的 Metadata 类型，用于定义页面 SEO 信息
import type { Metadata } from "next";

/**
 * 页面元数据
 * 
 * 定义首页的 SEO 信息，会显示在浏览器标签页和搜索引擎中
 */
export const metadata: Metadata = {
  title: "首页 - 高校官网",           // 浏览器标签页显示的标题
  description: "高校官方网站首页，展示要闻轮播、通知公告与新闻列表。",  // 搜索引擎描述
};

/**
 * 首页组件 - 异步 Server Component
 * 
 * 首页是一个异步组件，直接在服务器端获取 CMS 数据并渲染 HTML。
 * 这种模式的优势：
 * - 数据获取逻辑在服务器端完成，更安全
 * - 减少客户端 JavaScript 体积
 * - 有利于 SEO（搜索引擎可以直接抓取渲染后的内容）
 * 
 * @returns JSX 元素，包含完整的首页内容
 */
export default async function HomePage() {
  /**
   * 并行数据获取
   * 
   * 使用 Promise.all 并行发起多个 CMS API 请求，显著减少数据加载时间。
   * 所有请求同时发出，谁最慢的决定整体时间。
   * 
   * .catch(() => []) 的作用：
   * - 当某个请求失败时，返回空数组而不是抛出异常
   * - 确保页面即使 CMS 部分不可用也能正常显示
   */
  const [banners, articles, notices] = await Promise.all([
    getBanners().catch(() => []),    // 获取轮播图数据，失败时返回空数组
    getArticles().catch(() => []),    // 获取文章列表，失败时返回空数组
    getNotices().catch(() => []),     // 获取通知列表，失败时返回空数组
    getSiteSetting().catch(() => null), // 获取网站设置，失败时返回 null
  ]);

  // 截取前 6 篇文章作为"校园要闻"展示
  const latestArticles = articles.slice(0, 6);
  // 截取前 10 条通知作为"通知公告"展示
  const latestNotices = notices.slice(0, 10);

  // 返回首页 JSX 结构
  return (
    // 外层容器：max-w-6xl 限制最大宽度，px-4 左右内边距，py-8 上下内边距
    // space-y-12 每个子元素之间 12 单位间距
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-12">
      
      {/* 轮播区域：展示重要图片或公告 */}
      <section>
        {/* BannerCarousel 组件：接收 banners 数组作为轮播内容 */}
        <BannerCarousel banners={banners} />
      </section>

      {/* 要闻 + 通知 双栏布局区域 */}
      {/* grid md:grid-cols-2 gap-8：移动端单列，中等屏幕以上两列，gap-8 列间距 */}
      <section className="grid md:grid-cols-2 gap-8">
        
        {/* 左栏：校园要闻 */}
        <div>
          {/* 栏目标题：text-lg 大字号，font-semibold 半粗体，mb-4 下边距 */}
          {/* pb-2 下内边距，border-b 底部边框，border-zinc-200 灰色边框 */}
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-zinc-200">
            校园要闻
          </h2>
          
          {/* 判断是否有文章数据 */}
          {latestArticles.length > 0 ? (
            // 有文章：渲染文章列表
            // space-y-4 每个卡片之间 4 单位垂直间距
            <div className="space-y-4">
              {/* map 遍历渲染每个新闻卡片，key 使用文章 id */}
              {latestArticles.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          ) : (
            // 无文章：显示占位提示文字
            // text-zinc-400 灰色文字，text-sm 小字号，py-4 上下内边距
            <p className="text-zinc-400 text-sm py-4">暂无新闻</p>
          )}
        </div>

        {/* 右栏：通知公告 */}
        <div>
          {/* 栏目标题 */}
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-zinc-200">
            通知公告
          </h2>
          
          {/* NoticeList 组件：接收 notices 数组作为通知列表内容 */}
          <NoticeList notices={latestNotices} />
        </div>
      </section>
      
    </div>
  );
}
