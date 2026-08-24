/**
 * 机构设置页（静态壳）：检索在客户端进行。
 */

import { getDepartments } from "@/lib/content";
import { OrganizationFilterableList } from "@/components/OrganizationFilterableList";
import { ListPageShell } from "@/components/ListPageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "机构设置",
  description: "高校机构设置与部门信息。",
};

export default async function OrganizationPage() {
  const departments = await getDepartments().catch(() => []);
  return (
    <ListPageShell
      title="机构设置"
      crumbs={[{ label: "学校概况", href: "/about" }, { label: "机构设置" }]}
      fallback="正在加载机构信息…"
    >
      <OrganizationFilterableList departments={departments} />
    </ListPageShell>
  );
}
