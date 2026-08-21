#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SSH 连通性测试工具
====================
通过 SSH 连接到远程主机，执行一条简单命令以确认连接与认证均成功。

功能要点：
  - 使用密码方式登录
  - 区分「连接失败 / 认证错误 / 超时 / 协议错误 / 命令执行失败」等异常
  - 统一封装为 SSHConnectionError，便于调用方处理
  - 无论成功或失败都会安全关闭连接（finally 中 close）

依赖：pip install paramiko
"""

import os
import sys
import socket
from dataclasses import dataclass
from typing import Optional

import paramiko


class SSHConnectionError(Exception):
    """SSH 连接/测试相关错误的统一封装。"""


@dataclass
class SSHConfig:
    host: str
    port: int = 22
    username: str = "root"
    password: Optional[str] = None
    timeout: float = 10.0
    # 连通性测试命令：返回一行标识 + 系统基本信息
    command: str = "echo 'SSH_CONNECTION_OK'; uname -sn; uptime"


def connect_and_test(cfg: SSHConfig) -> str:
    """建立 SSH 连接并执行测试命令，成功返回命令输出，失败抛出 SSHConnectionError。"""
    client = paramiko.SSHClient()
    # 自动接受未知主机密钥。注意：生产环境建议使用 RejectPolicy 并预置 known_hosts，
    # 以避免中间人攻击。此处为连通性测试做了简化。
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    # 1) 建立连接
    try:
        client.connect(
            hostname=cfg.host,
            port=cfg.port,
            username=cfg.username,
            password=cfg.password,
            timeout=cfg.timeout,
            look_for_keys=False,   # 仅用密码，避免尝试本地密钥带来的额外耗时/报错
            allow_agent=False,     # 不向本机 ssh-agent 请求密钥
        )
    except paramiko.AuthenticationException as e:
        raise SSHConnectionError(
            f"认证失败：用户名或密码错误（{cfg.username}@{cfg.host}:{cfg.port}）"
        ) from e
    except paramiko.SSHException as e:
        raise SSHConnectionError(f"SSH 协议/握手错误：{e}") from e
    except socket.timeout:
        raise SSHConnectionError(
            f"连接超时：{cfg.host}:{cfg.port} 在 {cfg.timeout}s 内无响应"
        )
    except (socket.gaierror,) as e:
        raise SSHConnectionError(f"无法解析主机名：{cfg.host}（{e}）") from e
    except OSError as e:
        # 涵盖 ConnectionRefusedError / NetworkUnreachable / 通用 socket 错误等
        raise SSHConnectionError(f"网络/套接字错误：{e}") from e
    except Exception as e:
        raise SSHConnectionError(f"未知错误（{type(e).__name__}）：{e}") from e

    # 2) 连接已建立，执行连通性测试命令
    try:
        stdin, stdout, stderr = client.exec_command(cfg.command, timeout=cfg.timeout)
        exit_status = stdout.channel.recv_exit_status()
        out = stdout.read().decode("utf-8", errors="replace").strip()
        err = stderr.read().decode("utf-8", errors="replace").strip()

        if exit_status != 0:
            raise SSHConnectionError(
                f"命令执行失败（退出码 {exit_status}）：{err or '无错误输出'}"
            )
        return out
    except SSHConnectionError:
        raise
    except Exception as e:
        raise SSHConnectionError(f"命令执行异常（{type(e).__name__}）：{e}") from e
    finally:
        # 无论如何都关闭连接，避免句柄泄漏
        client.close()


def main() -> int:
    # ===== 连接信息（从环境变量读取，禁止硬编码密码） =====
    # 用法示例：
    #   export SSH_HOST=... SSH_USER=... SSH_PASSWORD=...
    #   python ssh_connect_test.py
    # 也可通过项目根目录 .env 文件提供（已被 .gitignore 忽略）
    host = os.environ.get("SSH_HOST", "")
    password = os.environ.get("SSH_PASSWORD", "")
    if not host or not password:
        print(
            "[-] 缺少连接信息：请设置环境变量 SSH_HOST / SSH_PORT / SSH_USER / SSH_PASSWORD",
            file=sys.stderr,
        )
        return 2

    cfg = SSHConfig(
        host=host,
        port=int(os.environ.get("SSH_PORT", "22")),
        username=os.environ.get("SSH_USER", "root"),
        password=password,
        timeout=10.0,
    )

    print(f"[*] 正在连接 {cfg.username}@{cfg.host}:{cfg.port} ...")
    try:
        result = connect_and_test(cfg)
        print("[+] 连接成功，连通性测试结果：")
        print("-" * 48)
        print(result)
        print("-" * 48)
        print("[+] 测试完成。")
        return 0
    except SSHConnectionError as e:
        print(f"[-] 连接/测试失败：{e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
