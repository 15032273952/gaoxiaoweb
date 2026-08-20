/**
 * 首页 - app/page.tsx（清华官网风格布局）
 *
 * 页面结构（自上而下）：
 * 1. 主视觉轮播区（全宽大幅焦点图）
 * 2. 校园要闻：头版大图新闻 + 新闻列表（左 2/3），通知公告卡片（右 1/3）
 * 3. 快捷入口：栅格化卡片（招生就业 / 教育教学 / 科学研究 等）
 *
 * 使用 Server Component 模式，数据在服务器端直接获取并渲染
 */

import { BannerCarousel } from "@/components/BannerCarousel";
import { NewsCard } from "@/components/NewsCard";
import { NoticeList } from "@/components/NoticeList";
import { getBanners, getArticles, getNotices, getSiteSetting } from "@/lib/cms";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "首页 - 高校官网",
  description: "高校官方网站首页，展示要闻轮播、通知公告与新闻列表。",
};

/** 快捷入口配置（对应清华官网的功能直达区） */
const quickLinks = [
  { label: "招生就业", desc: "Admissions & Careers", href: "/admissions" },
  { label: "教育教学", desc: "Education", href: "/education" },
  { label: "科学研究", desc: "Research", href: "/research" },
  { label: "师资队伍", desc: "Faculty", href: "/faculty" },
  { label: "机构设置", desc: "Organization", href: "/organization" },
  { label: "信息公开", desc: "Information", href: "/openness" },
];

export default async function HomePage() {
  // 并行获取 CMS 数据；单个请求失败时降级为空数据，保证页面可用
  const [banners, articles, notices] = await Promise.all([
    getBanners().catch(() => []),
    getArticles().catch(() => []),
    getNotices().catch(() => []),
    getSiteSetting().catch(() => null),
  ]);

  // 头版新闻：取第一篇作为大图焦点，其余作为列表
  const headline = articles[0];
  const listArticles = articles.slice(1, 6);
  const latestNotices = notices.slice(0, 8);

  return (
    <div className="w-full">
      {/* ===== 主视觉轮播区（全宽） ===== */}
      <section>
        <BannerCarousel banners={banners} />
      </section>

      {/* ===== 校园要闻 + 通知公告 ===== */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* 左侧 2/3：校园要闻 */}
          <div className="lg:col-span-2">
            {/* 版块标题：紫色竖条 + 衬线大标题 + 更多链接 */}
            <div className="section-title">
              <span className="section-title-text">校园要闻</span>
              <Link
                href="/news"
                className="text-sm text-zinc-400 hover:text-thu-purple transition-colors"
              >
                更多 &gt;
              </Link>
            </div>

            {articles.length > 0 ? (
              <div className="space-y-5">
                {/* 头版焦点新闻：大图 + 标题摘要，突出视觉层级 */}
                {headline && (
                  <Link
                    href={`/news/${headline.slug}`}
                    className="group block border border-zinc-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {headline.coverUrl && (
                      <div className="w-full h-56 md:h-72 overflow-hidden">
                        <img
                          src={headline.coverUrl}
                          alt={headline.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-lg md:text-xl font-bold text-zinc-900 group-hover:text-thu-purple transition-colors font-serif-title line-clamp-2">
                        {headline.isPinned && (
                          <span className="inline-block mr-2 text-xs align-middle text-white bg-thu-purple px-1.5 py-0.5 rounded font-normal">
                            置顶
                          </span>
                        )}
                        {headline.title}
                      </h3>
                      {headline.summary && (
                        <p className="mt-2 text-sm text-zinc-500 line-clamp-2">
                          {headline.summary}
                        </p>
                      )}
                      <div className="mt-3 text-xs text-zinc-400">
                        {new Date(headline.publishedAt).toLocaleDateString("zh-CN")}
                      </div>
                    </div>
                  </Link>
                )}

                {/* 其余新闻列表 */}
                <div className="space-y-4">
                  {listArticles.map((a) => (
                    <NewsCard key={a.id} article={a} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-zinc-400 text-sm py-4">暂无新闻</p>
            )}
          </div>

          {/* 右侧 1/3：通知公告卡片（紫色标题栏） */}
          <aside>
            <div className="border border-zinc-100 rounded-lg overflow-hidden shadow-sm">
              {/* 卡片标题栏：紫底白字 */}
              <div className="bg-thu-purple text-white px-5 py-3 flex items-center justify-between">
                <h2 className="font-bold font-serif-title">通知公告</h2>
                <Link
                  href="/notices"
                  className="text-xs text-white/70 hover:text-white transition-colors"
                >
                  更多 &gt;
                </Link>
              </div>
              <div className="px-5 py-2">
                <NoticeList notices={latestNotices} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ===== 快捷入口（栅格化卡片，浅紫底） ===== */}
      <section className="w-full bg-thu-purple-light/60 py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="section-title">
            <span className="section-title-text">快捷入口</span>
          </div>
          {/* 栅格布局：移动端 2 列，平板 3 列，桌面 6 列 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-white rounded-lg border border-zinc-100 px-4 py-6 text-center hover:border-thu-purple hover:shadow-md transition-all"
              >
                <div className="text-base font-bold text-zinc-800 group-hover:text-thu-purple transition-colors font-serif-title">
                  {link.label}
                </div>
                <div className="mt-1.5 text-[11px] text-zinc-400 tracking-wide uppercase">
                  {link.desc}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
