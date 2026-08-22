import { getPageBySlug } from "@/lib/cms";
import { CmsPageView } from "@/components/CmsPageView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "科学研究",
  description: "高校科学研究介绍。",
};

export default async function ResearchPage() {
  const page = await getPageBySlug("research").catch(() => null);
  return (
    <CmsPageView
      title="科学研究"
      crumbs={[{ label: "科学研究" }]}
      page={page}
    />
  );
}
