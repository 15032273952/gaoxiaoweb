/**
 * BannerCarousel - 轮播图组件
 * 
 * 首页顶部轮播图组件，支持：
 * 1. 多张图片自动轮播（通过 CSS opacity 实现淡入淡出）
 * 2. 图片可点击跳转链接
 * 3. 支持新标签页打开
 * 4. 无图片时显示占位提示
 * 
 * 使用方法：
 * <BannerCarousel banners={banners} />
 */

// 导入轮播项类型
import type { BannerItem } from "@/lib/types";

// 导入 Next.js Link 组件（站内链接）
import Link from "next/link";

/**
 * 轮播图组件
 * 
 * @param banners - 轮播项数组
 * @returns JSX 元素
 */
export function BannerCarousel({ banners }: { banners: BannerItem[] }) {
  // 无轮播内容时显示占位
  if (banners.length === 0) {
    return (
      // h-64: 固定高度 16rem (256px)
      // bg-zinc-100: 浅灰色背景
      // flex items-center justify-center: 居中显示文字
      <div className="w-full h-64 bg-zinc-100 flex items-center justify-center text-zinc-400">
        暂无轮播内容
      </div>
    );
  }

  // 渲染轮播图
  return (
    <div className="w-full overflow-hidden">
      {/* 相对定位容器，固定高度 */}
      {/* h-64: 移动端高度 16rem */}
      {/* md:h-96: 中等屏幕以上高度 24rem */}
      <div className="relative w-full h-64 md:h-96">
        {/* 遍历渲染每个轮播项 */}
        {banners.map((banner, i) => {
          /**
           * 轮播项内容
           * 
           * 注意：这里使用绝对定位，所有图片叠加在一起
           * 通过 opacity 控制显示哪一张（opacity-100 显示，opacity-0 隐藏）
           * i === 0 表示第一张默认显示
           */
          const content = (
            <div
              key={banner.id}
              // absolute inset-0: 绝对定位，覆盖整个容器
              // transition-opacity duration-500: 0.5秒淡入淡出动画
              className={`absolute inset-0 transition-opacity duration-500 ${
                i === 0 ? "opacity-100" : "opacity-0"  // 第一张显示，其余隐藏
              }`}
            >
              {/* 渲染图片或占位背景 */}
              {banner.imageUrl ? (
                // 有图片 URL 时显示图片
                // eslint-disable-next-line: 禁用 Next.js 图片警告（这里用普通 img 以支持任意 URL）
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"  // object-cover 保持比例填充
                />
              ) : (
                // 无图片时显示灰色占位背景
                <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-500">
                  {banner.title}
                </div>
              )}

              {/* 图片标题 overlay（覆盖层） */}
              {/* absolute bottom-0: 定位到底部 */}
              {/* bg-black/50: 半透明黑色背景 */}
              {/* text-white: 白色文字 */}
              {banner.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white px-4 py-2 text-sm">
                  {banner.title}
                </div>
              )}
            </div>
          );

          // 如果有链接，包裹在可点击元素中
          if (banner.linkUrl) {
            // 判断是否新标签页打开
            return banner.openInNewTab ? (
              // 新标签页打开：使用 <a> 标签
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
              // 当前页面跳转：使用 Next.js Link
              <Link key={banner.id} href={banner.linkUrl} className="block w-full h-full">
                {content}
              </Link>
            );
          }

          // 无链接，直接返回内容
          return content;
        })}
      </div>
    </div>
  );
}
