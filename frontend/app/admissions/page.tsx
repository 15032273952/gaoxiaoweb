import { getPageBySlug } from "@/lib/content";
import { CmsPageView } from "@/components/CmsPageView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "招生就业",
  description: "高校招生就业信息展示。",
};

export default async function AdmissionsPage() {
  const page = await getPageBySlug("admissions").catch(() => null);
  return (
    <CmsPageView
      title="招生就业"
      crumbs={[{ label: "招生就业" }]}
      page={page}
    />
  );
}
