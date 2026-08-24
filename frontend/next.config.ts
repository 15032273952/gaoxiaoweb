import type { NextConfig } from "next";

/**
 * 最简版：纯静态导出（out/），由 Nginx 直接托管。
 * 安全响应头随静态导出移至 Nginx（见 deploy/nginx-static.conf），
 * 应用层不再注入（output: "export" 与自定义 headers() 不兼容）。
 */
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // 静态导出无 Server 端图片优化服务
  },
};

export default nextConfig;
