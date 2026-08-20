import type { NextConfig } from "next";
import { withSecurityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  // SSG 静态导出（output: export 与自定义 headers 不兼容，已禁用）
  // output: "export",
  images: {
    unoptimized: true, // 静态导出模式关闭时也保留，便于 POC
  },
};

export default withSecurityHeaders(nextConfig);
