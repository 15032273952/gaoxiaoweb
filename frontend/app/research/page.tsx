import { CmsPageShell } from "@/components/CmsPageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "科学研究",
  description: "高校科学研究介绍。",
};

export default function ResearchPage() {
  return <CmsPageShell slug="research" title="科学研究" crumbs={[{ label: "科学研究" }]} />;
}
