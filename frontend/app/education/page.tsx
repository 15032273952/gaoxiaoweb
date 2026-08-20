/**
 * 教育教学页面 - app/education/page.tsx
 * 
 * 路由：/education
 * 功能：显示教育教学相关信息
 * 
 * 数据来源：从 CMS 获取 slug 为 "education" 的页面内容
 */

// 导入 CMS 数据获取函数
import { getPageBySlug } from "@/lib/cms";

// 导入 Metadata 类型
import type { Metadata } from "next";

/**
 * 页面 SEO 元数据
 */
export const metadata: Metadata = {
  title: "教育教学 - 高校官网",
  description: "高校教育教学介绍。",
};

/**
 * 教育教学页面组件
 */
export default async function EducationPage() {
  // 获取 CMS 中的教育教学页面内容
  const page = await getPageBySlug("education").catch(() => null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* 页面标题 */}
      <h1 className="text-2xl font-bold mb-6">教育教学</h1>
      
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
