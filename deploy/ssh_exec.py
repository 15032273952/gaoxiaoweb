#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
在远程主机上执行一条 shell 命令并回显输出（部署流程的通用远程执行器）。

用法:
    python ssh_exec.py "<命令>" [超时秒数]
退出码: 远程命令的退出码（连接失败则为 255）
"""
import os
import sys
import paramiko


def _load_dotenv():
    """自动加载项目根目录（脚本上级目录）的 .env（不存在则跳过；已设置的环境变量优先）。"""
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


_load_dotenv()

# 连接信息来源：环境变量 > 项目根目录 .env（.env 已被 .gitignore 忽略，密码不进 Git）
#   SSH_HOST / SSH_PORT / SSH_USER + SSH_KEY（私钥）或 SSH_PASSWORD（密码），密钥优先
HOST = os.environ.get("SSH_HOST", "")
PORT = int(os.environ.get("SSH_PORT", "22"))
USER = os.environ.get("SSH_USER", "root")
PASS = os.environ.get("SSH_PASSWORD", "") or None
KEY = os.environ.get("SSH_KEY", "") or None


def main() -> int:
    if len(sys.argv) < 2:
        print("用法: python ssh_exec.py \"<命令>\" [超时秒数]", file=sys.stderr)
        return 2
    if not HOST or not (KEY or PASS):
        print("[缺少连接信息] 请设置环境变量 SSH_HOST / SSH_PORT / SSH_USER / SSH_KEY（或 SSH_PASSWORD）", file=sys.stderr)
        return 2
    cmd = sys.argv[1]
    timeout = int(sys.argv[2]) if len(sys.argv) > 2 else 300

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(
            HOST, PORT, USER, PASS,
            key_filename=KEY,
            timeout=30, look_for_keys=False, allow_agent=False,
        )
    except Exception as e:
        print(f"[连接失败] {type(e).__name__}: {e}", file=sys.stderr)
        return 255

    try:
        stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
        out = stdout.read().decode("utf-8", errors="replace")
        err = stderr.read().decode("utf-8", errors="replace")
        rc = stdout.channel.recv_exit_status()
        if out:
            sys.stdout.write(out)
        if err.strip():
            sys.stderr.write("=== STDERR ===\n" + err)
        print(f"\n[远程退出码] {rc}", file=sys.stderr)
        return rc
    except Exception as e:
        print(f"[执行异常] {type(e).__name__}: {e}", file=sys.stderr)
        return 255
    finally:
        client.close()


if __name__ == "__main__":
    sys.exit(main())
