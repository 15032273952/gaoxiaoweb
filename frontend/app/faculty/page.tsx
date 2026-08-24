/**
 * 师资队伍页（静态壳）：学院筛选与关键词检索在客户端进行。
 */

import { getFacultyProfiles } from "@/lib/content";
import { FacultyFilterableList } from "@/components/FacultyFilterableList";
import { ListPageShell } from "@/components/ListPageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "师资队伍",
  description: "高校师资队伍公开信息。",
};

export default async function FacultyPage() {
  const profiles = await getFacultyProfiles().catch(() => []);
  return (
    <ListPageShell
      title="师资队伍"
      crumbs={[{ label: "人才培养", href: "/education" }, { label: "师资队伍" }]}
      fallback="正在加载师资列表…"
    >
      <FacultyFilterableList profiles={profiles} />
    </ListPageShell>
  );
}
