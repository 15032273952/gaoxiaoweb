/**
 * 管理面板中文化模块 - src/admin-zh.ts
 *
 * 功能：让 Strapi 管理后台呈现全中文界面
 *  - 启动时把所有管理员账号的界面语言统一为简体中文（配合 config/admin.ts
 *    的 locales 配置，后者约束新账号与 Profile 可选项）；
 *  - 向内容管理器（content-manager）注入各内容类型/组件字段的中文标签。
 *
 * 设计说明：
 *  - 字段内部名（title/slug 等）受 REST API 契约约束不能改中文，这里只改后台显示标签；
 *  - 枚举值（campus/school 等）被前台 lib/cms.ts 的查询逻辑依赖，保持英文原值；
 *  - 标签存于 core_store（经 strapi.store 读写），每次启动以本文件的标签表为准；
 *    管理员在界面里对布局、列表列等其他设置所做的修改会被保留；
 *  - 任一步骤失败只记录警告，不阻断 CMS 启动。
 */

import type { Core } from "@strapi/types";

/** Strapi 实例类型（@strapi/types 以命名空间形式导出） */
type Strapi = Core.Strapi;

/** admin 内置简体中文语言包的 locale 代码（v5 为 zh-Hans，注意大小写） */
const ZH_HANS = "zh-Hans";

/**
 * content-manager 的配置存储。
 * 与插件内部保持一致（见 @strapi/content-manager 的 services/utils/store.js）：
 * 经由该 store 写入的数据最终落在 core_store 的
 * plugin_content_manager_configuration_*::<uid> 记录上，管理后台实际读取的正是这些记录。
 */
function contentManagerStore(strapi: Strapi) {
  return strapi.store({ type: "plugin", name: "content_manager" });
}

/** 配置项 key（对应插件源码中 configurationKey() 拼接的前缀 + 模型类别） */
const CONTENT_TYPE_KEY = "configuration_content_types";
const COMPONENT_KEY = "configuration_components";

/** 系统字段的中文名（content-manager 默认生成英文标签，这里统一覆盖） */
const SYSTEM_FIELD_LABELS: Record<string, string> = {
  documentId: "文档 ID",
  createdAt: "创建时间",
  updatedAt: "更新时间",
  publishedAt: "发布时间",
};

/** 内容类型字段的中文标签（key 为 content-type uid） */
const CONTENT_TYPE_LABELS: Record<string, Record<string, string>> = {
  "api::article.article": {
    title: "标题",
    slug: "URL 别名",
    summary: "摘要",
    content: "正文",
    cover: "封面图",
    category: "栏目",
    department: "所属机构",
    authors: "作者",
    isPinned: "是否置顶",
    attachments: "附件",
    moderationStatus: "审核状态",
    seoTitle: "SEO 标题",
    seoDescription: "SEO 描述",
  },
  "api::banner.banner": {
    title: "标题",
    image: "轮播图片",
    linkUrl: "链接地址",
    sort: "排序值",
    isActive: "是否启用",
    openInNewTab: "新窗口打开",
  },
  "api::department.department": {
    name: "机构名称",
    slug: "URL 别名",
    intro: "简介",
    responsibilities: "机构职责",
    contactOffice: "办公地点",
    contactPhone: "联系电话",
    contactEmail: "联系邮箱",
    sort: "排序值",
    parent: "上级机构",
  },
  "api::faculty-profile.faculty-profile": {
    name: "姓名",
    title: "职称",
    college: "所在学院",
    researchFields: "研究方向",
    avatar: "头像",
    profile: "个人简介",
  },
  "api::notice.notice": {
    title: "标题",
    slug: "URL 别名",
    summary: "摘要",
    content: "正文",
    cover: "封面图",
    noticeNo: "通知编号",
    level: "级别",
    effectiveDate: "生效日期",
    expireDate: "失效日期",
    attachments: "附件",
    isTop: "是否置顶",
    moderationStatus: "审核状态",
    seoTitle: "SEO 标题",
    seoDescription: "SEO 描述",
  },
  "api::page.page": {
    title: "标题",
    slug: "URL 别名",
    summary: "摘要",
    body: "正文",
    template: "页面模板",
    parent: "上级页面",
    attachments: "附件",
    seoTitle: "SEO 标题",
    seoDescription: "SEO 描述",
  },
  "api::site-setting.site-setting": {
    siteName: "网站名称",
    logo: "网站 Logo",
    favicon: "网站图标",
    icpRecordNo: "ICP 备案号",
    policeRecordNo: "公安备案号",
    address: "学校地址",
    postcode: "邮政编码",
    generalPhone: "总机电话",
    generalEmail: "公共邮箱",
    footerLinks: "页脚链接",
  },
};

