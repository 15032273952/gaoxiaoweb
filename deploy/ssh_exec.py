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

# 连接信息从环境变量读取（禁止硬编码密码）：
#   SSH_HOST / SSH_PORT / SSH_USER / SSH_PASSWORD
# 可写入项目根目录 .env 文件（已被 .gitignore 忽略）
HOST = os.environ.get("SSH_HOST", "")
PORT = int(os.environ.get("SSH_PORT", "22"))
USER = os.environ.get("SSH_USER", "root")
PASS = os.environ.get("SSH_PASSWORD", "")


def main() -> int:
    if len(sys.argv) < 2:
        print("用法: python ssh_exec.py \"<命令>\" [超时秒数]", file=sys.stderr)
        return 2
    if not HOST or not PASS:
        print("[缺少连接信息] 请设置环境变量 SSH_HOST / SSH_PORT / SSH_USER / SSH_PASSWORD", file=sys.stderr)
        return 2
    cmd = sys.argv[1]
    timeout = int(sys.argv[2]) if len(sys.argv) > 2 else 300

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(
            HOST, PORT, USER, PASS,
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
