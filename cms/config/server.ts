/**
 * 服务器配置文件 - config/server.ts
 * 
 * 功能：配置 Strapi 服务器的监听地址和端口
 */

export default ({ env }: { env: any }) => {
  const appKeys = env.array("APP_KEYS", ["poc-key-1", "poc-key-2"]);

  // 安全检查：生产环境禁止使用默认 POC 密钥（防止会话伪造）
  if (env("NODE_ENV", "development") === "production" &&
      appKeys.some((k: string) => k.startsWith("poc-key"))) {
    throw new Error(
      "[安全错误] 生产环境检测到默认 APP_KEYS（poc-key-*）。" +
        "请设置环境变量 APP_KEYS 为强随机值，例如：" +
        "APP_KEYS=$(openssl rand -base64 32),$(openssl rand -base64 32)"
    );
  }

  return {
    // 服务器监听地址
    host: env("HOST", "0.0.0.0"),  // 默认监听所有网络接口

    // 服务器监听端口
    port: env.int("PORT", 1337),    // 默认 1337

    // 应用密钥（用于会话加密等）
    app: {
      keys: appKeys,
    },
  };
};
