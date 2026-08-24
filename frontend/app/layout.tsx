/**
 * 根布局：导航、页脚、全局 SEO
 */

import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BackToTop } from "@/components/BackToTop";
import { getSiteSetting } from "@/lib/content";
import { getSiteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const setting = await getSiteSetting().catch(() => null);
  const name = setting?.siteName ?? "高校官网";
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description: `${name}官方宣传网站`,
    icons: setting?.faviconUrl ? { icon: setting.faviconUrl } : undefined,
    alternates: {
      types: {
        "application/rss+xml": "/feed.xml",
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const setting = await getSiteSetting().catch(() => null);
  const siteName = setting?.siteName ?? "高校官网";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: siteName,
    url: getSiteUrl(),
    address: setting?.address,
    telephone: setting?.generalPhone,
    email: setting?.generalEmail,
  };

  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-zinc-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-thu-purple-dark"
        >
          跳到主要内容
        </a>
        <SiteHeader siteName={siteName} logoUrl={setting?.logoUrl} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter setting={setting} />
        <BackToTop />
      </body>
    </html>
  );
}
