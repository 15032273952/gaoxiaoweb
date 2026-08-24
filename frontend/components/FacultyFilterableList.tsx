"use client";

/**
 * 师资队伍列表（客户端筛选）：学院筛选 + 关键词检索。
 * 静态导出后 query 过滤在浏览器内进行，数据由服务端页面传入。
 */

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FacultyProfile } from "@/lib/types";

function chipClass(active: boolean) {
  return active
    ? "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-thu-purple text-white shadow-2xs"
    : "flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-white border border-zinc-200 text-zinc-700 hover:border-thu-purple hover:text-thu-purple transition-colors";
}

export function FacultyFilterableList({ profiles }: { profiles: FacultyProfile[] }) {
  const searchParams = useSearchParams();
  const college = (searchParams.get("college") ?? "").trim();
  const qRaw = (searchParams.get("q") ?? "").trim();
  const q = qRaw.toLowerCase();

  const colleges = useMemo(
    () => [...new Set(profiles.map((p) => p.college).filter(Boolean))].sort(),
    [profiles],
  );

  const filtered = useMemo(
    () =>
      [...profiles].sort((a, b) => a.name.localeCompare(b.name, "zh-CN")).filter((f) => {
        if (college && f.college !== college) return false;
        if (!q) return true;
        const blob = [f.name, f.title, f.college, f.researchFields].join(" ").toLowerCase();
        return blob.includes(q);
      }),
    [profiles, college, q],
  );

  return (
    <>
      {/* 检索表单 */}
      <form action="/faculty" method="get" className="flex flex-col sm:flex-row gap-2.5 mb-6">
        {college && <input type="hidden" name="college" value={college} />}
        <div className="relative flex-1">
          <input
            name="q"
            type="search"
            defaultValue={qRaw}
            placeholder="按姓名、职称、研究方向检索学者"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-thu-purple focus:ring-2 focus:ring-thu-purple/20 transition-all shadow-2xs"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-thu-purple to-thu-purple-dark px-6 py-2.5 text-sm font-medium text-white hover:shadow-md transition-all active-press"
        >
          检索师资
        </button>
      </form>

      {/* 学院横向平滑筛选栏 */}
      {colleges.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          <Link
            href={qRaw ? `/faculty?q=${encodeURIComponent(qRaw)}` : "/faculty"}
            className={chipClass(!college)}
          >
            全部院系
          </Link>
          {colleges.map((c) => {
            const params = new URLSearchParams();
            params.set("college", c);
            if (qRaw) params.set("q", qRaw);
            return (
              <Link key={c} href={`/faculty?${params.toString()}`} className={chipClass(college === c)}>
                {c}
              </Link>
            );
          })}
        </div>
      )}

      {filtered.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-zinc-400">共 {filtered.length} 人</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((f) => (
              <article
                key={f.id}
                id={`faculty-${f.id}`}
                className="bg-white p-5 border border-zinc-150/80 rounded-xl shadow-2xs hover:shadow-md hover:border-thu-purple/30 transition-all duration-200 scroll-mt-24 flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-4">
                    {f.avatarUrl ? (
                      <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden ring-2 ring-thu-purple/20 bg-zinc-100">
                        <img
                          src={f.avatarUrl}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-thu-purple-light text-thu-purple-dark flex items-center justify-center font-bold text-xl font-serif-title ring-2 ring-thu-purple/10">
                        {f.name.slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-base sm:text-lg text-zinc-900 font-serif-title">{f.name}</h2>
                      <p className="text-xs sm:text-sm text-thu-purple-dark font-medium mt-0.5">{f.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">{f.college}</p>
                    </div>
                  </div>

                  {f.researchFields && (
                    <div className="mt-3 text-xs text-zinc-600 bg-thu-purple-50/80 border border-thu-purple/10 rounded-lg p-2.5">
                      <span className="font-medium text-thu-purple-dark">研究方向：</span>
                      {f.researchFields}
                    </div>
                  )}
                </div>

                {f.profileHtml && (
                  <details className="mt-4 pt-3 border-t border-zinc-100 group">
                    <summary className="cursor-pointer text-xs sm:text-sm font-medium text-thu-purple hover:text-thu-purple-dark flex items-center justify-between">
                      <span>个人详情与履历</span>
                      <span className="text-xs text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div
                      className="mt-3 prose prose-zinc prose-sm max-w-none text-xs sm:text-sm text-zinc-600 bg-zinc-50/70 p-3 rounded-lg border border-zinc-100"
                      dangerouslySetInnerHTML={{ __html: f.profileHtml }}
                    />
                  </details>
                )}
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-zinc-150 text-zinc-400 text-sm">
          暂无匹配的师资信息
        </div>
      )}
    </>
  );
}
