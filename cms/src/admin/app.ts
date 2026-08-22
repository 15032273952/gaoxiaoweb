/**
 * 管理面板定制入口 - src/admin/app.ts
 *
 * 功能：将管理面板界面语言设置为简体中文
 *
 * 说明：v5 新版 admin 客户端（.strapi/client）不再读取 config/admin.ts 的
 * locales 配置，语言等前端定制统一经由本文件注入（构建时会以 customisations
 * 参数传给 renderAdmin）。zh-Hans 为内置简体中文语言包的 locale 代码。
 *
 * 覆盖策略：
 *  - locales 声明 zh-Hans（Strapi 会强制保留 en 作为兜底）；
 *  - translations 把补丁同时注入 zh-Hans 与 en：前者补齐内置中文包缺失的
 *    文案（见 zh-Hans-patch.ts），后者让未登录/新浏览器的默认英文界面
 *    同样显示这些中文文案。
 *
 * 注意：界面默认语言取浏览器 localStorage（首次为英文），已有管理员账号
 * 的语言由服务端 src/admin-zh.ts 在每次启动时统一改为 zh-Hans，登录后
 * 自动切换为中文。
 */

import zhHansPatch from "./zh-Hans-patch";

export default {
  config: {
    locales: ["zh-Hans"],
    translations: {
      "zh-Hans": zhHansPatch,
      en: zhHansPatch,
    },
  },
};
