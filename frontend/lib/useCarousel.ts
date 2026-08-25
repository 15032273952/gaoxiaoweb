"use client";

/**
 * useCarousel - 轮播图核心逻辑 Hook
 *
 * 学习要点：
 * 1. 为什么抽成 Hook？—— 把"轮播状态管理"从"轮播 UI 渲染"中分离，
 *    让 BannerCarousel 组件只关心"长什么样"，本 Hook 只关心"怎么切换"。
 * 2. 返回的 index 是当前轮播下标，go(next) 用于切换到指定下标（自动循环取模）。
 * 3. 自动播放：useEffect 里 setInterval 定时调用 go(index + 1)；
 *    paused 为 true 时暂停（鼠标悬停 / 触摸时）。
 * 4. 触摸滑动：记录触摸起点，结束时比较位移差，超过阈值就切换。
 *
 * 依赖数组说明（useCallback / useEffect 的 deps）：
 * - go 依赖 banners.length（取模需要知道总数）。
 * - 自动播放 effect 依赖 [banners.length, go, index, paused]，
 *   其中 index 变化会重置定时器，保证每次切换后重新计时。
 */

import { useCallback, useEffect, useRef, useState } from "react";

/** 自动播放间隔（毫秒） */
const INTERVAL_MS = 6000;

/** 触发切换的最小触摸位移（像素） */
const SWIPE_THRESHOLD = 45;

export function useCarousel(total: number) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  /** 切换到指定下标（自动循环：负数/越界都取模回正） */
  const go = useCallback(
    (next: number) => {
      if (total === 0) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  // 自动播放：未暂停且不止一张时，定时切到下一张
  useEffect(() => {
    if (total <= 1 || paused) return;
    const timer = window.setInterval(() => go(index + 1), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [total, go, index, paused]);

  // 触摸开始：记录起点并暂停自动播放
  const handleTouchStart = (e: React.TouchEvent) => {
    setPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  // 触摸结束：根据位移差决定切换方向，恢复自动播放
  const handleTouchEnd = (e: React.TouchEvent) => {
    setPaused(false);
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > SWIPE_THRESHOLD) {
      go(index + 1);
    } else if (diff < -SWIPE_THRESHOLD) {
      go(index - 1);
    }
    touchStartX.current = null;
  };

  return {
    index,
    paused,
    go,
    setPaused,
    handleTouchStart,
    handleTouchEnd,
  };
}
