/**
 * 内容数据适配层 - lib/content.ts
 *
 * 最简版数据源：直接读取仓库 content/ 目录下的 JSON 文件（ViewModel 结构）。
 *
 * 内容维护方式：编辑 content/*.json → git 提交 → 重新构建发布。
 * 排序语义：
 * - 文章：置顶优先，其次发布时间倒序
 * - 通知：置顶优先，其次发布时间倒序
 * - 轮播/部门：sort 字段升序
 */

import type {
  ArticleListItem,
  ArticleDetail,
  NoticeListItem,
  NoticeDetail,
  BannerItem,
  SiteSetting,
  DepartmentItem,
  FacultyProfile,
  PageContent,
} from "./types";
import articlesData from "@/content/articles.json";
import noticesData from "@/content/notices.json";
import bannersData from "@/content/banners.json";
import departmentsData from "@/content/departments.json";
import facultyData from "@/content/faculty.json";
import pagesData from "@/content/pages.json";
import siteData from "@/content/site.json";

// JSON 导入按结构断言为 ViewModel（数据文件即契约）
const articles = articlesData as ArticleDetail[];
const notices = noticesData as NoticeDetail[];
const banners = bannersData as BannerItem[];
const departments = (departmentsData as DepartmentItem[])
  .slice()
  .sort((a, b) => a.sort - b.sort);
const faculty = facultyData as FacultyProfile[];
const pages = pagesData as PageContent[];
const siteSetting = siteData as SiteSetting;

function byPinnedThenDate<T extends { publishedAt: string; isPinned?: boolean; isTop?: boolean }>(a: T, b: T): number {
  const pa = a.isPinned || a.isTop ? 1 : 0;
  const pb = b.isPinned || b.isTop ? 1 : 0;
  if (pa !== pb) return pb - pa;
  return b.publishedAt.localeCompare(a.publishedAt);
}

function toListItem(a: ArticleDetail): ArticleListItem {
  const { id, title, slug, summary, publishedAt, category, coverUrl, isPinned } = a;
  return { id, title, slug, summary, publishedAt, category, coverUrl, isPinned };
}

export async function getArticles(): Promise<ArticleListItem[]> {
  return articles.slice().sort(byPinnedThenDate).map(toListItem);
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  return articles.find((a) => a.slug === slug) ?? null;
}

export async function getNotices(): Promise<NoticeListItem[]> {
  return notices.slice().sort(byPinnedThenDate).map((n) => {
    const { id, title, slug, publishedAt, isTop, noticeNo, level } = n;
    return { id, title, slug, publishedAt, isTop, noticeNo, level };
  });
}

export async function getNoticeBySlug(slug: string): Promise<NoticeDetail | null> {
  return notices.find((n) => n.slug === slug) ?? null;
}

export async function getBanners(): Promise<BannerItem[]> {
  return banners;
}

export async function getSiteSetting(): Promise<SiteSetting> {
  return siteSetting;
}

export async function getDepartments(): Promise<DepartmentItem[]> {
  return departments;
}

export async function getFacultyProfiles(): Promise<FacultyProfile[]> {
  return faculty;
}

export async function getPageBySlug(slug: string): Promise<PageContent | null> {
  return pages.find((p) => p.slug === slug) ?? null;
}
