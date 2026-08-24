/**
 * 联系我们：联系方式 + 邮件咨询表单
 */

import { getSiteSetting } from "@/lib/content";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SearchForm } from "@/components/SearchForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "联系我们",
  description: "高校联系方式。",
};

export default async function ContactPage() {
  const setting = await getSiteSetting().catch(() => null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <Breadcrumb items={[{ label: "联系我们" }]} />
      <div className="bg-white border border-zinc-150/80 rounded-xl p-5 sm:p-8 shadow-2xs">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 font-serif-title text-zinc-900 border-b border-zinc-100 pb-4">
          联系我们
        </h1>

        {setting ? (
          <div className="grid sm:grid-cols-2 gap-4 text-zinc-700">
            {setting.address && (
              <div className="bg-thu-surface-warm p-4 rounded-xl border border-zinc-100">
                <h2 className="text-xs text-zinc-400 font-medium mb-1 uppercase tracking-wider">校区地址</h2>
                <p className="text-sm sm:text-base font-medium text-zinc-900">{setting.address}</p>
              </div>
            )}
            {setting.postcode && (
              <div className="bg-thu-surface-warm p-4 rounded-xl border border-zinc-100">
                <h2 className="text-xs text-zinc-400 font-medium mb-1 uppercase tracking-wider">邮政编码</h2>
                <p className="text-sm sm:text-base font-medium text-zinc-900 font-mono">{setting.postcode}</p>
              </div>
            )}
            {setting.generalPhone && (
              <div className="bg-thu-surface-warm p-4 rounded-xl border border-zinc-100">
                <h2 className="text-xs text-zinc-400 font-medium mb-1 uppercase tracking-wider">联系电话</h2>
                <p className="text-sm sm:text-base font-medium">
                  <a href={`tel:${setting.generalPhone}`} className="text-thu-purple hover:underline font-mono">
                    {setting.generalPhone}
                  </a>
                </p>
              </div>
            )}
            {setting.generalEmail && (
              <div className="bg-thu-surface-warm p-4 rounded-xl border border-zinc-100">
                <h2 className="text-xs text-zinc-400 font-medium mb-1 uppercase tracking-wider">官方邮箱</h2>
                <p className="text-sm sm:text-base font-medium">
                  <a href={`mailto:${setting.generalEmail}`} className="text-thu-purple hover:underline font-mono">
                    {setting.generalEmail}
                  </a>
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-zinc-400 py-8 text-center">暂无内容</p>
        )}

        {setting?.generalEmail && (
          <section className="mt-8 pt-8 border-t border-zinc-100">
            <h2 className="text-lg font-bold mb-2 font-serif-title text-zinc-900">邮件咨询</h2>
            <p className="text-xs sm:text-sm text-zinc-500 mb-4">
              将调用本机邮件客户端发送至学校邮箱，不会在网站服务器留存内容。
            </p>
            <form action={`mailto:${setting.generalEmail}`} method="get" className="space-y-3">
              <div>
                <label htmlFor="mail-subject" className="block text-sm mb-1">
                  主题
                </label>
                <input
                  id="mail-subject"
                  name="subject"
                  required
                  className="w-full rounded border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-thu-purple"
                />
              </div>
              <div>
                <label htmlFor="mail-body" className="block text-sm mb-1">
                  内容
                </label>
                <textarea
                  id="mail-body"
                  name="body"
                  required
                  rows={5}
                  className="w-full rounded border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-thu-purple"
                />
              </div>
              <button
                type="submit"
                className="rounded bg-thu-purple px-4 py-2 text-sm text-white hover:bg-thu-purple-dark"
              >
                打开邮件客户端
              </button>
            </form>
          </section>
        )}

        <section className="mt-8 pt-8 border-t border-zinc-100">
          <h2 className="text-lg font-bold mb-2 font-serif-title text-zinc-900">站内快速搜索</h2>
          <p className="text-xs sm:text-sm text-zinc-500 mb-4">可通过关键词检索全校新闻、通知公告、师资学者与部门设置。</p>
          <SearchForm id="contact-search" />
        </section>
      </div>
    </div>
  );
}
