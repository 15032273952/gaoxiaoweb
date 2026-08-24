import { CmsPageShell } from "@/components/CmsPageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "信息公开",
  description: "高校信息公开。",
};

export default function OpennessPage() {
  return (
    <CmsPageShell
      slug="openness"
      title="信息公开"
      crumbs={[{ label: "学校概况", href: "/about" }, { label: "信息公开" }]}
      attachmentTitle="公开文件"
    />
  );
}
