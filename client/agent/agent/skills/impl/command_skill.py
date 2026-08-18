# -*- coding: utf-8 -*-
"""
万能命令行执行技能

基于 builtin.py 中的 run_command 工具,
增强为更强大、更安全的命令行执行能力,
支持超时控制、工作目录、环境变量、命令黑名单过滤等。
"""
import os
import sys
import json
import shlex
import signal
import subprocess
import threading
from typing import Optional, List, Dict, Any
from langchain_core.tools import tool

from ..base import ToolSkill


# ===== 安全限制 =====

# 禁止执行的危险命令片段 (黑名单)
_DANGEROUS_CMDS = [
    "rm -rf /", "rm -rf /*", "format ", "mkfs.", "dd if=",
    ">:*", ">&", "fdisk", "shutdown", "reboot", "init 0", "init 6",
    "chmod 777 /", "chown", "mv / ", "wget http", "curl -o",
    ":(){ :|:& };:",  # fork 炸弹
    "rd /s /q", "rmdir /s /q", "del /f /s",
    "reg delete", "regedit",
]

# 禁止执行的文件扩展名
_DANGEROUS_EXTENSIONS = [".exe", ".com", ".bat", ".cmd", ".ps1", ".vbs", ".msi"]

# 默认超时(秒)
_DEFAULT_TIMEOUT = 30
_MAX_TIMEOUT = 300


def _is_dangerous(command: str) -> Optional[str]:
    """检查命令是否包含危险操作, 返回危险描述或 None"""
    cmd_lower = command.lower().strip()

    # 检查黑名单关键字
    for dangerous in _DANGEROUS_CMDS:
        if dangerous in cmd_lower:
            return f"命令包含危险操作: {dangerous}"

    # 检查是否试图直接执行危险文件
    first_word = cmd_lower.split()[0] if cmd_lower.split() else ""
    # 去除路径部分
    cmd_name = os.path.basename(first_word)
    for ext in _DANGEROUS_EXTENSIONS:
        if cmd_name.endswith(ext):
            return f"不允许直接执行 {ext} 文件, 请使用适当的解释器运行"

    return None


@tool
def run_command(
    command: str,
    timeout: int = 30,
    work_dir: str = "",
    env_vars: Optional[Dict[str, str]] = None,
) -> str:
    """
    执行系统命令行指令, 支持超时、工作目录和环境变量。

    跨平台兼容: Windows/Linux/Mac 均可用 shell=True 执行管道/重定向/链式操作。
    注意: 交互式命令(需要实时输入的)不支持, 如 Windows 的 date、set /p。
    复杂逻辑建议用 run_script("python", code) 代替管道链式。

    参数:
        command:  要执行的命令字符串
        timeout:  超时秒数, 默认30秒, 最大300秒
        work_dir: 工作目录路径, 默认为当前目录
        env_vars: 环境变量字典(可选), 如 {"MY_VAR": "value"}

    返回命令的标准输出(stdout)和标准错误(stderr)。
    Warning: 禁止执行破坏性命令(删除、格式化、关机等)。
    """
    # ----- 安全检查 -----
    danger = _is_dangerous(command)
    if danger:
        return f"[安全拦截] {danger}\n命令已被阻止执行。"

    # ----- 参数校验 -----
    timeout = min(max(timeout, 1), _MAX_TIMEOUT)

    # ----- 准备执行环境 -----
    env = os.environ.copy()
    if env_vars:
        env.update(env_vars)

    # ----- 构造执行参数 -----
    cwd = None
    if work_dir:
        cwd = os.path.abspath(work_dir)
        if not os.path.isdir(cwd):
            return f"工作目录不存在: {work_dir}"

    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
            cwd=cwd,
            env=env,
            # stdin 指向 DEVNULL, 防止交互式命令(如 date)卡住等待输入导致超时
            stdin=subprocess.DEVNULL,
        )

        # ----- 格式化输出 -----
        output_parts = []

        if result.stdout:
            output_parts.append("[stdout]")
            output_parts.append(result.stdout.rstrip())

        if result.stderr:
            output_parts.append("[stderr]")
            output_parts.append(result.stderr.rstrip())

        # 无输出但有返回码
        if not output_parts:
            if result.returncode == 0:
                output_parts.append("(命令执行成功, 无输出)")
            else:
                output_parts.append(f"(命令执行失败, 返回码: {result.returncode})")

        # 附加返回码信息
        if result.returncode != 0:
            output_parts.append(f"\n返回码: {result.returncode}")

        return "\n".join(output_parts)

    except subprocess.TimeoutExpired:
        return (
            f"[超时] 命令执行超过 {timeout} 秒, 已强制终止。\n"
            f"如需更长时间, 请设置 timeout 参数(最大{_MAX_TIMEOUT}秒)。\n"
            f"提示: 部分交互式命令(如 date、set /p)不支持在工具中运行, 因为无法提供实时输入。"
        )
    except FileNotFoundError as e:
        return f"[错误] 找不到命令: {e}"
    except PermissionError as e:
        return f"[权限错误] 没有执行权限: {e}"
    except OSError as e:
        return f"[系统错误] 执行失败: {e}"
    except Exception as e:
        return f"[执行错误] {type(e).__name__}: {str(e)}"


