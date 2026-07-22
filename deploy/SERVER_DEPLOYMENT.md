# 高校官网 POC — 服务器部署文档

> 适用范围：`poc/` 仓库（Strapi 5 CMS + Next.js 16 前台）  
> 文档定位：生产/预发环境服务器部署、发布、回滚与运维清单  
> 配套短说明：[README.md](./README.md)  
> 最后更新：2026-07-19

---

## 1. 文档目的与边界

本文给出从**空服务器**到**可对外访问前台 + 内网 CMS** 的完整部署路径，覆盖：

- 架构与网络隔离
- 环境与密钥规划
- PostgreSQL / CMS / 前台安装与 systemd
- Nginx 反代与安全头
- CI/CD、冒烟、备份回滚
- 验收与故障排查

**不在本文范围：**

- 等保测评全文、机房物理安全
- 视觉设计定稿、内容运营规范
- 本地开发细节（见根目录 [README.md](../README.md)）

**与 POC 代码现状对齐的硬约束（务必先读）：**

| 项 | 现状 | 部署含义 |
|---|---|---|
| Next.js | **16.2.10**（非 README 写的 15） | 构建/运行按 v16 约定 |
| `output: "export"` | **已禁用**（与自定义 headers 冲突） | 默认生产模式为 `next build` + `next start`，**不会**生成 `out/` |
| 安全头 | `frontend/lib/security-headers.ts` 注入 | 推荐 Node 进程模式保留应用层头；纯静态需改到 Nginx/CDN |
| CMS | Strapi 5，engines **Node ≥18 ≤22** | 生产使用 Node 20 LTS 或 22 |
| 数据流 | 浏览器**不**直连 CMS 写接口 | 公网仅暴露前台；CMS/Admin/DB 内网或 VPN |
| Token | 构建/运行时只读 Token | `CMS_API_TOKEN` 只读，密钥不进 Git |

---

## 2. 目标架构

```text
                    ┌─────────────┐
  用户 ──HTTPS──▶   │  CDN / WAF  │
                    └──────┬──────┘
                           │ 回源（仅允许 CDN IP）
                    ┌──────▼──────┐
                    │   Nginx     │  公网 :443
                    │  (web-edge) │
                    └──────┬──────┘
                           │ reverse_proxy → 127.0.0.1:3000
                    ┌──────▼──────┐
                    │  Next.js    │  模式 A：next start
                    │  (frontend) │  内网可读 CMS API
                    └──────┬──────┘
                           │ CMS_API_URL + 只读 Token
         VPN/跳板 ──▶ ┌────▼────┐     ┌──────────┐
                      │ Strapi  │────▶│PostgreSQL│
                      │ :1337   │     │  :5432   │
                      └────┬────┘     └──────────┘
                           │
                      上传目录 / 对象存储
```

### 2.1 组件职责

| 组件 | 职责 | 暴露面 |
|---|---|---|
| CDN + WAF | TLS 终结可选、缓存、防 CC/SQL 注入基础防护 | 公网 |
| Nginx (web) | 反代前台、TLS、限流、静态缓存、安全头兜底 | 公网或仅 CDN 回源 |
| Next.js | 渲染页面；服务端请求 CMS | 仅本机或内网 |
| Strapi CMS | 内容管理、只读 REST API | **内网/VPN only** |
| PostgreSQL | 生产库 | 仅 CMS 子网 |
| 对象存储（推荐） | 媒体/附件 | 私有桶 + 签名 URL 或内网回源 |

### 2.2 前台部署两种模式

| 模式 | 适用 | 说明 |
|---|---|---|
| **A（推荐，与当前代码一致）** | 默认生产 | `next build` + `next start`；安全头由 Next 配置注入；Nginx 反代 |
| **B（可选静态导出）** | 必须纯静态托管时 | 启用 `output: "export"`，**去掉** Next 自定义 headers，改在 Nginx/CDN 注入同等安全头；产物为 `out/` |

