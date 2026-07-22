/**
 * RootLayout - 根布局组件
 * 
 * 这是 Next.js App Router 的根布局，所有页面都会包裹在这个布局中。
 * 包含全局导航头(SiteHeader)、页面内容区域和页脚(SiteFooter)。
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
 */

// 导入 Next.js 的 Metadata 类型，用于定义全局 SEO 信息
import type { Metadata } from "next";

// 导入全局样式文件（包含 TailwindCSS 基础样式和全局 CSS 变量）
import "./globals.css";

// 导入页面布局组件：顶部导航和底部页脚
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

// 导入 CMS 数据获取函数，用于获取网站配置信息（如网站名称）
import { getSiteSetting } from "@/lib/cms";

/**
 * 全局元数据定义
 * 
 * metadata 对象用于设置所有页面的默认 SEO 信息：
 * - title: 网站标题（可被子页面覆盖）
 * - description: 网站描述，用于搜索引擎索引
 */
export const metadata: Metadata = {
  title: "高校官网",                    // 默认页面标题
  description: "高校官方宣传网站",      // 默认页面描述
};

/**
 * 根布局异步函数组件
 * 
 * 这是 App Router 的根布局，所有页面都会通过 children prop 嵌入此处。
 * 因为需要从 CMS 获取网站名称，所以这是一个异步组件（async）。
 * 
 * @param children - 通过 props 传入的子页面组件
 * @returns JSX 元素，包含完整的 HTML 文档结构
 */
export default async function RootLayout({
  children,  // 子页面组件，会被渲染在 <main> 标签内
}: Readonly<{
  children: React.ReactNode;  // React 节点类型，表示任意 React 子元素
}>) {
  // 默认网站名称，当 CMS 不可用时使用
  let siteName = "高校官网";
  
  try {
    // 异步获取网站配置信息（包含网站名称等）
    // 如果 CMS 服务不可用，getSiteSetting() 会抛出异常
    const setting = await getSiteSetting();
    // 从配置中取出 siteName 用于显示在导航栏
    siteName = setting.siteName;
  } catch {
    // 捕获异常：当 CMS 不可用时，使用默认名称 "高校官网"
    // 注意：cms.ts 内部已经处理了构建期失败的逻辑，这里只是兜底
  }

  // 返回完整的 HTML 文档结构
  return (
    // <html> 标签：语言设置为简体中文，h-full 使其占满整个视口高度
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-zinc-900 antialiased">
        {/* SiteHeader: 顶部导航栏，接收 siteName 作为网站名称显示 */}
        <SiteHeader siteName={siteName} />
        
        {/* main: 主内容区域，flex-1 使其占据剩余空间（推动页脚到底部） */}
        <main className="flex-1">
          {children}
        </main>
        
        {/* SiteFooter: 底部信息栏（版权信息、联系方式等） */}
        <SiteFooter />
      </body>
    </html>
  );
}
