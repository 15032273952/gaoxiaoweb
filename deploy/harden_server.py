#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
服务器一键安全加固脚本（配套 2026-08-24 安全评估执行）
================================================================
覆盖项（均幂等，可重复执行）：
  backup     备份 Nginx/sshd/cms.env 到 /root/hardening-backup-2026-08-24/
  nginx      /admin 公网拦截(404)、HTTP 80→301 HTTPS（保留 ACME 验证路径）、
             server_tokens off、隐藏 X-Powered-By、limit_req 限流 20r/s
  pg         轮换 PostgreSQL strapi 密码（随机 hex），同步 cms.env，重启并健康检查
  fail2ban   启用 sshd + nginx-botsearch jail（防 SSH 与 /admin 爆破）
  cert       验证 certbot 自动续期（renew --dry-run）与 systemd timer
  backupcron 每日 2:30 pg_dump 备份（保留 30 天）+ 每日 8:00 证书到期检查
  updates    安装启用 unattended-upgrades 自动安全更新
  ssh        SSH 加固（自保护）：密码登录时先部署本机公钥→密钥验证成功→
             才写 00-hardening.conf 禁密码；验证失败则跳过，绝不锁死

用法（凭据读项目根目录 .env，与 ssh_exec.py 相同）：
    python deploy/harden_server.py                 # 全部步骤
    python deploy/harden_server.py --dry-run       # 只探测现状 + 打印 nginx diff，不改配置
    python deploy/harden_server.py --only nginx,ssh

