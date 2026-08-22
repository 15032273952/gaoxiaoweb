/**
 * 前台展示文案映射
 *
 * CMS 枚举存的是英文值，页面展示用中文标签。
 */

export const ARTICLE_CATEGORIES = [
  { value: "campus", label: "校园要闻" },
  { value: "academic", label: "学术动态" },
  { value: "media", label: "媒体报道" },
  { value: "other", label: "其他" },
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]["value"];

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  ARTICLE_CATEGORIES.map((c) => [c.value, c.label]),
);

/** 新闻分类英文枚举 → 中文标签 */
export function articleCategoryLabel(category?: string): string {
  if (!category) return "新闻";
  return CATEGORY_LABEL[category] ?? category;
}

/** 将 searchParams 中的分类参数规范化为合法枚举，非法则视为未筛选 */
export function parseArticleCategory(
  value: string | string[] | undefined,
): ArticleCategory | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  return ARTICLE_CATEGORIES.some((c) => c.value === raw)
    ? (raw as ArticleCategory)
    : undefined;
}

export const NOTICE_LEVELS = [
  { value: "school", label: "校级通知" },
  { value: "dept", label: "部门通知" },
] as const;

export type NoticeLevel = (typeof NOTICE_LEVELS)[number]["value"];

const LEVEL_LABEL: Record<string, string> = Object.fromEntries(
  NOTICE_LEVELS.map((l) => [l.value, l.label]),
);

/** 通知级别英文枚举 → 中文标签 */
export function noticeLevelLabel(level?: string): string {
  if (!level) return "校级通知";
  return LEVEL_LABEL[level] ?? level;
}

/** 将 searchParams 中的级别参数规范化为合法枚举，非法则视为未筛选 */
export function parseNoticeLevel(
  value: string | string[] | undefined,
): NoticeLevel | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  return NOTICE_LEVELS.some((l) => l.value === raw)
    ? (raw as NoticeLevel)
    : undefined;
}

/** 解析页码，非法或小于 1 时回退为 1 */
export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** 统一中文日期展示 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("zh-CN");
}

/** 新闻分类对应的色彩徽章类名 */
export function articleCategoryBadgeClass(category?: string): string {
  switch (category) {
    case "academic":
      return "bg-thu-blue-light text-thu-blue-dark border-thu-blue/20";
    case "media":
      return "bg-thu-gold-light text-thu-gold-dark border-thu-gold/30";
    case "campus":
      return "bg-thu-purple-light text-thu-purple-dark border-thu-purple/20";
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
}

/** 通知级别对应的色彩徽章类名 */
export function noticeLevelBadgeClass(level?: string): string {
  switch (level) {
    case "school":
      return "bg-thu-red-light text-thu-red-dark border-thu-red/20";
    case "dept":
      return "bg-thu-purple-light text-thu-purple-dark border-thu-purple/20";
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
}
