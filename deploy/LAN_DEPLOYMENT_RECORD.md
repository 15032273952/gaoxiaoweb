# 局域网部署实操记录（192.168.2.5）

> 记录时间：2026-07-19  
> 目标主机：`192.168.2.5:22`  
> 登录用户：`zcm`（具备 sudo）  
> 部署目录：`/home/zcm/campus-site`  
> 访问地址：http://192.168.2.5/  
> CMS Admin（仅本机）：http://127.0.0.1:1337/admin  
> 本文是**真实落地过程**，与通用方案 [SERVER_DEPLOYMENT.md](./SERVER_DEPLOYMENT.md) 配套。

---

## 1. 结论（当前状态）

| 项 | 结果 |
|---|---|
| 前台公网/局域网访问 | **成功** `http://192.168.2.5/` → HTTP 200 |
| 前台服务 | `campus-frontend.service` active，监听 `*:3000` |
| CMS 服务 | `campus-cms.service` active，监听 `127.0.0.1:1337`（不对外） |
| 反代 | Nginx `1.28.3` 监听 `0.0.0.0:80` → 反代到 `127.0.0.1:3000` |
| 安全头 | 已生效（HSTS/CSP/XFO/nosniff 等，由 Next 应用层注入） |
| 数据库 | SQLite（POC 单机）：`/home/zcm/campus-site/cms/database/data.db` |
| 样例内容 | 已初始化（站点设置/新闻/通知/机构/师资/单页等） |
| 管理员 | `admin@example.com` / 初始密码已从文档移除（**上线后务必修改**） |

从本机验证：

```text
http://192.168.2.5/       → 200
http://192.168.2.5/news   → 200
http://192.168.2.5/about  → 200
```

---

## 2. 目标机环境勘察

| 项 | 值 |
|---|---|
| 主机名 | `admin` |
| 系统 | Ubuntu 26.04 LTS（kernel 7.0.0-27-generic） |
| SSH | OpenSSH_10.2p1，端口 22 |
| 资源 | 4 vCPU / 6.1GiB RAM / 根盘约 19G（部署后仍可用约数 G，注意空间） |
| 初始状态 | 无 Node/Nginx/PostgreSQL；仅 22 端口对外 |
| 用户 | `zcm` 在 `sudo` 组，需密码 sudo |

### 2.1 关键障碍：系统时钟落后

- 勘察时系统时间约为 `2026-06-29`，而真实时间约为 `2026-07-19`。
- 导致 `apt-get update` 报 **Release file is not valid yet**，以及部分 HTTPS 源证书校验失败。
- 处理：从 `https://nodejs.org` 响应头 `Date` 强制校时并写 RTC。

```bash
# 已在目标机执行（摘要）
timedatectl set-ntp false
date -u -s "<HTTP Date from nodejs.org>"
hwclock --systohc
timedatectl set-ntp true
```

校时后 apt 正常。

---

## 3. 部署架构（本次落地）

```text
浏览器 ──HTTP:80──▶ Nginx(192.168.2.5)
                       │
                       ▼
                  Next.js :3000  (campus-frontend)
                       │ 只读 Token
                       ▼
                  Strapi 127.0.0.1:1337  (campus-cms)
                       │
                       ▼
                  SQLite data.db
```

选择说明：

1. **模式 A**（`next build` + `next start`），与仓库当前配置一致（`output: "export"` 已禁用）。  
2. **CMS 仅本机回环**，不暴露 1337 到局域网。  
3. **SQLite** 作为 POC 单机数据源（未装 PostgreSQL，降低首次落地复杂度；生产请切 PG）。  
4. **Node 22.22.1**（Ubuntu 源）；满足 Strapi engines `>=18 <=22`。

---

## 4. 分步操作记录

### 步骤 0：连通性

```powershell
# Windows 侧
ping 192.168.2.5
# TCP/22 可达；SSH banner: OpenSSH_10.2p1 Ubuntu
```

使用账号 `zcm` 登录（密码由用户提供，**勿写入仓库明文**；本文不记录明文密码）。

### 步骤 1：上传源码包

本地打包（排除 `node_modules` / `.next` / `data.db` 等）：

```text
D:\网络4\poc\_deploy_bundle.tar.gz  ≈ 147KB（源码）
```

远程解压：

```bash
mkdir -p ~/campus-site
tar -xzf ~/campus-site-bundle.tar.gz -C ~/campus-site
# 得到 cms/ frontend/ deploy/ bootstrap-cms.js README.md AGENTS.md
```

### 步骤 2：校时

