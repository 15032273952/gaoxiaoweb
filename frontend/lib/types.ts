/**
 * 前端 ViewModel 类型契约
 * 
 * 本文件定义了前端所有数据类型的 TypeScript 类型。
 * 
 * 设计原则（对应设计说明书第 11 章）：
 * - 前端只依赖这些 ViewModel 类型，不直接感知后端（Strapi）的数据结构
 * - 数据转换逻辑统一在 lib/cms.ts 中处理
 * - 这样做的好处：后端字段变化时，只需修改 cms.ts，不影响页面组件
 * 
 * 类型命名约定：
 * - ListItem: 列表项类型（简化版本，用于列表展示）
 * - Detail: 详情类型（完整版本，用于详情页）
 * - ?: 可选属性（不一定有值）
 */

export type ArticleListItem = {
  /** 文章唯一标识符（字符串类型，兼容多种 ID 格式） */
  id: string;
  /** 文章标题 */
  title: string;
  /** 文章 URL 友好名称（用于生成文章详情页 URL） */
  slug: string;
  /** 文章摘要/导语（用于列表页预览） */
  summary: string;
  /** 发布时间（ISO 8601 格式字符串，如 "2024-01-15T08:00:00Z"） */
  publishedAt: string;
  /** 文章分类（如 "校园要闻"、"学术动态" 等） */
  category: string;
  /** 封面图片 URL（可选，无封面时显示默认图标） */
  coverUrl?: string;
  /** 是否置顶（可选，置顶文章在列表中排在前面） */
  isPinned?: boolean;
};

/**
 * 文章详情类型
 * 
 * 继承 ArticleListItem 的所有属性，添加详情页特有的内容
 */
export type ArticleDetail = ArticleListItem & {
  /** 文章正文 HTML（已转换好的 HTML 格式，可直接用 dangerouslySetInnerHTML 渲染） */
  contentHtml: string;
  /** 附件列表（可下载的文件，如 PDF、Word 文档等） */
  attachments: {
    /** 附件显示名称 */
    name: string;
    /** 附件下载 URL */
    url: string;
    /** 附件文件大小（字节，可选） */
    size?: number;
  }[];
  /** 作者署名（可选，CMS authors 字段） */
  authors?: string;
  /** SEO 标题（可选，用于 meta title，覆盖默认标题） */
  seoTitle?: string;
  /** SEO 描述（可选，用于 meta description） */
  seoDescription?: string;
};

/**
 * 通知列表项类型
 */
export type NoticeListItem = {
  /** 通知唯一标识符 */
  id: string;
  /** 通知标题 */
  title: string;
  /** 通知 URL 友好名称 */
  slug: string;
  /** 发布时间 */
  publishedAt: string;
  /** 是否置顶（可选，置顶通知显示特殊标记） */
  isTop?: boolean;
  /** 通知文号（可选，如 "校发〔2024〕1号"） */
  noticeNo?: string;
  /** 通知级别（school=校级 / dept=部门） */
  level?: string;
};

/**
 * 通知详情类型
 */
export type NoticeDetail = NoticeListItem & {
  /** 通知摘要 */
  summary: string;
  /** 通知正文 HTML */
  contentHtml: string;
  /** 附件列表 */
  attachments: { name: string; url: string; size?: number }[];
  /** 通知级别（如 "普通"、"重要"、"紧急"） */
  level: string;
  /** 生效日期（可选） */
  effectiveDate?: string;
  /** 失效日期（可选，用于有时效性的通知） */
  expireDate?: string;
  /** SEO 标题 */
  seoTitle?: string;
  /** SEO 描述 */
  seoDescription?: string;
};

/**
 * 轮播项类型
 * 
 * 用于首页顶部轮播图组件
 */
export type BannerItem = {
  /** 轮播项唯一标识符 */
  id: string;
  /** 轮播项标题（显示在图片上或作为 alt 文本） */
  title: string;
  /** 轮播图片 URL */
  imageUrl: string;
  /** 点击轮播图跳转的链接（可选，无链接时只展示图片） */
  linkUrl?: string;
  /** 是否在新标签页打开链接（可选，默认本页面跳转） */
  openInNewTab?: boolean;
};

/**
 * 网站全局配置类型
 * 
 * 存储网站的全局配置信息，如名称、联系方式、备案号等
 */
export type SiteSetting = {
  /** 网站名称（显示在导航栏等位置） */
  siteName: string;
  /** 网站 Logo URL（可选） */
  logoUrl?: string;
  /** 网站图标（favicon）URL（可选） */
  faviconUrl?: string;
  /** ICP 备案号（可选，如 "京ICP备12345678号"） */
  icpRecordNo?: string;
  /** 公安备案号（可选） */
  policeRecordNo?: string;
  /** 学校地址（可选） */
  address?: string;
  /** 邮政编码（可选） */
  postcode?: string;
  /** 总机电话（可选） */
  generalPhone?: string;
  /** 通用邮箱（可选） */
  generalEmail?: string;
  /** 底部链接列表（如 "隐私政策"、"联系我们" 等） */
  footerLinks: { label: string; href: string }[];
};

/**
 * 部门类型
 */
export type DepartmentItem = {
  /** 部门唯一标识符 */
  id: string;
  /** 部门名称 */
  name: string;
  /** URL 友好名称 */
  slug: string;
  /** 部门简介（可选） */
  intro?: string;
  /** 部门职责（可选） */
  responsibilities?: string;
  /** 办公室位置（可选） */
  contactOffice?: string;
  /** 联系电话（可选） */
  contactPhone?: string;
  /** 联系邮箱（可选） */
  contactEmail?: string;
  /** 排序序号（数字越小排序越靠前） */
  sort: number;
  /** 父部门 slug（可选，用于构建部门层级） */
  parentSlug?: string;
};

/**
 * 教职工简介类型
 */
export type FacultyProfile = {
  /** 教职工唯一标识符 */
  id: string;
  /** 姓名 */
  name: string;
  /** 职称/职务（如 "教授"、"副教授"、"讲师"） */
  title: string;
  /** 所属学院/部门 */
  college: string;
  /** 研究领域（可选，多个领域用逗号分隔） */
  researchFields?: string;
  /** 头像图片 URL（可选） */
  avatarUrl?: string;
  /** 个人简介 HTML（可选） */
  profileHtml?: string;
};

/**
 * 页面内容类型
 * 
 * 用于"关于我们"、"组织机构"等单页面内容
 */
export type PageContent = {
  /** 页面唯一标识符 */
  id: string;
  /** 页面标题 */
  title: string;
  /** URL 友好名称（用于路由） */
  slug: string;
  /** 页面正文 HTML */
  bodyHtml: string;
  /** 页面模板类型：
   * - "default": 默认模板（单栏布局）
   * - "withSidebar": 带侧边栏模板
   * - "openness": 信息公开模板
   */
  template: "default" | "withSidebar" | "openness";
  /** 附件列表 */
  attachments: { name: string; url: string; size?: number }[];
  /** SEO 标题 */
  seoTitle?: string;
  /** SEO 描述 */
  seoDescription?: string;
};
