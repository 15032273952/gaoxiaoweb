import { CmsPage } from "@/components/CmsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "科学研究",
  description: "高校科学研究介绍。",
};

export default function ResearchPage() {
  return <CmsPage slug="research" title="科学研究" accent="blue" crumbs={[{ label: "科学研究" }]} />;
}
