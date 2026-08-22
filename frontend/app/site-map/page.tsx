/**
 * 给人看的网站地图
 */

import { Breadcrumb } from "@/components/Breadcrumb";
import { extraSiteLinks, navItems } from "@/lib/nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "网站地图",
  description: "高校官网栏目与功能入口一览。",
};

export default function SiteMapPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb items={[{ label: "网站地图" }]} />
      <h1 className="text-2xl font-bold mb-6 font-serif-title">网站地图</h1>
      <ul className="space-y-5">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="font-semibold text-thu-purple-dark hover:text-thu-purple">
              {item.label}
            </Link>
            {item.children && (
              <ul className="mt-2 ml-4 space-y-1 text-sm text-zinc-600">
                {item.children.map((child) => (
                  <li key={child.href}>
                    <Link href={child.href} className="hover:text-thu-purple">
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <h2 className="mt-10 mb-3 font-semibold font-serif-title">其他入口</h2>
      <ul className="space-y-1 text-sm">
        {extraSiteLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-thu-purple hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
