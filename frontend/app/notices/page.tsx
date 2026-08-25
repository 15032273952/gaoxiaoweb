/**
 * 通知公告列表页（静态壳）：级别筛选与分页在客户端进行。
 */

import { getNotices } from "@/lib/content";
import { NoticeFilterableList } from "@/components/NoticeFilterableList";
import { ListPageShell } from "@/components/ListPageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "通知公告",
  description: "高校通知公告列表。",
};

export default async function NoticesPage() {
  const notices = await getNotices().catch(() => []);
  return (
    <ListPageShell
      title="通知公告"
      accent="red"
      crumbs={[{ label: "新闻公告", href: "/news" }, { label: "通知公告" }]}
      fallback="正在加载通知列表…"
    >
      <NoticeFilterableList notices={notices} />
    </ListPageShell>
  );
}
