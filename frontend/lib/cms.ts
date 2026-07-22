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

const CMS_BASE_URL =
  process.env.CMS_API_URL ?? "http://localhost:1337/api";
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

function mediaUrl(media?: StrapiMedia | null): string | undefined {
  return media?.data?.attributes?.url ?? undefined;
}

function mediaList(media?: StrapiMediaList | null) {
  return (
    media?.data?.map((m) => ({
      name: m.attributes?.name ?? "附件",
      url: m.attributes?.url ?? "",
      size: m.attributes?.size,
    })) ?? []
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isList(res: any): res is StrapiListResponse {
  return Array.isArray(res.data);
}

// ---------- public API ----------

export async function getArticles(): Promise<ArticleListItem[]> {
  const res = await cmsFetch(
    "/articles?filters[moderationStatus][$eq]=published&sort=publishedAt:desc&pagination[pageSize]=100&populate=cover",
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
    `/articles?filters[slug][$eq]=${slug}&publicationState=live&populate=cover,attachments`,
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
    seoTitle: a.seoTitle,
    seoDescription: a.seoDescription,
  };
}

export async function getNotices(): Promise<NoticeListItem[]> {
  const res = await cmsFetch(
    "/notices?sort=isTop:desc,publishedAt:desc&pagination[pageSize]=100",
  );
  if (!isList(res)) return [];
  return res.data.map((n) => ({
    id: String(n.id),
    title: n.title,
    slug: n.slug,
    publishedAt: n.publishedAt,
    isTop: n.isTop ?? false,
    noticeNo: n.noticeNo,
  }));
}

export async function getNoticeBySlug(slug: string): Promise<NoticeDetail | null> {
  const res = await cmsFetch(
    `/notices?filters[slug][$eq]=${slug}&populate=attachments`,
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
    parentSlug: d.parent?.data?.attributes?.slug,
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
    `/pages?filters[slug][$eq]=${slug}&populate=attachments`,
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
