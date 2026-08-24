import { getPageBySlug } from "@/lib/content";
import { CmsPageView } from "@/components/CmsPageView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "信息公开",
  description: "高校信息公开。",
};

export default async function OpennessPage() {
  const page = await getPageBySlug("openness").catch(() => null);
  return (
    <CmsPageView
      title="信息公开"
      crumbs={[{ label: "学校概况", href: "/about" }, { label: "信息公开" }]}
      page={page}
      attachmentTitle="公开文件"
    />
  );
}