注意：脚本本身不含任何凭据；PG 新密码只在执行时打印一次，请自行记录。
"""
import os
import re
import sys
import difflib
import secrets
import argparse

import paramiko

HOME = os.path.expanduser("~")
LOCAL_KEY = os.path.join(HOME, ".ssh", "id_ed25519")
LOCAL_PUB = LOCAL_KEY + ".pub"
STAMP = "2026-08-24"
DOMAIN = "zcmwxy.duckdns.org"

RESULTS = []


def load_dotenv():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(root, ".env")
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip())


load_dotenv()

HOST = os.environ.get("SSH_HOST", "")
PORT = int(os.environ.get("SSH_PORT", "22"))
USER = os.environ.get("SSH_USER", "root")
PASS = os.environ.get("SSH_PASSWORD", "") or None
KEY = os.environ.get("SSH_KEY", "") or None


def log(tag, msg):
    print(f"[{tag}] {msg}", flush=True)


def record(name, ok, detail=""):
    RESULTS.append((name, ok, detail))
    log("OK" if ok else "FAIL", f"{name}{(' — ' + detail) if detail else ''}")


def connect(use_key=None):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    key_file = use_key if use_key is not None else KEY
    if key_file:
        client.connect(HOST, PORT, USER, key_filename=key_file,
                       timeout=30, look_for_keys=False, allow_agent=False)
    else:
        client.connect(HOST, PORT, USER, PASS,
                       timeout=30, look_for_keys=False, allow_agent=False)
    return client


def run(client, cmd, timeout=300):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    rc = stdout.channel.recv_exit_status()
    return rc, out, err


def sh(client, cmd, timeout=300):
    rc, out, err = run(client, cmd, timeout)
    return rc == 0, (out + ("\n[stderr] " + err if err.strip() else "")).strip()


def write_file(client, path, content, mode=None):
    sftp = client.open_sftp()
    with sftp.file(path, "w") as f:
        f.write(content)
    if mode:
        run(client, f"chmod {mode} {path}")
    sftp.close()


# ---------------------------------------------------------------- backup
def step_backup(client, dry=False):
    ok, out = sh(client, (
        f"mkdir -p /root/hardening-backup-{STAMP} && cd /root/hardening-backup-{STAMP} && "
        "cp -a /etc/nginx/nginx.conf . 2>/dev/null; "
        "cp -a /etc/nginx/sites-available . 2>/dev/null; "
        "cp -a /etc/nginx/sites-enabled . 2>/dev/null; "
        "cp -a /etc/ssh/sshd_config . 2>/dev/null; "
        "cp -a /etc/ssh/sshd_config.d . 2>/dev/null; "
        "cp -a /etc/campus-site/cms.env cms.env.bak 2>/dev/null; "
        "ls | tr '\\n' ' '"
    ))
    record("备份配置", ok or "sites" in out, f"/root/hardening-backup-{STAMP}/: {out.strip()[:100]}")


# ---------------------------------------------------------------- nginx
def _server_blocks(text):
    """返回顶层 server { ... } 块的 (start, end) 列表。"""
    blocks, i = [], 0
    while True:
        s = text.find("server {", i)
        if s == -1:
            break
        # 顶层判断：块开始行缩进不超过 4 空格（sites 文件里 server 顶格）
        line_start = text.rfind("\n", 0, s) + 1
        indent = s - line_start
        j = text.find("{", s)
        depth, k = 0, j
        end = -1
        while k < len(text):
            if text[k] == "{":
                depth += 1
            elif text[k] == "}":
                depth -= 1
                if depth == 0:
                    end = k + 1
                    break
            k += 1
        if end == -1:
            break
        if indent <= 4:
            blocks.append((s, end))
        i = end
    return blocks


def harden_nginx_text(text):
    """对 campus-web 配置做幂等加固，返回 (新文本, 是否有变化)。"""
    orig = text
    # http 级限流 zone（sites 文件被 include 进 http 上下文，可写 http 级指令）
    if "limit_req_zone" not in text:
        text = "limit_req_zone $binary_remote_addr zone=campus_web:10m rate=20r/s;\n\n" + text

    for s, e in reversed(_server_blocks(text)):
        block = text[s:e]
        listens_80 = re.search(r"listen[^;]*\s80[\s;]", block)
        if listens_80 and "return 301" not in block:
            # 80 块 → 精简 301（保留 listen/server_name/add_header 行）
            inner = block[block.index("{") + 1: block.rindex("}")]
            keep = [l.strip() for l in inner.splitlines()
                    if re.match(r"(listen|server_name|add_header)\b", l.strip())]
            new_block = ("server {\n"
                         + "".join(f"    {k}\n" for k in keep)
                         + "\n    location ^~ /.well-known/acme-challenge/ { root /var/www/html; }\n"
                         + f"    location / {{ return 301 https://$host$request_uri; }}\n"
                         + "}")
            text = text[:s] + new_block + text[e:]
            continue
        if listens_80:
            continue
        # 443 块加固（幂等）：admin 代理块改写为 404 + 逐项补齐其他指令
        modified = block
        if re.search(r"location\s+[^{]*\badmin\b[^{]*\{", modified):
            # 替换值必须与再次匹配结果一致（不带注释），保证幂等
            modified = re.sub(r"location\s+[^{]*\badmin\b[^{]*\{[^}]*\}",
                              "location /admin { return 404; }",
                              modified)
        insert = ""
        if "server_tokens off" not in modified:
            insert += "\n    server_tokens off;"
        if "proxy_hide_header X-Powered-By" not in modified:
            insert += "\n    proxy_hide_header X-Powered-By;"
        if "limit_req zone" not in modified:
            insert += "\n    limit_req zone=campus_web burst=40 nodelay;"
        if not re.search(r"location[^{]*\badmin\b", modified):
            insert += ("\n    # CMS 后台仅经 SSH 隧道访问，公网一律 404（2026-08-24 加固）"
                       "\n    location ^~ /admin { return 404; }")
        if insert:
            head = modified[: modified.index("{") + 1]
            modified = modified.replace(head, head + insert, 1)
        if modified != block:
            text = text[:s] + modified + text[e:]

    return text, text != orig


def step_nginx(client, dry=False):
    rc, out, _ = run(client, "grep -rl '127.0.0.1:3000' /etc/nginx/sites-enabled/ 2>/dev/null | head -1")
    target = out.strip().splitlines()[0] if out.strip() else ""
    if not target:
        record("Nginx 加固", False, "未找到反代 127.0.0.1:3000 的 sites-enabled 配置，请人工处理")
        return
    log("INFO", f"目标配置: {target}")
    sftp = client.open_sftp()
    with sftp.file(target) as f:
        text = f.read().decode("utf-8", errors="replace")
    sftp.close()

    new_text, changed = harden_nginx_text(text)
    if not changed:
        record("Nginx 加固", True, "配置已含全部加固项，无需修改")
        return
    diff = "\n".join(difflib.unified_diff(
        text.splitlines(), new_text.splitlines(),
        fromfile="before", tofile="after", lineterm=""))
    print(diff)
    if dry:
        record("[dry-run] Nginx 加固", True, "以上为将应用的 diff")
        return

    write_file(client, target, new_text)
    ok, out = sh(client, "nginx -t 2>&1 && systemctl reload nginx && echo RELOADED")
    if "RELOADED" not in out:
        # 回滚
        write_file(client, target, text)
        sh(client, "nginx -t 2>&1 && systemctl reload nginx")
        record("Nginx 加固并 reload", False, f"nginx -t 失败已回滚: {out.splitlines()[-1] if out else ''}")
        return
    record("Nginx 加固并 reload", True)
    _, out, _ = run(client, (
        f"sleep 1; echo admin=$(curl -sk -o /dev/null -w '%{{http_code}}' -H 'Host: {DOMAIN}' https://127.0.0.1/admin); "
        f"echo http80=$(curl -s -o /dev/null -w '%{{http_code}}' -H 'Host: {DOMAIN}' http://127.0.0.1/); "
        f"echo https=$(curl -sk -o /dev/null -w '%{{http_code}}' -H 'Host: {DOMAIN}' https://127.0.0.1/)"
    ))
    log("INFO", f"服务器本机验证: {out.strip().replace(chr(10), ' ')}（期望 admin=404, http80=301, https=200）")


# ---------------------------------------------------------------- pg
def step_pg(client, dry=False):
    if dry:
        record("[dry-run] PG 密码轮换", True, "将 ALTER USER + 同步 cms.env + 重启 campus-cms")
        return
    rc, out, _ = run(client, "sudo -u postgres psql -tAc \"SELECT 1 FROM pg_roles WHERE rolname='strapi'\"")
    if out.strip() != "1":
        record("PG 密码轮换", False, "未找到 strapi 角色（本机无 postgres?），跳过")
        return
    new_pw = secrets.token_hex(24)
    ok, out = sh(client, f"sudo -u postgres psql -c \"ALTER USER strapi WITH PASSWORD '{new_pw}';\"")
    if not ok:
        record("PG 修改密码", False, out)
        return
    record("PG 修改密码", True)
    ok, out = sh(client, f"sed -i 's|^DATABASE_PASSWORD=.*|DATABASE_PASSWORD={new_pw}|' /etc/campus-site/cms.env && grep -c '^DATABASE_PASSWORD=' /etc/campus-site/cms.env")
    record("同步 cms.env", ok, out.strip())
    ok, out = sh(client, "systemctl restart campus-cms && sleep 10 && curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:1337/_health", timeout=120)
    record("重启 campus-cms 并健康检查", ok and out.strip() in ("200", "204"), f"/_health={out.strip()}")
    ok, out = sh(client, f"curl -sk -o /dev/null -w '%{{http_code}}' -H 'Host: {DOMAIN}' https://127.0.0.1/")
    record("前台 HTTPS 验证", ok and out.strip() == "200", f"状态码={out.strip()}")
    print("\n" + "=" * 62)
    print(f"  新 PostgreSQL strapi 密码（仅此一次显示，请立即记录）：\n  {new_pw}")
    print("=" * 62 + "\n")


# ---------------------------------------------------------------- fail2ban
FAIL2BAN_JAIL = """\
# 由 harden_server.py 写入（2026-08-24）
[sshd]
enabled = true
maxretry = 5
bantime = 1h
findtime = 10m

