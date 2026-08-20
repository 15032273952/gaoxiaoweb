/**
 * 机构设置页面 - app/organization/page.tsx
 * 
 * 路由：/organization
 * 功能：以网格卡片形式展示学校各部门信息
 * 
 * 数据来源：从 CMS 获取部门列表
 */

// 导入 CMS 数据获取函数
import { getDepartments } from "@/lib/cms";

// 导入 Metadata 类型
import type { Metadata } from "next";

/**
 * 页面 SEO 元数据
 */
export const metadata: Metadata = {
  title: "机构设置 - 高校官网",
  description: "高校机构设置与部门信息。",
};

/**
 * 机构设置页面组件
 */
export default async function OrganizationPage() {
  // 获取部门列表
  const departments = await getDepartments().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 页面标题 */}
      <h1 className="text-2xl font-bold mb-6">机构设置</h1>
      
      {/* 判断是否有数据 */}
      {departments.length > 0 ? (
        // 三列网格布局
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 遍历渲染每个部门 */}
          {departments.map((dept) => (
            // 每个部门一个卡片
            <div key={dept.id} className="p-4 border border-zinc-200 rounded-lg">
              {/* 部门名称 */}
              <h2 className="font-semibold text-zinc-900">{dept.name}</h2>
              {/* 部门简介（可选，最多显示3行） */}
              {dept.intro && (
                <p className="mt-2 text-sm text-zinc-600 line-clamp-3">{dept.intro}</p>
              )}
              {/* 联系方式 */}
              <div className="mt-3 text-xs text-zinc-400 space-y-1">
                {dept.contactOffice && <p>办公室：{dept.contactOffice}</p>}
                {dept.contactPhone && <p>电话：{dept.contactPhone}</p>}
                {dept.contactEmail && <p>邮箱：{dept.contactEmail}</p>}
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