见 §2.1。脚本：`/home/zcm/_fix_time.sh`（部署过程中上传）。

### 步骤 3：安装系统依赖

```bash
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nodejs npm nginx build-essential python3 ca-certificates curl git
```

实际版本：

| 软件 | 版本 |
|---|---|
| node | v22.22.1 |
| npm | 9.2.0 |
| nginx | 1.28.3 (Ubuntu) |

### 步骤 4：环境变量

`/home/zcm/campus-site/cms.env`（要点）：

```bash
NODE_ENV=production
HOST=127.0.0.1
PORT=1337
APP_KEYS=...
JWT_SECRET=...
ADMIN_JWT_SECRET=...
API_TOKEN_SALT=...
TRANSFER_TOKEN_SALT=...
WEBHOOK_SECRET=...
DATABASE_CLIENT=sqlite
```

`/home/zcm/campus-site/frontend.env`（要点）：

```bash
NODE_ENV=production
PORT=3000
HOSTNAME=127.0.0.1
CMS_API_URL=http://127.0.0.1:1337/api
CMS_API_TOKEN=<只读 API Token，256 字符>
```

systemd 的 `EnvironmentFile=` 指向上述文件。

### 步骤 5：构建 CMS

```bash
cd /home/zcm/campus-site/cms
npm install --omit=dev
npm run build   # strapi build 成功
```

说明：构建日志中有 `Config file not loaded ... *.js.map` 警告，可忽略（map 文件被误扫描，不影响运行）。

### 步骤 6：构建前台

```bash
cd /home/zcm/campus-site/frontend
npm install
# 注入 CMS_API_* 后
npm run build   # BUILD_DONE:0
```

构建期会访问 CMS；日志出现若干 `[cms] retry ...` 后仍完成静态页生成（14 路由）。

### 步骤 7：systemd 服务

单元文件：

- `/etc/systemd/system/campus-cms.service`  
  WorkingDirectory=`/home/zcm/campus-site/cms`  
  ExecStart=`/usr/bin/npm run start`

- `/etc/systemd/system/campus-frontend.service`  
  WorkingDirectory=`/home/zcm/campus-site/frontend`  
  ExecStart=`/usr/bin/npm run start`  
  After/Wants=`campus-cms.service`

```bash
systemctl daemon-reload
systemctl enable --now campus-cms campus-frontend
systemctl status campus-cms campus-frontend
```

### 步骤 8：Nginx 反代

`/etc/nginx/sites-available/campus-web.conf`：

- `listen 80`，`server_name 192.168.2.5 _`
- `/` 与 `/_next/static/` 反代到 `http://127.0.0.1:3000`
- 禁用 default site，启用 campus-web

```bash
nginx -t && systemctl restart nginx
```

### 步骤 9：CMS 初始化

1. 首次管理员注册 API：

```bash
curl -X POST http://127.0.0.1:1337/admin/register-admin \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"<强密码，勿写入文档>","firstname":"Campus","lastname":"Admin"}'
```

2. 创建只读 API Token：`frontend-readonly-*`，写入  
   `/home/zcm/campus-site/api-token.txt` 并同步到 `frontend.env`。

3. 录入样例内容（脚本 `/home/zcm/campus-site/init-content.js`）：
   - site-setting：站点名「高校官网演示站」
   - article：`welcome-2026`（已 publish）
   - notice：`schedule-notice`（已 publish）
   - banner / department / faculty-profile / page(about)

4. footerLinks 字段名为 **`href`**（不是 url），初始化时已按 schema 修正。

### 步骤 10：验收

在目标机：

```bash
systemctl is-active campus-cms campus-frontend nginx
# active active active

ss -lntp | grep -E ':80|:3000|:1337'
# 127.0.0.1:1337  node
# *:3000          next-server
# 0.0.0.0:80      nginx

curl -I http://127.0.0.1/
# HTTP/1.1 200 OK + 安全响应头
```

在部署机浏览器/脚本：

```text
http://192.168.2.5/  → 200，页面标题含「高校官网演示站」
```

---

## 5. 访问与运维入口

| 用途 | 地址 | 备注 |
|---|---|---|
| 官网前台 | http://192.168.2.5/ | 局域网 HTTP |
| Next 直连 | http://192.168.2.5:3000/ | 当前对所有网卡开放；可按需防火墙只留 80 |
| CMS Admin | 需 SSH 隧道 | 见下 |
| CMS API | 仅 127.0.0.1:1337 | 前台本机访问 |

**推荐通过 SSH 隧道管理后台（不把 1337 暴露到局域网）：**

