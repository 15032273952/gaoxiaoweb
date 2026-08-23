/**
 * 安全响应头配置
 * 对应设计说明书 7.3 与技术方案附录 A。
 */
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

export const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "media-src 'self' https:",
      "style-src 'self' 'unsafe-inline'",
      // Next.js App Router 通过 HTML 内联脚本（self.__next_f.push）向浏览器传递 RSC 数据；
      // 若禁止内联脚本，React 永远无法水合，所有客户端交互（移动端抽屉导航、返回顶部等）静默失效。
      // dev 模式另需 'unsafe-eval'（React 开发版用 eval 重建服务端错误栈）。
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' mailto:",
    ].join("; "),
  },
];

/**
 * 将安全头注入 Next.js 配置。
 * 用法：nextConfig = withSecurityHeaders(nextConfig);
 */
export function withSecurityHeaders(config: NextConfig): NextConfig {
  return {
    ...config,
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: securityHeaders,
        },
      ];
    },
  };
}
