"use client";

/**
 * StatsBand - 「数说学校」统计带
 *
 * 流动渐变底（thu-flow-gradient）+ 白色大数字：
 * 元素进入视口后以 requestAnimationFrame 从 0 计数到目标值（1.4s ease-out）。
 * 数据为演示配置，如需内容化可迁入 content/site.json。
 */

import { useEffect, useRef, useState } from "react";

type Stat = {
  value: number;
  suffix?: string;
  label: string;
  desc: string;
};

const STATS: Stat[] = [
  { value: 1958, label: "建校年份", desc: "六十余载弦歌不辍" },
  { value: 19, suffix: "个", label: "学院（系）", desc: "多学科协调发展" },
  { value: 68, suffix: "个", label: "本科专业", desc: "国家级一流专业21个" },
  { value: 20000, suffix: "+", label: "在校学生", desc: "本硕博全面发展" },
];

/** 数字缓动计数：easeOutCubic */
function animateCount(target: number, duration: number, onTick: (v: number) => void) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onTick(target);
    return () => {};
  }
  let raf = 0;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    onTick(Math.round(target * eased));
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

export function StatsBand() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [values, setValues] = useState<number[]>(STATS.map(() => 0));
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;

    if (typeof IntersectionObserver === "undefined") {
      // 极旧浏览器无 IntersectionObserver：下一微任务直接显示最终值
      queueMicrotask(() => setValues(STATS.map((s) => s.value)));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            STATS.forEach((s, i) => {
              animateCount(s.value, 1400, (v) =>
                setValues((prev) => {
                  const next = [...prev];
                  next[i] = v;
                  return next;
                }),
              );
            });
            io.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section aria-label="学校概况数据" className="w-full">
      <div
        ref={ref}
        className="relative overflow-hidden bg-gradient-to-r from-thu-purple-dark via-thu-purple to-thu-blue py-8 sm:py-10"
      >
        {/* 漂浮装饰光斑 */}
        <div
          aria-hidden
          className="absolute -top-16 -left-10 w-56 h-56 rounded-full bg-thu-gold/15 blur-3xl animate-[thu-float_11s_ease-in-out_infinite]"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 right-8 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-[thu-float_14s_ease-in-out_infinite_reverse]"
        />

        <div className="relative mx-auto max-w-6xl px-4 grid grid-cols-2 lg:grid-cols-4 gap-y-7 gap-x-4 text-center text-white">
          {STATS.map((s, i) => (
            <div key={s.label} className="px-2">
              <div
                className="font-serif-title font-bold leading-none tracking-tight drop-shadow-sm"
                style={{
                  fontSize: "clamp(1.9rem, 4.5vw, 2.75rem)",
                  animation: `thu-pop-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.12}s both`,
                }}
              >
                {values[i]?.toLocaleString?.() ?? values[i]}
                {s.suffix && <span className="text-thu-gold-light text-[0.5em] align-baseline ml-1">{s.suffix}</span>}
              </div>
              <div className="mt-2 text-sm sm:text-base font-bold text-white/95">{s.label}</div>
              <div className="mt-1 text-[11px] sm:text-xs text-white/60">{s.desc}</div>
              <div className="mx-auto mt-3 h-[2px] w-8 rounded-full bg-gradient-to-r from-transparent via-thu-gold to-transparent opacity-80" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
