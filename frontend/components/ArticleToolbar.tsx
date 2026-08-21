"use client";

/**
 * ArticleToolbar - 详情页阅读工具条（客户端组件）
 *
 * 提供两个功能：
 * - 字号调节：小/中/大三档，写入根元素 CSS 变量 --article-font-size，
 *   正文容器 .article-body 通过 var(--article-font-size, 16px) 消费
 * - 打印：调用浏览器打印，配合全局 @media print 样式输出干净版面
 */

import { useState } from "react";

const FONT_SIZES = [
  { key: "small", label: "小", value: "14px" },
  { key: "medium", label: "中", value: "16px" },
  { key: "large", label: "大", value: "19px" },
] as const;

type FontKey = (typeof FONT_SIZES)[number]["key"];

export function ArticleToolbar() {
  const [fontKey, setFontKey] = useState<FontKey>("medium");

  function changeFont(key: FontKey) {
    setFontKey(key);
    const target = FONT_SIZES.find((f) => f.key === key) ?? FONT_SIZES[1];
    // 写入根元素，.article-body 通过 CSS 变量继承生效
    document.documentElement.style.setProperty("--article-font-size", target.value);
  }

  return (
    <div className="print-hidden mb-6 flex flex-wrap items-center justify-end gap-3 text-sm">
      {/* 字号调节：三个按钮，选中项高亮 */}
      <div className="flex items-center gap-1.5 text-zinc-500">
        <span>字号</span>
        <div className="flex overflow-hidden rounded border border-zinc-200">
          {FONT_SIZES.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => changeFont(f.key)}
              aria-pressed={fontKey === f.key}
              className={`px-2.5 py-1 transition-colors ${
                fontKey === f.key
                  ? "bg-thu-purple text-white"
                  : "bg-white text-zinc-600 hover:bg-thu-purple-light"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 打印本页 */}
      <button
        type="button"
        onClick={() => window.print()}
        className="flex items-center gap-1 rounded border border-zinc-200 px-2.5 py-1 text-zinc-600 transition-colors hover:border-thu-purple hover:text-thu-purple"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M5 7V3h10v4M5 13H3V7h14v6h-2M5 11h10v6H5z" strokeLinejoin="round" />
        </svg>
        打印
      </button>
    </div>
  );
}
