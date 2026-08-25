"use client";

/**
 * MobileNav - 移动端抽屉式导航（< md 断点显示）
 *
 * 学习要点：
 * 1. 为什么是客户端组件？—— 需要 useState 管理抽屉开合、useEffect 处理副作用。
 * 2. 抽屉开合：drawerOpen 状态 + 条件 class（translate-x-0 / translate-x-full）实现滑入滑出。
 * 3. 手风琴二级菜单：expandedMenus 记录每个菜单是否展开，点击切换。
 * 4. 两个 useEffect 的职责：
 *    - 抽屉打开时锁定 body 滚动（防止背景跟着滚）。
 *    - 按 ESC 键关闭抽屉（键盘无障碍）。
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, navItems, utilityLinks } from "@/lib/nav";

export function MobileNav() {
  const pathname = usePathname() ?? "/";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // 抽屉打开时锁定页面背景滚动
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
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
    <>
      {/* 触发条 */}
      <button
        type="button"
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="md:hidden w-full bg-thu-purple text-white px-4 py-3 flex items-center justify-between select-none"
        aria-label={drawerOpen ? "关闭菜单" : "打开菜单"}
        aria-expanded={drawerOpen}
      >
        <span className="text-sm font-medium">网站导航</span>
        <svg
          className="w-5 h-5"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>

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
              网站导航
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

        {/* 导航列表区（滚动） */}
        <div className="flex-1 overflow-y-auto py-2 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const hasChildren = Boolean(item.children && item.children.length > 0);
              const isExpanded = expandedMenus[item.label];
              const active = isNavActive(pathname, item);

              return (
                <li key={item.href} className="rounded-lg overflow-hidden">
                  {hasChildren ? (
                    <div>
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-thu-purple-light/50 transition-colors">
                        <Link
                          href={item.href}
                          onClick={closeDrawer}
                          aria-current={active ? "page" : undefined}
                          className={`flex-1 text-[15px] font-medium transition-colors ${
                            active ? "text-thu-purple" : "text-zinc-800 hover:text-thu-purple"
                          }`}
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
                          {item.children.map((child) => {
                            const childActive =
                              pathname === child.href || pathname.startsWith(`${child.href}/`);
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={closeDrawer}
                                  aria-current={childActive ? "page" : undefined}
                                  className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                    childActive
                                      ? "text-thu-purple bg-thu-purple-light/40"
                                      : "text-zinc-600 hover:text-thu-purple hover:bg-thu-purple-light/40"
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={closeDrawer}
                      aria-current={active ? "page" : undefined}
                      className={`block px-3 py-2.5 text-[15px] font-medium rounded-lg transition-colors ${
                        active
                          ? "text-thu-purple bg-thu-purple-light"
                          : "text-zinc-800 hover:bg-thu-purple-light hover:text-thu-purple"
                      }`}
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
          <div className="grid grid-cols-2 gap-2">
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
    </>
  );
}
