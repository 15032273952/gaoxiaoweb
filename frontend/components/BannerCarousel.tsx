/**
 * BannerCarousel - 主视觉轮播图（客户端组件）
 *
 * 学习要点：
 * 1. 为什么是客户端组件？—— 轮播需要交互状态（当前下标、自动播放、触摸滑动），
 *    这些只能在浏览器端运行，所以顶部有 "use client"。
 * 2. 本组件只负责"渲染"，轮播的"状态与逻辑"全部在 lib/useCarousel.ts 的
 *    useCarousel Hook 里，职责分离，便于理解与复用。
 * 3. 响应式高度：手机 240px → 平板 340px → 桌面 460px（h-60 / sm:h-80 / md:h-[28rem]）。
 * 4. 无障碍：aria-roledescription="carousel"、aria-label、指示点带 aria-current。
 */

"use client";

import type { BannerItem } from "@/lib/types";
import Link from "next/link";
import { useCarousel } from "@/lib/useCarousel";

export function BannerCarousel({ banners }: { banners: BannerItem[] }) {
  const { index, go, setPaused, handleTouchStart, handleTouchEnd } =
    useCarousel(banners.length);

  // 无轮播内容时的占位
  if (banners.length === 0) {
    return (
      <div className="relative w-full h-56 sm:h-72 md:h-[28rem] flex items-center justify-center text-white/70 font-serif-title text-lg md:text-xl overflow-hidden">
        <div aria-hidden className="absolute inset-0 thu-flow-gradient" />
        <span className="relative">暂无轮播内容</span>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-60 sm:h-80 md:h-[28rem] lg:h-[32rem] overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="焦点图"
    >
      {banners.map((banner, i) => {
        const isCurrent = i === index;
        const content = (
          <div
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isCurrent ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
            }`}
            aria-hidden={!isCurrent}
          >
            {banner.imageUrl ? (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div aria-hidden className="absolute inset-0 thu-flow-gradient" />
            )}

            {banner.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 sm:px-8 md:px-10 pb-5 sm:pb-7 md:pb-10 pt-16 md:pt-24">
                <div className="mx-auto max-w-6xl flex items-start gap-2.5 sm:gap-3.5">
                  <span className="mt-1 flex-shrink-0 w-1 sm:w-1.5 h-5 sm:h-7 md:h-9 bg-gradient-to-b from-thu-gold to-thu-gold-dark rounded-xs shadow-xs" />
                  <h2 className="text-white text-base sm:text-2xl md:text-3xl font-bold font-serif-title leading-snug drop-shadow-md line-clamp-2">
                    {banner.title}
                  </h2>
                </div>
              </div>
            )}
          </div>
        );

        // 有链接时整张图可点击，否则纯展示
        if (banner.linkUrl) {
          const wrapClass = isCurrent ? "block" : "block pointer-events-none";
          return banner.openInNewTab ? (
            <a
              key={banner.id}
              href={banner.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={wrapClass}
            >
              {content}
            </a>
          ) : (
            <Link key={banner.id} href={banner.linkUrl} className={wrapClass}>
              {content}
            </Link>
          );
        }

        return (
          <div key={banner.id} className={isCurrent ? undefined : "pointer-events-none"}>
            {content}
          </div>
        );
      })}

      {banners.length > 1 && (
        <>
          {/* 桌面端左右切换箭头 */}
          <button
            type="button"
            aria-label="上一张"
            onClick={() => go(index - 1)}
            className="hidden md:flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-xs text-white hover:bg-black/60 transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="下一张"
            onClick={() => go(index + 1)}
            className="hidden md:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-xs text-white hover:bg-black/60 transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 底部指示条（移动端友好触控） */}
          <div className="absolute bottom-2.5 sm:bottom-3.5 left-0 right-0 z-20 flex justify-center gap-1.5 sm:gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`切换到第 ${i + 1} 张`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 py-1 -my-1 px-0.5 ${
                  i === index
                    ? "w-6 sm:w-8 bg-gradient-to-r from-thu-gold to-white"
                    : "w-2 sm:w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
