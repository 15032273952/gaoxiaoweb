/**
 * 服务器配置文件 - config/server.ts
 * 
 * 功能：配置 Strapi 服务器的监听地址和端口
 */

export default ({ env }: { env: any }) => ({
  // 服务器监听地址
  host: env("HOST", "0.0.0.0"),  // 默认监听所有网络接口
  
  // 服务器监听端口
  port: env.int("PORT", 1337),    // 默认 1337
  
  // 应用密钥（用于会话加密等）
  app: {
    // 从环境变量读取密钥数组，默认为 POC 测试密钥
    keys: env.array("APP_KEYS", ["poc-key-1", "poc-key-2"]),
  },
});
