/**
 * 通知公告列表页 - app/notices/page.tsx
 * 
 * 路由：/notices
 * 功能：显示所有通知公告列表
 * 
 * 页面布局：
 * - 垂直列表，每项显示标题、日期
 * - 支持置顶和文号显示
 */

// 导入 CMS 数据获取函数
import { getNotices } from "@/lib/cms";

// 导入通知列表组件
import { NoticeList } from "@/components/NoticeList";

// 导入 Metadata 类型
import type { Metadata } from "next";

/**
 * 页面 SEO 元数据
 */
export const metadata: Metadata = {
  title: "通知公告 - 高校官网",
  description: "高校通知公告列表。",
};

/**
 * 通知公告列表页组件
 */
export default async function NoticesPage() {
  // 获取所有通知
  const notices = await getNotices().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 页面标题 */}
      <h1 className="text-2xl font-bold mb-6">通知公告</h1>
      
      {/* 渲染通知列表组件 */}
      <NoticeList notices={notices} />
    </div>
  );
}
