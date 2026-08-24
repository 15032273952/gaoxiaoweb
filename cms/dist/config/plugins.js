"use strict";
/**
 * 插件配置文件 - config/plugins.ts
 *
 * 功能：配置 Strapi 插件的选项
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    // 用户权限插件配置
    "users-permissions": {
        config: {
            /**
             * 注册配置
             *
             * allowedFields: 允许在注册时填写的字段
             * 为空数组表示关闭公开注册（设计说明书 8.1 要求）
             */
            register: { allowedFields: [] },
        },
    },
};
//# sourceMappingURL=plugins.js.map