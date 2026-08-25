import { CmsPage } from "@/components/CmsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "信息公开",
  description: "高校信息公开。",
};

export default function OpennessPage() {
  return (
    <CmsPage
      slug="openness"
      title="信息公开"
      crumbs={[{ label: "学校概况", href: "/about" }, { label: "信息公开" }]}
      attachmentTitle="公开文件"
    />
  );
}
