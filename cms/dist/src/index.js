"use strict";
/**
 * Strapi 应用入口 - src/index.ts
 *
 * 功能：Strapi 应用生命周期钩子
 */
Object.defineProperty(exports, "__esModule", { value: true });
const admin_zh_1 = require("./admin-zh");
exports.default = {
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
    async bootstrap({ strapi }) {
        await (0, admin_zh_1.applyAdminChinese)(strapi);
    },
    /**
     * 应用销毁时调用（可选）
     *
     * 用于执行清理资源、关闭连接等操作
     */
    // destroy(/*{ strapi }*/) {},
};
//# sourceMappingURL=index.js.map