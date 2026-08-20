## 架构文档

**[ARCHITECTURE.md](./ARCHITECTURE.md)**

# 部署配置样例


## 详细部署文档

完整服务器部署、发布、回滚与验收清单见：**[SERVER_DEPLOYMENT.md](./SERVER_DEPLOYMENT.md)**。\n\n局域网实操记录（192.168.2.5）：**[LAN_DEPLOYMENT_RECORD.md](./LAN_DEPLOYMENT_RECORD.md)**。

## 环境划分

| 环境 | 域名示例 | 数据 |
|---|---|---|
| dev | localhost | 本地 SQLite |
| staging | www-staging.example.edu | 脱敏内容 |
| prod | www.example.edu | 生产 |

## 安全组原则

- `sg-web-origin`: 仅允许 CDN 回源 IP
- `sg-cms`: 仅允许 VPN/跳板机 443/22
- `sg-db`: 仅允许 CMS 子网 5432
- `sg-ci`: 拉代码、访问 CMS 内网 API、推送静态产物

## 发布流水线

```
install (frozen lockfile) → lint/typecheck → security scan → next build → upload artifact → invalidate CDN → smoke check
```

## 备份策略

| 对象 | 频率 | 保留 |
|---|---|---|
| PostgreSQL | 每日全量 + WAL | ≥ 30 天 |
| 对象存储 | 跨区域复制 | ≥ 30 天 |
| 静态产物 | 最近 20 版本 | 便于回滚 |
