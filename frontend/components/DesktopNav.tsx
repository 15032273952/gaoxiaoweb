"use client";

/**
 * DesktopNav - 桌面端主导航（≥ md 断点显示）
 *
 * 学习要点：
 * 1. 为什么是客户端组件？—— 需要 usePathname() 读取当前路由，用于高亮当前栏目。
 * 2. 高亮逻辑：isNavActive(pathname, item) 判断当前路径是否属于该栏目（含子栏目）。
 * 3. 下拉菜单：纯 CSS 实现（group-hover / group-focus-within），无需 JS 状态。
 *    - group：父级 li 上标记，子元素用 group-hover: 响应父级悬停。
 *    - focus-within：键盘 Tab 聚焦到子链接时也能展开，保证无障碍。
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, navItems } from "@/lib/nav";

export function DesktopNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="hidden md:block sticky top-0 z-40 w-full bg-gradient-to-r from-thu-purple via-[#6f0a7e] to-thu-purple shadow-md border-b-2 border-thu-gold/80">
      <div className="mx-auto max-w-6xl px-4">
        <ul className="flex items-stretch">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item);
            return (
              <li key={item.href} className="relative group">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center px-5 py-3.5 text-[15px] font-medium transition-colors ${
                    active
                      ? "bg-thu-purple-dark text-white"
                      : "text-white/95 hover:bg-thu-purple-dark hover:text-white"
                  }`}
                >
                  {item.label}
                  {item.children && (
                    <svg
                      className="ml-1 w-3 h-3 opacity-70 group-hover:rotate-180 group-focus-within:rotate-180 transition-transform"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  )}
                </Link>
                {item.children && (
                  <ul className="absolute left-0 top-full min-w-44 bg-white/95 backdrop-blur-md shadow-xl border-t-2 border-thu-purple rounded-b-md py-1.5 z-50 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200 ring-1 ring-black/5">
                    {item.children.map((child) => {
                      const childActive =
                        pathname === child.href || pathname.startsWith(`${child.href}/`);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            aria-current={childActive ? "page" : undefined}
                            className={`block px-5 py-2.5 text-sm transition-colors ${
                              childActive
                                ? "bg-thu-purple-light text-thu-purple-dark"
                                : "text-zinc-700 hover:bg-thu-purple-light hover:text-thu-purple-dark"
                            }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
