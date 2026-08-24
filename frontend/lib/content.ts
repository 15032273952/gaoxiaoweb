/**
 * 内容数据适配层 - lib/content.ts
 *
 * 最简版数据源：直接读取仓库 content/ 目录下的 JSON 文件（ViewModel 结构）。
 * 与原 lib/cms.ts 保持完全相同的导出签名，页面组件零改动。
 *
 * 内容维护方式：编辑 content/*.json → git 提交 → 重新构建发布。
 * 排序语义与原 CMS 查询一致：
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
import { articleCategoryLabel, noticeLevelLabel } from "./labels";
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

function toListItem(d: ArticleDetail): ArticleListItem {
  const { contentHtml, attachments, authors, seoTitle, seoDescription, ...list } = d;
  void contentHtml; void attachments; void authors; void seoTitle; void seoDescription;
  return list;
}

export async function getArticles(): Promise<ArticleListItem[]> {
  return articles.slice().sort(byPinnedThenDate).map(toListItem);
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  return articles.find((a) => a.slug === slug) ?? null;
}

export async function getNotices(): Promise<NoticeListItem[]> {
  return notices.slice().sort(byPinnedThenDate).map((n) => {
    const { summary, contentHtml, attachments, effectiveDate, expireDate, seoTitle, seoDescription, ...list } = n;
    void summary; void contentHtml; void attachments; void effectiveDate; void expireDate; void seoTitle; void seoDescription;
    return list;
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

export type SiteSearchHit = {
  kind: "news" | "notice" | "faculty" | "department";
  title: string;
  href: string;
  snippet: string;
};

function includesQuery(haystack: string | undefined, query: string): boolean {
  return (haystack ?? "").toLowerCase().includes(query);
}

/** 站内检索：新闻、通知、师资、部门（构建期生成索引，客户端过滤） */
export async function searchSite(q: string): Promise<SiteSearchHit[]> {
  const query = q.trim().toLowerCase();
  if (!query) return [];

  const [articleList, noticeList, facultyList, departmentList] = await Promise.all([
    getArticles(),
    getNotices(),
    getFacultyProfiles(),
    getDepartments(),
  ]);

  const hits: SiteSearchHit[] = [];

  for (const a of articleList) {
    if (
      includesQuery(a.title, query) ||
      includesQuery(a.summary, query) ||
      includesQuery(a.category, query) ||
      includesQuery(articleCategoryLabel(a.category), query)
    ) {
      hits.push({
        kind: "news",
        title: a.title,
        href: `/news/${a.slug}`,
        snippet: a.summary || articleCategoryLabel(a.category),
      });
    }
  }

  for (const n of noticeList) {
    if (
      includesQuery(n.title, query) ||
      includesQuery(n.noticeNo, query) ||
      includesQuery(noticeLevelLabel(n.level), query)
    ) {
      hits.push({
        kind: "notice",
        title: n.title,
        href: `/notices/${n.slug}`,
        snippet: [n.noticeNo, noticeLevelLabel(n.level)].filter(Boolean).join(" · ") || "通知公告",
      });
    }
  }

  for (const f of facultyList) {
    if (
      includesQuery(f.name, query) ||
      includesQuery(f.title, query) ||
      includesQuery(f.college, query) ||
      includesQuery(f.researchFields, query)
    ) {
      hits.push({
        kind: "faculty",
        title: f.name,
        href: `/faculty#faculty-${f.id}`,
        snippet: [f.title, f.college, f.researchFields].filter(Boolean).join(" · "),
      });
    }
  }

  for (const d of departmentList) {
    if (
      includesQuery(d.name, query) ||
      includesQuery(d.intro, query) ||
      includesQuery(d.responsibilities, query)
    ) {
      hits.push({
        kind: "department",
        title: d.name,
        href: `/organization#dept-${d.id}`,
        snippet: d.intro ?? d.responsibilities ?? "机构设置",
      });
    }
  }

  return hits;
}
