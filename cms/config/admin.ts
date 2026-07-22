/**
 * 管理面板配置文件 - config/admin.ts
 * 
 * 功能：配置 Strapi 管理面板（后台）的认证和 API 安全选项
 */

export default ({ env }: { env: any }) => ({
  // 管理面板 JWT 认证配置
  auth: {
    // JWT 密钥（生产环境必须从环境变量读取）
    secret: env("ADMIN_JWT_SECRET", "poc-admin-jwt-secret"),
  },
  
  // API Token 配置
  apiToken: {
    // Token 盐值（用于生成安全的 API Token）
    salt: env("API_TOKEN_SALT", "poc-api-token-salt"),
  },
  
  // 数据传输 Token 配置（用于内容迁移）
  transfer: {
    token: {
      salt: env("TRANSFER_TOKEN_SALT", "poc-transfer-token-salt"),
    },
  },
});