@tool
def run_script(
    language: str,
    code: str,
    timeout: int = 30,
) -> str:
    """
    执行一段脚本代码(如Python、JavaScript、Lua等), 自动处理临时文件和环境。

    参数:
        language: 脚本语言, 支持 python / node / lua / lua53 / lua54
        code:     要执行的脚本代码内容
        timeout:  超时秒数, 默认30秒, 最大300秒

    示例:
        run_script("python", "print('hello world')")
        run_script("node", "console.log('hello')")
    """
    timeout = min(max(timeout, 1), _MAX_TIMEOUT)

    # 语言到解释器映射
    _INTERPRETERS = {
        "python": sys.executable or "python",
        "node": "node",
        "lua": "lua",
        "lua53": "lua5.3",
        "lua54": "lua5.4",
    }

    interpreter = _INTERPRETERS.get(language.lower())
    if not interpreter:
        return (
            f"不支持的脚本语言: {language}\n"
            f"支持的语言: {', '.join(_INTERPRETERS.keys())}"
        )

    try:
        result = subprocess.run(
            [interpreter, "-c", code],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
            stdin=subprocess.DEVNULL,
        )

        output_parts = []
        if result.stdout:
            output_parts.append(result.stdout.rstrip())
        if result.stderr:
            output_parts.append(f"[stderr]\n{result.stderr.rstrip()}")
        if not output_parts:
            if result.returncode == 0:
                output_parts.append("(脚本执行成功, 无输出)")
            else:
                output_parts.append(f"(脚本执行失败, 返回码: {result.returncode})")

        return "\n".join(output_parts)

    except subprocess.TimeoutExpired:
        return f"[超时] 脚本执行超过 {timeout} 秒, 已强制终止。"
    except FileNotFoundError:
        return (
            f"[错误] 找不到解释器: {interpreter}\n"
            f"请确保已安装并配置了环境变量。"
        )
    except Exception as e:
        return f"[执行错误] {type(e).__name__}: {str(e)}"


class CommandSkill(ToolSkill):
    m_name = "shell"
    m_description = "万能命令行执行技能, 支持运行系统命令和各种脚本语言"
    m_version = "1.0.0"
    m_author = "小鱼"
    m_tags = ["shell", "command", "script", "system"]

    m_instructions = """
## 万能命令行技能 (CommandSkill)

提供两个强大的命令行执行工具:

### 1. run_command
- 执行任意系统命令(支持管道、重定向、链式操作)
- 参数:
  - `command`: 命令字符串 (必填)
  - `timeout`: 超时秒数, 默认30, 最大300 (可选)
  - `work_dir`: 工作目录 (可选)
  - `env_vars`: 环境变量字典 (可选)
- 自动拦截危险命令(rm -rf、格式化、关机等)
- 返回 stdout 和 stderr

### 2. run_script
- 直接执行一段脚本代码
- 支持语言: python / node / lua / lua53 / lua54
- 参数:
  - `language`: 脚本语言 (必填)
  - `code`: 脚本源码 (必填)
  - `timeout`: 超时秒数 (可选)

### 使用规则
- 简单的单行命令用 run_command
- 需要逻辑判断、循环、复杂处理时用 run_script("python", code)
- 执行结果检查返回码: 0=成功, 非0=失败
- 涉及敏感操作(网络下载、git操作等)需要在对话中先征求用户同意
- 禁止执行的命令类型: 磁盘格式化、系统关机重启、删除系统文件、修改注册表
"""

    def get_tools(self):
        return [run_command, run_script]
