/**
 * BannerCarousel - 主视觉轮播图组件（清华官网风格）
 *
 * 首页顶部大幅焦点图区域：
 * 1. 加高轮播区域（桌面端 28rem），视觉更大气
 * 2. 图片底部叠加紫色渐变遮罩 + 衬线体大标题
 * 3. 标题左侧金色装饰条点缀，层级清晰
 * 4. 图片可点击跳转链接，支持新标签页打开
 * 5. 无图片时使用紫色渐变占位背景
 *
 * 使用方法：
 * <BannerCarousel banners={banners} />
 */

import type { BannerItem } from "@/lib/types";
import Link from "next/link";

export function BannerCarousel({ banners }: { banners: BannerItem[] }) {
  // 无轮播内容时显示紫色渐变占位
  if (banners.length === 0) {
    return (
      <div className="w-full h-72 md:h-[28rem] bg-gradient-to-br from-thu-purple to-thu-purple-dark flex items-center justify-center text-white/70 font-serif-title text-xl">
        暂无轮播内容
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      {/* 相对定位容器：移动端 h-72，桌面端 28rem（约 448px）大幅焦点图 */}
      <div className="relative w-full h-72 md:h-[28rem]">
        {banners.map((banner, i) => {
          const content = (
            <div
              key={banner.id}
              // 所有轮播项绝对定位叠加，通过 opacity 淡入淡出
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === 0 ? "opacity-100" : "opacity-0"
              }`}
            >
              {banner.imageUrl ? (
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                // 无图片时使用紫色渐变占位，保持视觉统一
                <div className="w-full h-full bg-gradient-to-br from-thu-purple to-thu-purple-dark flex items-center justify-center text-white/80 font-serif-title text-2xl px-8 text-center">
                  {banner.title}
                </div>
              )}

              {/* 底部渐变遮罩 + 标题（清华风格：深色渐变 + 衬线大标题） */}
              {banner.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-6 md:px-10 pb-6 md:pb-8 pt-20">
                  <div className="mx-auto max-w-6xl flex items-start gap-3">
                    {/* 金色装饰竖条 */}
                    <span className="mt-1.5 flex-shrink-0 w-1 h-7 md:h-9 bg-thu-gold rounded-sm" />
                    <h2 className="text-white text-xl md:text-3xl font-bold font-serif-title leading-snug drop-shadow-md line-clamp-2">
                      {banner.title}
                    </h2>
                  </div>
                </div>
              )}
            </div>
          );

          // 有链接时包裹可点击元素
          if (banner.linkUrl) {
            return banner.openInNewTab ? (
              <a
                key={banner.id}
                href={banner.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                {content}
              </a>
            ) : (
              <Link key={banner.id} href={banner.linkUrl} className="block w-full h-full">
                {content}
              </Link>
            );
          }

          return content;
        })}
      </div>
    </div>
  );
}
