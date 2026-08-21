# AGENTS.md

高校官网 POC：Strapi 5 CMS 后台 + Next.js 前台。代码注释和文档以中文为主，回复和新增注释也用中文。

## 仓库结构

- `cms/` — Strapi 5（Node ≥18 ≤22）。内容类型：article、banner、department、faculty-profile、notice、page、site-setting（单类型），组件 `shared.footer-link`。
- `frontend/` — Next.js 16.2.10 + React 19，App Router，Tailwind CSS v4（CSS-first 配置在 `app/globals.css`，无 tailwind.config 文件）。
- `deploy/` — 部署文档（`SERVER_DEPLOYMENT.md`、`LAN_DEPLOYMENT_RECORD.md`）与 SSH 辅助脚本。
- `.workbuddy/memory/` — 工作记录，含部署踩坑，改部署相关代码前先读。

## 常用命令

```bash
# CMS
cd cms && npm run develop        # Strapi 开发，:1337
cd cms && npm run build          # strapi build

# 前台
cd frontend && npm run dev       # :3000
cd frontend && npm run build
cd frontend && npm run lint      # eslint
cd frontend && npx tsc --noEmit  # typecheck
```

## 数据流与分层

- 浏览器不直连 CMS。前台 Server Component 在**构建期**经 `frontend/lib/cms.ts` 调 Strapi REST API 拉数据；`lib/types.ts` 定义 ViewModel，页面组件只消费 ViewModel，不碰 Strapi 原始结构。
- CMS 字段变更时只改 `lib/cms.ts` 的映射逻辑。
- 环境变量：`CMS_API_URL`（默认 `http://localhost:1337/api`）、`CMS_API_TOKEN`（只读 Bearer）。`.env` 不进 Git，参照 `cms/.env.example`。
- 设计红线（见 `deploy/SERVER_DEPLOYMENT.md` §4）：CMS Admin 与 PostgreSQL 不对公网；构建/运行只用只读 Token；密钥不进 Git。

## 前台约定

- **Next.js 16 与训练数据中的版本不同**：API/约定可能有破坏性变更，写代码前先查 `frontend/node_modules/next/dist/docs/`（`frontend/AGENTS.md` 有同样要求）。
- 安全响应头由 `frontend/lib/security-headers.ts`（`withSecurityHeaders`）在 `next.config.ts` 注入，改 headers 走这里，别在别处重复定义。
- `output: "export"` 已禁用（与自定义 headers 不兼容），生产是 `next build` + `next start`，不会有 `out/`。
- 路径别名 `@/*` 指向 `frontend/` 根。
- 主题色是清华紫（`--thu-purple` 等 CSS 变量，`@theme inline` 映射成 `bg-thu-purple` 等工具类），标题用衬线（宋体系）。改视觉风格沿用这套变量，别硬编码新色值。

## CMS 约定

- 数据库随 `DATABASE_CLIENT` 切换：dev 用 SQLite（`cms/database/data.db`），prod 用 PostgreSQL，配置在 `cms/config/database.ts`。
- 文章有 `draftAndPublish` 和 `moderationStatus`（draft→in_review→approved→published→archived）双状态；前台列表查 `moderationStatus=published`，详情查 `publicationState=live`。

## 已知踩坑（来自 `.workbuddy/memory/2026-08-20.md`）

- Strapi 单类型 `site-setting` 无记录时 GET 返回 404（集合类型返回 200），`lib/cms.ts` 非 2xx 抛错重试会导致构建失败；需保证库里至少有一条记录。
- Strapi 只读 Token 不含单类型权限，`site-setting` 需 full-access Token（仅服务端使用，POC 可接受）。
- Strapi 首次启动前必须存在 `cms/public/uploads/`，否则崩溃。
- 目标服务器 186.241.89.117 仅 2GB 内存：`strapi build` 与 `next build` 需 `NODE_OPTIONS=--max-old-space-size=1500`；`npm ci` 必须 `--include=dev`（Tailwind v4 的 `@tailwindcss/postcss` 是 devDependency，缺失会构建失败）。

## 安全注意

- 不要把任何服务器凭据、CMS Token、数据库密码写进代码或提交到 Git。
- **当前隐患（待处理）**：`deploy/ssh_exec.py` 与根目录 `ssh_connect_test.py` 都含硬编码服务器 root 密码，且**仍被 git 跟踪**（`.gitignore` 只挡未跟踪文件，不会自动取消跟踪）。这两个文件需要 `git rm --cached` 移出跟踪、并清理 git 历史（如 `git filter-repo`），否则密码已泄露到仓库历史。
- `deploy/ssh_sftp_put.py` 已被 `.gitignore` 忽略且未跟踪，属正确状态，不要提交。
- 远程操作可参考 `.workbuddy/memory/2026-08-20.md` 中的服务器结构说明，但优先改用密钥登录/密钥库而非硬编码密码。
