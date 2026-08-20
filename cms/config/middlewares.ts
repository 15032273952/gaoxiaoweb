/**
 * 中间件配置文件 - config/middlewares.ts
 *
 * 功能：配置 Strapi 的 HTTP 中间件
 *
 * 说明：Strapi 5 的 middlewares 必须是数组，可以包含 string 或者
 * { name, resolve, config } 形式的中间件条目。
 * 此处使用默认安全相关中间件。
 */

export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