[nginx-botsearch]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 1h
"""


def step_fail2ban(client, dry=False):
    if dry:
        record("[dry-run] fail2ban", True, "将安装并启用 sshd + nginx-botsearch jail")
        return
    ok, out = sh(client, "DEBIAN_FRONTEND=noninteractive apt-get install -y fail2ban 2>&1 | tail -1", timeout=420)
    if not ok:
        record("fail2ban 安装", False, out)
        return
    record("fail2ban 安装", True)
    write_file(client, "/etc/fail2ban/jail.local", FAIL2BAN_JAIL)
    ok, out = sh(client, "systemctl enable --now fail2ban 2>&1; systemctl restart fail2ban && sleep 3 && fail2ban-client status")
    record("fail2ban 启用", "sshd" in out, out.replace("\n", " | ")[:120])


# ---------------------------------------------------------------- certbot
def step_cert(client, dry=False):
    if dry:
        record("[dry-run] certbot", True, "将验证 renew --dry-run 与 timer")
        return
    _, out, _ = run(client, "systemctl list-timers --no-pager 2>/dev/null | grep -i certbot || echo NO_TIMER")
    log("INFO", f"certbot timer: {out.strip()}")
    ok, out = sh(client, "certbot renew --dry-run 2>&1 | tail -3", timeout=300)
    record("certbot 自动续期验证", ok and ("success" in out.lower() or "no renewals" in out.lower()),
           out.replace("\n", " | ")[:150])


# ---------------------------------------------------------------- backup cron
BACKUP_SH = """\
#!/usr/bin/env bash
# 每日备份 PostgreSQL strapi 库 + uploads，保留 30 天（harden_server.py 2026-08-24）
set -euo pipefail
BACKUP_DIR=/var/backups/campus-site
mkdir -p "$BACKUP_DIR"
STAMP=$(date +%F)
sudo -u postgres pg_dump -Fc strapi > "$BACKUP_DIR/strapi-$STAMP.dump"
if [ -d /opt/campus-site/cms/public/uploads ]; then
  tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C /opt/campus-site/cms/public uploads
