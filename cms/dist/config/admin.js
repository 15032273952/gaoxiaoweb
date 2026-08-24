"use strict";
/**
 * 管理面板配置文件 - config/admin.ts
 *
 * 功能：配置 Strapi 管理面板（后台）的认证和 API 安全选项
 *
 * 安全说明：
 *  - 下方 fallback 值仅用于本地开发（POC），生产环境（NODE_ENV=production）
 *    启动时会检测到默认密钥并直接拒绝启动，防止用公开已知密钥伪造
 *    Admin JWT / API Token。
 */
Object.defineProperty(exports, "__esModule", { value: true });
const DEFAULT_SECRETS = [
    "poc-admin-jwt-secret",
    "poc-api-token-salt",
    "poc-transfer-token-salt",
];
function assertProductionSecrets(env, values) {
    if (env("NODE_ENV", "development") !== "production")
        return;
    const weak = values.filter((v) => !!v && DEFAULT_SECRETS.includes(v));
    if (weak.length > 0) {
        throw new Error(`[安全错误] 生产环境检测到默认 POC 密钥（${weak.join(", ")}）。` +
            "请在环境变量中设置强随机值：ADMIN_JWT_SECRET / API_TOKEN_SALT / TRANSFER_TOKEN_SALT。" +
            "可用命令生成：openssl rand -base64 32");
    }
}
exports.default = ({ env }) => {
    const adminJwtSecret = env("ADMIN_JWT_SECRET", "poc-admin-jwt-secret");
    const apiTokenSalt = env("API_TOKEN_SALT", "poc-api-token-salt");
    const transferTokenSalt = env("TRANSFER_TOKEN_SALT", "poc-transfer-token-salt");
    assertProductionSecrets(env, [adminJwtSecret, apiTokenSalt, transferTokenSalt]);
    return {
        // 管理面板 JWT 认证配置
        auth: {
            // JWT 密钥（生产环境必须从环境变量读取）
            secret: adminJwtSecret,
        },
        // API Token 配置
        apiToken: {
            // Token 盐值（用于生成安全的 API Token）
            salt: apiTokenSalt,
        },
        // 数据传输 Token 配置（用于内容迁移）
        transfer: {
            token: {
                salt: transferTokenSalt,
            },
        },
    };
};
//# sourceMappingURL=admin.js.map