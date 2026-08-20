/**
 * NoticeList - 通知列表组件
 *
 * 用于显示通知公告列表，每条通知包含：
 * - 标题（可带置顶标记和文号）
 * - 发布日期
 *
 * 使用方法：
 * <NoticeList notices={notices} />
 */

// 导入通知列表项类型
import type { NoticeListItem } from "@/lib/types";

// 导入 Next.js Link 组件
import Link from "next/link";

/**
 * 通知列表组件
 *
 * @param notices - 通知列表数组
 * @returns JSX 元素
 */
export function NoticeList({ notices }: { notices: NoticeListItem[] }) {
  // 无通知时显示占位提示
  if (notices.length === 0) {
    return (
      <p className="text-zinc-400 text-sm py-4">暂无通知</p>
    );
  }

  // 渲染通知列表
  // ul: 无序列表
  // divide-y divide-zinc-100: 每个 li 之间有分隔线（浅灰色）
  return (
    <ul className="divide-y divide-zinc-100">
      {/* 遍历渲染每个通知项 */}
      {notices.map((notice) => (
        <li key={notice.id} className="py-3">
          {/* 通知项链接：标题 + 日期 */}
          {/* flex: 水平布局 */}
          {/* items-baseline: 基线对齐（标题和日期垂直对齐） */}
          {/* justify-between: 两端对齐 */}
          {/* gap-4: 标题和日期之间 1rem 间距 */}
          {/* hover:text-blue-700: 悬停时标题变蓝色 */}
          <Link
            href={`/notices/${notice.slug}`}
            className="group flex items-baseline justify-between gap-4 transition-colors"
          >
            {/* 标题区域 */}
            {/* flex-1: 占据剩余空间 */}
            {/* text-sm: 小字号 */}
            {/* text-zinc-800: 深灰色文字 */}
            {/* line-clamp-1: 最多显示 1 行，超出省略 */}
            <span className="flex-1 text-sm text-zinc-700 group-hover:text-thu-purple line-clamp-1 transition-colors">
              {/* 置顶标记（可选） */}
              {notice.isTop && (
                <span className="inline-block mr-2 text-xs text-red-600 font-normal">[置顶]</span>
              )}
              {/* 文号（可选，如"校发〔2024〕1号"） */}
              {notice.noticeNo && (
                <span className="inline-block mr-2 text-xs text-zinc-400 font-normal">
                  {notice.noticeNo}
                </span>
              )}
              {/* 通知标题 */}
              {notice.title}
            </span>

            {/* 日期区域 */}
            {/* flex-shrink-0: 不允许缩小 */}
            {/* text-xs: 最小字号 */}
            {/* text-zinc-400: 浅灰色 */}
            <span className="flex-shrink-0 text-xs text-zinc-400">
              {/* 转换为中文格式日期 */}
              {new Date(notice.publishedAt).toLocaleDateString("zh-CN")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}