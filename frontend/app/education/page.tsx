import { getPageBySlug } from "@/lib/cms";
import { CmsPageView } from "@/components/CmsPageView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "教育教学",
  description: "高校教育教学介绍。",
};

export default async function EducationPage() {
  const page = await getPageBySlug("education").catch(() => null);
  return (
    <CmsPageView
      title="教育教学"
      crumbs={[{ label: "教育教学" }]}
      page={page}
    />
  );
}
