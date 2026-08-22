/**
 * SiteHeader - 顶部导航栏组件（清华大学典雅风格 + 现代移动端交互）
 *
 * 桌面端结构（三层）：
 * 1. 顶部辅助条：深紫渐变底色，放置访客/校友等快捷入口
 * 2. Logo 区：白底温润微光，左侧衬线体校名 + 英文副标，右侧标语与快速搜索
 * 3. 主导航条：由 SiteNav 渲染（深紫渐变底、金线微边框、悬停下拉二级菜单）
 *
 * 移动端结构：Logo 区 + 快速检索条 + 抽屉式导航（见 SiteNav 的 MobileNav）
 */

import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";
import { DesktopNav, MobileNav } from "@/components/SiteNav";
import { utilityLinks } from "@/lib/nav";

export function SiteHeader({
  siteName,
  logoUrl,
}: {
  siteName?: string;
  logoUrl?: string;
}) {
  const name = siteName ?? "高校官网";

  return (
    <header className="print-hidden w-full relative z-40">
      {/* ===== 第一层 顶部辅助条（深紫微渐变） ===== */}
      <div className="w-full bg-gradient-to-r from-thu-purple-dark via-[#52075f] to-thu-purple-dark text-white/80 text-xs border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 h-8 flex items-center justify-between">
          <span className="text-white/60 text-[11px] tracking-wider">
            传承卓越 · 启迪未来
          </span>
          <div className="flex items-center gap-5">
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

      {/* ===== 第二层 Logo 区（白底微光 + 玻璃质感） ===== */}
      <div className="w-full bg-white/95 backdrop-blur-xs border-b border-zinc-100 shadow-xs">
        <div className="mx-auto max-w-6xl px-4 py-3.5 md:py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-sm ring-2 ring-thu-purple/20 group-hover:ring-thu-gold transition-all duration-300"
              />
            ) : (
              <span className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-thu-purple to-thu-purple-dark text-white flex items-center justify-center text-lg md:text-xl font-bold font-serif-title shadow-sm ring-2 ring-thu-purple/20 group-hover:ring-thu-gold transition-all duration-300">
                校
              </span>
            )}
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
        </div>
      </div>

      {/* ===== 第三层 主导航条（SiteNav 渲染） ===== */}
      <DesktopNav />

      {/* ===== 移动端：快速检索 + 抽屉式导航 ===== */}
      <div className="md:hidden bg-thu-purple px-4 py-3">
        <SearchForm compact={false} id="mobile-search" />
      </div>
      <MobileNav />
    </header>
  );
}
