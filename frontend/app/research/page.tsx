/**
 * 科学研究页面 - app/research/page.tsx
 * 
 * 路由：/research
 * 功能：显示科学研究相关信息
 * 
 * 数据来源：从 CMS 获取 slug 为 "research" 的页面内容
 */

// 导入 CMS 数据获取函数
import { getPageBySlug } from "@/lib/cms";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Metadata } from "next";

/**
 * 页面 SEO 元数据
 */
export const metadata: Metadata = {
  title: "科学研究 - 高校官网",
  description: "高校科学研究介绍。",
};

/**
 * 科学研究页面组件
 */
export default async function ResearchPage() {
  // 获取 CMS 中的科学研究页面内容
  const page = await getPageBySlug("research").catch(() => null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb items={[{ label: "科学研究" }]} />
      <h1 className="text-2xl font-bold mb-6 font-serif-title">科学研究</h1>
      
      {/* 渲染页面内容 */}
      {page ? (
        <div
          className="prose prose-zinc max-w-none"
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      ) : (
        <p className="text-zinc-400">暂无内容</p>
      )}
    </div>
  );
}
