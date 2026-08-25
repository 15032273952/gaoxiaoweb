/**
 * 首页"快捷入口"配置数据
 *
 * 学习要点：
 * 1. 为什么是 .tsx 而不是 .ts？—— 每个图标的 icon 字段是 JSX（<svg>），
 *    含 JSX 的文件必须用 .tsx 扩展名。
 * 2. 为什么抽成独立文件？—— 首页 page.tsx 原本内联了 6 个 SVG 图标，
 *    占了大半篇幅。抽离后 page.tsx 只关心"页面结构"，本文件只关心"入口配置"。
 * 3. color 字段是字符串，由 getIconColorClasses 映射成 Tailwind 色彩类名。
 */

import type { ReactNode } from "react";

export type QuickLink = {
  /** 入口名称（中文） */
  label: string;
  /** 英文副标题 */
  desc: string;
  /** 跳转地址 */
  href: string;
  /** 色彩类别（green/blue/gold/purple），决定图标底色 */
  color: string;
  /** 图标 JSX */
  icon: ReactNode;
};

export const quickLinks: QuickLink[] = [
  {
    label: "招生就业",
    desc: "Admissions & Careers",
    href: "/admissions",
    color: "green",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
  {
    label: "教育教学",
    desc: "Education",
    href: "/education",
    color: "purple",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: "科学研究",
    desc: "Research",
    href: "/research",
    color: "blue",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-2.674 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    label: "师资队伍",
    desc: "Faculty",
    href: "/faculty",
    color: "purple",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "机构设置",
    desc: "Organization",
    href: "/organization",
    color: "gold",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    label: "信息公开",
    desc: "Information",
    href: "/openness",
    color: "blue",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

/** 根据 color 字段返回图标底色与悬停色彩类名 */
export function getIconColorClasses(color: string): string {
  switch (color) {
    case "green":
      return "bg-thu-green-light text-thu-green group-hover:bg-thu-green group-hover:text-white";
    case "blue":
      return "bg-thu-blue-light text-thu-blue group-hover:bg-thu-blue group-hover:text-white";
    case "gold":
      return "bg-thu-gold-light text-thu-gold-dark group-hover:bg-thu-gold group-hover:text-white";
    default:
      return "bg-thu-purple-light text-thu-purple group-hover:bg-thu-purple group-hover:text-white";
  }
}
