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

// 导入 Metadata 类型
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
  // 获取 CMS 中的招生就业页面内容
  const page = await getPageBySlug("admissions").catch(() => null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* 页面标题 */}
      <h1 className="text-2xl font-bold mb-6">招生就业</h1>
      
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
