"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold font-serif-title mb-3">页面暂时无法显示</h1>
      <p className="text-sm text-zinc-500 mb-8">请稍后重试，或返回首页、使用站内搜索。</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2 bg-thu-purple text-white text-sm rounded hover:bg-thu-purple-dark"
        >
          重试
        </button>
        <Link
          href="/"
          className="px-5 py-2 border border-zinc-200 text-sm rounded hover:border-thu-purple hover:text-thu-purple"
        >
          返回首页
        </Link>
        <Link
          href="/search"
          className="px-5 py-2 border border-zinc-200 text-sm rounded hover:border-thu-purple hover:text-thu-purple"
        >
          站内搜索
        </Link>
      </div>
    </div>
  );
}
