/**
 * 机构设置：部门检索与职责展开
 */

import { getDepartments } from "@/lib/cms";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "机构设置 - 高校官网",
  description: "高校机构设置与部门信息。",
};

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function OrganizationPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim().toLowerCase();
  const departments = await getDepartments().catch(() => []);
  const filtered = q
    ? departments.filter((d) =>
        [d.name, d.intro, d.responsibilities, d.contactOffice]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : departments;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb items={[{ label: "学校概况", href: "/about" }, { label: "机构设置" }]} />
      <h1 className="text-2xl font-bold mb-6 font-serif-title">机构设置</h1>

      <form action="/organization" method="get" className="flex gap-2 mb-6 max-w-md">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="检索部门名称或职责"
          className="flex-1 rounded border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-thu-purple"
        />
        <button
          type="submit"
          className="rounded bg-thu-purple px-4 py-2 text-sm text-white hover:bg-thu-purple-dark"
        >
          检索
        </button>
      </form>

      {filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dept) => (
            <article
              key={dept.id}
              id={`dept-${dept.id}`}
              className="p-4 border border-zinc-200 rounded-lg scroll-mt-24"
            >
              <h2 className="font-semibold text-zinc-900">{dept.name}</h2>
              {dept.intro && (
                <p className="mt-2 text-sm text-zinc-600">{dept.intro}</p>
              )}
              {dept.responsibilities && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-thu-purple">部门职责</summary>
                  <p className="mt-2 text-sm text-zinc-600 whitespace-pre-line">
                    {dept.responsibilities}
                  </p>
                </details>
              )}
              <div className="mt-3 text-xs text-zinc-500 space-y-1">
                {dept.contactOffice && <p>办公室：{dept.contactOffice}</p>}
                {dept.contactPhone && (
                  <p>
                    电话：
                    <a href={`tel:${dept.contactPhone}`} className="hover:text-thu-purple">
                      {dept.contactPhone}
                    </a>
                  </p>
                )}
                {dept.contactEmail && (
                  <p>
                    邮箱：
                    <a href={`mailto:${dept.contactEmail}`} className="hover:text-thu-purple">
                      {dept.contactEmail}
                    </a>
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-zinc-400">暂无匹配部门</p>
      )}
    </div>
  );
}
