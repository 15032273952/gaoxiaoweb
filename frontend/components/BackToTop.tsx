"use client";

/**
 * BackToTop - 回到顶部悬浮按钮（客户端组件）
 *
 * 页面向下滚动超过 400px 时显示，点击平滑回到页面顶部。
 * 可见性通过 useSyncExternalStore 订阅滚动位置派生，无需手动 setState。
 * 打印时通过 print-hidden 类隐藏。
 */

import { useCallback, useSyncExternalStore } from "react";

/** 显示按钮所需的滚动距离（像素） */
const SHOW_THRESHOLD_PX = 400;

/** 订阅窗口滚动事件 */
function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

export function BackToTop() {
  // 客户端快照：按当前滚动位置判断是否显示
  const getSnapshot = useCallback(
    () => window.scrollY > SHOW_THRESHOLD_PX,
    [],
  );
  // 服务端快照：SSR 阶段始终不显示
  const getServerSnapshot = useCallback(() => false, []);
  const visible = useSyncExternalStore(subscribeToScroll, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      aria-label="回到顶部"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`print-hidden fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-thu-purple text-white shadow-lg transition-all hover:bg-thu-purple-dark ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* 向上箭头图标 */}
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10 16V4M4 10l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
