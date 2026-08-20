/**
 * SiteHeader - 顶部导航栏组件（清华官网风格）
 *
 * 结构分三层（参考 tsinghua.edu.cn）：
 * 1. 顶部辅助条：深紫细条，放置访客/校友等快捷入口
 * 2. Logo 区：白色背景，左侧衬线体校名 + 英文副标，右侧校训/标语
 * 3. 主导航条：深紫底白字，一级菜单 + 悬停下拉二级菜单
 *
 * 响应式：
 * - 桌面端：完整三级结构 + 悬停下拉菜单（纯 CSS group-hover 实现，无需 JS）
 * - 移动端：导航折叠为可展开的菜单面板（<details> 原生实现，无需 JS）
 *
 * 使用方法：
 * <SiteHeader siteName="高校名称" />
 */

import Link from "next/link";

/**
 * 导航菜单项配置（支持二级下拉菜单）
 *
 * - label: 显示文字
 * - href:  链接路径
 * - children: 二级菜单（可选），悬停一级菜单时展开
 */
interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "首页", href: "/" },
  {
    label: "学校概况",
    href: "/about",
    children: [
      { label: "学校简介", href: "/about" },
      { label: "机构设置", href: "/organization" },
      { label: "信息公开", href: "/openness" },
    ],
  },
  {
    label: "新闻公告",
    href: "/news",
    children: [
      { label: "校园新闻", href: "/news" },
      { label: "通知公告", href: "/notices" },
    ],
  },
  {
    label: "人才培养",
    href: "/education",
    children: [
      { label: "教育教学", href: "/education" },
      { label: "师资队伍", href: "/faculty" },
    ],
  },
  { label: "科学研究", href: "/research" },
  { label: "招生就业", href: "/admissions" },
  { label: "联系我们", href: "/contact" },
];

/** 顶部辅助条快捷入口 */
const utilityLinks = [
  { label: "学生", href: "/education" },
  { label: "教职工", href: "/faculty" },
  { label: "校友访客", href: "/contact" },
];

export function SiteHeader({ siteName }: { siteName?: string }) {
  const name = siteName ?? "高校官网";

  return (
    <header className="w-full">
      {/* ===== 第一层：顶部辅助条（深紫细条） ===== */}
      <div className="w-full bg-thu-purple-dark text-white/80 text-xs">
        <div className="mx-auto max-w-6xl px-4 h-8 flex items-center justify-end gap-5">
          {utilityLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ===== 第二层：Logo 区（白底，衬线大校名） ===== */}
      <div className="w-full bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* 紫色校徽占位方块 */}
            <span className="flex-shrink-0 w-11 h-11 rounded-full bg-thu-purple text-white flex items-center justify-center text-lg font-bold font-serif-title">
              校
            </span>
            <span className="flex flex-col">
              <span className="text-2xl font-bold tracking-wide text-thu-purple-dark font-serif-title group-hover:text-thu-purple transition-colors">
                {name}
              </span>
              <span className="text-[11px] tracking-[0.2em] text-zinc-400 uppercase">
                University Official Website
              </span>
            </span>
          </Link>
          {/* 右侧标语：移动端隐藏 */}
          <div className="hidden md:block text-right text-sm text-zinc-400 font-serif-title">
            自强不息 · 厚德载物
          </div>
        </div>
      </div>

      {/* ===== 第三层：主导航条（紫底白字，悬停下拉） ===== */}
      {/* 桌面端导航 */}
      <nav className="hidden md:block w-full bg-thu-purple shadow-md">
        <div className="mx-auto max-w-6xl px-4">
          <ul className="flex items-stretch">
            {navItems.map((item) => (
              <li key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className="flex items-center px-5 py-3.5 text-[15px] font-medium text-white/95 hover:bg-thu-purple-dark hover:text-white transition-colors"
                >
                  {item.label}
                  {/* 有子菜单时显示下拉箭头 */}
                  {item.children && (
                    <svg
                      className="ml-1 w-3 h-3 opacity-70 group-hover:rotate-180 transition-transform"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  )}
                </Link>
                {/* 二级下拉菜单：纯 CSS 悬停展开 */}
                {item.children && (
                  <ul className="absolute left-0 top-full min-w-40 bg-white shadow-lg border-t-2 border-thu-purple py-1 z-50 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block px-5 py-2.5 text-sm text-zinc-700 hover:bg-thu-purple-light hover:text-thu-purple-dark transition-colors"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 移动端导航：<details> 原生折叠面板，无需客户端 JS */}
      <details className="md:hidden w-full bg-thu-purple text-white group">
        <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none select-none">
          <span className="text-sm font-medium">网站导航</span>
          {/* 汉堡图标 */}
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </summary>
        <ul className="border-t border-white/15 pb-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-5 py-2.5 text-sm hover:bg-thu-purple-dark transition-colors"
              >
                {item.label}
              </Link>
              {/* 移动端二级菜单直接平铺缩进显示 */}
              {item.children && (
                <ul className="bg-thu-purple-dark/60">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="block pl-9 pr-5 py-2 text-[13px] text-white/80 hover:text-white transition-colors"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </details>
    </header>
  );
}
