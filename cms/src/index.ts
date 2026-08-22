/**
 * Strapi 应用入口 - src/index.ts
 *
 * 功能：Strapi 应用生命周期钩子
 */

import type { Core } from "@strapi/types";

import { applyAdminChinese } from "./admin-zh";

export default {
  /**
   * 应用注册时调用（可选）
   *
   * 在此可注册自定义中间件、服务、策略等
   */
  // register(/*{ strapi }*/) {},

  /**
   * 应用启动时调用
   *
   * 将管理后台中文化：统一管理员界面语言、注入中文字段标签，
   * 实现见 src/admin-zh.ts（内部逐项容错，不会阻断启动）。
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await applyAdminChinese(strapi);
  },

  /**
   * 应用销毁时调用（可选）
   *
   * 用于执行清理资源、关闭连接等操作
   */
  // destroy(/*{ strapi }*/) {},
};
