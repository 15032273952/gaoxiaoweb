import { CmsPageShell } from "@/components/CmsPageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "招生就业",
  description: "高校招生就业信息展示。",
};

export default function AdmissionsPage() {
  return <CmsPageShell slug="admissions" title="招生就业" crumbs={[{ label: "招生就业" }]} />;
}
