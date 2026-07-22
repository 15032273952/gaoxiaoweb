/**
 * SiteHeader - 顶部导航栏组件
 * 
 * 这是网站全局顶部导航栏组件，显示：
 * 1. 网站 Logo/名称（点击可返回首页）
 * 2. 主导航菜单链接
 * 
 * 使用方法：
 * <SiteHeader siteName="高校名称" />
 */

// 导入 Next.js 的 Link 组件（用于客户端导航，无需刷新页面）
import Link from "next/link";

/**
 * 导航菜单项配置
 * 
 * 定义导航栏中的所有菜单项：
 * - label: 显示的菜单文字
 * - href: 链接路径（对应 app/ 目录下的路由）
 */
const navItems = [
  { label: "首页", href: "/" },           // 首页
  { label: "学校概况", href: "/about" }, // 关于我们
  { label: "新闻", href: "/news" },       // 新闻列表
  { label: "通知公告", href: "/notices" }, // 通知列表
  { label: "机构设置", href: "/organization" }, // 组织机构
  { label: "师资队伍", href: "/faculty" }, // 教职工
  { label: "教育教学", href: "/education" }, // 教育
  { label: "科学研究", href: "/research" }, // 科研
  { label: "招生就业", href: "/admissions" }, // 招生就业
  { label: "信息公开", href: "/openness" }, // 信息公开
  { label: "联系我们", href: "/contact" }, // 联系方式
];

/**
 * 顶部导航栏组件
 * 
 * @param siteName - 网站名称（可选，默认显示"高校官网"）
 * @returns JSX 元素
 */
export function SiteHeader({ siteName }: { siteName?: string }) {
  return (
    <>
    {/* <header>: HTML5 语义化标签，表示页面头部 */}
    {/* w-full: 宽度100% */}
    {/* border-b: 底部边框 */}
    {/* border-zinc-200: 边框颜色（浅灰色） */}
    {/* bg-white: 背景白色 */}
    <header className="w-full border-b border-zinc-200 bg-white">
      {/* max-w-6xl: 最大宽度限制（约 72rem） */}
      {/* mx-auto: 水平居中 */}
      {/* flex: 使用 Flexbox 布局 */}
      {/* items-center: 垂直居中 */}
      {/* justify-between: 两端对齐（Logo左边，导航右边） */}
      {/* px-4: 左右内边距 1rem */}
      {/* py-4: 上下内边距 1rem */}
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
        {/* Logo/网站名称区域，点击返回首页 */}
        <Link href="/" className="text-xl font-bold text-zinc-900">
          {/* siteName 优先显示，没有则显示默认文字 */}
          {siteName ?? "高校官网"}
        </Link>

        {/* 导航菜单 */}
        {/* hidden md:flex: 移动端隐藏，中等屏幕以上显示 */}
        {/* gap-6: 菜单项之间 1.5rem 间距 */}
        {/* text-sm: 菜单文字小字号 */}
        <nav className="hidden md:flex gap-6 text-sm">
          {/* 遍历渲染所有导航项 */}
          {navItems.map((item) => (
            <Link
              key={item.href}  // React 要求列表项有唯一 key
              href={item.href} // 链接路径
              className="text-zinc-600 hover:text-zinc-900 transition-colors" // 悬停变色
            >
              {item.label}  {/* 菜单文字 */}
            </Link>
          ))}
        </nav>
      </div>
    </header>
    </>
  );
}
