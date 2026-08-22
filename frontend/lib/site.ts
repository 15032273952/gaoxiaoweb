/**
 * 站点公开地址（sitemap / RSS / JSON-LD 用）
 * 生产环境可设 SITE_URL，例如 https://www.example.edu.cn
 */
export function getSiteUrl(): string {
  const raw =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}
