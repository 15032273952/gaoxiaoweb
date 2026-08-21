/**
 * BannerCarousel - 主视觉轮播图（客户端组件，自动切换）
 *
 * 无 JS 时仍展示第一张；有 JS 后按间隔轮播，并提供指示点与左右切换。
 */

"use client";

import type { BannerItem } from "@/lib/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const INTERVAL_MS = 6000;

export function BannerCarousel({ banners }: { banners: BannerItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number) => {
      if (banners.length === 0) return;
      setIndex(((next % banners.length) + banners.length) % banners.length);
    },
    [banners.length],
  );

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const timer = window.setInterval(() => go(index + 1), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [banners.length, go, index, paused]);

  if (banners.length === 0) {
    return (
      <div className="w-full h-72 md:h-[28rem] bg-gradient-to-br from-thu-purple to-thu-purple-dark flex items-center justify-center text-white/70 font-serif-title text-xl">
        暂无轮播内容
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-72 md:h-[28rem] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="焦点图"
    >
      {banners.map((banner, i) => {
        const content = (
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={i !== index}
          >
            {banner.imageUrl ? (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-thu-purple to-thu-purple-dark flex items-center justify-center text-white/80 font-serif-title text-2xl px-8 text-center">
                {banner.title}
              </div>
            )}

            {banner.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-6 md:px-10 pb-6 md:pb-8 pt-20">
                <div className="mx-auto max-w-6xl flex items-start gap-3">
                  <span className="mt-1.5 flex-shrink-0 w-1 h-7 md:h-9 bg-thu-gold rounded-sm" />
                  <h2 className="text-white text-xl md:text-3xl font-bold font-serif-title leading-snug drop-shadow-md line-clamp-2">
                    {banner.title}
                  </h2>
                </div>
              </div>
            )}
          </div>
        );

        if (banner.linkUrl) {
          const wrapClass = i === index ? "block" : "block pointer-events-none";
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
          <div key={banner.id} className={i === index ? undefined : "pointer-events-none"}>
            {content}
          </div>
        );
      })}

      {banners.length > 1 && (
        <>
          <button
            type="button"
            aria-label="上一张"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/35 text-white hover:bg-black/55"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="下一张"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/35 text-white hover:bg-black/55"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`切换到第 ${i + 1} 张`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
