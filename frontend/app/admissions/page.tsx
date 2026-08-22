/**
 * 招生就业页面 - app/admissions/page.tsx
 * 
 * 路由：/admissions
 * 功能：显示招生就业相关信息
 * 
 * 数据来源：从 CMS 获取 slug 为 "admissions" 的页面内容
 */

// 导入 CMS 数据获取函数
import { getPageBySlug } from "@/lib/cms";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Metadata } from "next";

/**
 * 页面 SEO 元数据
 */
export const metadata: Metadata = {
  title: "招生就业 - 高校官网",
  description: "高校招生就业信息展示。",
};

/**
 * 招生就业页面组件
 */
export default async function AdmissionsPage() {
  const page = await getPageBySlug("admissions").catch(() => null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <Breadcrumb items={[{ label: "招生就业" }]} />
      <div className="bg-white border border-zinc-150/80 rounded-xl p-5 sm:p-8 shadow-2xs">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 font-serif-title text-zinc-900 border-b border-zinc-100 pb-4">
          招生就业
        </h1>
        
        {page ? (
          <div
            className="prose prose-zinc max-w-none article-body"
            dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
          />
        ) : (
          <p className="text-zinc-400 py-8 text-center">暂无内容</p>
        )}
      </div>
    </div>
  );
}
