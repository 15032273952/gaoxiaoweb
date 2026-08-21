/**
 * 师资队伍：按学院筛选，展开查看简介
 */

import { getFacultyProfiles } from "@/lib/cms";
import { Breadcrumb } from "@/components/Breadcrumb";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "师资队伍 - 高校官网",
  description: "高校师资队伍公开信息。",
};

type Props = { searchParams: Promise<{ college?: string | string[]; q?: string | string[] }> };

function firstParam(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

export default async function FacultyPage({ searchParams }: Props) {
  const sp = await searchParams;
  const college = firstParam(sp.college);
  const qRaw = firstParam(sp.q);
  const q = qRaw.toLowerCase();
  const profiles = await getFacultyProfiles().catch(() => []);
  const colleges = [...new Set(profiles.map((p) => p.college).filter(Boolean))].sort();

  const filtered = profiles.filter((f) => {
    if (college && f.college !== college) return false;
    if (!q) return true;
    const blob = [f.name, f.title, f.college, f.researchFields].join(" ").toLowerCase();
    return blob.includes(q);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb items={[{ label: "人才培养", href: "/education" }, { label: "师资队伍" }]} />
      <h1 className="text-2xl font-bold mb-6 font-serif-title">师资队伍</h1>

      <form action="/faculty" method="get" className="flex flex-wrap gap-2 mb-4">
        {college && <input type="hidden" name="college" value={college} />}
        <input
          name="q"
          type="search"
          defaultValue={qRaw}
          placeholder="按姓名、职称、研究方向检索"
          className="flex-1 min-w-48 rounded border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-thu-purple"
        />
        <button
          type="submit"
          className="rounded bg-thu-purple px-4 py-2 text-sm text-white hover:bg-thu-purple-dark"
        >
          检索
        </button>
      </form>

      {colleges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={qRaw ? `/faculty?q=${encodeURIComponent(qRaw)}` : "/faculty"}
            className={
              !college
                ? "px-3 py-1.5 text-sm rounded bg-thu-purple text-white"
                : "px-3 py-1.5 text-sm rounded border border-zinc-200 hover:border-thu-purple hover:text-thu-purple"
            }
          >
            全部学院
          </Link>
          {colleges.map((c) => {
            const params = new URLSearchParams();
            params.set("college", c);
            if (qRaw) params.set("q", qRaw);
            return (
              <Link
                key={c}
                href={`/faculty?${params.toString()}`}
                className={
                  college === c
                    ? "px-3 py-1.5 text-sm rounded bg-thu-purple text-white"
                    : "px-3 py-1.5 text-sm rounded border border-zinc-200 hover:border-thu-purple hover:text-thu-purple"
                }
              >
                {c}
              </Link>
            );
          })}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((f) => (
            <article
              key={f.id}
              id={`faculty-${f.id}`}
              className="p-4 border border-zinc-200 rounded-lg scroll-mt-24"
            >
              <div className="flex gap-4">
                {f.avatarUrl && (
                  <div className="flex-shrink-0 w-16 h-16">
                    <img
                      src={f.avatarUrl}
                      alt={f.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold">{f.name}</h2>
                  <p className="text-sm text-zinc-600">{f.title}</p>
                  <p className="text-sm text-zinc-500">{f.college}</p>
                  {f.researchFields && (
                    <p className="mt-1 text-xs text-zinc-400">研究方向：{f.researchFields}</p>
                  )}
                </div>
              </div>
              {f.profileHtml && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-thu-purple">查看简介</summary>
                  <div
                    className="mt-2 prose prose-zinc prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: f.profileHtml }}
                  />
                </details>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-zinc-400">暂无匹配的师资信息</p>
      )}
    </div>
  );
}
