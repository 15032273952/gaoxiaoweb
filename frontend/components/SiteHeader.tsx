/**
 * SiteHeader - 顶部导航栏组件（清华大学典雅风格 + 现代移动端交互）
 *
 * 桌面端结构（三层）：
 * 1. 顶部辅助条：深紫渐变底色，放置访客/校友等快捷入口
 * 2. Logo 区：白底温润微光，左侧衬线体校名 + 英文副标，右侧标语与快速搜索
 * 3. 主导航条：深紫渐变底、金线微边框、悬停下拉二级菜单
 *
 * 移动端结构（抽屉式导航 Drawer）：
 * 1. 紧凑顶部条：自适应校名 + 快速检索图标 + 动态汉堡包菜单按钮
 * 2. 平滑滑出抽屉面板：背景遮罩毛玻璃、搜索条、手风琴折叠二级菜单、底部快捷身份入口
 */

"use client";

import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";
import { useEffect, useState } from "react";

/**
 * 导航菜单项配置（支持二级下拉菜单）
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // 移动端抽屉打开时锁定页面背景滚动
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // 按 ESC 键关闭抽屉
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <header className="w-full relative z-40">
      {/* ===== 桌面端：第一层 顶部辅助条（深紫微渐变） ===== */}
      <div className="hidden md:block w-full bg-gradient-to-r from-thu-purple-dark via-[#52075f] to-thu-purple-dark text-white/80 text-xs border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 h-8 flex items-center justify-between">
          <span className="text-white/60 text-[11px] tracking-wider">
            传承卓越 · 启迪未来
          </span>
          <div className="flex items-center gap-6">
            {utilityLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors duration-150 relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-thu-gold after:transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 桌面端与移动端顶部 Logo 区 ===== */}
      <div className="w-full bg-white/95 backdrop-blur-xs border-b border-zinc-100 shadow-xs">
        <div className="mx-auto max-w-6xl px-4 py-3.5 md:py-5 flex items-center justify-between">
          {/* 校徽与校名 */}
          <Link href="/" className="flex items-center gap-3 group" onClick={closeDrawer}>
            {/* 紫金双色校徽徽章 */}
            <span className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-thu-purple to-thu-purple-dark text-white flex items-center justify-center text-lg md:text-xl font-bold font-serif-title shadow-sm ring-2 ring-thu-purple/20 group-hover:ring-thu-gold transition-all duration-300">
              校
            </span>
            <span className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold tracking-wide text-thu-purple-dark font-serif-title group-hover:text-thu-purple transition-colors">
                {name}
              </span>
              <span className="text-[10px] md:text-[11px] tracking-[0.18em] text-zinc-400 uppercase">
                University Official Website
              </span>
            </span>
          </Link>

          {/* 桌面端右侧：搜索 + 标语 */}
          <div className="hidden md:flex items-center gap-6">
            <SearchForm compact id="header-search" />
            <div className="hidden lg:block text-right text-xs md:text-sm text-zinc-400 font-serif-title border-l border-zinc-200 pl-6 py-1">
              <span className="text-thu-purple/90 font-medium">自强不息</span> · 厚德载物
            </div>
          </div>

          {/* 移动端操作按钮（汉堡包菜单按钮） */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="p-2 rounded-lg text-thu-purple hover:bg-thu-purple-light focus:outline-none focus:ring-2 focus:ring-thu-purple/30 transition-colors"
              aria-label={drawerOpen ? "关闭菜单" : "打开菜单"}
              aria-expanded={drawerOpen}
            >
              {drawerOpen ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ===== 桌面端第三层：主导航条（紫底金线，悬停展开） ===== */}
      <nav className="hidden md:block w-full bg-gradient-to-r from-thu-purple via-[#6f0a7e] to-thu-purple shadow-md border-b-2 border-thu-gold/80">
        <div className="mx-auto max-w-6xl px-4">
          <ul className="flex items-stretch">
            {navItems.map((item) => (
              <li key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className="flex items-center px-4.5 py-3 text-[15px] font-medium text-white/95 hover:bg-thu-purple-dark hover:text-white transition-colors duration-150"
                >
                  {item.label}
                  {item.children && (
                    <svg
                      className="ml-1.5 w-3 h-3 opacity-70 group-hover:rotate-180 transition-transform duration-200"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  )}
                </Link>

                {/* 二级下拉菜单 */}
                {item.children && (
                  <ul className="absolute left-0 top-full min-w-44 bg-white/95 backdrop-blur-md shadow-xl border-t-2 border-thu-purple rounded-b-md py-1.5 z-50 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ring-1 ring-black/5">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block px-5 py-2.5 text-sm text-zinc-700 hover:bg-thu-purple-light hover:text-thu-purple-dark transition-colors duration-150"
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

      {/* ===== 移动端抽屉式导航 (Off-Canvas Drawer) ===== */}
      {/* 半透明毛玻璃背景遮罩 */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* 抽屉内容容器 */}
      <aside
        className={`md:hidden fixed top-0 right-0 bottom-0 w-[82%] max-w-sm bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="移动端主导航"
      >
        {/* 抽屉头部 */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-thu-purple-light/40">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-thu-purple text-white flex items-center justify-center text-xs font-bold font-serif-title">
              校
            </span>
            <span className="font-bold text-thu-purple-dark text-base font-serif-title">
              {name}
            </span>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-white transition-colors"
            aria-label="关闭菜单"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* 抽屉内搜索框 */}
        <div className="p-4 border-b border-zinc-100">
          <SearchForm compact={false} id="drawer-search" />
        </div>

        {/* 导航列表区（滚动） */}
        <div className="flex-1 overflow-y-auto py-2 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const hasChildren = Boolean(item.children && item.children.length > 0);
              const isExpanded = expandedMenus[item.label];

              return (
                <li key={item.href} className="rounded-lg overflow-hidden">
                  {hasChildren ? (
                    <div>
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-thu-purple-light/50 transition-colors">
                        <Link
                          href={item.href}
                          onClick={closeDrawer}
                          className="flex-1 text-[15px] font-medium text-zinc-800 hover:text-thu-purple"
                        >
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleSubmenu(item.label)}
                          className="p-1.5 text-zinc-400 hover:text-thu-purple focus:outline-none"
                          aria-label={`展开 ${item.label} 子菜单`}
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-thu-purple" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* 二级菜单展开手风琴 */}
                      {isExpanded && item.children && (
                        <ul className="ml-4 pl-3 border-l-2 border-thu-purple/20 space-y-1 py-1">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={closeDrawer}
                                className="block px-3 py-2 text-sm text-zinc-600 hover:text-thu-purple hover:bg-thu-purple-light/40 rounded-md transition-colors"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={closeDrawer}
                      className="block px-3 py-2.5 text-[15px] font-medium text-zinc-800 hover:bg-thu-purple-light hover:text-thu-purple rounded-lg transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* 抽屉底部：快捷身份入口 */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50">
          <div className="text-xs text-zinc-400 mb-2 font-medium">快捷通道</div>
          <div className="grid grid-cols-3 gap-2">
            {utilityLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeDrawer}
                className="text-center py-2 text-xs font-medium text-thu-purple-dark bg-white border border-zinc-200 rounded-md hover:border-thu-purple hover:text-thu-purple transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </header>
  );
}
