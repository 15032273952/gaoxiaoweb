#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
在远程主机上执行一条 shell 命令并回显输出（部署流程的通用远程执行器）。

用法:
    python ssh_exec.py "<命令>" [超时秒数]
退出码: 远程命令的退出码（连接失败则为 255）
"""
import sys
import paramiko

HOST = "186.241.89.117"
PORT = 22
USER = "root"
PASS = "f3OjV0su9AHi"


def main() -> int:
    if len(sys.argv) < 2:
        print("用法: python ssh_exec.py \"<命令>\" [超时秒数]", file=sys.stderr)
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
