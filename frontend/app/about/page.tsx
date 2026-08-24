import { getPageBySlug } from "@/lib/content";
import { CmsPageView } from "@/components/CmsPageView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "学校概况",
  description: "高校学校概况介绍。",
};

export default async function AboutPage() {
  const page = await getPageBySlug("about").catch(() => null);
  return (
    <CmsPageView
      title="学校概况"
      crumbs={[{ label: "学校概况" }]}
      page={page}
    />
  );
}
