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
import { NoticeTicker } from "@/components/NoticeTicker";
import { StatsBand } from "@/components/StatsBand";
import { Reveal } from "@/components/Reveal";
import { getBanners, getArticles, getNotices } from "@/lib/content";
import { articleCategoryLabel, formatDate } from "@/lib/labels";
import { quickLinks, getIconColorClasses } from "@/lib/quickLinks";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "首页",
  description: "高校官方网站首页，展示要闻轮播、通知公告与新闻列表。",
};

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

      <NoticeTicker notices={notices} />

      {/* ===== 校园要闻 + 通知公告 ===== */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10 md:py-14">
        <div className="grid gap-8 lg:gap-10 lg:grid-cols-3">
          {/* 左侧 2/3：校园要闻 */}
          <Reveal className="lg:col-span-2">
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
                    className="group card-lift block bg-white border border-zinc-150/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-lg hover:border-thu-purple/30 active-press"
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
          </Reveal>

          {/* 右侧 1/3：通知公告卡片 */}
          <aside className="space-y-6">
            <Reveal delay={120}>
            <div className="bg-white border border-zinc-150/80 rounded-xl overflow-hidden shadow-2xs card-lift hover:shadow-md hover:border-thu-purple/25">
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
            </Reveal>

            {academic.length > 0 && (
              <Reveal delay={220}>
              <div className="bg-white border border-zinc-150/80 rounded-xl overflow-hidden shadow-2xs card-lift hover:shadow-md hover:border-thu-blue/25">
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
              </Reveal>
            )}
          </aside>
        </div>
      </section>

      {/* ===== 数说学校（滚动进入时数字计数动画） ===== */}
      <StatsBand />

      {/* ===== 快捷入口（图标化多色卡片） ===== */}
      <section className="w-full bg-gradient-to-b from-thu-surface-warm to-thu-purple-50/50 py-10 sm:py-12 md:py-16 border-t border-thu-purple/5 relative overflow-hidden">
        {/* 背景漂浮装饰光斑 */}
        <div
          aria-hidden
          className="absolute top-6 right-[8%] w-40 h-40 rounded-full bg-thu-gold-light blur-3xl opacity-70 animate-[thu-float_13s_ease-in-out_infinite]"
        />
        <div
          aria-hidden
          className="absolute -bottom-10 left-[6%] w-48 h-48 rounded-full bg-thu-blue-light blur-3xl opacity-80 animate-[thu-float_16s_ease-in-out_infinite_reverse]"
        />
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="section-title">
            <span className="section-title-text">快捷入口</span>
          </div>
          {/* 栅格布局：移动端 2 列，平板 3 列，桌面 6 列 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {quickLinks.map((link, i) => {
              const iconClasses = getIconColorClasses(link.color);
              return (
                <Reveal key={link.href} delay={i * 70}>
                  <Link
                    href={link.href}
                    className="group card-lift bg-white rounded-xl border border-zinc-150/80 p-4 sm:p-5 text-center hover:border-thu-purple/40 hover:shadow-lg active-press flex flex-col items-center justify-center"
                  >
                    {/* 双色微渐变图标：hover 弹跳 */}
                    <div
                      className={`icon-bounce w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors duration-300 shadow-2xs ${iconClasses}`}
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
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
