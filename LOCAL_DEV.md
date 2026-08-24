# 本地开发调试指南

本文档说明如何在本地开发环境调试高校官网（最简版：纯静态站点）。

## 架构总览

```
浏览器 ──► Nginx（生产，直接托管 frontend/out/ 静态文件）

开发期：
浏览器 ──► Next.js dev server (:3000) ──► frontend/content/*.json
```

- **无后端服务**。站点内容以 JSON 文件形式存放在 `frontend/content/`，结构与 `frontend/lib/types.ts` 的 ViewModel 一一对应。
- **前端**：Next.js 16（`frontend/`），构建期读取 `content/` 生成全静态站点（`output: "export"` → `out/`）。
- **内容维护**：编辑 `frontend/content/*.json` → git 提交 → 重新构建部署（`deploy/deploy_static.py`）。

## 环境要求

- Node.js ≥ 18 且 ≤ 22
- npm ≥ 6

## 一、启动开发服务器

```bash
cd frontend
npm install   # 首次
npm run dev
```

- 访问 **http://localhost:3000**，改 `content/*.json` 或组件代码后热更新。

## 二、本地验证静态导出

```bash
cd frontend
npm run build   # 生成 out/（全静态）
npx serve out   # 或 python -m http.server -d out 8000，本地预览静态产物
```

## 三、内容数据说明（frontend/content/）

| 文件 | 对应页面 | 说明 |
|---|---|---|
| `site.json` | 全站（页头/页脚） | 站点名、备案号、联系方式、底部链接 |
| `articles.json` | `/news`、首页 | 文章列表+详情；`isPinned` 置顶，`category` 见 `lib/labels.ts` |
| `notices.json` | `/notices` | 通知；`isTop` 置顶，`level`: school/dept |
| `banners.json` | 首页轮播 | `imageUrl` 留空则显示默认样式 |
| `departments.json` | `/organization` | `sort` 升序；`parentSlug` 构建层级 |
| `faculty.json` | `/faculty` | 师资卡片，`profileHtml` 为 HTML 字符串 |
| `pages.json` | `/about` `/openness` `/education` `/research` `/admissions` | 单页内容，按 `slug` 匹配路由 |

字段契约详见 `frontend/lib/types.ts`；列表页的筛选/分页/搜索在浏览器端进行（静态导出无服务端运行时）。

## 四、部署

```bash
# 项目根目录 .env 配好 SSH 连接信息后（参照 .env.example）
python deploy/deploy_static.py                    # 构建+上传+切版本+装 nginx 配置
python deploy/deploy_static.py --shutdown-services  # 首次迁移：顺带停用旧 Node 服务
```

详见 `deploy/campus-static.conf`（Nginx 配置，安全响应头在此注入）。

## 常用检查

```bash
cd frontend && npm run lint       # eslint
cd frontend && npx tsc --noEmit   # typecheck
cd frontend && npm run build      # 静态导出
```
