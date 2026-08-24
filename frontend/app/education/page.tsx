import { CmsPageShell } from "@/components/CmsPageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "教育教学",
  description: "高校教育教学介绍。",
};

export default function EducationPage() {
  return <CmsPageShell slug="education" title="教育教学" crumbs={[{ label: "教育教学" }]} />;
}