模式 B 需改代码，见 [§8.2](#82-模式-b可选纯静态)。未改代码前**不要**按 README 旧描述期待 `out/` 目录。

---

## 3. 环境划分

| 环境 | 域名示例 | 数据库 | CMS | 数据 |
|---|---|---|---|---|
| dev | localhost | SQLite | 本机 :1337 | 本地样例 |
| staging | www-staging.example.edu | PostgreSQL（独立实例） | 内网 | **脱敏**内容 |
| prod | www.example.edu | PostgreSQL 生产 | 内网 | 生产内容 |

建议：staging 与 prod **隔离账号、密钥、存储桶、只读 Token**，禁止共用。

---

## 4. 网络与安全组

与 [README.md](./README.md) 原则一致，落地示例：

| 安全组 | 入站 | 出站 | 绑定资源 |
|---|---|---|---|
| `sg-web-origin` | 仅 CDN 回源 IP → 443；运维 IP → 22（或仅跳板） | 访问 CMS 内网 API、DNS、包源 | Nginx / 前台机 |
| `sg-cms` | VPN/跳板 → 22、443（Admin 内网入口）；`sg-web-origin` 与 `sg-ci` 子网 → 1337 或内网 443 | DB:5432、对象存储、DNS | CMS 机 |
| `sg-db` | 仅 CMS 子网 → 5432 | 无公网 | PostgreSQL |
| `sg-ci` | 无公网入站（或 runner 自管） | Git、CMS 内网 API、制品仓库、对象存储 | CI Runner |

**红线：**

1. CMS Admin（`/admin`）**不**对公网开放。  
2. PostgreSQL **不**对公网开放。  
3. 浏览器只访问前台域名，不持有写 Token。  
4. 构建/运行使用**只读** API Token。

---

## 5. 服务器与软件基线

### 5.1 建议规格（起步）

| 角色 | CPU | 内存 | 磁盘 | 备注 |
|---|---|---|---|---|
| web（Nginx + Next） | 2 vCPU | 4 GB | 40 GB SSD | 可与 CMS 分机 |
| cms | 2–4 vCPU | 4–8 GB | 40 GB + 上传盘 | uploads 独立盘更佳 |
| db | 2 vCPU | 4–8 GB | 100 GB SSD | 生产建议独立；开启自动备份 |

POC/小流量可将 web+cms 同机，**db 仍建议独立**或至少独立数据盘。

### 5.2 操作系统与运行时

- OS：Ubuntu 22.04 LTS / 24.04 LTS（或等价 RHEL 系，命令需替换）
- **Node.js：20.x LTS 或 22.x**（满足 Strapi engines `>=18 <=22`；**不要**用 Node 24 跑 CMS）
- npm：随 Node 安装的 LTS 版本
- Nginx：稳定版
- PostgreSQL：**14+**（推荐 15/16）
- 进程守护：systemd（推荐）或 PM2
- 可选：Certbot（公网证书）、fail2ban、云厂商监控 Agent

### 5.3 安装示例（Ubuntu）

```bash
# 系统更新
sudo apt update && sudo apt upgrade -y

# 基础工具
sudo apt install -y curl ca-certificates gnupg git build-essential nginx

# Node 20（示例：NodeSource，也可使用 nvm / 发行版包）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # 期望 v20.x
npm -v

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 时区
sudo timedatectl set-timezone Asia/Shanghai
```

---

## 6. 目录、用户与权限

建议专用系统用户与发布目录：

```bash
sudo useradd -r -m -s /bin/bash deploy
sudo mkdir -p /opt/campus-site/{frontend,cms,shared,releases,scripts}
sudo mkdir -p /var/lib/campus-cms/uploads
sudo mkdir -p /etc/campus-site
sudo chown -R deploy:deploy /opt/campus-site /var/lib/campus-cms
sudo chown root:deploy /etc/campus-site
sudo chmod 750 /etc/campus-site
```

推荐布局：

```text
/opt/campus-site/
  frontend/
    current -> releases/frontend/<version>
    releases/frontend/<version>/
  cms/
    current -> releases/cms/<version>
    releases/cms/<version>/
  shared/
    env/                 # 可选：非密钥配置片段
  scripts/
    smoke.sh
    rollback-frontend.sh
    backup-db.sh

/etc/campus-site/
  frontend.env           # 权限 640，owner root:deploy
  cms.env

/var/lib/campus-cms/
  uploads/               # Strapi public/uploads 挂载或软链目标
```

原则：**密钥与 env 放在 release 目录外**，发布切换软链不影响密钥文件。

---

## 7. PostgreSQL 部署

### 7.1 创建库与用户

```bash
sudo -u postgres psql <<'SQL'
CREATE USER strapi WITH PASSWORD 'REPLACE_WITH_STRONG_PASSWORD';
CREATE DATABASE strapi OWNER strapi;
GRANT ALL PRIVILEGES ON DATABASE strapi TO strapi;
\c strapi
GRANT ALL ON SCHEMA public TO strapi;
SQL
```

### 7.2 监听与访问控制

```bash
# postgresql.conf
listen_addresses = '内网IP或localhost'

# pg_hba.conf（示例：仅 CMS 机）
# host  strapi  strapi  10.0.1.0/24  scram-sha-256
```

```bash
sudo systemctl restart postgresql
```

### 7.3 备份（最低要求）

每日全量 + WAL 归档，保留 ≥ 30 天（与 deploy/README 一致）。

```bash
# 示例：逻辑备份
pg_dump -U strapi -h 127.0.0.1 -Fc strapi > /backup/strapi-$(date +%F).dump
```

生产请使用云 RDS 自动备份或 pgBackRest 等方案；定期做**恢复演练**。

---

## 8. CMS（Strapi 5）部署

### 8.1 代码获取与构建

```bash
sudo -u deploy bash -lc '
set -e
VERSION=$(date +%Y%m%d%H%M%S)
ROOT=/opt/campus-site/cms/releases/$VERSION
mkdir -p "$ROOT"
# 从制品库或 git 检出 cms 子目录到 $ROOT
cd "$ROOT"
npm ci --omit=dev
# 生产构建 Admin 与服务
npm run build
ln -sfn /var/lib/campus-cms/uploads "$ROOT/public/uploads"
ln -sfn /opt/campus-site/cms/releases/$VERSION /opt/campus-site/cms/current
'
```

> 若 CI 已产出完整 `node_modules` + `dist` 制品，可跳过服务器上 `npm ci`/`build`，仅解压并切软链。

### 8.2 环境变量（`/etc/campus-site/cms.env`）

```bash
# /etc/campus-site/cms.env  （chmod 640）
NODE_ENV=production
HOST=127.0.0.1
PORT=1337

# 强随机密钥：可用 openssl rand -base64 32 生成多个
APP_KEYS=key1,key2,key3,key4
JWT_SECRET=...
ADMIN_JWT_SECRET=...
API_TOKEN_SALT=...
TRANSFER_TOKEN_SALT=...
WEBHOOK_SECRET=...

DATABASE_CLIENT=postgres
DATABASE_HOST=10.0.2.10
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=...
DATABASE_SSL=false

# 若公网域名仅给前台，CMS 用内网域名
# PUBLIC_URL=https://cms.internal.example.edu
```

**密钥轮换注意：** 修改 `API_TOKEN_SALT` / JWT 相关盐会令既有 Token 失效，需在 Admin 重建只读 Token 并同步到前台/CI。

### 8.3 systemd 单元

```ini
# /etc/systemd/system/campus-cms.service
[Unit]
Description=Campus Site Strapi CMS
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/opt/campus-site/cms/current
EnvironmentFile=/etc/campus-site/cms.env
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=5
# 安全加固（按发行版能力调整）
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now campus-cms
sudo systemctl status campus-cms
```

健康检查：

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:1337/_health
# 或
curl -sS http://127.0.0.1:1337/api/site-setting
```

### 8.4 CMS 内网 Nginx（可选，仅 VPN/跳板）

```nginx
# /etc/nginx/sites-available/cms-internal.conf
server {
    listen 443 ssl http2;
    server_name cms.internal.example.edu;

    # ssl_certificate ...;
    # ssl_certificate_key ...;

    # 可选：IP allow 列表 / mTLS

    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:1337;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8.5 首次上线运营步骤

1. 启动 CMS 后访问内网 `https://cms.internal.../admin` 创建**首个管理员**（强密码、MFA 若有）。  
2. 确认内容类型 schema 已加载（article / notice / banner / department / faculty-profile / page / site-setting）。  
3. **Settings → API Tokens** 创建 **Read-only** Token，记录到密钥库；**禁止** Full access 给前台。  
4. 配置 Roles & Permissions：公开角色仅必要 read（若使用 Public 权限模型）；优先用 API Token。  
5. 录入站点设置、轮播、样例新闻/通知。  
6. 上传目录权限：`deploy` 用户可写 `/var/lib/campus-cms/uploads`。  
7. 将只读 Token 写入 `frontend.env` 与 CI secrets。

### 8.6 上传与媒体

- POC 默认本地 `public/uploads`；生产建议：
  - **独立数据盘** 挂载到 uploads，或  
  - **S3 兼容对象存储**（通过 Strapi upload provider，需额外配置插件，当前 POC 未内置）
- 备份 uploads 与 DB **同一 RPO 策略**；跨区域复制保留 ≥ 30 天。

---

## 9. 前台（Next.js 16）部署

### 9.1 模式 A（推荐）：Node 进程

#### 环境变量 `/etc/campus-site/frontend.env`

```bash
NODE_ENV=production
PORT=3000
HOSTNAME=127.0.0.1

# 服务端请求 CMS（内网地址，带 /api 前缀，与 .env.example 一致）
CMS_API_URL=https://cms.internal.example.edu/api
# 或 http://10.0.1.20:1337/api

CMS_API_TOKEN=REPLACE_READONLY_TOKEN
```

> 当前 `lib/cms.ts` 在服务端/构建期用上述变量拉取数据；Token 勿下发浏览器、勿写入 `NEXT_PUBLIC_*`。

#### 构建与发布

```bash
sudo -u deploy bash -lc '
set -e
VERSION=$(date +%Y%m%d%H%M%S)
ROOT=/opt/campus-site/frontend/releases/$VERSION
mkdir -p "$ROOT"
# 同步 frontend 源码或 CI 制品到 $ROOT
cd "$ROOT"
set -a; source /etc/campus-site/frontend.env; set +a
npm ci
npm run build
ln -sfn "$ROOT" /opt/campus-site/frontend/current
'
```

**说明：** 构建期会访问 CMS；CMS 不可达或 Token 无效时，`lib/cms.ts` 逻辑会导致**构建失败**（有意设计，避免上线残缺站点）。CI/发布机须能访问 CMS 内网 API。

#### systemd

```ini
# /etc/systemd/system/campus-frontend.service
[Unit]
Description=Campus Site Next.js Frontend
After=network.target

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/opt/campus-site/frontend/current
EnvironmentFile=/etc/campus-site/frontend.env
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now campus-frontend
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
```

#### Nginx（公网或 CDN 回源）

```nginx
# /etc/nginx/sites-available/campus-web.conf
# 安全头与 Next 应用层 headers 可双端并存；若冲突以统一清单为准
limit_req_zone $binary_remote_addr zone=web_limit:10m rate=20r/s;

upstream campus_next {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name www.example.edu;

    # ssl_certificate /etc/ssl/.../fullchain.pem;
    # ssl_certificate_key /etc/ssl/.../privkey.pem;

    # 若仅 CDN 回源：allow CDN IP; deny all;

    client_max_body_size 10m;
    limit_req zone=web_limit burst=40 nodelay;

    # 兜底安全头（与 frontend/lib/security-headers.ts 对齐）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Frame-Options "DENY" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    location /_next/static/ {
        proxy_pass http://campus_next;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://campus_next;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
    }
}

server {
    listen 80;
    server_name www.example.edu;
    return 301 https://$host$request_uri;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/campus-web.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 9.2 模式 B（可选纯静态）

仅在必须对象存储 + CDN 静态托管时使用：

1. 在 `frontend/next.config.ts` 启用 `output: "export"`。  
2. **移除** `withSecurityHeaders`（或改写为空），因静态导出与自定义 `headers()` 不兼容。  
3. 在 CDN/Nginx 注入与 `security-headers.ts` **等价** 的响应头。  
4. `npm run build` 生成 `out/`，同步到对象存储并刷新 CDN。  
5. 注意：当前动态路由 `generateStaticParams` 在 POC 中可能返回空数组，纯静态下详情页需预生成或改回 Node 模式。

**未完成上述改造前，生产请使用模式 A。**

---

## 10. CI/CD 与发布流水线

推荐流水线（与 deploy/README 一致，并按模式 A 细化）：

```text
checkout
  → install (npm ci / frozen lockfile)
  → lint / typecheck
  → security scan（依赖漏洞）
  → next build（注入 CMS_API_URL + 只读 Token，访问内网 CMS）
  → 打包 artifact（.next + 必要 node_modules 或 standalone 产物）
  → 上传至服务器 releases/<version>
  → 切换 current 软链
  → systemctl restart campus-frontend
  → smoke check
  → （可选）CDN 缓存刷新
  → 失败则自动/人工回滚上一版本
```

CMS 发布可独立流水线：`npm ci` → `npm run build` → 切软链 → `systemctl restart campus-cms` → health check。

### 10.1 冒烟检查脚本示例

```bash
#!/usr/bin/env bash
# /opt/campus-site/scripts/smoke.sh
set -euo pipefail
BASE="${1:-https://www.example.edu}"

check() {
  local path="$1" expect="${2:-200}"
  code=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE$path")
  test "$code" = "$expect" && echo "OK $path $code" || { echo "FAIL $path $code"; exit 1; }
}

check "/"
check "/news"
check "/notices"
# 按实际路由补充 about / faculty 等

# 安全头抽检
curl -sSI "$BASE/" | grep -qi "x-content-type-options: nosniff"
curl -sSI "$BASE/" | grep -qi "x-frame-options: DENY"
echo "smoke passed"
```

### 10.2 回滚

```bash
# 前台回滚到上一发布目录
cd /opt/campus-site/frontend/releases
# 列出版本后
sudo -u deploy ln -sfn /opt/campus-site/frontend/releases/<prev> /opt/campus-site/frontend/current
sudo systemctl restart campus-frontend
/opt/campus-site/scripts/smoke.sh
```

保留最近 **≥ 20** 个前台制品版本便于回滚。

---

## 11. 首次上线推荐顺序

1. 安全组与内网 DNS  
2. PostgreSQL 建库与备份策略  
3. 部署 CMS → 管理员 → 只读 Token → 基础内容  
4. 部署前台（模式 A）→ 本机 curl 通  
5. Nginx + 证书 +（可选）CDN  
6. 冒烟与安全头检查  
7. 监控告警接入  
8. 备份恢复演练  
9. 再对业务方开放内容录入

---

## 12. 安全清单（上线前）

- [ ] CMS / Admin / DB 不暴露公网  
- [ ] 前台仅只读 Token；无 `NEXT_PUBLIC` 泄露密钥  
- [ ] 生产 `APP_KEYS` / JWT / 盐均为强随机，且不在 Git  
- [ ] HTTPS 全站；HSTS 已开  
- [ ] CSP / XFO / nosniff / Referrer / Permissions-Policy 已生效  
- [ ] Nginx 限流、合理 `client_max_body_size`  
- [ ] SSH 密钥登录、禁用密码、fail2ban 或等价  
- [ ] 系统与 npm 依赖定期扫描  
- [ ] 日志脱敏（勿打印 Token）  
- [ ] 上传文件类型与大小限制（CMS + 网关）  
- [ ] 管理员最小权限、离职回收账号  
- [ ] Webhook 若启用须校验 `WEBHOOK_SECRET`

安全响应头参考实现：`frontend/lib/security-headers.ts`。

---

## 13. 监控与日志

| 对象 | 指标/日志 | 告警建议 |
|---|---|---|
| Nginx | 5xx 率、延迟、连接数 | 5xx > 阈值 |
| Next | 进程存活、RSS、重启次数 | 进程 down |
| Strapi | 存活、5xx、上传错误 | 进程 down / 错误飙升 |
| PostgreSQL | 连接数、磁盘、复制延迟 | 磁盘 > 80% |
| 证书 | 到期日 | < 14 天 |
| 备份 | 最近成功备份时间 | > 26h 无成功 |

日志路径建议：journald（systemd）+ Nginx access/error；集中到云日志服务。保留策略按等保/校内规范，建议 ≥ 180 天。

---

## 14. 备份与恢复

| 对象 | 频率 | 保留 | 恢复要点 |
|---|---|---|---|
| PostgreSQL | 每日全量 + WAL | ≥ 30 天 | 先恢复 DB 再启 CMS |
| 上传/对象存储 | 持续或每日同步 + 跨区域 | ≥ 30 天 | 与 DB 时间点尽量对齐 |
| 前台制品 | 每次发布 | 最近 20 版 | 切软链 + restart |
| env/密钥 | 密钥管理系统备份 | 按密管策略 | 勿明文进 Git |

恢复演练：至少每季度一次在 staging 完整走通。

---

## 15. 本地对照命令（非生产）

```bash
# CMS
cd cms
cp .env.example .env
npm install
npm run develop   # http://localhost:1337/admin

# 前台
cd frontend
cp .env.example .env.local
# CMS_API_URL=http://localhost:1337/api
# CMS_API_TOKEN=<只读 token>
npm install
npm run dev       # 默认 :3000；占用时可 next dev -p 3001
```

生产请使用 `npm run build` + `npm run start`（模式 A），而非 `develop`/`dev`。

---

## 16. 故障排查

| 现象 | 可能原因 | 处理 |
|---|---|---|
| `next build` 失败且日志含 CMS fetch | CMS 不可达 / Token 错 / 权限不足 | 检查内网连通、Token、API 权限 |
| 前台 200 但内容空 | 未发布内容 / 过滤条件不匹配 | Admin 检查 published 与 moderationStatus |
| 图片 404 | uploads 未挂载 / URL 主机错误 | 检查软链与 CMS 公网/内网 URL 配置 |
| CMS 无法启动 | Node 版本 >22 或 DB 连不上 | 换 Node 20/22；查 DATABASE_* 与 pg_hba |
| 安全头缺失 | 走了静态托管且未在边缘注入 | 回到模式 A 或在 CDN 补齐头 |
| Admin 公网被扫 | 误暴露 1337/443 | 立刻收紧安全组，轮换管理员密码与 Token |
| 上传失败 | 目录权限 / 磁盘满 | chown deploy；扩容 uploads 盘 |

```bash
# 常用诊断
sudo systemctl status campus-cms campus-frontend nginx
sudo journalctl -u campus-cms -n 100 --no-pager
sudo journalctl -u campus-frontend -n 100 --no-pager
curl -v http://127.0.0.1:1337/api/site-setting -H "Authorization: Bearer READ_ONLY_TOKEN"
curl -sSI https://www.example.edu/ | head -n 30
```

---

## 17. 配置与代码索引

| 路径 | 说明 |
|---|---|
| [frontend/package.json](../frontend/package.json) | Next 16.2.10；scripts: dev/build/start |
| [frontend/next.config.ts](../frontend/next.config.ts) | 安全头包装；export 已注释 |
| [frontend/lib/security-headers.ts](../frontend/lib/security-headers.ts) | HSTS/CSP 等 |
| [frontend/lib/cms.ts](../frontend/lib/cms.ts) | 只读拉取与映射；超时 15s、重试 2 |
| [frontend/.env.example](../frontend/.env.example) | `CMS_API_URL` / `CMS_API_TOKEN` |
| [cms/package.json](../cms/package.json) | engines Node ≥18 ≤22 |
| [cms/config/database.ts](../cms/config/database.ts) | sqlite / postgres 切换 |
| [cms/config/server.ts](../cms/config/server.ts) | HOST/PORT/APP_KEYS |
| [cms/config/admin.ts](../cms/config/admin.ts) | Admin JWT / API Token 盐 |
| [cms/.env.example](../cms/.env.example) | CMS 环境变量模板 |
| [deploy/README.md](./README.md) | 环境/安全组/流水线/备份摘要 |

---

## 18. 验收门禁（Definition of Done）

部署完成当且仅当：

1. 公网 HTTPS 可打开首页与主要栏目，冒烟脚本通过  
2. 安全响应头抽检通过  
3. CMS Admin 仅 VPN/跳板可访问  
4. 前台构建/运行使用只读 Token，浏览器网络面板无 CMS 写请求  
5. PostgreSQL 备份任务已启用且有一次成功记录  
6. 回滚演练：切回上一前台版本成功  
7. 监控对 CMS/前台/ Nginx 宕机有告警  
8. 密钥均在密钥库，仓库内无真实密钥

---

## 19. 附录：环境变量速查

### 前台

| 变量 | 必需 | 说明 |
|---|---|---|
| `CMS_API_URL` | 是 | 如 `https://cms.internal.example.edu/api` |
| `CMS_API_TOKEN` | 是（生产） | 只读 API Token |
| `PORT` | 否 | 默认 3000 |
| `NODE_ENV` | 是 | `production` |

### CMS

| 变量 | 必需 | 说明 |
|---|---|---|
| `APP_KEYS` | 是 | 逗号分隔多个密钥 |
| `JWT_SECRET` | 是 | Users-Permissions JWT |
| `ADMIN_JWT_SECRET` | 是 | Admin JWT |
| `API_TOKEN_SALT` | 是 | API Token 盐 |
| `TRANSFER_TOKEN_SALT` | 是 | Transfer Token 盐 |
| `DATABASE_CLIENT` | 是 | 生产 `postgres` |
| `DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD` | 生产是 | 连接信息 |
| `DATABASE_SSL` | 否 | 云库常为 true |
| `HOST` / `PORT` | 否 | 默认 0.0.0.0:1337；生产可 127.0.0.1:1337 |
| `WEBHOOK_SECRET` | 建议 | Webhook 签名 |

生成密钥示例：

```bash
openssl rand -base64 32
```

---

## 20. 变更记录

| 日期 | 说明 |
|---|---|
| 2026-07-19 | 首版：对齐 Next 16、禁用 export、模式 A/B、systemd/Nginx/PG 全流程 |

如云厂商（阿里云/腾讯云/华为云）或 K8s 落地细节需要专项附录，可在本文基础上按厂商安全组与 SLB 名词扩展，不改变上述隔离原则。
