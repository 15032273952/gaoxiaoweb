#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
静态站点一键部署脚本（最简版架构）
================================================================
流程：
  1. 本地构建：SITE_URL 注入后 npm run build 生成 frontend/out/
  2. 打包上传：out/ → tar.gz → SFTP → 服务器 /tmp
  3. 服务器：解压到 /var/www/campus-site/releases/<版本>，切换 current 软链
  4. 安装 Nginx 静态托管配置（campus-static.conf，含安全响应头）
  5. 验证 HTTPS 200 与安全头
  6. 可选（--shutdown-services）：停用 campus-frontend/campus-cms 服务与旧反代

用法（凭据读项目根目录 .env，与 ssh_exec.py 相同）：
    python deploy/deploy_static.py                     # 构建+部署
    python deploy/deploy_static.py --skip-build        # 跳过本地构建（out/ 已存在）
    python deploy/deploy_static.py --shutdown-services # 部署后停用旧 Node 服务
回滚：ln -sfn /var/www/campus-site/releases/<上一版本> /var/www/campus-site/current
"""
import os
import sys
import argparse
import subprocess
import time

import paramiko

DOMAIN = "zcmwxy.duckdns.org"
STAMP = time.strftime("%Y%m%d%H%M%S")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND = os.path.join(ROOT, "frontend")
OUT_DIR = os.path.join(FRONTEND, "out")
TARBALL = os.path.join(FRONTEND, f"out-{STAMP}.tar.gz")
REMOTE_ROOT = "/var/www/campus-site"


def load_dotenv():
    path = os.path.join(ROOT, ".env")
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip())


def sh(cmd, cwd=None):
    print(f"[local] {cmd}")
    return subprocess.run(cmd, shell=True, cwd=cwd).returncode == 0


def main():
    global DOMAIN
    load_dotenv()
    host = os.environ.get("SSH_HOST", "")
    port = int(os.environ.get("SSH_PORT", "22"))
    user = os.environ.get("SSH_USER", "root")
    key = os.environ.get("SSH_KEY", "") or None
    password = os.environ.get("SSH_PASSWORD", "") or None
    site_url = os.environ.get("SITE_URL", f"https://{DOMAIN}")

    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-build", action="store_true", help="跳过本地构建")
    ap.add_argument("--shutdown-services", action="store_true",
                    help="部署后停用 campus-frontend / campus-cms（最简版无需 Node 服务）")
    args = ap.parse_args()

    if not host or not (key or password):
        print("[缺少连接信息] 请在项目根目录 .env 配置 SSH_HOST/SSH_USER + SSH_KEY 或 SSH_PASSWORD", file=sys.stderr)
        return 2

    # 1. 本地构建
    if not args.skip_build:
        env = dict(os.environ, SITE_URL=site_url)
        print(f"[local] 构建（SITE_URL={site_url}）")
        rc = subprocess.run("npm run build", shell=True, cwd=FRONTEND, env=env).returncode
        if rc != 0:
            print("[构建失败]", file=sys.stderr)
            return 1
    if not os.path.isdir(OUT_DIR):
        print(f"[缺少产物] {OUT_DIR} 不存在，请先构建（去掉 --skip-build）", file=sys.stderr)
        return 1

    # 2. 打包
    if not sh(f'tar -czf "{TARBALL}" -C "{FRONTEND}" out'):
        print("[打包失败]", file=sys.stderr)
        return 1
    size_mb = os.path.getsize(TARBALL) / 1024 / 1024
    print(f"[local] 打包完成 {size_mb:.1f} MB")

    # 3. 连接并上传
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port, user, password, key_filename=key,
                       timeout=30, look_for_keys=False, allow_agent=False)
    except Exception as e:
        print(f"[连接失败] {type(e).__name__}: {e}", file=sys.stderr)
        return 255

    def run(cmd, timeout=300):
        _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
        out = stdout.read().decode("utf-8", errors="replace")
        err = stderr.read().decode("utf-8", errors="replace")
        return stdout.channel.recv_exit_status(), out, err

    try:
        sftp = client.open_sftp()
        print("[upload] 上传产物…")
        sftp.put(TARBALL, "/tmp/campus-out.tar.gz")
        conf_local = os.path.join(os.path.dirname(os.path.abspath(__file__)), "campus-static.conf")
        sftp.put(conf_local, "/tmp/campus-static.conf")
        sftp.close()

        # 4. 服务器：发布目录 + 软链
        rc, out, err = run(
            f"mkdir -p {REMOTE_ROOT}/releases && "
            f"rm -rf {REMOTE_ROOT}/releases/{STAMP} && "
            f"mkdir -p {REMOTE_ROOT}/releases/{STAMP} && "
            f"tar -xzf /tmp/campus-out.tar.gz -C {REMOTE_ROOT}/releases/{STAMP} --strip-components=1 && "
            f"ln -sfn {REMOTE_ROOT}/releases/{STAMP} {REMOTE_ROOT}/current && "
            f"echo RELEASED"
        )
        print("[server]", out.strip() or err.strip())
        if "RELEASED" not in out:
            print("[发布失败]", err, file=sys.stderr)
            return 1

        # 保留最近 20 个版本
        run(f"cd {REMOTE_ROOT}/releases && ls -1 | head -n -20 | xargs -r rm -rf")

        # 5. 安装 Nginx 静态配置（幂等）
        rc, out, err = run(
            "cp /tmp/campus-static.conf /etc/nginx/sites-available/campus-static.conf && "
            "ln -sfn /etc/nginx/sites-available/campus-static.conf /etc/nginx/sites-enabled/campus-static.conf && "
            "nginx -t 2>&1 && systemctl reload nginx && echo NGINX_OK"
        )
        print("[server]", (out + err).strip()[:200])
        if "NGINX_OK" not in out:
            print("[Nginx 配置失败，已保留旧配置]", file=sys.stderr)
            return 1

        # 6. 停用旧 Node 服务（可选）
        if args.shutdown_services:
            rc, out, err = run(
                "systemctl disable --now campus-frontend campus-cms 2>&1; "
                "rm -f /etc/nginx/sites-enabled/campus-web.conf; "
                "nginx -t 2>&1 && systemctl reload nginx && echo SHUTDOWN_OK"
            )
            print("[server]", (out + err).strip()[:200])

        # 7. 验证
        rc, out, err = run(
            f"sleep 1; curl -sk -o /dev/null -w '%{{http_code}}' https://127.0.0.1/ -H 'Host: {DOMAIN}'; echo; "
            f"curl -skI https://127.0.0.1/ -H 'Host: {DOMAIN}' | grep -iE 'strict-transport|x-content-type' | head -2"
        )
        print("[verify]", out.strip())

        print(f"""
部署完成：
  版本：{STAMP}（{REMOTE_ROOT}/current）
  回滚：ln -sfn {REMOTE_ROOT}/releases/<旧版本> {REMOTE_ROOT}/current
  内容更新：编辑 frontend/content/*.json → git 提交 → 重新运行本脚本
""")
        return 0
    finally:
        client.close()
        try:
            os.remove(TARBALL)
        except OSError:
            pass


if __name__ == "__main__":
    sys.exit(main())
