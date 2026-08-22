/**
 * SiteFooter - 底部页脚组件（清华大学典雅风格）
 *
 * 优化点：
 * 1. 顶部金线点缀，深紫渐变底色
 * 2. 联系方式配备微矢量图标，提升信息可读性
 * 3. 移动端更紧凑且清晰的分组排版
 */

import type { SiteSetting } from "@/lib/types";
import { extraSiteLinks, navItems } from "@/lib/nav";
import Link from "next/link";

const footerColumns = navItems.filter((item) => item.href !== "/");

export function SiteFooter({ setting }: { setting?: SiteSetting | null }) {
  const name = setting?.siteName ?? "高校官网";
  const year = new Date().getFullYear();

  return (
    <footer className="print-hidden w-full text-sm border-t-2 border-thu-gold/80">
      {/* 主区域：深紫渐变底色 */}
      <div className="bg-gradient-to-b from-thu-purple via-[#560062] to-thu-purple-dark text-white/85 py-8 md:py-12">
        <div className="mx-auto max-w-6xl px-4">
          {/* 站点名称 + 附加链接 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-b border-white/15 pb-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/15 text-thu-gold flex items-center justify-center font-bold text-sm font-serif-title border border-white/20">
                校
              </span>
              <span className="text-xl md:text-2xl font-bold text-white font-serif-title tracking-wide">
                {name}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-5 sm:gap-x-7 gap-y-2 text-xs sm:text-sm">
              {extraSiteLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/75 hover:text-thu-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 栏目导航列 */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 border-b border-white/15 py-6">
            {footerColumns.slice(0, 3).map((col) => (
              <div key={col.href}>
                <Link href={col.href} className="font-semibold text-white hover:underline">
                  {col.label}
                </Link>
                <ul className="mt-3 space-y-1.5 text-white/70">
                  {(col.children ?? [{ label: col.label, href: col.href }]).map((child) => (
                    <li key={child.href}>
                      <Link href={child.href} className="hover:text-white">
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 联系方式 */}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 text-xs sm:text-sm text-white/75 py-6">
            {setting?.address && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-thu-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">地址：{setting.address}</span>
              </div>
            )}
            {setting?.generalPhone && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-thu-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>电话：{setting.generalPhone}</span>
              </div>
            )}
            {setting?.generalEmail && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-thu-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>邮箱：{setting.generalEmail}</span>
              </div>
            )}
          </div>

          {/* 自定义页脚链接 */}
          {setting?.footerLinks && setting.footerLinks.length > 0 && (
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/60">
              {setting.footerLinks.map((link, i) => (
                <a
                  key={`${link.href}-${i}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/75 hover:text-thu-gold transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 备案信息条：深紫底条 */}
      <div className="bg-thu-purple-dark text-white/50 text-xs py-3">
        <div className="mx-auto max-w-6xl px-4 flex flex-wrap justify-center gap-x-6 gap-y-1">
          <span>© {year} {name}</span>
          {setting?.icpRecordNo && (
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/80 transition-colors"
            >
              {setting.icpRecordNo}
            </a>
          )}
          {setting?.policeRecordNo && <span>{setting.policeRecordNo}</span>}
        </div>
      </div>
    </footer>
  );
}
