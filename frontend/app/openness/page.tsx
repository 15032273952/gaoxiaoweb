/**
 * 信息公开页面 - app/openness/page.tsx
 * 
 * 路由：/openness
 * 功能：显示信息公开内容及相关文件下载
 * 
 * 数据来源：从 CMS 获取 slug 为 "openness" 的页面内容
 */

// 导入 CMS 数据获取函数
import { getPageBySlug } from "@/lib/cms";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Metadata } from "next";

/**
 * 页面 SEO 元数据
 */
export const metadata: Metadata = {
  title: "信息公开 - 高校官网",
  description: "高校信息公开。",
};

/**
 * 信息公开页面组件
 */
export default async function OpennessPage() {
  const page = await getPageBySlug("openness").catch(() => null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <Breadcrumb items={[{ label: "学校概况", href: "/about" }, { label: "信息公开" }]} />
      <div className="bg-white border border-zinc-150/80 rounded-xl p-5 sm:p-8 shadow-2xs">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 font-serif-title text-zinc-900 border-b border-zinc-100 pb-4">
          信息公开
        </h1>
        
        {page ? (
          <>
            <div
              className="prose prose-zinc max-w-none article-body"
              dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
            />
            
            {page.attachments.length > 0 && (
              <section className="mt-8 border-t border-zinc-100 pt-6">
                <h2 className="text-base sm:text-lg font-bold mb-3 font-serif-title text-zinc-900">公开文件下载</h2>
                <ul className="space-y-2">
                  {page.attachments.map((att, i) => (
                    <li key={i}>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-thu-purple hover:underline text-sm inline-flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4 text-thu-purple/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {att.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <p className="text-zinc-400 py-8 text-center">暂无内容</p>
        )}
      </div>
    </div>
  );
}
