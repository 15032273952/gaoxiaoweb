/**
 * 关于我们页面 - app/about/page.tsx
 * 
 * 路由：/about
 * 功能：显示"学校概况"单页面内容
 * 
 * 页面特点：
 * - 从 CMS 获取 slug 为 "about" 的页面内容
 * - 支持富文本正文（HTML）
 * - 支持附件下载（可选）
 */

// 导入 CMS 数据获取函数
import { getPageBySlug } from "@/lib/cms";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Metadata } from "next";

/**
 * 页面 SEO 元数据
 */
export const metadata: Metadata = {
  title: "学校概况 - 高校官网",
  description: "高校学校概况介绍。",
};

/**
 * 关于我们页面组件
 * 
 * 这是一个 Server Component，直接在服务器获取 CMS 数据
 */
export default async function AboutPage() {
  // 从 CMS 获取 slug 为 "about" 的页面内容
  // .catch(() => null) 确保 CMS 不可用时显示"暂无内容"
  const page = await getPageBySlug("about").catch(() => null);

  return (
    // 外层容器：max-w-3xl 限制阅读宽度，水平居中
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb items={[{ label: "学校概况" }]} />
      <h1 className="text-2xl font-bold mb-6 font-serif-title">学校概况</h1>
      
      {/* 判断页面内容是否存在 */}
      {page ? (
        <>
          {/* 富文本正文内容 */}
          {/* prose prose-zinc: Tailwind Typography 插件的富文本样式 */}
          {/* dangerouslySetInnerHTML: 直接渲染 HTML（来自 CMS 的可信内容） */}
          <div
            className="prose prose-zinc max-w-none"
            dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
          />
          
          {/* 附件下载区域（仅在有附件时显示） */}
          {/* mt-8: 与正文 2rem 间距 */}
          {/* border-t: 顶部边框分隔 */}
          {page.attachments.length > 0 && (
            <section className="mt-8 border-t border-zinc-200 pt-6">
              <h2 className="text-lg font-semibold mb-3">附件下载</h2>
              <ul className="space-y-2">
                {page.attachments.map((att, i) => (
                  <li key={i}>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline text-sm"
                    >
                      {att.name}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        // 无内容时的占位提示
        <p className="text-zinc-400">暂无内容</p>
      )}
    </div>
  );
}
