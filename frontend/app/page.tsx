/**
 * 首页 - app/page.tsx（清华大学典雅风格 + 现代化流体响应布局）
 *
 * 页面结构（自上而下）：
 * 1. 主视觉轮播区（全宽大幅焦点图，支持移动端手势滑动）
 * 2. 校园要闻与通知公告：头版大图新闻 + 列表（左 2/3），通知公告卡片（右 1/3）
 * 3. 快捷入口：图标化多色栅格卡片（招生就业 / 教育教学 / 科学研究 等）
 */

import { BannerCarousel } from "@/components/BannerCarousel";
import { NewsCard } from "@/components/NewsCard";
import { NoticeList } from "@/components/NoticeList";
import { getBanners, getArticles, getNotices } from "@/lib/cms";
import { articleCategoryLabel, formatDate } from "@/lib/labels";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "首页",
  description: "高校官方网站首页，展示要闻轮播、通知公告与新闻列表。",
};

/** 快捷入口配置（包含专属图标与色彩类别） */
const quickLinks = [
  {
    label: "招生就业",
    desc: "Admissions & Careers",
    href: "/admissions",
    color: "green",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
  {
    label: "教育教学",
    desc: "Education",
    href: "/education",
    color: "purple",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: "科学研究",
    desc: "Research",
    href: "/research",
    color: "blue",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    label: "师资队伍",
    desc: "Faculty",
    href: "/faculty",
    color: "purple",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "机构设置",
    desc: "Organization",
    href: "/organization",
    color: "gold",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    label: "信息公开",
    desc: "Information",
    href: "/openness",
    color: "blue",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

function getIconColorClasses(color: string) {
  switch (color) {
    case "green":
      return "bg-thu-green-light text-thu-green group-hover:bg-thu-green group-hover:text-white";
    case "blue":
      return "bg-thu-blue-light text-thu-blue group-hover:bg-thu-blue group-hover:text-white";
    case "gold":
      return "bg-thu-gold-light text-thu-gold-dark group-hover:bg-thu-gold group-hover:text-white";
    default:
      return "bg-thu-purple-light text-thu-purple group-hover:bg-thu-purple group-hover:text-white";
  }
}

export default async function HomePage() {
  const [banners, articles, notices] = await Promise.all([
    getBanners().catch(() => []),
    getArticles().catch(() => []),
    getNotices().catch(() => []),
  ]);

  const headline = articles[0];
  const listArticles = articles.slice(1, 6);
  const latestNotices = notices.slice(0, 8);
  const academic = articles.filter((a) => a.category === "academic").slice(0, 4);

  return (
    <div className="w-full">
      <section>
        <BannerCarousel banners={banners} />
      </section>

      {/* ===== 校园要闻 + 通知公告 ===== */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10 md:py-14">
        <div className="grid gap-8 lg:gap-10 lg:grid-cols-3">
          {/* 左侧 2/3：校园要闻 */}
          <div className="lg:col-span-2">
            <div className="section-title">
              <span className="section-title-text">校园要闻</span>
              <Link
                href="/news"
                className="text-xs sm:text-sm text-zinc-400 hover:text-thu-purple transition-colors font-medium"
              >
                更多 &gt;
              </Link>
            </div>

            {articles.length > 0 ? (
              <div className="space-y-4 sm:space-y-5">
                {/* 头版焦点新闻 */}
                {headline && (
                  <Link
                    href={`/news/${headline.slug}`}
                    className="group block bg-white border border-zinc-150/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-lg hover:border-thu-purple/30 transition-all duration-300 active-press"
                  >
                    {headline.coverUrl && (
                      <div className="w-full h-48 sm:h-64 md:h-72 overflow-hidden bg-zinc-100">
                        <img
                          src={headline.coverUrl}
                          alt={headline.title}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-4 sm:p-5">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 group-hover:text-thu-purple transition-colors font-serif-title line-clamp-2 leading-snug">
                        {headline.isPinned && (
                          <span className="inline-block mr-2 text-[11px] sm:text-xs align-middle text-white bg-gradient-to-r from-thu-gold to-thu-gold-dark px-1.5 py-0.5 rounded font-normal shadow-2xs">
                            置顶
                          </span>
                        )}
                        {headline.title}
                      </h3>
                      {headline.summary && (
                        <p className="mt-2 text-xs sm:text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                          {headline.summary}
                        </p>
                      )}
                      <div className="mt-3 text-xs text-zinc-400 font-mono">
                        {articleCategoryLabel(headline.category)} · {formatDate(headline.publishedAt)}
                      </div>
                    </div>
                  </Link>
                )}

                {/* 其余新闻列表 */}
                <div className="space-y-3 sm:space-y-4">
                  {listArticles.map((a) => (
                    <NewsCard key={a.id} article={a} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-zinc-400 text-sm py-4">暂无新闻</p>
            )}
          </div>

          {/* 右侧 1/3：通知公告卡片 */}
          <aside className="space-y-6">
            <div className="bg-white border border-zinc-150/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow">
              {/* 卡片标题栏：深紫微渐变底色 */}
              <div className="bg-gradient-to-r from-thu-purple to-thu-purple-dark text-white px-4 sm:px-5 py-3.5 flex items-center justify-between border-b-2 border-thu-gold/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-thu-gold" />
                  <h2 className="font-bold font-serif-title text-base tracking-wide">通知公告</h2>
                </div>
                <Link
                  href="/notices"
                  className="text-xs text-white/80 hover:text-thu-gold transition-colors font-medium"
                >
                  更多 &gt;
                </Link>
              </div>
              <div className="p-3 sm:p-4">
                <NoticeList notices={latestNotices} />
              </div>
            </div>

            {academic.length > 0 && (
              <div className="bg-white border border-zinc-150/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow">
                <div className="px-5 py-3 flex items-center justify-between border-b border-zinc-100">
                  <h2 className="font-bold font-serif-title text-thu-purple-dark">学术动态</h2>
                  <Link
                    href="/news?category=academic"
                    className="text-xs text-zinc-400 hover:text-thu-purple"
                  >
                    更多 &gt;
                  </Link>
                </div>
                <ul className="px-5 py-2 divide-y divide-zinc-100">
                  {academic.map((a) => (
                    <li key={a.id} className="py-2.5">
                      <Link
                        href={`/news/${a.slug}`}
                        className="text-sm text-zinc-700 hover:text-thu-purple line-clamp-2"
                      >
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* ===== 快捷入口（图标化多色卡片） ===== */}
      <section className="w-full bg-gradient-to-b from-thu-surface-warm to-thu-purple-50/50 py-10 sm:py-12 md:py-16 border-t border-thu-purple/5">
        <div className="mx-auto max-w-6xl px-4">
          <div className="section-title">
            <span className="section-title-text">快捷入口</span>
          </div>
          {/* 栅格布局：移动端 2 列，平板 3 列，桌面 6 列 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {quickLinks.map((link) => {
              const iconClasses = getIconColorClasses(link.color);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group bg-white rounded-xl border border-zinc-150/80 p-4 sm:p-5 text-center hover:border-thu-purple/40 hover:shadow-md transition-all duration-200 active-press flex flex-col items-center justify-center"
                >
                  {/* 双色微渐变图标 */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 shadow-2xs ${iconClasses}`}
                  >
                    {link.icon}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-zinc-800 group-hover:text-thu-purple transition-colors font-serif-title">
                    {link.label}
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-400 tracking-wider uppercase font-medium">
                    {link.desc}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
