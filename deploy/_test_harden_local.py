#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""harden_server.py 的本地单元测试：验证 nginx 配置加固函数与整体语法。"""
import sys
import importlib.util

spec = importlib.util.spec_from_file_location("hs", "deploy/harden_server.py")
hs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(hs)

# 模拟服务器上推断的实际配置（80 反代 + 443 反代含 /admin 代理）
SIM = """
server {
    listen 443 ssl http2;
    server_name zcmwxy.duckdns.org;
    ssl_certificate /etc/letsencrypt/live/x/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/x/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    location /admin {
        proxy_pass http://127.0.0.1:1337;
        proxy_set_header Host $host;
    }
}

server {
    listen 80;
    server_name zcmwxy.duckdns.org;
    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
"""

new, changed = hs.harden_nginx_text(SIM)
assert changed, "应检测到变化"

checks = {
    "限流 zone 注入": "limit_req_zone" in new.split("server")[0],
    "443 server_tokens": "server_tokens off;" in new,
    "443 隐藏 X-Powered-By": "proxy_hide_header X-Powered-By;" in new,
    "443 limit_req": "limit_req zone=campus_web burst=40 nodelay;" in new,
    "admin 块改写为 404": "location /admin { return 404; }" in new,
    "原 admin 代理被移除": "proxy_pass http://127.0.0.1:1337" not in new,
    "80 块 301": "return 301 https://$host$request_uri;" in new,
    "80 块保留 ACME": "acme-challenge" in new,
    "443 证书配置保留": "ssl_certificate /etc/letsencrypt/live/x/fullchain.pem;" in new,
    "443 反代保留": "proxy_pass http://127.0.0.1:3000;" in new,
    "80 块 proxy_pass 已移除": new.count("proxy_pass") == 1,
}
failed = [k for k, v in checks.items() if not v]
for k, v in checks.items():
    print(f" {'PASS' if v else 'FAIL'}  {k}")

# 幂等性：二次加固不应再变化
new2, changed2 = hs.harden_nginx_text(new)
checks["幂等（二次无变化）"] = not changed2
print(f" {'PASS' if not changed2 else 'FAIL'}  幂等（二次无变化）")

# 无 /admin 代理的变体：应插入 ^~ /admin
SIM2 = SIM.replace("""
    location /admin {
        proxy_pass http://127.0.0.1:1337;
        proxy_set_header Host $host;
    }
""", "")
new3, changed3 = hs.harden_nginx_text(SIM2)
ok_insert = "location ^~ /admin { return 404; }" in new3
print(f" {'PASS' if ok_insert else 'FAIL'}  无 admin 代理时插入 ^~ /admin")

if failed or changed2 or not ok_insert:
    print("\n--- 加固后配置 ---")
    print(new)
    sys.exit(1)
print("\n全部通过")