/** 组件字段的中文标签（key 为组件 uid） */
const COMPONENT_LABELS: Record<string, Record<string, string>> = {
  "shared.footer-link": {
    label: "链接文字",
    href: "链接地址",
    sort: "排序值",
  },
};

/* ---------- content-manager 配置的构造与合并 ---------- */

/** 单字段的展示元数据（label 为中文，其余键保持 content-manager 的默认行为） */
type FieldMetadata = {
  edit: {
    label: string;
    description: string;
    placeholder: string;
    visible: boolean;
    editable: boolean;
  };
  list: { label: string; searchable: boolean; sortable: boolean };
};

type CMConfiguration = {
  settings: Record<string, unknown>;
  // 旧配置来自 core_store 反序列化，键可能残缺，故 edit/list 设为可选
  metadatas: Record<
    string,
    { edit?: Partial<FieldMetadata["edit"]>; list?: Partial<FieldMetadata["list"]> }
  >;
  layouts: { list: string[]; edit: string[][] };
};

type Attributes = Record<string, { type?: string }>;

/** 这些类型的字段内容过长或结构化，不适合出现在列表页 */
const LIST_HIDDEN_TYPES = new Set(["component", "dynamiczone", "richtext", "json", "blocks"]);

/** 可参与列表搜索的字段类型 */
const SEARCHABLE_TYPES = new Set(["string", "text", "uid", "email", "richtext"]);

/** 可参与列表排序的字段类型 */
const SORTABLE_TYPES = new Set([
  "string",
  "text",
  "uid",
  "email",
  "richtext",
  "enumeration",
  "boolean",
  "date",
  "datetime",
  "integer",
  "decimal",
  "float",
]);

/** 关系字段在 schema 中没有 type 键，按 relation 处理 */
function fieldType(attr: { type?: string }): string {
  return attr.type ?? "relation";
}

function buildFieldMetadata(
  field: string,
  attr: { type?: string },
  labels: Record<string, string>
): FieldMetadata {
  const type = fieldType(attr);
  const label = labels[field] ?? SYSTEM_FIELD_LABELS[field] ?? field;
  return {
    edit: { label, description: "", placeholder: "", visible: true, editable: true },
    list: {
      label,
      searchable: SEARCHABLE_TYPES.has(type),
      sortable: SORTABLE_TYPES.has(type),
    },
  };
}

/** 生成与 content-manager 默认配置同构的初始配置（库中尚无配置时兜底） */
function buildDefaultConfiguration(
  attributes: Attributes,
  labels: Record<string, string>
): CMConfiguration {
  const fields = Object.keys(attributes);

  const metadatas: Record<string, FieldMetadata> = {};
  for (const [field, attr] of Object.entries(attributes)) {
    metadatas[field] = buildFieldMetadata(field, attr, labels);
  }
  // 列表页可显示的系统时间字段
  for (const sys of ["createdAt", "updatedAt", "publishedAt"]) {
    if (!metadatas[sys]) {
      metadatas[sys] = buildFieldMetadata(sys, { type: "datetime" }, labels);
    }
  }

  // 列表列取前 10 个可读字段，末尾固定追加更新时间
  const listFields = fields
    .filter((f) => !LIST_HIDDEN_TYPES.has(fieldType(attributes[f])))
    .slice(0, 10);
  listFields.push("updatedAt");

  const mainField =
    fields.find((f) => fieldType(attributes[f]) === "string") ?? fields[0] ?? "documentId";

  return {
    settings: {
      bulkable: true,
      filterable: true,
      searchable: true,
      pageSize: 10,
      mainField,
      defaultSortBy: "createdAt",
      defaultSortOrder: "ASC",
    },
    metadatas,
    layouts: {
      list: listFields,
      edit: fields.map((f) => [f]),
    },
  };
}

