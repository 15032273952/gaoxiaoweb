/**
 * 联系我们页面 - app/contact/page.tsx
 * 
 * 路由：/contact
 * 功能：显示学校联系方式
 * 
 * 数据来源：从 CMS 获取网站全局配置（SiteSetting）
 */

// 导入 CMS 数据获取函数
import { getSiteSetting } from "@/lib/cms";

// 导入 Metadata 类型
import type { Metadata } from "next";

/**
 * 页面 SEO 元数据
 */
export const metadata: Metadata = {
  title: "联系我们 - 高校官网",
  description: "高校联系方式。",
};

/**
 * 联系我们页面组件
 */
export default async function ContactPage() {
  // 获取网站全局配置
  const setting = await getSiteSetting().catch(() => null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* 页面标题 */}
      <h1 className="text-2xl font-bold mb-6">联系我们</h1>
      
      {/* 渲染联系方式 */}
      {setting ? (
        <div className="space-y-4 text-zinc-700">
          {/* 地址 */}
          {setting.address && (
            <div>
              <h2 className="font-semibold mb-1">地址</h2>
              <p className="text-sm">{setting.address}</p>
            </div>
          )}
          {/* 邮编 */}
          {setting.postcode && (
            <div>
              <h2 className="font-semibold mb-1">邮编</h2>
              <p className="text-sm">{setting.postcode}</p>
            </div>
          )}
          {/* 联系电话 */}
          {setting.generalPhone && (
            <div>
              <h2 className="font-semibold mb-1">联系电话</h2>
              <p className="text-sm">{setting.generalPhone}</p>
            </div>
          )}
          {/* 邮箱 */}
          {setting.generalEmail && (
            <div>
              <h2 className="font-semibold mb-1">邮箱</h2>
              <p className="text-sm">{setting.generalEmail}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-zinc-400">暂无内容</p>
      )}
    </div>
  );
}
