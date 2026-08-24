# AGENTS.md

高校官网（最简版）：Next.js 16 纯静态站点，无后端服务。代码注释和文档以中文为主，回复和新增注释也用中文。

## 仓库结构

- `frontend/` — Next.js 16.2 + React 19，App Router，Tailwind CSS v4（CSS-first 配置在 `app/globals.css`，无 tailwind.config 文件）。`output: "export"` 全静态导出。
- `frontend/content/` — 站点内容数据（7 个 JSON，结构与 `lib/types.ts` ViewModel 一一对应），改内容 = 改这里。
- `deploy/` — 部署工件：`campus-static.conf`（Nginx 静态托管+安全头）、`deploy_static.py`（一键部署）、`harden_server.py`（服务器加固）、SSH 辅助脚本、部署文档。
- `LOCAL_DEV.md` — 本地开发调试指南，新环境先读。
- `.workbuddy/memory/` — 工作记录，含架构变迁与部署踩坑。

## 常用命令

```bash
cd frontend && npm run dev       # :3000 开发（读 content/*.json，热更新）
cd frontend && npm run build     # 静态导出到 out/
cd frontend && npm run lint      # eslint
cd frontend && npx tsc --noEmit  # typecheck

python deploy/deploy_static.py   # 构建+部署（凭据读根目录 .env）
```

## 数据流与分层

- **无 CMS、无数据库、无 Node 运行时**。内容在 `frontend/content/*.json`，构建期由 `lib/content.ts` 读取并映射为 ViewModel（`lib/types.ts`），页面组件只消费 ViewModel。
- 列表页（news/notices/faculty/organization/search）的筛选、分页、搜索在**浏览器端**进行（客户端组件 + `useSearchParams`），因为静态导出没有服务端运行时；数据量增长到数千条前无需改回服务端方案。
- 动态路由（`news/[slug]`、`notices/[slug]`）由 `generateStaticParams` 从 content 数据预生成。
- 环境变量仅 `SITE_URL`（构建期注入 sitemap/RSS 的站点地址）。

## 前台约定

- **Next.js 16 与训练数据中的版本不同**：API/约定可能有破坏性变更，写代码前先查 `frontend/node_modules/next/dist/docs/`（`frontend/AGENTS.md` 有同样要求）。
- 安全响应头由 `deploy/campus-static.conf` 在 Nginx 注入（应用层 `withSecurityHeaders` 已随静态导出移除），改 headers 走这里，别在别处重复定义。
- `output: "export"` 已启用；`feed.xml`/`sitemap`/`robots` 均为 `force-static` 构建期生成。新增 route handler 或读 searchParams 的页面时注意静态导出兼容（需要客户端化或 force-static）。
- 路径别名 `@/*` 指向 `frontend/` 根。
- 主题色是清华紫（`--thu-purple` 等 CSS 变量，`@theme inline` 映射成 `bg-thu-purple` 等工具类），标题用衬线（宋体系）。改视觉风格沿用这套变量，别硬编码新色值。

## 内容维护约定

- 改 `content/*.json` 后必须 `npm run build` 验证（JSON 结构错误会在构建期暴露）。
- 文章 `category`、通知 `level` 的合法枚举见 `lib/labels.ts`（campus/academic/media/other；school/dept）。
- `pages.json` 的 `slug` 必须与路由页面的 `getPageBySlug("...")` 参数一致。
- 正文类字段（`contentHtml`/`bodyHtml`/`profileHtml`）是 HTML 字符串，经 `dangerouslySetInnerHTML` 渲染——**只放可信内容，勿粘贴外部来源 HTML**（无 sanitizer）。

## 已知踩坑

- 静态导出下页面组件不能 `await searchParams`（构建报 `dynamic = "error"`）；筛选需求一律做成客户端组件并用 `<Suspense>` 包裹（`useSearchParams` 要求）。
- 新增 Route Handler（如 RSS）必须 `export const dynamic = "force-static"`，否则静态导出失败。
- 目标服务器 186.241.89.117 仅 2GB 内存：**构建放本地/CI**（`deploy_static.py` 即此设计），服务器只跑 Nginx，不再有构建内存问题。
- Git Bash（MSYS）下 `grep -l | xargs sed` 会因反斜杠路径静默失败，批量改文件用 Python 脚本。

## 安全注意

- 不要把任何服务器凭据写进代码或提交到 Git。
- 历史遗留已处理（2026-08-24）：旧 SSH 脚本曾硬编码 root 密码并推送至公开 GitHub 仓库，git 历史已经 `git filter-repo` 重写并 force push，相关凭据已轮换。剩余：GitHub 仓库转 Private（需手动，Settings → Change visibility）。
- `deploy/ssh_sftp_put.py`、`deploy/ssh_exec.py`、`ssh_connect_test.py` 均被 `.gitignore` 忽略且未跟踪，不要提交。
- 远程操作统一用 `deploy/ssh_exec.py`（自动读根目录 `.env` 的 `SSH_HOST/SSH_PORT/SSH_USER/SSH_KEY/SSH_PASSWORD`，密钥优先）；服务器加固用 `deploy/harden_server.py`；部署用 `deploy/deploy_static.py`。
- 攻击面现状：服务器只应开放 22（SSH，仅密钥）、80/443（Nginx 静态站点）。CMS/数据库相关的服务（campus-cms、campus-frontend、PostgreSQL）在迁移后应停用（`deploy_static.py --shutdown-services`）。
