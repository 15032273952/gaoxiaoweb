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
  // 获取 CMS 中的信息公开页面内容
  const page = await getPageBySlug("openness").catch(() => null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb items={[{ label: "学校概况", href: "/about" }, { label: "信息公开" }]} />
      <h1 className="text-2xl font-bold mb-6 font-serif-title">信息公开</h1>
      
      {page ? (
        <>
          {/* 富文本正文 */}
          <div
            className="prose prose-zinc max-w-none"
            dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
          />
          
          {/* 公开文件下载区域（可选） */}
          {page.attachments.length > 0 && (
            <section className="mt-8 border-t border-zinc-200 pt-6">
              <h2 className="text-lg font-semibold mb-3">公开文件</h2>
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
        <p className="text-zinc-400">暂无内容</p>
      )}
    </div>
  );
}
