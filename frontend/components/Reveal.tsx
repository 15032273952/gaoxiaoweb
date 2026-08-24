"use client";

/**
 * Reveal - 滚动入场包装器
 *
 * 子元素初始处于 .reveal（透明+下移）状态，进入视口后加 .is-visible 浮入；
 * delay（毫秒）通过 transition-delay 实现同屏多元素级联错落感。
 * prefers-reduced-motion 下由 CSS 直接展示，无动画。
 */

import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  /** 级联延迟（毫秒） */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 无 IntersectionObserver 环境（极旧浏览器）直接显示
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style = delay > 0 ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    // @ts-expect-error 动态标签的 ref 类型收窄由运行时保证
    <Tag ref={ref} className={`reveal ${className}`} style={style}>
      {children}
    </Tag>
  );
}
