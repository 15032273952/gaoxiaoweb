/**
 * 404 页面 - app/not-found.tsx
 * 
 * 当用户访问不存在的页面时显示的页面。
 * Next.js App Router 会自动调用这个组件。
 * 
 * 注意：文件名必须是 not-found.tsx
 */

// 导入 Next.js Link 组件
import Link from "next/link";

/**
 * 404 页面组件
 */
export default function NotFound() {
  return (
    // py-32: 很大的垂直内边距，让内容垂直居中
    <div className="mx-auto max-w-3xl px-4 py-32 text-center">
      {/* 404 大标题 */}
      <h1 className="text-4xl font-bold text-zinc-300 mb-4">404</h1>
      
      {/* 提示文字 */}
      <p className="text-lg text-zinc-600 mb-8">页面未找到</p>
      
      {/* 返回首页链接 */}
      <Link
        href="/"
        className="inline-block px-6 py-2 bg-zinc-900 text-white rounded-full text-sm hover:bg-zinc-700 transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}
