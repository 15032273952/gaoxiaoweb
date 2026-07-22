/**
 * SiteFooter - 底部页脚组件
 * 
 * 这是网站的底部区域，显示：
 * 1. 页脚导航链接
 * 2. 联系方式信息
 * 3. 备案信息
 * 
 * 使用方法：
 * <SiteFooter setting={siteSetting} />
 * 或
 * <SiteFooter />
 */

// 导入 SiteSetting 类型（用于类型检查）
import type { SiteSetting } from "@/lib/types";

/**
 * 底部页脚组件
 * 
 * @param setting - 网站配置对象（可选，无配置时显示简化版本）
 * @returns JSX 元素
 */
export function SiteFooter({ setting }: { setting?: SiteSetting }) {
  // 无配置时的简化显示
  if (!setting) {
    return (
      // <footer>: HTML5 语义化标签，表示页面底部
      // w-full: 宽度100%
      // border-t: 顶部边框
      // bg-zinc-50: 背景浅灰色
      // py-8: 上下内边距 2rem
      // text-center: 文字居中
      <footer className="w-full border-t border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-500">
        <p>暂无站点信息</p>
      </footer>
    );
  }

  // 正常显示完整页脚
  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50 py-8 text-sm text-zinc-600">
      <div className="mx-auto max-w-6xl px-4 space-y-4">
        {/* 第一个区域：页脚导航链接 */}
        {/* flex flex-wrap: Flexbox 布局，自动换行 */}
        {/* gap-4: 链接之间 1rem 间距 */}
        {/* justify-center: 居中对齐 */}
        <div className="flex flex-wrap gap-4 justify-center">
          {setting.footerLinks.map((link, i) => (
            <a
              key={i}                              // 数组索引作为 key
              href={link.href}                     // 链接地址
              target="_blank"                      // 在新标签页打开
              rel="noopener noreferrer"            // 安全属性，防止反向引用
              className="hover:text-zinc-900 transition-colors"  // 悬停效果
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* 第二个区域：联系方式 */}
        {/* space-y-1: 垂直方向每个元素 0.25rem 间距 */}
        <div className="text-center space-y-1">
          {/* 可选显示：地址 */}
          {setting.address && <p>{setting.address}</p>}
          {/* 可选显示：联系电话 */}
          {setting.generalPhone && <p>联系电话：{setting.generalPhone}</p>}
          {/* 可选显示：邮箱 */}
          {setting.generalEmail && <p>邮箱：{setting.generalEmail}</p>}
        </div>

        {/* 第三个区域：备案信息 */}
        {/* text-xs: 最小字号 */}
        {/* text-zinc-400: 更浅的灰色文字 */}
        {/* space-x-4: 水平排列，元素间距 1rem */}
        <div className="text-center text-xs text-zinc-400 space-x-4">
          {/* ICP 备案号，可点击跳转工信部备案查询 */}
          {setting.icpRecordNo && (
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-600"
            >
              {setting.icpRecordNo}
            </a>
          )}
          {/* 公安备案号（不可点击） */}
          {setting.policeRecordNo && <span>{setting.policeRecordNo}</span>}
        </div>
      </div>
    </footer>
  );
}
