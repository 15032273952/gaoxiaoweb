/**
 * 中间件配置文件 - config/middlewares.ts
 *
 * 功能：配置 Strapi 的 HTTP 中间件
 *
 * 说明：Strapi 5 的 middlewares 必须是数组，可以包含 string 或者
 * { name, resolve, config } 形式的中间件条目。
 * 此处使用默认安全相关中间件。
 */

export default ({ env }: { env: any }) => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    // CORS 白名单：通过环境变量 CORS_ORIGINS 配置（逗号分隔），
    // 例如 CORS_ORIGINS=https://www.example.com,https://example.com
    // 本地开发默认仅放行 localhost。
    name: 'strapi::cors',
    config: {
      origin: env.array('CORS_ORIGINS', [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ]),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
