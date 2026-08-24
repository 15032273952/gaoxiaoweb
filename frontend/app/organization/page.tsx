/**
 * 机构设置页（静态壳）：检索在客户端进行。
 */

import { Suspense } from "react";
import { getDepartments } from "@/lib/content";
import { OrganizationFilterableList } from "@/components/OrganizationFilterableList";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "机构设置",
  description: "高校机构设置与部门信息。",
};

export default async function OrganizationPage() {
  const departments = await getDepartments().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Breadcrumb items={[{ label: "学校概况", href: "/about" }, { label: "机构设置" }]} />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 font-serif-title text-zinc-900">机构设置</h1>
      <Suspense fallback={<p className="text-sm text-zinc-400">正在加载机构信息…</p>}>
        <OrganizationFilterableList departments={departments} />
      </Suspense>
    </div>
  );
}
