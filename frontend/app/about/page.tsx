import { CmsPage } from "@/components/CmsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "学校概况",
  description: "高校学校概况介绍。",
};

export default function AboutPage() {
  return <CmsPage slug="about" title="学校概况" crumbs={[{ label: "学校概况" }]} />;
}
