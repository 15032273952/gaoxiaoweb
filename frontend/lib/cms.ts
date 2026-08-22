/**
 * CMS 数据适配层 - lib/cms.ts
 * 
 * 这是前端与后端 CMS（Strapi）之间的桥梁模块。
 * 
 * 主要职责（对应设计说明书第 6、7.4 章）：
 * 1. 封装 fetch 请求，统一处理超时与有限重试
 * 2. 映射 Strapi 原始字段 → 前端 ViewModel 类型（定义在 types.ts）
 * 3. 构建期失败即 fail build，确保不会上线一个数据不完整的站点
 * 
 * 为什么需要这一层？
 * - 前端页面组件不应该关心 Strapi 的内部数据结构
 * - 当 Strapi 字段名变化时，只需修改这里的转换逻辑
 * - 统一错误处理和请求配置
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

const CMS_BASE_URL =
  process.env.CMS_API_URL ?? "http://localhost:1337/api";
const CMS_ORIGIN = CMS_BASE_URL.replace(/\/api\/?$/, "");
const CMS_TOKEN = process.env.CMS_API_TOKEN ?? "";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

// ---------- Strapi 原始响应类型 ----------

interface StrapiMedia {
  data?: { attributes?: { url?: string; name?: string; size?: number } };
}
interface StrapiMediaList {
  data?: Array<{ attributes?: { url?: string; name?: string; size?: number } }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface StrapiListResponse<T = Record<string, any>> {
  data: T[];
  meta: { pagination?: Record<string, number> };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface StrapiSingleResponse<T = Record<string, any>> {
  data: T;
  meta: Record<string, unknown>;
}

// ---------- internal helpers ----------

async function cmsFetch(
  path: string,
  retries = MAX_RETRIES,
): Promise<StrapiListResponse | StrapiSingleResponse> {
  const url = `${CMS_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (CMS_TOKEN) {
    headers["Authorization"] = `Bearer ${CMS_TOKEN}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers,
      signal: controller.signal,
      next: { revalidate: 0 },
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(
        `CMS fetch failed: ${res.status} ${res.statusText} — ${url}`,
      );
    }
    return (await res.json()) as StrapiListResponse | StrapiSingleResponse;
  } catch (err) {
    if (retries > 0) {
      console.warn(`[cms] retry ${path} (${retries} left)`);
      return cmsFetch(path, retries - 1);
    }
    throw err;
  }
}

/** 相对路径补全为 CMS 源站绝对地址（兼容 Strapi 4/5 媒体结构） */
function resolveMediaUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (/^(https?:|data:|\/\/)/i.test(url)) return url;
  return `${CMS_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function pickMediaFields(node: unknown): {
  url?: string;
  name?: string;
  size?: number;
} {
  if (!node || typeof node !== "object") return {};
  const rec = node as Record<string, unknown>;
  if (typeof rec.url === "string") {
    return {
      url: rec.url,
      name: typeof rec.name === "string" ? rec.name : undefined,
      size: typeof rec.size === "number" ? rec.size : undefined,
    };
  }
  const attrs = rec.attributes as Record<string, unknown> | undefined;
  if (attrs && typeof attrs.url === "string") {
    return {
      url: attrs.url,
      name: typeof attrs.name === "string" ? attrs.name : undefined,
      size: typeof attrs.size === "number" ? attrs.size : undefined,
    };
  }
  return pickMediaFields(rec.data);
}

function mediaUrl(media?: StrapiMedia | Record<string, unknown> | null): string | undefined {
  return resolveMediaUrl(pickMediaFields(media).url);
}

function mediaList(media?: StrapiMediaList | unknown[] | Record<string, unknown> | null) {
  const raw = media && typeof media === "object" && "data" in media
    ? (media as { data?: unknown }).data
    : media;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list
    .map((m) => {
      const fields = pickMediaFields(m);
      return {
        name: fields.name ?? "附件",
        url: resolveMediaUrl(fields.url) ?? "",
        size: fields.size,
      };
    })
    .filter((m) => m.url);
}

function relationSlug(rel: unknown): string | undefined {
  if (!rel || typeof rel !== "object") return undefined;
  const rec = rel as Record<string, unknown>;
  if (typeof rec.slug === "string") return rec.slug;
  return relationSlug(rec.data) ?? relationSlug(rec.attributes);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isList(res: any): res is StrapiListResponse {
  return Array.isArray(res.data);
}

// ---------- public API ----------

export async function getArticles(): Promise<ArticleListItem[]> {
  const res = await cmsFetch(
    "/articles?filters[moderationStatus][$eq]=published&sort=isPinned:desc,publishedAt:desc&pagination[pageSize]=100&populate=cover",
  );
  if (!isList(res)) return [];
  return res.data.map((a) => ({
    id: String(a.id),
    title: a.title,
    slug: a.slug,
    summary: a.summary ?? "",
    publishedAt: a.publishedAt,
    category: a.category,
    coverUrl: mediaUrl(a.cover),
    isPinned: a.isPinned ?? false,
  }));
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const res = await cmsFetch(
    `/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&publicationState=live&populate=cover,attachments`,
  );
  if (!isList(res) || res.data.length === 0) return null;
  const a = res.data[0];
  return {
    id: String(a.id),
    title: a.title,
    slug: a.slug,
    summary: a.summary ?? "",
    publishedAt: a.publishedAt,
    category: a.category,
    coverUrl: mediaUrl(a.cover),
    isPinned: a.isPinned ?? false,
    contentHtml: a.content ?? a.contentHtml ?? "",
    attachments: mediaList(a.attachments),
    authors: a.authors,
    seoTitle: a.seoTitle,
    seoDescription: a.seoDescription,
  };
}

export async function getNotices(): Promise<NoticeListItem[]> {
  const res = await cmsFetch(
    "/notices?filters[moderationStatus][$eq]=published&sort=isTop:desc,publishedAt:desc&pagination[pageSize]=100",
  );
  if (!isList(res)) return [];
  return res.data.map((n) => ({
    id: String(n.id),
    title: n.title,
    slug: n.slug,
    publishedAt: n.publishedAt,
    isTop: n.isTop ?? false,
    noticeNo: n.noticeNo,
    level: n.level,
  }));
}

export async function getNoticeBySlug(slug: string): Promise<NoticeDetail | null> {
  const res = await cmsFetch(
    `/notices?filters[slug][$eq]=${encodeURIComponent(slug)}&publicationState=live&populate=attachments`,
  );
  if (!isList(res) || res.data.length === 0) return null;
  const n = res.data[0];
  return {
    id: String(n.id),
    title: n.title,
    slug: n.slug,
    publishedAt: n.publishedAt,
    isTop: n.isTop ?? false,
    noticeNo: n.noticeNo,
    summary: n.summary ?? "",
    contentHtml: n.content ?? n.contentHtml ?? "",
    attachments: mediaList(n.attachments),
    level: n.level,
    effectiveDate: n.effectiveDate,
    expireDate: n.expireDate,
    seoTitle: n.seoTitle,
    seoDescription: n.seoDescription,
  };
}

export async function getBanners(): Promise<BannerItem[]> {
  const res = await cmsFetch(
    "/banners?filters[isActive][$eq]=true&sort=sort:asc&populate=image",
  );
  if (!isList(res)) return [];
  return res.data.map((b) => ({
    id: String(b.id),
    title: b.title,
    imageUrl: mediaUrl(b.image) ?? "",
    linkUrl: b.linkUrl,
    openInNewTab: b.openInNewTab ?? false,
  }));
}

export async function getSiteSetting(): Promise<SiteSetting> {
  const res = await cmsFetch("/site-setting?populate=footerLinks,favicon,logo");
  const s = (res as StrapiSingleResponse).data;
  return {
    siteName: s.siteName ?? "高校官网",
    logoUrl: mediaUrl(s.logo),
    faviconUrl: mediaUrl(s.favicon),
    icpRecordNo: s.icpRecordNo,
    policeRecordNo: s.policeRecordNo,
    address: s.address,
    postcode: s.postcode,
    generalPhone: s.generalPhone,
    generalEmail: s.generalEmail,
    footerLinks: s.footerLinks ?? [],
  };
}

export async function getDepartments(): Promise<DepartmentItem[]> {
  const res = await cmsFetch(
    "/departments?sort=sort:asc&populate=parent",
  );
  if (!isList(res)) return [];
  return res.data.map((d) => ({
    id: String(d.id),
    name: d.name,
    slug: d.slug,
    intro: d.intro,
    responsibilities: d.responsibilities,
    contactOffice: d.contactOffice,
    contactPhone: d.contactPhone,
    contactEmail: d.contactEmail,
    sort: d.sort ?? 0,
    parentSlug: relationSlug(d.parent),
  }));
}

export async function getFacultyProfiles(): Promise<FacultyProfile[]> {
  const res = await cmsFetch(
    "/faculty-profiles?populate=avatar",
  );
  if (!isList(res)) return [];
  return res.data.map((f) => ({
    id: String(f.id),
    name: f.name,
    title: f.title,
    college: f.college,
    researchFields: f.researchFields,
    avatarUrl: mediaUrl(f.avatar),
    profileHtml: f.profile ?? f.profileHtml,
  }));
}

export async function getPageBySlug(slug: string): Promise<PageContent | null> {
  const res = await cmsFetch(
    `/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=attachments`,
  );
  if (!isList(res) || res.data.length === 0) return null;
  const p = res.data[0];
  return {
    id: String(p.id),
    title: p.title,
    slug: p.slug,
    bodyHtml: p.body ?? p.bodyHtml ?? "",
    template: p.template ?? "default",
    attachments: mediaList(p.attachments),
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
  };
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

/** 站内检索：新闻、通知、师资、部门（构建/请求期在服务端过滤） */
export async function searchSite(q: string): Promise<SiteSearchHit[]> {
  const query = q.trim().toLowerCase();
  if (!query) return [];

  const [articles, notices, faculty, departments] = await Promise.all([
    getArticles().catch(() => []),
    getNotices().catch(() => []),
    getFacultyProfiles().catch(() => []),
    getDepartments().catch(() => []),
  ]);

  const hits: SiteSearchHit[] = [];

  for (const a of articles) {
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

  for (const n of notices) {
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

  for (const f of faculty) {
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

  for (const d of departments) {
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
