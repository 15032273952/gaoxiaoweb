import { CmsPageShell } from "@/components/CmsPageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "学校概况",
  description: "高校学校概况介绍。",
};

export default function AboutPage() {
  return <CmsPageShell slug="about" title="学校概况" crumbs={[{ label: "学校概况" }]} />;
}
