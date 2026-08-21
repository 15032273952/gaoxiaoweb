# 本地开发调试指南

本文档说明如何在本地开发环境调试高校官网 POC 的前端（Next.js）与后端（Strapi CMS）功能。

## 架构总览

```
浏览器 ──► Next.js 前台 (:3000) ──► Strapi CMS 后台 (:1337)
              frontend/                 cms/
```

- **后端**：Strapi 5 CMS（`cms/`），提供 REST API，管理文章、横幅、院系、教师、通知、页面等数据。
- **前端**：Next.js 16（`frontend/`），构建期通过 `lib/cms.ts` 调 Strapi API 拉数据渲染页面。

## 环境要求

- Node.js ≥ 18 且 ≤ 22（当前开发机为 v22.11.0，符合要求）
- npm ≥ 6

## 一、启动后端（Strapi CMS）

```bash
cd cms
npm run develop
```

- 启动后访问 **http://localhost:1337/admin** 进入 CMS 管理后台。
- 默认端口 `1337`（在 `cms/.env` 中配置，当前用 `.env.example` 的默认值）。
- 数据库默认用 SQLite（`cms/database/data.db`），无需额外配置。

> ⚠️ **注意**：首次启动前需确保 `cms/public/uploads/` 目录存在，否则 Strapi 会崩溃。

## 二、启动前端（Next.js）

```bash
cd frontend
npm run dev
```

- 启动后访问 **http://localhost:3000**。
- 前端通过 `lib/cms.ts` 里的 `CMS_API_URL`（默认 `http://localhost:1337/api`）访问后端。

### 前端环境变量

当前 `frontend/` 下没有 `.env` 文件，使用默认值。如需自定义，创建 `frontend/.env`：

```bash
# frontend/.env
CMS_API_URL=http://localhost:1337/api
CMS_API_TOKEN=你的只读Token
```

> ⚠️ **注意**：`lib/cms.ts` 里 `CMS_TOKEN` 默认是空字符串。如果 CMS 的 API 需要鉴权，需先在 Strapi 后台创建只读 API Token，再填入此处。

## 三、调试流程

### 1. 数据准备（后端）

1. 打开 `http://localhost:1337/admin` 登录 CMS 后台。
2. 创建/编辑内容（文章、横幅、通知等）。
3. 确保 `site-setting` 单类型**至少有一条记录**（否则前端构建会失败，这是已知踩坑）。

### 2. 前端调试

- 前端是**构建期拉数据**（Server Component），修改 CMS 数据后，需**刷新页面**或**重新构建**才能看到变化。
- 开发模式下 `next dev` 会热更新，但 CMS 数据变化可能需要刷新。

### 3. 常用调试命令

```bash
# 前端类型检查
cd frontend && npx tsc --noEmit

# 前端 lint
cd frontend && npm run lint

# 前端构建（生产验证）
cd frontend && npm run build
```

## 四、调试技巧

| 需求 | 方法 |
|------|------|
| 看后端 API 返回 | 浏览器直接访问 `http://localhost:1337/api/articles` 等 |
| 看前端请求 | 打开浏览器 DevTools → Network 面板 |
| 改前端样式 | 直接改 `app/globals.css`（Tailwind v4 CSS-first 配置） |
| 改数据映射 | 只改 `frontend/lib/cms.ts`（不要动页面组件） |
| 调试后端逻辑 | 在 `cms/src/api/*/controllers/` 里加日志 |

## 五、注意事项

1. **Node 版本**：需 ≥18 且 ≤22，当前 v22.11.0 符合要求。
2. **前端是 Next.js 16**，与训练数据版本不同，写代码前先查 `frontend/node_modules/next/dist/docs/`。
3. **生产构建**：`next build` + `next start`（`output: "export"` 已禁用）。
4. **CMS 数据变更**：前端构建期拉数据，改数据后需刷新/重建。
5. **安全红线**：不要把服务器凭据、CMS Token、数据库密码写进代码或提交到 Git。