fi
find "$BACKUP_DIR" -name 'strapi-*.dump' -mtime +30 -delete
find "$BACKUP_DIR" -name 'uploads-*.tar.gz' -mtime +30 -delete
echo "backup done: $STAMP"
"""

CERT_CHECK_SH = """\
#!/usr/bin/env bash
# TLS 证书到期检查：剩余 <14 天时写告警日志（harden_server.py 2026-08-24）
for cert in /etc/letsencrypt/live/*/fullchain.pem; do
  [ -f "$cert" ] || continue
  END=$(openssl x509 -enddate -noout -in "$cert" | cut -d= -f2)
  LEFT=$(( ($(date -d "$END" +%s) - $(date +%s)) / 86400 ))
  [ "$LEFT" -lt 14 ] && echo "$(date '+%F %T') [WARN] $cert expires in ${LEFT} days" >> /var/log/campus-cert-check.log
done
exit 0
"""


def step_backupcron(client, dry=False):
    if dry:
        record("[dry-run] 备份 cron", True, "将部署 backup-db.sh + cert-check.sh + crontab")
        return
    sh(client, "mkdir -p /opt/campus-site/scripts /var/backups/campus-site")
    write_file(client, "/opt/campus-site/scripts/backup-db.sh", BACKUP_SH, mode="755")
    write_file(client, "/opt/campus-site/scripts/cert-check.sh", CERT_CHECK_SH, mode="755")
    ok, out = sh(client, "/opt/campus-site/scripts/backup-db.sh && ls -la /var/backups/campus-site/ | tail -2", timeout=180)
    record("备份脚本部署并试运行", ok, out.replace("\n", " | ")[:120])
    ok, out = sh(client, (
        '(crontab -l 2>/dev/null | grep -v "campus-site/scripts"; '
        'echo "30 2 * * * /opt/campus-site/scripts/backup-db.sh >> /var/log/campus-backup.log 2>&1"; '
        'echo "0 8 * * * /opt/campus-site/scripts/cert-check.sh") | crontab - && crontab -l | grep campus'
    ))
    record("crontab（每日 2:30 备份 / 8:00 证书检查）", ok, out.replace("\n", " | ")[:120])


# ---------------------------------------------------------------- updates
def step_updates(client, dry=False):
    if dry:
        record("[dry-run] unattended-upgrades", True, "将安装并启用自动安全更新")
        return
    ok, out = sh(client, "DEBIAN_FRONTEND=noninteractive apt-get install -y unattended-upgrades 2>&1 | tail -1", timeout=420)
    ok2, out2 = sh(client, "systemctl is-enabled unattended-upgrades 2>&1")
    record("unattended-upgrades 自动安全更新", ok and "enabled" in out2, (out + " " + out2).strip()[:120])


# ---------------------------------------------------------------- ssh
def step_ssh(client, dry=False):
    if dry:
        record("[dry-run] SSH 加固", True, "将（必要时部署密钥→验证）→ 禁密码认证")
        return
    via_key = bool(KEY)
    if not via_key:
        # 当前是密码登录：部署公钥并验证，失败则不动 sshd 配置
        if not (os.path.exists(LOCAL_KEY) and os.path.exists(LOCAL_PUB)):
            log("INFO", f"本机无密钥对，生成 {LOCAL_KEY}")
            if os.system(f'ssh-keygen -t ed25519 -N "" -f "{LOCAL_KEY}" -q') != 0:
                record("SSH 加固（生成密钥）", False, "ssh-keygen 失败")
                return
        with open(LOCAL_PUB) as f:
            pub = f.read().strip()
        ok, out = sh(client, (
            'mkdir -p /root/.ssh && chmod 700 /root/.ssh && touch /root/.ssh/authorized_keys && '
            f'grep -qF "{pub}" /root/.ssh/authorized_keys || echo "{pub}" >> /root/.ssh/authorized_keys; '
            'chmod 600 /root/.ssh/authorized_keys && echo KEYDEPLOYED'
        ))
        if "KEYDEPLOYED" not in out:
            record("SSH 加固（部署公钥）", False, out)
            return
        record("部署公钥到服务器", True)
        try:
            t = connect(use_key=LOCAL_KEY)
            t.close()
            record("密钥登录验证", True)
        except Exception as e:
            record("密钥登录验证", False, f"{type(e).__name__}: {e} —— 已跳过禁密码，请人工排查")
            return
    else:
        record("当前即密钥登录", True, "可直接禁密码")

    write_file(client, "/etc/ssh/sshd_config.d/00-hardening.conf",
               "# 仅密钥登录（harden_server.py 2026-08-24）\n"
               "# 00- 前缀保证优先于 cloud-init 的 50-cloud-init.conf（sshd 首见生效）\n"
               "PasswordAuthentication no\n"
               "KbdInteractiveAuthentication no\n"
               "PermitRootLogin prohibit-password\n")
    ok, out = sh(client, "sshd -t 2>&1 && systemctl reload sshd && echo SSHD_RELOADED")
    if "SSHD_RELOADED" not in out:
        record("SSH 禁密码", False, out)
        return
    record("SSH 禁密码并 reload", True)
    try:
        t = connect(use_key=LOCAL_KEY if not via_key else None)
        t.close()
        record("禁密码后密钥登录复验", True)
    except Exception as e:
        record("禁密码后密钥登录复验", False, f"{type(e).__name__}: {e} —— 请立即检查 /etc/ssh/sshd_config.d/00-hardening.conf")
    if PASS and not via_key:
        try:
            b = connect()  # 无 KEY 时走密码
            b.close()
            record("密码登录应被拒", False, "密码仍可登录，检查 cloud-init 覆盖")
        except paramiko.AuthenticationException:
            record("密码登录应被拒", True, "服务器已拒绝密码认证")


# ---------------------------------------------------------------- main
STEPS = {
    "backup": ("备份配置", step_backup),
    "nginx": ("Nginx 加固（/admin 拦截、301、限流、隐藏版本）", step_nginx),
    "pg": ("PostgreSQL 密码轮换", step_pg),
    "fail2ban": ("fail2ban", step_fail2ban),
    "cert": ("certbot 续期验证", step_cert),
    "backupcron": ("每日备份 + 证书监控", step_backupcron),
    "updates": ("自动安全更新", step_updates),
    "ssh": ("SSH 仅密钥登录", step_ssh),
}


def main():
    ap = argparse.ArgumentParser(description="服务器一键安全加固")
    ap.add_argument("--dry-run", action="store_true", help="只探测与打印 diff，不修改")
    ap.add_argument("--only", default="", help="逗号分隔步骤名: " + ",".join(STEPS))
    args = ap.parse_args()

    if not HOST or not (KEY or PASS):
        print("[缺少连接信息] 请在项目根目录 .env 配置 SSH_HOST/SSH_USER + SSH_KEY 或 SSH_PASSWORD", file=sys.stderr)
        return 2
    if PASS and not KEY:
        print("[提示] 密码登录：脚本会先部署密钥并验证成功后才禁密码，不会锁死。", file=sys.stderr)

    try:
        client = connect()
    except Exception as e:
        print(f"[连接失败] {type(e).__name__}: {e}", file=sys.stderr)
        return 255

    print(f"=== 已连接 {USER}@{HOST}（dry-run={args.dry_run}）===\n")
    only = [s.strip() for s in args.only.split(",") if s.strip()]
    try:
        for name, (desc, fn) in STEPS.items():
            if only and name not in only:
                continue
            print(f"\n----- {desc} -----")
            try:
                fn(client, args.dry_run)
            except Exception as e:
                record(desc, False, f"{type(e).__name__}: {e}")
    finally:
        client.close()

    print("\n=== 加固结果汇总 ===")
    fail = sum(1 for _, ok, _ in RESULTS if not ok)
    for name, ok, detail in RESULTS:
        print(f" {'✓' if ok else '✗'} {name}" + (f" — {detail[:120]}" if detail else ""))
    print(f"\n完成：{len(RESULTS) - fail} 成功 / {fail} 失败")
    print(f"回滚参考：/root/hardening-backup-{STAMP}/")
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
