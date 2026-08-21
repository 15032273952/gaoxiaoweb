/**
 * SiteFooter - 底部页脚组件（清华官网风格）
 *
 * 深紫底页脚，分三个区域：
 * 1. 站点名称 + 页脚导航链接
 * 2. 联系方式（地址 / 电话 / 邮箱）
 * 3. 备案信息（深色底条）
 *
 * 使用方法：
 * <SiteFooter setting={siteSetting} />
 */

import type { SiteSetting } from "@/lib/types";

export function SiteFooter({ setting }: { setting?: SiteSetting | null }) {
  // 无配置时的简化显示（保持紫色系，视觉统一）
  if (!setting) {
    return (
      <footer className="print-hidden w-full bg-thu-purple py-8 text-center text-sm text-white/70">
        <p className="font-serif-title text-white/90 text-base">高校官网</p>
        <p className="mt-2">暂无站点信息</p>
      </footer>
    );
  }

  return (
    <footer className="print-hidden w-full text-sm">
      {/* 主区域：深紫底 */}
      <div className="bg-thu-purple text-white/85 py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          {/* 站点名称 + 页脚导航 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-b border-white/15 pb-6">
            <span className="text-xl font-bold text-white font-serif-title tracking-wide">
              {setting.siteName}
            </span>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {setting.footerLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/75 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* 联系方式 */}
          <div className="grid gap-2 md:grid-cols-3 text-white/70">
            {setting.address && <p>地址：{setting.address}</p>}
            {setting.generalPhone && <p>联系电话：{setting.generalPhone}</p>}
            {setting.generalEmail && <p>邮箱：{setting.generalEmail}</p>}
          </div>
        </div>
      </div>

      {/* 备案信息条：更深的紫色 */}
      {(setting.icpRecordNo || setting.policeRecordNo) && (
        <div className="bg-thu-purple-dark text-white/50 text-xs py-3">
          <div className="mx-auto max-w-6xl px-4 flex flex-wrap justify-center gap-x-6 gap-y-1">
            {setting.icpRecordNo && (
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/80 transition-colors"
              >
                {setting.icpRecordNo}
              </a>
            )}
            {setting.policeRecordNo && <span>{setting.policeRecordNo}</span>}
          </div>
        </div>
      )}
    </footer>
  );
}
