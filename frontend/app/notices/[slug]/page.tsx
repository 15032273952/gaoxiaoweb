/**
 * 通知详情页：面包屑、时效提示、返回列表
 */

import { getNoticeBySlug, getNotices } from "@/lib/content";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ArticleToolbar } from "@/components/ArticleToolbar";
import { PrevNextNav } from "@/components/PrevNextNav";
import { AttachmentList } from "@/components/AttachmentList";
import { formatDate, noticeLevelLabel, noticeLevelBadgeClass } from "@/lib/labels";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const notices = await getNotices().catch(() => []);
  return notices.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const notice = await getNoticeBySlug(slug).catch(() => null);
  if (!notice) return { title: "通知详情 - 高校官网" };
  return {
    title: notice.seoTitle ?? notice.title,
    description: notice.seoDescription ?? notice.summary,
  };
}

export default async function NoticeDetailPage({ params }: Props) {
  const { slug } = await params;
  const notice = await getNoticeBySlug(slug).catch(() => null);
  if (!notice) notFound();

  const allNotices = await getNotices().catch(() => []);

  // 时效判断必须基于渲染时刻的当前时间；本页按请求渲染、不缓存，此处豁免纯度检查
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const expired =
    notice.expireDate && !Number.isNaN(new Date(notice.expireDate).getTime())
      ? new Date(notice.expireDate).getTime() < now
      : false;
  const notYetEffective =
    notice.effectiveDate && !Number.isNaN(new Date(notice.effectiveDate).getTime())
      ? new Date(notice.effectiveDate).getTime() > now
      : false;

  const cardAccent = notice.level === "school" ? "accent-red" : "";

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: "通知公告", href: "/notices" },
          { label: notice.title },
        ]}
      />
      <ArticleToolbar />
      <div className={`card-top-accent ${cardAccent} bg-white border border-zinc-150/80 rounded-xl shadow-2xs p-5 sm:p-8`}>
      <header className="mb-6 pb-5 border-b border-zinc-100">
        <h1 className="text-2xl font-bold mb-3 font-serif-title text-zinc-900">{notice.title}</h1>
        <div className="text-sm text-zinc-400 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-mono">{formatDate(notice.publishedAt)}</span>
          {notice.noticeNo && <span className="font-mono">文号：{notice.noticeNo}</span>}
          {notice.level && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${noticeLevelBadgeClass(notice.level)}`}>
              {noticeLevelLabel(notice.level)}
            </span>
          )}
          {notice.effectiveDate && <span>生效：{formatDate(notice.effectiveDate)}</span>}
          {notice.expireDate && <span>失效：{formatDate(notice.expireDate)}</span>}
        </div>
        {expired && (
          <p className="mt-3 text-sm text-thu-red-dark bg-thu-red-light border border-thu-red/20 rounded-lg px-3 py-2">
            本通知已过失效日期，内容仅供查阅。
          </p>
        )}
        {!expired && notYetEffective && (
          <p className="mt-3 text-sm text-thu-blue-dark bg-thu-blue-light border border-thu-blue/20 rounded-lg px-3 py-2">
            本通知尚未到生效日期。
          </p>
        )}
      </header>

      {notice.summary && (
        <p className="mb-6 text-zinc-600 text-sm leading-relaxed bg-thu-surface-warm border-l-4 border-thu-gold/60 rounded-r-lg px-4 py-3">
          {notice.summary}
        </p>
      )}

      <div
        className="prose prose-zinc max-w-none article-body"
        dangerouslySetInnerHTML={{ __html: notice.contentHtml }}
      />

      <AttachmentList items={notice.attachments} />
      </div>

      <PrevNextNav
        items={allNotices.map((n) => ({ slug: n.slug, title: n.title }))}
        currentSlug={notice.slug}
        basePath="/notices"
      />

      <p className="mt-8">
        <Link
          href="/notices"
          className="inline-flex items-center gap-1 text-sm text-thu-purple hover:text-thu-purple-dark transition-colors"
        >
          ← 返回通知列表
        </Link>
      </p>
    </article>
  );
}
