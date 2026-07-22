/**
 * 师资队伍页面 - app/faculty/page.tsx
 * 
 * 路由：/faculty
 * 功能：以网格卡片形式展示教职工简介信息
 * 
 * 数据来源：从 CMS 获取教职工简介列表
 */

// 导入 CMS 数据获取函数
import { getFacultyProfiles } from "@/lib/cms";

// 导入 Metadata 类型
import type { Metadata } from "next";

/**
 * 页面 SEO 元数据
 */
export const metadata: Metadata = {
  title: "师资队伍 - 高校官网",
  description: "高校师资队伍公开信息。",
};

/**
 * 师资队伍页面组件
 */
export default async function FacultyPage() {
  // 获取教职工简介列表
  const profiles = await getFacultyProfiles().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 页面标题 */}
      <h1 className="text-2xl font-bold mb-6">师资队伍</h1>
      
      {/* 判断是否有数据 */}
      {profiles.length > 0 ? (
        // 三列网格布局（移动端 1 列，中等屏幕 2 列，大屏幕 3 列）
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 遍历渲染每位教职工 */}
          {profiles.map((f) => (
            // 每个教职工一个卡片
            <div key={f.id} className="flex gap-4 p-4 border border-zinc-200 rounded-lg">
              {/* 头像（可选） */}
              {f.avatarUrl && (
                <div className="flex-shrink-0 w-16 h-16">
                  {/* eslint-disable-next-line: 禁用 Next.js 图片检查 */}
                  <img
                    src={f.avatarUrl}
                    alt={f.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              )}
              {/* 信息区域 */}
              <div>
                {/* 姓名 */}
                <h2 className="font-semibold">{f.name}</h2>
                {/* 职称/职务 */}
                <p className="text-sm text-zinc-600">{f.title}</p>
                {/* 所属学院/部门 */}
                <p className="text-sm text-zinc-500">{f.college}</p>
                {/* 研究方向（可选） */}
                {f.researchFields && (
                  <p className="mt-1 text-xs text-zinc-400">
                    研究方向：{f.researchFields}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-zinc-400">暂无内容</p>
      )}
    </div>
  );
}
