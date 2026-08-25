/**
 * 站内检索 - lib/search.ts
 *
 * 学习要点：
 * 1. 为什么从 content.ts 拆出来？—— content.ts 只负责"读取数据"，
 *    本文件负责"搜索逻辑"。职责单一，各自更易理解。
 * 2. 搜索范围：新闻、通知、师资、部门四类内容。
 * 3. 实现方式：构建期生成数据索引，浏览器端用关键词过滤（静态导出无服务端运行时）。
 * 4. includesQuery 做大小写不敏感的子串匹配；空关键词直接返回空结果。
 */

import { articleCategoryLabel, noticeLevelLabel } from "./labels";
import {
  getArticles,
  getNotices,
  getFacultyProfiles,
  getDepartments,
} from "./content";

export type SiteSearchHit = {
  /** 命中内容类型：news=新闻 / notice=通知 / faculty=师资 / department=部门 */
  kind: "news" | "notice" | "faculty" | "department";
  /** 命中条目标题 */
  title: string;
  /** 跳转地址 */
  href: string;
  /** 摘要片段 */
  snippet: string;
};

/** 大小写不敏感的子串匹配（undefined 视为空串） */
function includesQuery(haystack: string | undefined, query: string): boolean {
  return (haystack ?? "").toLowerCase().includes(query);
}

/** 站内检索：新闻、通知、师资、部门 */
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

  // 新闻：匹配标题 / 摘要 / 分类（含中文标签）
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

  // 通知：匹配标题 / 文号 / 级别标签
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

  // 师资：匹配姓名 / 职称 / 学院 / 研究领域
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

  // 部门：匹配名称 / 简介 / 职责
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
