# 部署（最简版：纯静态站点）

架构与流程详见根目录 [AGENTS.md](../AGENTS.md) 与 [LOCAL_DEV.md](../LOCAL_DEV.md)。

## 组件

| 文件 | 用途 |
|---|---|
| `deploy_static.py` | 一键部署：本地构建 → 上传 out/ → 服务器切版本 → 装 Nginx 配置 → 验证 |
| `campus-static.conf` | Nginx 静态托管配置（含全套安全响应头、限流、缓存策略） |
| `harden_server.py` | 服务器安全加固（SSH 禁密码、fail2ban、备份 cron 等；2026-08-24 安全工作配套） |
| `ssh_exec.py` | 远程命令执行辅助（读根目录 `.env` 凭据） |
| `_test_harden_local.py` | harden_server.py 的本地单元测试 |

## 使用

```bash
# 0. 项目根目录建 .env（参照 .env.example）：
#    SSH_HOST / SSH_PORT / SSH_USER / SSH_KEY（推荐）或 SSH_PASSWORD
#    SITE_URL=https://zcmwxy.duckdns.org   # 可选，默认按域名

# 1. 日常发布（改完 frontend/content/*.json 或代码后）
python deploy/deploy_static.py

# 2. 首次从旧架构迁移时，顺带停用 Node 服务与旧反代
python deploy/deploy_static.py --shutdown-services

# 3. 回滚
# 服务器上：ln -sfn /var/www/campus-site/releases/<旧版本> /var/www/campus-site/current
```

## 服务器布局

```
/var/www/campus-site/
  releases/<时间戳>/   # 每次发布的完整静态产物（保留 20 版）
  current -> releases/<最新>
/etc/nginx/sites-enabled/campus-static.conf -> sites-available/campus-static.conf
```

## 安全基线

- 服务器只开 22（SSH 仅密钥）、80/443（Nginx）。旧服务（campus-cms / campus-frontend / PostgreSQL）迁移后停用。
- 安全响应头、限流在 `campus-static.conf` 统一注入。
- 内容为仓库内 JSON，发布即 git 提交记录，天然可审计可回滚。
