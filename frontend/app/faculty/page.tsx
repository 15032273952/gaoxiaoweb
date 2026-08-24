/**
 * 师资队伍页（静态壳）：学院筛选与关键词检索在客户端进行。
 */

import { Suspense } from "react";
import { getFacultyProfiles } from "@/lib/content";
import { FacultyFilterableList } from "@/components/FacultyFilterableList";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "师资队伍",
  description: "高校师资队伍公开信息。",
};

export default async function FacultyPage() {
  const profiles = await getFacultyProfiles().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Breadcrumb items={[{ label: "人才培养", href: "/education" }, { label: "师资队伍" }]} />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 font-serif-title text-zinc-900">师资队伍</h1>
      <Suspense fallback={<p className="text-sm text-zinc-400">正在加载师资列表…</p>}>
        <FacultyFilterableList profiles={profiles} />
      </Suspense>
    </div>
  );
}
