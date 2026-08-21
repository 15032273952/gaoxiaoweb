/**
 * 联系我们：可点击电话/邮箱，附带站内搜索入口
 */

import { getSiteSetting } from "@/lib/cms";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SearchForm } from "@/components/SearchForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "联系我们 - 高校官网",
  description: "高校联系方式。",
};

export default async function ContactPage() {
  const setting = await getSiteSetting().catch(() => null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb items={[{ label: "联系我们" }]} />
      <h1 className="text-2xl font-bold mb-6 font-serif-title">联系我们</h1>

      {setting ? (
        <div className="space-y-5 text-zinc-700">
          {setting.address && (
            <div>
              <h2 className="font-semibold mb-1">地址</h2>
              <p className="text-sm">{setting.address}</p>
            </div>
          )}
          {setting.postcode && (
            <div>
              <h2 className="font-semibold mb-1">邮编</h2>
              <p className="text-sm">{setting.postcode}</p>
            </div>
          )}
          {setting.generalPhone && (
            <div>
              <h2 className="font-semibold mb-1">联系电话</h2>
              <p className="text-sm">
                <a href={`tel:${setting.generalPhone}`} className="text-thu-purple hover:underline">
                  {setting.generalPhone}
                </a>
              </p>
            </div>
          )}
          {setting.generalEmail && (
            <div>
              <h2 className="font-semibold mb-1">邮箱</h2>
              <p className="text-sm">
                <a href={`mailto:${setting.generalEmail}`} className="text-thu-purple hover:underline">
                  {setting.generalEmail}
                </a>
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-zinc-400">暂无内容</p>
      )}

      <section className="mt-10 pt-8 border-t border-zinc-100">
        <h2 className="font-semibold mb-3">查找内容</h2>
        <p className="text-sm text-zinc-500 mb-3">可通过关键词检索新闻、通知、师资与部门。</p>
        <SearchForm id="contact-search" />
      </section>
    </div>
  );
}