```powershell
ssh -L 1337:127.0.0.1:1337 zcm@192.168.2.5
# 本机浏览器打开 http://127.0.0.1:1337/admin
```

管理员（POC 初始，**请立即修改**）：

- 邮箱：`admin@example.com`
- 密码：初始密码已从文档移除（2026-08-24 清理；真实凭据不入仓库）

---

## 6. 常用命令速查

```bash
# 状态
sudo systemctl status campus-cms campus-frontend nginx

# 日志
sudo journalctl -u campus-cms -f
sudo journalctl -u campus-frontend -f
sudo tail -f /var/log/nginx/error.log

# 重启
sudo systemctl restart campus-cms
sudo systemctl restart campus-frontend
sudo systemctl reload nginx

# 更新前台（示例）
cd /home/zcm/campus-site/frontend
# 同步新代码后：
set -a; source /home/zcm/campus-site/frontend.env; set +a
npm install
npm run build
sudo systemctl restart campus-frontend

# 更新 CMS
cd /home/zcm/campus-site/cms
npm install --omit=dev
npm run build
sudo systemctl restart campus-cms
```

---

## 7. 目录与文件清单（目标机）

```text
/home/zcm/campus-site/
  cms/                 # Strapi 源码 + node_modules + dist
  frontend/            # Next.js 源码 + node_modules + .next
  cms.env              # CMS 环境变量
  frontend.env         # 前台环境变量（含只读 Token）
  api-token.txt        # 只读 Token 备份
  init-content.js      # 内容初始化脚本
  deploy/              # 文档

/etc/systemd/system/campus-cms.service
/etc/systemd/system/campus-frontend.service
/etc/nginx/sites-available/campus-web.conf
/etc/nginx/sites-enabled/campus-web.conf  -> campus-web.conf
```

---

## 8. 问题与处理记录

| 问题 | 现象 | 处理 |
|---|---|---|
| 时钟落后 | apt Release not valid yet；部分 SSL 失败 | 强制 `date -u -s` + hwclock |
| nvm 安装失败 | git clone GitHub SSL 失败 | 改用 apt 安装 Node 22 |
| apt 锁占用 | Could not get lock | 等待后台 apt 结束后重试 |
| PowerShell 转义 | 内联 bash/`$()` 被本地解析 | 改用脚本文件 + paramiko 上传执行 |
| site-setting 校验失败 | footerLinks 缺 `href` | 字段改为 schema 定义的 `href` |
| 权限接口 | users-permissions 角色结构返回 0 个开关 | 依赖 **只读 API Token** 访问 API，前台构建/运行正常 |
| 本地命令超时 | Windows 侧长任务约 14s 超时 | 目标机 `nohup` 后台构建 + 短轮询 |

---

## 9. 安全与后续建议

1. **立即修改** SSH 密码与 CMS 管理员密码；考虑禁用密码登录改密钥。  
2. 防火墙建议：仅开放 `22`（限管理网段）与 `80`（或后续 443）；**不要**开放 `1337`。  
3. 可选：关闭 Next 对 `*:3000` 的监听，改为 `127.0.0.1:3000`（改 `HOSTNAME`/`PORT` 与 systemd 后重启）。  
4. 配置 HTTPS（内网可用自签或学校证书），并保留 HSTS 策略评估。  
5. 生产切换 PostgreSQL、对象存储 uploads、独立备份。  
6. 根盘约 19G，`cms`+`frontend` node_modules 已占约 1.4G+，注意清理日志与旧构建。  
7. 仓库/文档中**不要**提交真实 `CMS_API_TOKEN` 与服务器密码。

---

## 10. 回滚思路

```bash
# 停服务
sudo systemctl stop campus-frontend campus-cms

# 保留数据
cp /home/zcm/campus-site/cms/database/data.db ~/data.db.bak

# 如需卸站点
sudo rm -f /etc/nginx/sites-enabled/campus-web.conf
sudo systemctl reload nginx
sudo systemctl disable --now campus-frontend campus-cms
```

---

## 11. 变更记录

| 时间 | 事项 |
|---|---|
| 2026-07-19 | 完成 192.168.2.5 首次局域网部署（Nginx + Next16 + Strapi5 + SQLite） |

---

## 12. 与通用文档关系

- 通用生产规范：[`SERVER_DEPLOYMENT.md`](./SERVER_DEPLOYMENT.md)  
- 摘要：[`README.md`](./README.md)  
- 本文：记录**本机实操路径与已验证结果**，后续扩容/换 PG/上 CDN 时以通用文档为准，并在此追加修订节。