/**
 * 读取现有 content-manager 配置（若有），把标签覆盖为中文后写回；
 * 库中无配置时先生成默认配置再写回。除 label 外的既有设置全部保留。
 */
async function applyLabels(
  strapi: Strapi,
  storeKey: string,
  attributes: Attributes,
  labels: Record<string, string>
): Promise<void> {
  const existing = (await contentManagerStore(strapi).get({
    key: storeKey,
  })) as CMConfiguration | null;

  const config: CMConfiguration = existing
    ? {
        settings: existing.settings ?? {},
        metadatas: existing.metadatas ?? {},
        layouts: existing.layouts ?? {
          list: [],
          edit: Object.keys(attributes).map((f) => [f]),
        },
      }
    : buildDefaultConfiguration(attributes, labels);

  const patch = (field: string, attr: { type?: string }) => {
    const label = labels[field] ?? SYSTEM_FIELD_LABELS[field] ?? field;
    const meta = config.metadatas[field] ?? buildFieldMetadata(field, attr, labels);
    // 逐键兜底旧值，避免旧配置残缺导致界面读取到 undefined
    meta.edit = {
      description: meta.edit?.description ?? "",
      placeholder: meta.edit?.placeholder ?? "",
      visible: meta.edit?.visible ?? true,
      editable: meta.edit?.editable ?? true,
      label,
    };
    meta.list = {
      searchable: meta.list?.searchable ?? false,
      sortable: meta.list?.sortable ?? false,
      label,
    };
    config.metadatas[field] = meta;
  };

  for (const field of Object.keys(attributes)) {
    patch(field, attributes[field]);
  }
  // 系统字段仅在旧配置已包含时覆盖（content-manager 自动生成英文标签）
  for (const field of Object.keys(SYSTEM_FIELD_LABELS)) {
    if (config.metadatas[field]) {
      patch(field, { type: "datetime" });
    }
  }

  await contentManagerStore(strapi).set({ key: storeKey, value: config });
}

/* ---------- 启动入口 ---------- */

/**
 * 管理面板中文化入口（由 src/index.ts 的 bootstrap 调用，幂等可重复执行）
 */
export async function applyAdminChinese(strapi: Strapi): Promise<void> {
  // 1) 统一所有管理员账号的界面语言（覆盖账号注册时选择的英文）
  try {
    await strapi.db.query("admin::user").updateMany({
      where: {},
      data: { preferedLanguage: ZH_HANS },
    });
  } catch (error) {
    strapi.log.warn(`[汉化] 统一管理员界面语言失败：${(error as Error).message}`);
  }

  // 2) 注入内容类型字段中文标签
  //    strapi.contentTypes 的类型以具体 uid 字面量为键，这里按 uid 动态查找需放宽索引类型
  const allContentTypes = strapi.contentTypes as unknown as Record<
    string,
    { attributes: Attributes }
  >;
  for (const [uid, labels] of Object.entries(CONTENT_TYPE_LABELS)) {
    const contentType = allContentTypes[uid];
    if (!contentType) {
      strapi.log.warn(`[汉化] 未找到内容类型 ${uid}，已跳过`);
      continue;
    }
    try {
      await applyLabels(
        strapi,
        `${CONTENT_TYPE_KEY}::${uid}`,
        contentType.attributes,
        labels
      );
    } catch (error) {
      strapi.log.warn(`[汉化] 内容类型 ${uid} 标签注入失败：${(error as Error).message}`);
    }
  }

  // 3) 注入组件字段中文标签（同理放宽索引类型）
  const allComponents = strapi.components as unknown as Record<
    string,
    { attributes: Attributes }
  >;
  for (const [uid, labels] of Object.entries(COMPONENT_LABELS)) {
    const component = allComponents[uid];
    if (!component) {
      strapi.log.warn(`[汉化] 未找到组件 ${uid}，已跳过`);
      continue;
    }
    try {
      await applyLabels(
        strapi,
        `${COMPONENT_KEY}::${uid}`,
        component.attributes,
        labels
      );
    } catch (error) {
      strapi.log.warn(`[汉化] 组件 ${uid} 标签注入失败：${(error as Error).message}`);
    }
  }

  strapi.log.info("[汉化] 管理面板中文字段标签已应用");
}
