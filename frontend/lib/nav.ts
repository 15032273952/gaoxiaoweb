/**
 * 全站导航配置，供顶栏、页脚、网站地图复用
 */

export type NavChild = { label: string; href: string };
export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

export const navItems: NavItem[] = [
  { label: "首页", href: "/" },
  {
    label: "学校概况",
    href: "/about",
    children: [
      { label: "学校简介", href: "/about" },
      { label: "机构设置", href: "/organization" },
      { label: "信息公开", href: "/openness" },
    ],
  },
  {
    label: "新闻公告",
    href: "/news",
    children: [
      { label: "校园新闻", href: "/news" },
      { label: "通知公告", href: "/notices" },
    ],
  },
  {
    label: "人才培养",
    href: "/education",
    children: [
      { label: "教育教学", href: "/education" },
      { label: "师资队伍", href: "/faculty" },
    ],
  },
  { label: "科学研究", href: "/research" },
  { label: "招生就业", href: "/admissions" },
  { label: "联系我们", href: "/contact" },
];

export const utilityLinks = [
  { label: "学生", href: "/education" },
  { label: "教职工", href: "/faculty" },
  { label: "校友访客", href: "/contact" },
  { label: "网站地图", href: "/site-map" },
];

export const extraSiteLinks = [
  { label: "站内搜索", href: "/search" },
  { label: "网站地图", href: "/site-map" },
  { label: "新闻 RSS", href: "/feed.xml" },
];

/** 当前路径是否属于该一级栏目（含子栏目） */
export function isNavActive(pathname: string, item: NavItem): boolean {
  const targets = [item.href, ...(item.children?.map((c) => c.href) ?? [])];
  return targets.some((href) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`),
  );
}
