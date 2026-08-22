/**
 * 机构设置：检索 + 上下级分组
 */

import { getDepartments } from "@/lib/cms";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { DepartmentItem } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "机构设置",
  description: "高校机构设置与部门信息。",
};

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function OrganizationPage({ searchParams }: Props) {
  const sp = await searchParams;
  const qRaw = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim();
  const q = qRaw.toLowerCase();
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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Breadcrumb items={[{ label: "学校概况", href: "/about" }, { label: "机构设置" }]} />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 font-serif-title text-zinc-900">机构设置</h1>

      <form action="/organization" method="get" className="flex flex-col sm:flex-row gap-2.5 mb-8 max-w-lg">
        <input
          name="q"
          type="search"
          defaultValue={qRaw}
          placeholder="检索部门名称或职责..."
          className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-thu-purple focus:ring-2 focus:ring-thu-purple/20 transition-all shadow-2xs"
        />
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-thu-purple to-thu-purple-dark px-6 py-2.5 text-sm font-medium text-white hover:shadow-md transition-all active-press"
        >
          检索
        </button>
      </form>

      {filtered.length > 0 ? (
        q ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((dept) => (
              <DepartmentCard key={dept.id} dept={dept} />
            ))}
          </div>
        ) : (
          <DepartmentTree items={filtered} />
        )
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-zinc-150 text-zinc-400 text-sm">
          暂无匹配部门
        </div>
      )}
    </div>
  );
}

function DepartmentTree({ items }: { items: DepartmentItem[] }) {
  const bySlug = new Map(items.map((d) => [d.slug, d]));
  const children = new Map<string, DepartmentItem[]>();
  const roots: DepartmentItem[] = [];

  for (const d of items) {
    if (d.parentSlug && bySlug.has(d.parentSlug)) {
      const list = children.get(d.parentSlug) ?? [];
      list.push(d);
      children.set(d.parentSlug, list);
    } else {
      roots.push(d);
    }
  }

  return (
    <div className="space-y-8">
      {roots.map((root) => {
        const kids = children.get(root.slug) ?? [];
        return (
          <section key={root.id}>
            <DepartmentCard dept={root} />
            {kids.length > 0 && (
              <div className="mt-3 ml-0 md:ml-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kids.map((child) => (
                  <DepartmentCard key={child.id} dept={child} nested />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function DepartmentCard({
  dept,
  nested = false,
}: {
  dept: DepartmentItem;
  nested?: boolean;
}) {
  const html = dept.responsibilities ?? "";
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(html);

  return (
    <article
      id={`dept-${dept.id}`}
      className={`p-5 border rounded-xl shadow-2xs hover:shadow-md hover:border-thu-purple/30 transition-all duration-200 scroll-mt-24 flex flex-col justify-between ${
        nested ? "bg-zinc-50/80 border-zinc-100" : "bg-white border-zinc-150/80"
      }`}
    >
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <span className="w-2 h-2 rounded-full bg-thu-purple flex-shrink-0" />
          <h2 className="font-bold text-base sm:text-lg text-zinc-900 font-serif-title">{dept.name}</h2>
        </div>
        {dept.intro && <p className="mt-2 text-xs sm:text-sm text-zinc-600 leading-relaxed">{dept.intro}</p>}
        {html && (
          <details className="mt-3 group">
            <summary className="cursor-pointer text-xs sm:text-sm font-medium text-thu-purple hover:text-thu-purple-dark flex items-center justify-between">
              <span>部门主要职责</span>
              <span className="text-xs text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            {isHtml ? (
              <div
                className="mt-2 prose prose-zinc prose-sm max-w-none text-xs sm:text-sm text-zinc-600 bg-thu-purple-50/70 p-3 rounded-lg border border-thu-purple/10 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 bg-thu-purple-50/70 p-3 rounded-lg border border-thu-purple/10 whitespace-pre-line leading-relaxed">
                {html}
              </p>
            )}
          </details>
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-500 space-y-1.5 font-mono">
        {dept.contactOffice && <p>办公室：{dept.contactOffice}</p>}
        {dept.contactPhone && (
          <p>
            电话：
            <a href={`tel:${dept.contactPhone}`} className="text-thu-purple hover:underline">
              {dept.contactPhone}
            </a>
          </p>
        )}
        {dept.contactEmail && (
          <p>
            邮箱：
            <a href={`mailto:${dept.contactEmail}`} className="text-thu-purple hover:underline">
              {dept.contactEmail}
            </a>
          </p>
        )}
      </div>
    </article>
  );
}
