#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gateway.py -- 跨平台(macOS / Linux / Windows)按实例起服

用法:
    python gateway.py                      # 交互菜单
    python gateway.py debug                # 默认 s1 单服
    python gateway.py debug --type 2 --server-id 2
    python gateway.py debug --type 3       # 小跨服
    python gateway.py debug --type 4       # 大跨服
    python gateway.py debug --type 5       # 除大跨服外全开
    python gateway.py debug --type 8       # 全部实例
    python gateway.py build/debug          # 实例目录支持相对仓库根或绝对路径
    ./gateway.sh [构建目录]                 # macOS / Linux
    gateway.bat [构建目录]                  # Windows

"""

import argparse
import atexit
import ctypes
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import threading
import time
from datetime import datetime


# ==============================================
# 常量
# ==============================================
# 是否 Windows 平台
IS_WINDOWS = os.name == "nt"

# 脚本所在目录, 即仓库根目录
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPT_PATH = os.path.abspath(__file__)

# 构建配置(实例根目录), 相对仓库根或绝对路径
DEFAULT_CONFIG = "debug"

# 需要链接到可执行文件目录的资源: (链接名, 仓库内相对路径)
LINK_DIRS = (
    ("config", "config"),
    ("luascript", "luascript"),
    ("dist", os.path.join("client", "webui", "dist")),
)

# 服务名
SERVER_DB = "dbserver"
SERVER_GLOBAL = "globalserver"
SERVER_LOGIC = "logicserver"
SERVER_GATEWAY = "gatewayserver"
SERVER_WEBUI = "webui"

# 前台跟随日志的服务, 以及日志文件名规则
FOLLOW_SERVER = SERVER_LOGIC
LOG_FILE_BASE = "server"
LOG_DATE_FORMAT = "%Y%m%d"

# 默认参数
DEFAULT_START_DELAY = 0.0        # dbserver/logicserver 之后等待多久再起 gatewayserver
DEFAULT_STOP_TIMEOUT = 30.0      # 单个服务退出的等待秒数
DEFAULT_TAIL_LINES = 0         # 首屏显示的历史日志行数
POLL_INTERVAL = 0.25             # 日志跟随与状态检查的轮询间隔
FORCE_KILL_WAIT = 5.0            # 强杀后等待退出的秒数
EXIT_WAIT_INTERVAL = 0.1         # 等待进程退出的轮询间隔

# Windows 进程创建标志: 后台独立运行, 不随主控制台关闭
DETACHED_PROCESS = 0x00000008
CREATE_NEW_PROCESS_GROUP = 0x00000200

# 可执行文件后缀与运行库目录
EXE_SUFFIX = ".exe" if IS_WINDOWS else ""
RUNTIME_LIBS_DIR = os.path.join(ROOT_DIR, "lib")

# 各进程运行需要的资源目录: (仓库内源路径, 实例内目标路径)
SERVICE_RESOURCES = {
    SERVER_LOGIC: [
        ("config/logicconfig", os.path.join("config", "logicconfig")),
        ("luascript", "luascript"),
    ],
    SERVER_GATEWAY: [
        (os.path.join("client", "webui", "dist"), "dist"),
    ],
}

# 日志里的 ANSI 颜色转义
ANSI_ESCAPE_PATTERN = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")

# 日志行格式: [时间][级别]消息, 级别是单字符
LOG_LEVEL_PATTERN = re.compile(r"^\[[^\]]*\]\[([DICWEF])\]")

# 终端颜色, 与 logmodule.cpp 的级别配色保持一致
COLOR_RESET = "\033[0m"
COLOR_GRAY = "\033[0;90m"
COLOR_RED = "\033[0;91m"
COLOR_GREEN = "\033[0;92m"
COLOR_YELLOW = "\033[0;93m"

# 日志级别 -> 颜色
LOG_LEVEL_COLORS = {
    "D": COLOR_GRAY,
    "I": COLOR_GREEN,
    "C": COLOR_GREEN,
    "W": COLOR_YELLOW,
    "E": COLOR_RED,
    "F": COLOR_RED,
}

# Windows 控制台相关常量
WINDOWS_STD_OUTPUT_HANDLE = -11
WINDOWS_STD_ERROR_HANDLE = -12
WINDOWS_ENABLE_VIRTUAL_TERMINAL = 0x0004
WINDOWS_CTRL_C_EVENT = 0
WINDOWS_STILL_ACTIVE = 259
WINDOWS_PROCESS_QUERY_LIMITED_INFORMATION = 0x1000

# 当前输出端是否支持颜色
_color_enabled = False


# ==============================================
# 基础输出与平台适配
# ==============================================
def colorize(text, color):
    """给整段文本包上颜色, 未开启颜色时原样返回."""
    if not _color_enabled or not color or not text:
        return text
    return color + text + COLOR_RESET


def colorize_log_line(line):
    """按日志级别给整行着色, 行尾换行符保持原样."""
    if not _color_enabled:
        return line
    body = line.rstrip("\r\n")
    match = LOG_LEVEL_PATTERN.match(body)
    if match is None:
        return line
    color = LOG_LEVEL_COLORS.get(match.group(1))
    if color is None:
        return line
    return color + body + COLOR_RESET + line[len(body):]


def print_line(message="", color=None):
    """打印一行并立即刷新, 终端被关闭时不抛异常."""
    try:
        sys.stdout.write(colorize(message, color) + "\n")
        sys.stdout.flush()
    except (OSError, ValueError):
        pass


def print_ok(message=""):
    """打印成功信息."""
    print_line(message, COLOR_GREEN)


def print_warn(message=""):
    """打印警告信息."""
    print_line(message, COLOR_YELLOW)


def print_error(message=""):
    """打印错误信息."""
    print_line(message, COLOR_RED)


def configure_console():
    """统一输出编码为 UTF-8, 并在 Windows 下打开 ANSI 颜色与 UTF-8 代码页."""
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure is None:
            continue
        try:
            reconfigure(encoding="utf-8", errors="replace")
        except (OSError, ValueError):
            pass

    global _color_enabled
    virtual_terminal_ready = configure_windows_console() if IS_WINDOWS else True
    _color_enabled = detect_color_support(virtual_terminal_ready)


def detect_color_support(virtual_terminal_ready):
    """只有输出到真实终端且支持 ANSI 转义时才上色, 避免重定向时写出乱码."""
    if os.environ.get("NO_COLOR") is not None:
        return False
    if not virtual_terminal_ready:
        return False
    try:
        return bool(sys.stdout.isatty())
    except (AttributeError, ValueError):
        return False


def configure_windows_console():
    """Windows: 切到 UTF-8 代码页并启用虚拟终端转义, 返回是否开启成功."""
    try:
        kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
    except (AttributeError, OSError):
        return False

    try:
        kernel32.SetConsoleOutputCP(65001)
        kernel32.SetConsoleCP(65001)
    except (AttributeError, OSError):
        pass

    try:
        # 显式声明类型, 否则 64 位句柄会被 ctypes 当作 int 截断, 调用必然失败
        kernel32.GetStdHandle.argtypes = [ctypes.c_uint32]
        kernel32.GetStdHandle.restype = ctypes.c_void_p
        kernel32.GetConsoleMode.argtypes = [ctypes.c_void_p, ctypes.POINTER(ctypes.c_uint32)]
        kernel32.GetConsoleMode.restype = ctypes.c_int
        kernel32.SetConsoleMode.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
        kernel32.SetConsoleMode.restype = ctypes.c_int
    except AttributeError:
        return False

    enabled = False
    # stdout 与 stderr 都开, 否则重定向其中一个时颜色会失效
    for std_handle in (WINDOWS_STD_OUTPUT_HANDLE, WINDOWS_STD_ERROR_HANDLE):
        try:
            handle = kernel32.GetStdHandle(std_handle)
            if not handle:
                continue
            mode = ctypes.c_uint32()
            if not kernel32.GetConsoleMode(handle, ctypes.byref(mode)):
                continue
            if kernel32.SetConsoleMode(handle, mode.value | WINDOWS_ENABLE_VIRTUAL_TERMINAL):
                enabled = True
        except (AttributeError, OSError):
            continue
    return enabled


def send_console_ctrl_c():
    """Windows: 向当前控制台的所有进程广播 Ctrl+C,

    CreateProcess 的子进程与本脚本共享同一个控制台, 广播后服务端
    std::signal(SIGINT) 的处理函数会收到信号, 走各自的退出流程.
    """
    try:
        kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
    except (AttributeError, OSError):
        return False

    # 广播会同时打到本进程, 先屏蔽自己的 SIGINT, 避免重复进入停止流程
    previous_handler = None
    try:
        previous_handler = signal.getsignal(signal.SIGINT)
        signal.signal(signal.SIGINT, signal.SIG_IGN)
    except (ValueError, OSError):
        previous_handler = None

    try:
        return bool(kernel32.GenerateConsoleCtrlEvent(WINDOWS_CTRL_C_EVENT, 0))
    except (AttributeError, OSError):
        return False
    finally:
        # 控制台事件是异步派发的, 等一小会儿再恢复自己的 SIGINT, 免得广播打到脚本自己身上
        time.sleep(0.3)
        if previous_handler is not None:
            try:
                signal.signal(signal.SIGINT, previous_handler)
            except (ValueError, OSError):
                pass


# ==============================================
# pid 文件与进程探测
# ==============================================
def pid_file_path(runlog_dir, name):
    return os.path.join(runlog_dir, name + ".pid")


def read_pid_file(runlog_dir, name):
    """读取 pid 文件, 内容非法时返回 None."""
    try:
        with open(pid_file_path(runlog_dir, name), "r", encoding="utf-8") as handle:
            return int(handle.read().strip())
    except (OSError, ValueError):
        return None


def write_pid_file(runlog_dir, name, pid):
    try:
        with open(pid_file_path(runlog_dir, name), "w", encoding="utf-8") as handle:
            handle.write(str(pid))
    except OSError:
        pass


def remove_pid_file(runlog_dir, name):
    try:
        os.remove(pid_file_path(runlog_dir, name))
    except OSError:
        pass


def is_pid_alive(pid):
    """判断 pid 是否存活; Windows 用 OpenProcess 避免进程号复用后的误判."""
    if not pid or pid <= 0:
        return False

    if IS_WINDOWS:
        try:
            kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
        except (AttributeError, OSError):
            return False
        handle = kernel32.OpenProcess(WINDOWS_PROCESS_QUERY_LIMITED_INFORMATION, False, pid)
        if not handle:
            return False
        try:
            exit_code = ctypes.c_ulong()
            if not kernel32.GetExitCodeProcess(handle, ctypes.byref(exit_code)):
                return False
            return exit_code.value == WINDOWS_STILL_ACTIVE
        finally:
            kernel32.CloseHandle(handle)

    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    except OSError:
        return False
    return True


def pid_matches_executable(pid, exe_path):
    """确认 pid 确实是目标可执行文件, 拿不到命令行时按匹配处理."""
    if IS_WINDOWS or not exe_path:
        return True
    try:
        result = subprocess.run(
            ["ps", "-p", str(pid), "-o", "command="],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            check=False,
        )
    except OSError:
        return True
    command = result.stdout.decode("utf-8", errors="replace")
    return os.path.basename(exe_path) in command


def executable_path(exe_dir, name):
    """可执行文件路径, Windows 带 .exe 后缀."""
    candidates = [os.path.join(exe_dir, name + ".exe"), os.path.join(exe_dir, name)]
    if not IS_WINDOWS:
        candidates.reverse()
    for candidate in candidates:
        if os.path.isfile(candidate):
            return candidate
    return candidates[0]


# ==============================================
# 目录链接
# ==============================================
def is_dir_link(path):
    """判断目录是否已是链接, Windows 的 junction 不走 os.path.islink."""
    if os.path.islink(path):
        return True
    if IS_WINDOWS and os.path.isdir(path):
        try:
            return os.path.realpath(path) != os.path.abspath(path)
        except OSError:
            return False
    return False


def is_empty_dir(path):
    try:
        return not os.listdir(path)
    except OSError:
        return False


def create_dir_link(link_path, target_path):
    """建目录链接: Windows 用 junction(不需要管理员权限), 其它平台用符号链接."""
    if IS_WINDOWS:
        try:
            result = subprocess.run(
                ["cmd", "/c", "mklink", "/J", link_path, target_path],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )
        except OSError:
            return False
        return result.returncode == 0
    try:
        os.symlink(target_path, link_path)
    except OSError:
        return False
    return True


# ==============================================
# 受管子进程
# ==============================================
class ManagedProcess:
    """一个受管子进程: 负责启动, 日志重定向, 停止与强杀."""

    def __init__(self, name, argv, working_dir, log_path, reuse_pid=None, env=None, detached=False):
        self.name = name
        self.argv = argv
        self.working_dir = working_dir
        self.log_path = log_path
        self.env = env
        self.detached = detached
        self.process = None
        self.pid = reuse_pid
        # 复用上一轮已在运行的进程, 它不在本脚本的进程组里, 只能对单个 pid 发信号
        self.reused = reuse_pid is not None
        self.log_handle = None

    def start(self):
        """启动子进程, 标准输出/错误重定向到 runlog/<name>.log."""
        if self.reused:
            return self.pid

        self.log_handle = open(self.log_path, "wb")
        popen_kwargs = {
            "cwd": self.working_dir,
            "stdin": subprocess.DEVNULL,
            "stdout": self.log_handle,
            "stderr": subprocess.STDOUT,
        }
        if self.env:
            popen_kwargs["env"] = self.env
        if IS_WINDOWS:
            if self.detached:
                # 后台模式: 脱离控制台, 主窗口关闭后继续运行
                popen_kwargs["creationflags"] = DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP
            else:
                # 子进程共享控制台, 键盘 Ctrl+C 能直接送达它们
                popen_kwargs["creationflags"] = 0
        else:
            # 独立会话: 子进程不直接收终端 SIGINT, 由本脚本按顺序统一发信号
            popen_kwargs["start_new_session"] = True

        self.process = subprocess.Popen(self.argv, **popen_kwargs)
        self.pid = self.process.pid
        return self.pid

    def is_alive(self):
        if self.process is not None:
            return self.process.poll() is None
        return is_pid_alive(self.pid)

    def stop(self, timeout, send_signal=True):
        """停止, 超时强杀; 返回进程最终是否已退出."""
        if not self.is_alive():
            self.release()
            return True

        print_line("  停止 %s (PID: %d) ..." % (self.name, self.pid))
        if send_signal:
            self.request_stop()
        if self.wait_exit(timeout):
            self.release()
            return True

        print_warn("  警告: %s 未在 %.0f 秒内退出, 强制结束" % (self.name, timeout))
        self.force_kill()
        exited = self.wait_exit(FORCE_KILL_WAIT)
        self.release()
        return exited

    def request_stop(self):
        """请求退出: POSIX 发 SIGTERM, Windows 由控制台广播覆盖."""
        if IS_WINDOWS or not self.pid:
            return
        self.signal_target(signal.SIGTERM)

    def force_kill(self):
        """强杀: Windows 结束整棵进程树, POSIX 发 SIGKILL."""
        if not self.pid:
            return

        if IS_WINDOWS:
            try:
                subprocess.run(
                    ["taskkill", "/F", "/T", "/PID", str(self.pid)],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    check=False,
                )
            except OSError:
                pass
            return

        self.signal_target(signal.SIGKILL)

    def signal_target(self, signal_value):
        """优先对整个进程组发信号以覆盖派生子进程, 拿不到安全的进程组时只打单个 pid."""
        process_group = self.safe_process_group()
        if process_group is not None:
            try:
                os.killpg(process_group, signal_value)
                return
            except (ProcessLookupError, OSError):
                pass
        try:
            os.kill(self.pid, signal_value)
        except (ProcessLookupError, OSError):
            pass

    def safe_process_group(self):
        """本脚本启动的进程自成会话; 复用进程只有自成进程组时才敢整组发信号."""
        if not self.pid:
            return None
        if not self.reused:
            return self.pid
        try:
            process_group = os.getpgid(self.pid)
            own_group = os.getpgid(0)
        except OSError:
            return None
        if process_group == self.pid and process_group != own_group:
            return process_group
        return None

    def wait_exit(self, timeout):
        """等待进程退出, 超时返回 False."""
        deadline = time.time() + max(timeout, 0.0)
        while time.time() < deadline:
            if not self.is_alive():
                return True
            time.sleep(EXIT_WAIT_INTERVAL)
        return not self.is_alive()

    def release(self):
        """回收日志句柄与进程状态, pid 文件由调用方删除."""
        if self.process is not None:
            try:
                self.process.poll()
            except OSError:
                pass
        if self.log_handle is not None:
            try:
                self.log_handle.close()
            except OSError:
                pass
            self.log_handle = None


# ==============================================
# 日志跟随
# ==============================================
def read_log_path_from_config(config_file, server_name):
    """从 config.json 的 LogPath 读取某个服务的日志目录."""
    try:
        with open(config_file, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, ValueError):
        return ""

    log_path = data.get("LogPath")
    if not isinstance(log_path, dict):
        return ""
    value = log_path.get(server_name)
    if not isinstance(value, str):
        return ""
    return value.strip()


def resolve_log_dir(exe_dir, config_files, server_name):
    """按 config.json 的 LogPath 算出某个服务的日志目录(只解析一次)."""
    log_dir = ""
    for config_file in config_files:
        log_dir = read_log_path_from_config(config_file, server_name)
        if log_dir:
            break

    if not log_dir:
        log_dir = os.path.join(".", "log", server_name)
    if not os.path.isabs(log_dir):
        log_dir = os.path.normpath(os.path.join(exe_dir, log_dir))
    return log_dir


def current_log_file(log_dir):
    """当天日志文件路径, 与 logmodule.cpp 的轮转命名(server + %Y%m%d + .log)一致."""
    file_name = LOG_FILE_BASE + datetime.now().strftime(LOG_DATE_FORMAT) + ".log"
    return os.path.join(log_dir, file_name)


class LogFollower:
    """跟随日志文件: 支持文件延迟创建, 文件被截断以及跨天轮转."""

    def __init__(self, resolve_path, tail_lines=DEFAULT_TAIL_LINES, strip_color=False):
        self.resolve_path = resolve_path
        self.tail_lines = max(tail_lines, 0)
        self.strip_color = strip_color
        self.current_path = ""
        self.offset = 0
        # 着色时缓存最后一段不完整的行, 等下一批数据补齐后再输出
        self.pending = ""

    def poll(self):
        """读取新增内容并输出, 每次轮询调用一次."""
        path = self.resolve_path()
        if path != self.current_path:
            self.current_path = path
            self.offset = 0
            self.pending = ""
            print_line("[gateway] 跟随日志: %s" % path)
            if not os.path.exists(path):
                print_line("[gateway] 日志文件还没生成, 等待服务写入 ...")
                return
            self.offset = self.tail_offset(path)

        if not os.path.exists(path):
            return

        try:
            size = os.path.getsize(path)
            # 文件被截断或重建时从头读
            if size < self.offset:
                self.offset = 0
            if size == self.offset:
                return
            with open(path, "rb") as handle:
                handle.seek(self.offset)
                data = handle.read()
                self.offset = handle.tell()
        except OSError:
            return

        self.emit(data)

    def tail_offset(self, path):
        """定位到末尾往前 tail_lines 行的位置, 首屏只显示最近的内容."""
        try:
            with open(path, "rb") as handle:
                handle.seek(0, os.SEEK_END)
                size = handle.tell()
                if self.tail_lines <= 0:
                    return size

                block_size = 64 * 1024
                position = size
                data = b""
                while position > 0 and data.count(b"\n") <= self.tail_lines:
                    step = min(block_size, position)
                    position -= step
                    handle.seek(position)
                    data = handle.read(step) + data

                lines = data.splitlines(keepends=True)
                if len(lines) > self.tail_lines:
                    data = b"".join(lines[-self.tail_lines:])
                return size - len(data)
        except OSError:
            return 0

    def emit(self, data):
        text = data.decode("utf-8", errors="replace")
        if self.strip_color:
            text = ANSI_ESCAPE_PATTERN.sub("", text)
        text = self.colorize(text)
        try:
            sys.stdout.write(text)
            sys.stdout.flush()
        except (OSError, ValueError):
            pass

    def colorize(self, text):
        """按日志级别逐行着色, 不完整的行留到下一批一起输出."""
        if self.strip_color or not _color_enabled:
            return text

        lines = (self.pending + text).split("\n")
        self.pending = lines.pop()
        if not lines:
            return ""
        return "".join(colorize_log_line(line) + "\n" for line in lines)


# ==============================================
# 起服器
# ==============================================
# 跨服场景服 server_id 分段, 与 share/share.hpp 保持一致
SMALL_CROSS_BEGIN = 42001
SMALL_CROSS_END = 42500
LARGE_CROSS_BEGIN = 42501
LARGE_CROSS_END = 42800


class InstanceTarget:
    """一个实例目录及其要启动的进程."""

    def __init__(self, name, path, services, server_id):
        self.name = name
        self.path = path
        self.services = services
        self.server_id = server_id

    @property
    def kind(self):
        if SERVER_GLOBAL in self.services:
            return "hub"
        if SMALL_CROSS_BEGIN <= self.server_id <= SMALL_CROSS_END:
            return "small_cross"
        if LARGE_CROSS_BEGIN <= self.server_id <= LARGE_CROSS_END:
            return "big_cross"
        return "normal"


def resolve_config_dir(variant):
    """实例根目录, 相对仓库根或绝对路径"""
    return variant if os.path.isabs(variant) else os.path.join(ROOT_DIR, variant)


def load_targets(variant):
    """从 config/crossconfig.json 读取实例清单."""
    blueprint_path = os.path.join(ROOT_DIR, "config", "crossconfig.json")
    if not os.path.isfile(blueprint_path):
        raise SystemExit("错误: 找不到实例清单 %s" % blueprint_path)

    with open(blueprint_path, "r", encoding="utf-8") as handle:
        blueprint = json.load(handle)

    targets = []
    for node in blueprint.get("nodes") or []:
        services = list(node.get("executables") or [])
        path = os.path.join(resolve_config_dir(variant), node["name"])
        targets.append(InstanceTarget(node["name"], path, services, int(node["server_id"])))
    return targets


def is_runtime_lib(name):
    """是否为需要随可执行文件分发的运行库"""
    lower = name.lower()
    return lower.endswith(".dll") or lower.endswith(".so") or lower.endswith(".dylib") or ".so." in lower


def file_changed(src, dst):
    """源文件比目标新或大小不同时视为有变更"""
    if not os.path.isfile(dst):
        return True
    try:
        src_stat = os.stat(src)
        dst_stat = os.stat(dst)
    except OSError:
        return True
    if src_stat.st_size != dst_stat.st_size:
        return True
    return src_stat.st_mtime > dst_stat.st_mtime + 1


def sync_file_if_changed(src, dst):
    if not file_changed(src, dst):
        return False
    try:
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
    except OSError:
        # 文件被运行中的进程占用时跳过, 下次启动再同步
        return False
    return True


def sync_dir_if_changed(src_dir, dst_dir):
    """递归同步目录, 返回是否有文件被更新(不删除目标多余文件)"""
    changed = False
    for root, _dirs, files in os.walk(src_dir):
        rel = os.path.relpath(root, src_dir)
        target_root = dst_dir if rel == "." else os.path.join(dst_dir, rel)
        for name in files:
            if sync_file_if_changed(os.path.join(root, name), os.path.join(target_root, name)):
                changed = True
    return changed


def read_instance_value(instance_path, section, key, default=None):
    """读取实例生效值: baseconfig 打底, 实例 config.json 覆盖"""
    value = default
    for path in (
        os.path.join(ROOT_DIR, "config", "baseconfig.json"),
        os.path.join(instance_path, "config", "config.json"),
    ):
        try:
            with open(path, "r", encoding="utf-8") as handle:
                data = json.load(handle)
        except (OSError, ValueError):
            continue
        section_data = data.get(section)
        if isinstance(section_data, dict) and key in section_data:
            value = section_data[key]
    return value


def select_targets(targets, menu_type, server_id, with_hub=False):
    """按菜单类型挑选要启动的实例."""
    normal = [target for target in targets if target.kind == "normal"]
    small_cross = [target for target in targets if target.kind == "small_cross"]
    big_cross = [target for target in targets if target.kind == "big_cross"]
    hub = [target for target in targets if target.kind == "hub"]

    if menu_type == 1:
        selected = normal[:1]
    elif menu_type == 2:
        selected = [
            target for target in normal
            if target.server_id == server_id or target.name == str(server_id)
        ][:1]
        if not selected:
            raise SystemExit("错误: 没有找到普通服 %s" % server_id)
    elif menu_type == 3:
        selected = small_cross[:1]
        if not selected:
            raise SystemExit("错误: 没有配置小跨服实例")
    elif menu_type == 4:
        selected = big_cross[:1]
        if not selected:
            raise SystemExit("错误: 没有配置大跨服实例")
    elif menu_type == 5:
        # 除大跨服外的全部实例
        selected = hub + normal + small_cross
    elif menu_type == 8:
        # 全部实例(含大跨服)
        selected = hub + normal + small_cross + big_cross
    else:
        raise SystemExit("错误: 未知的启动类型 %s" % menu_type)

    if not selected:
        raise SystemExit("错误: 没有可启动的实例, 请先运行 python generate_server.py")

    if with_hub and not any(target.kind == "hub" for target in selected):
        selected = hub + selected

    return selected


def print_menu(targets, webui_enabled=True, config=DEFAULT_CONFIG):
    normal = [target for target in targets if target.kind == "normal"]
    default_name = normal[0].name if normal else "-"
    print_line()
    print_line("=" * 56)
    print_line(" 服务器启动器")
    print_line(" 1. %s 单服 (默认)" % default_name)
    print_line(" 2. 指定普通服")
    print_line(" 3. 小跨服")
    print_line(" 4. 大跨服")
    print_line(" 5. 全部普通服 + 小跨服 + 中心服 (不含大跨服)")
    print_line(" 6. 停止已启动的服务")
    print_line(" 7. 切换前端 Vite (当前: %s)" % ("开启" if webui_enabled else "关闭"))
    print_line(" 8. 全部实例 (含大跨服)")
    print_line(" 9. 设置实例根目录 (当前: %s)" % config)
    print_line(" 0. 退出")
    print_line("=" * 56)


def prompt_choice(targets, webui_enabled=True, config=DEFAULT_CONFIG):
    """交互选择, 返回 (类型, 附加参数).

    类型 2 时附加参数是 server_id; 类型 9 时附加参数是要切换的目录(可能为 None)
    """
    print_menu(targets, webui_enabled, config)
    try:
        raw = input("请选择 [1]: ").strip()
    except (EOFError, KeyboardInterrupt):
        return 0, None

    if raw == "":
        return 1, None
    if raw in ("0", "6", "7"):
        return int(raw), None

    # 支持 "9 bin" 这种一行输入
    parts = raw.split(None, 1)
    if parts[0] == "9":
        return 9, (parts[1].strip() if len(parts) > 1 else None)

    try:
        menu_type = int(raw)
    except ValueError:
        raise SystemExit("错误: 请输入数字, 设置实例根目录用 9 <目录>")

    server_id = None
    if menu_type == 2:
        normal = [target for target in targets if target.kind == "normal"]
        print_line("可选普通服:")
        for target in normal:
            print_line("  %-6s %s" % (target.server_id, target.name))
        try:
            raw_id = input("请输入 server_id: ").strip()
        except (EOFError, KeyboardInterrupt):
            return 0, None
        try:
            server_id = int(raw_id)
        except ValueError:
            raise SystemExit("错误: 请输入数值 server_id")

    return menu_type, server_id


class Gateway:
    """按实例目录管理服务启停与日志跟随."""

    def __init__(self, args, targets):
        self.args = args
        self.targets = targets
        self.exe_dir = resolve_config_dir(args.config)
        self.runlog_dir = os.path.join(self.exe_dir, "runlog")
        self.stop_event = threading.Event()
        self.processes = {}
        self.log_windows = []
        self.detach = not getattr(args, "foreground", False)
        self.stopped = False
        self.logic_exit_warned = False

    def run(self):
        """主流程: 检查目录 -> 起服 -> 跟随日志, 退出时必定清理子进程."""
        self.prepare()
        self.start_all()
        self.start_log_windows()

        if self.detach:
            self.release_handles()
            print_line()
            print_ok("[gateway] 服务已在后台启动, 本窗口即将退出")
            print_line("[gateway] 停止服务: python gateway.py %s --stop" % self.args.config)
            return 0

        try:
            self.follow()
        finally:
            self.shutdown()
        return 0

    def release_handles(self):
        """后台模式: 只释放句柄, 不停止进程, 也不关闭日志窗口"""
        for managed in self.processes.values():
            managed.release()
        self.processes.clear()
        self.log_windows = []

    def prepare(self):
        if not os.path.isdir(self.exe_dir):
            raise SystemExit(
                "错误: 找不到实例根目录 %s\n"
                "      用 python gateway.py <目录> 指定, 或在菜单里选 9 设置实例根目录\n"
                "      部署实例目录: python generate_server.py --type 1"
                % self.exe_dir
            )

        missing = [target.name for target in self.targets if not os.path.isdir(target.path)]
        if missing:
            raise SystemExit(
                "错误: 实例目录不存在: %s\n      请先运行 python generate_server.py"
                % ", ".join(missing)
            )

        os.makedirs(self.runlog_dir, exist_ok=True)

        self.sync_resources()

        print_line("[gateway] 配置: %s" % self.args.config)
        for target in self.targets:
            print_line("[gateway] 实例: %-10s %s" % (target.name, ", ".join(target.services)))
        print_line()

    def sync_resources(self):
        """启动前同步 exe/运行库/配置/前端, 源有变化才覆盖"""
        changed = []
        for target in self.targets:
            changed.extend(self.sync_target(target))

        if changed:
            preview = ", ".join(changed[:6])
            if len(changed) > 6:
                preview += " ..."
            print_line("[sync] 已更新 %d 项: %s" % (len(changed), preview))
        else:
            print_line("[sync] 实例文件已是最新")

    def sync_target(self, target):
        changed = []

        # 可执行文件与调试符号
        for service in target.services:
            for suffix in (EXE_SUFFIX, ".pdb"):
                src = os.path.join(self.exe_dir, service + suffix)
                if not os.path.isfile(src):
                    continue
                if sync_file_if_changed(src, os.path.join(target.path, service + suffix)):
                    changed.append("%s/%s%s" % (target.name, service, suffix))

        # 运行库 (libmysql 等)
        if os.path.isdir(RUNTIME_LIBS_DIR):
            for name in sorted(os.listdir(RUNTIME_LIBS_DIR)):
                src = os.path.join(RUNTIME_LIBS_DIR, name)
                if not os.path.isfile(src) or not is_runtime_lib(name):
                    continue
                if sync_file_if_changed(src, os.path.join(target.path, name)):
                    changed.append("%s/%s" % (target.name, name))

        # 逻辑配置 / Lua / 前端产物
        for service in target.services:
            for src_rel, dst_rel in SERVICE_RESOURCES.get(service, []):
                src = os.path.join(ROOT_DIR, src_rel)
                if not os.path.isdir(src):
                    continue
                if sync_dir_if_changed(src, os.path.join(target.path, dst_rel)):
                    changed.append("%s/%s" % (target.name, dst_rel))

        return changed

    def start_log_windows(self):
        """Windows 下为每个逻辑服实例单独开一个日志窗口"""
        if not IS_WINDOWS or self.args.no_follow or self.args.follow_single:
            return False

        targets = [target for target in self.targets if SERVER_LOGIC in target.services]
        if not targets:
            return False
        if not self.detach and len(targets) <= 1:
            # 前台模式且只有一份日志时留在当前窗口
            return False

        opened = 0
        for target in targets:
            if self.open_log_window(target, SERVER_LOGIC):
                opened += 1

        if opened:
            print_ok("[gateway] 已为 %d 个逻辑服打开独立日志窗口" % opened)
            return True

        print_warn("[gateway] 警告: 打开日志窗口失败, 改为当前窗口跟随")
        return False

    def open_log_window(self, target, service):
        """启动一个独立控制台窗口跟随指定实例日志"""
        command = [
            sys.executable,
            SCRIPT_PATH,
            self.args.config,
            "--tail", target.name,
            "--tail-service", service,
        ]
        try:
            popen = subprocess.Popen(
                command,
                cwd=ROOT_DIR,
                creationflags=getattr(subprocess, "CREATE_NEW_CONSOLE", 0),
            )
        except OSError as error:
            print_error("[gateway] 打开 %s 日志窗口失败: %s" % (target.name, error))
            return False
        self.log_windows.append(popen)
        return True

    def start_all(self):
        """启动顺序: 中心服 -> 数据服 -> 逻辑服 -> 网关."""
        for target in self.targets:
            if SERVER_GLOBAL in target.services:
                self.start_service(target, SERVER_GLOBAL)

        for target in self.targets:
            if SERVER_DB in target.services:
                self.start_service(target, SERVER_DB)

        for target in self.targets:
            if SERVER_LOGIC in target.services:
                self.start_service(target, SERVER_LOGIC)

        if any(SERVER_GATEWAY in target.services for target in self.targets):
            print_line("[gateway] 等待 %.0f 秒后启动 gatewayserver ..." % self.args.start_delay)
            if not self.sleep_interruptible(self.args.start_delay):
                return
            for target in self.targets:
                if SERVER_GATEWAY in target.services:
                    self.start_service(target, SERVER_GATEWAY)

            if self.args.no_webui:
                print_line("[gateway] 未启动前端 Vite (菜单 7 或 --webui 可开启)")
            else:
                self.start_webui()

    def start_service(self, target, name):
        exe_path = executable_path(target.path, name)
        key = "%s/%s" % (target.name, name)
        if not os.path.isfile(exe_path):
            print_warn("[gateway] 警告: 找不到可执行文件 %s, 跳过" % exe_path)
            return None

        runlog_dir = os.path.join(target.path, "runlog")
        os.makedirs(runlog_dir, exist_ok=True)

        reused_pid = self.reclaim_pid(runlog_dir, name, exe_path)
        if reused_pid is not None:
            managed = ManagedProcess(key, None, target.path, "", reuse_pid=reused_pid, detached=self.detach)
            self.processes[key] = managed
            print_line("%s 已在运行 (PID: %d), 复用" % (key, reused_pid))
            return managed

        log_path = os.path.join(runlog_dir, name + ".log")
        managed = ManagedProcess(key, [exe_path], target.path, log_path, detached=self.detach)
        try:
            pid = managed.start()
        except OSError as error:
            managed.release()
            print_error("[gateway] 错误: 启动 %s 失败: %s" % (key, error))
            return None

        write_pid_file(runlog_dir, name, pid)
        self.processes[key] = managed
        print_ok("%s 启动 (PID: %d) 日志: %s" % (key, pid, os.path.join(target.name, "runlog", name + ".log")))
        return managed

    def start_webui(self):
        webui_dir = os.path.join(ROOT_DIR, "client", "webui")
        npm_path = shutil.which("npm")
        if not os.path.isdir(webui_dir) or not npm_path:
            print_line("[gateway] 跳过 webui (未找到 client/webui 目录或 npm 命令)")
            return None

        log_path = os.path.join(self.runlog_dir, SERVER_WEBUI + ".log")
        env = os.environ.copy()
        gateway_target = self.webui_gateway_target()
        if gateway_target:
            env["VITE_GATEWAY_URL"] = gateway_target
            print_line("[gateway] 前端代理目标: %s" % gateway_target)

        managed = ManagedProcess(SERVER_WEBUI, [npm_path, "run", "dev"], webui_dir, log_path, env=env, detached=self.detach)
        try:
            pid = managed.start()
        except OSError as error:
            managed.release()
            print_error("[gateway] 错误: 启动 webui 失败: %s" % error)
            return None

        write_pid_file(self.runlog_dir, SERVER_WEBUI, pid)
        self.processes[SERVER_WEBUI] = managed
        print_ok("webui 启动 (PID: %d) 日志: runlog/%s.log" % (pid, SERVER_WEBUI))
        return managed

    def webui_gateway_target(self):
        """Vite 开发代理指向第一个网关实例"""
        for target in self.targets:
            if SERVER_GATEWAY not in target.services:
                continue
            port = read_instance_value(target.path, "gatewayserver", "ListenPort")
            if isinstance(port, int) and port > 0:
                return "http://127.0.0.1:%d" % port
        return ""

    def reclaim_pid(self, runlog_dir, name, exe_path):
        """上一轮遗留的 pid 文件仍然有效时复用, 失效则清掉避免误杀."""
        pid = read_pid_file(runlog_dir, name)
        if pid is None:
            return None
        if is_pid_alive(pid) and pid_matches_executable(pid, exe_path):
            return pid
        remove_pid_file(runlog_dir, name)
        return None

    def follow(self):
        """前台跟随日志, 同时轮询服务状态, 直到收到停止信号."""
        print_line()
        print_ok("[gateway] 全部启动完成, Ctrl+C 停止全部服务")

        follower = None
        if self.log_windows:
            print_line("[gateway] 逻辑服日志已在独立窗口显示")
        elif not self.args.no_follow:
            target, server_name = self.pick_follow()
            if target is not None:
                log_dir = os.path.join(target.path, "log", server_name)
                follower = LogFollower(
                    lambda: current_log_file(log_dir),
                    self.args.lines,
                    self.args.strip_color,
                )
                print_line("[gateway] 跟随日志: %s/log/%s" % (target.name, server_name))

        while not self.stop_event.is_set():
            if follower is not None:
                follower.poll()
            self.check_services()
            self.stop_event.wait(POLL_INTERVAL)

    def pick_follow(self):
        """优先跟随逻辑服日志, 只有中心服时跟随全局服."""
        for target in self.targets:
            if SERVER_LOGIC in target.services:
                return target, SERVER_LOGIC
        for target in self.targets:
            if SERVER_GLOBAL in target.services:
                return target, SERVER_GLOBAL
        return None, ""

    def check_services(self):
        """逻辑服意外退出时提示一次, 方便定位崩溃."""
        if self.logic_exit_warned:
            return
        for key, managed in self.processes.items():
            if not key.endswith("/" + SERVER_LOGIC):
                continue
            if not managed.is_alive():
                self.logic_exit_warned = True
                print_warn()
                print_warn("[gateway] 警告: %s 已退出, 详见 runlog" % key)
                return

    def sleep_interruptible(self, seconds):
        """可被打断的等待, 返回 False 表示等待期间收到了停止请求."""
        deadline = time.time() + seconds
        while time.time() < deadline:
            if self.stop_event.is_set():
                return False
            remaining = deadline - time.time()
            self.stop_event.wait(min(POLL_INTERVAL, max(remaining, 0.01)))
        return not self.stop_event.is_set()

    def shutdown(self):
        """按启动逆序停止服务, 保证不留残留进程."""
        if self.stopped:
            return
        self.stopped = True

        # 先关掉独立日志窗口
        for popen in self.log_windows:
            try:
                if popen.poll() is None:
                    popen.terminate()
            except OSError:
                pass
        self.log_windows.clear()

        names = list(reversed(list(self.processes.keys())))
        if not names:
            return

        print_line()
        print_line("[gateway] 正在停止服务 ...")

        # Windows 下子进程与本脚本共享控制台, 广播一次 Ctrl+C 让它们各自退出
        broadcast = IS_WINDOWS and send_console_ctrl_c()

        failed = []
        for key in names:
            managed = self.processes.pop(key)
            if not managed.stop(self.args.stop_timeout, send_signal=not broadcast):
                failed.append(key)
            if "/" in key:
                instance_name, _, service_name = key.partition("/")
                remove_pid_file(os.path.join(self.exe_dir, instance_name, "runlog"), service_name)
            else:
                remove_pid_file(self.runlog_dir, key)

        if failed:
            print_warn("[gateway] 警告: %s 仍未退出, 请手动检查" % ", ".join(failed))
        print_ok("[gateway] 已停止")

# ==============================================
# 命令行入口
# ==============================================
def parse_args(argv=None):
    parser = argparse.ArgumentParser(
        prog="gateway.py",
        description="按实例启动服务器(替代旧的单目录启动方式)",
    )
    parser.add_argument(
        "config", nargs="?", default=DEFAULT_CONFIG,
        help="实例根目录, 相对仓库根或绝对路径, 默认 %s" % DEFAULT_CONFIG,
    )
    parser.add_argument("--type", type=int, default=0,
                        help="启动类型: 1=s1单服 2=指定普通服 3=小跨服 4=大跨服 5=除大跨服外全开 8=全部实例")
    parser.add_argument("--server-id", type=int, default=None,
                        help="--type 2 时指定普通服的 server_id")
    parser.add_argument("--with-globalserver", action="store_true", help="同时启动中心服 hub")
    parser.add_argument("--foreground", action="store_true", help="启动后保持当前窗口管理服务(默认启动完成即退出)")
    parser.add_argument("--stop", action="store_true", help="停止已启动的全部实例服务")
    parser.add_argument("--webui", dest="no_webui", action="store_false",
                        help="启动前端 Vite 开发服务器(默认不启动)")
    parser.add_argument("--no-webui", dest="no_webui", action="store_true",
                        help="不启动前端 Vite 开发服务器(默认行为, 保留兼容)")
    parser.set_defaults(no_webui=True)
    parser.add_argument("--no-link", action="store_true", help="兼容旧参数, 已忽略")
    parser.add_argument("--no-follow", action="store_true", help="不跟随日志, 只保持服务运行")
    parser.add_argument("--follow-single", action="store_true", help="在当前窗口跟随第一个逻辑服日志(默认每个实例独立窗口)")
    parser.add_argument("--tail", default="", help=argparse.SUPPRESS)
    parser.add_argument("--tail-service", default=SERVER_LOGIC, help=argparse.SUPPRESS)
    parser.add_argument("--lines", type=int, default=DEFAULT_TAIL_LINES,
                        help="跟随日志时首屏显示的历史行数, 默认 %d" % DEFAULT_TAIL_LINES)
    parser.add_argument("--strip-color", action="store_true", help="不输出颜色(同时去掉日志里的 ANSI 转义)")
    parser.add_argument("--start-delay", type=float, default=DEFAULT_START_DELAY,
                        help="等待多少秒后启动 gatewayserver, 默认 %g" % DEFAULT_START_DELAY)
    parser.add_argument("--stop-timeout", type=float, default=DEFAULT_STOP_TIMEOUT,
                        help="单个服务退出的等待秒数, 默认 %g" % DEFAULT_STOP_TIMEOUT)
    return parser.parse_args(argv)


def install_signal_handlers(stop_event):
    """Ctrl+C / SIGTERM / 关闭终端时只置标志, 清理工作交给主流程统一做."""
    def handler(signum, frame):
        stop_event.set()

    for signal_name in ("SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK"):
        signal_value = getattr(signal, signal_name, None)
        if signal_value is None:
            continue
        try:
            signal.signal(signal_value, handler)
        except (ValueError, OSError):
            pass


def stop_services(config):
    """停止所有实例已启动的服务并清理 pid 文件"""
    targets = load_targets(config)
    stopped = 0
    services = (SERVER_GATEWAY, SERVER_LOGIC, SERVER_GLOBAL, SERVER_DB)

    for target in targets:
        runlog_dir = os.path.join(target.path, "runlog")
        for service in services:
            pid = read_pid_file(runlog_dir, service)
            if pid is None:
                continue
            if is_pid_alive(pid):
                print_line("停止 %s/%s (PID: %d)" % (target.name, service, pid))
                if IS_WINDOWS:
                    subprocess.run(
                        ["taskkill", "/F", "/T", "/PID", str(pid)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        check=False,
                    )
                else:
                    try:
                        os.kill(pid, signal.SIGTERM)
                    except OSError:
                        pass
                stopped += 1
            remove_pid_file(runlog_dir, service)

    print_ok("[gateway] 已停止 %d 个服务进程" % stopped)
    return 0


def run_tail(args):
    """内部模式: 只跟随指定实例的日志, 供独立窗口使用."""
    targets = load_targets(args.config)
    target = None
    for item in targets:
        if item.name == args.tail:
            target = item
            break

    if target is None:
        print_error("错误: 找不到实例 %s" % args.tail)
        return 1

    if IS_WINDOWS:
        try:
            ctypes.windll.kernel32.SetConsoleTitleW("%s %s" % (target.name, args.tail_service))
        except (AttributeError, OSError):
            pass

    log_dir = os.path.join(target.path, "log", args.tail_service)
    runlog_dir = os.path.join(target.path, "runlog")
    print_line("[tail] %s/%s" % (target.name, args.tail_service))
    print_line("[tail] 日志目录: %s" % log_dir)

    follower = LogFollower(lambda: current_log_file(log_dir), args.lines, args.strip_color)
    try:
        while True:
            follower.poll()
            # 服务已停止(pid 文件被清理或进程已退出)时自动关闭窗口
            pid = read_pid_file(runlog_dir, args.tail_service)
            if pid is None or not is_pid_alive(pid):
                print_line("[tail] 服务已停止, 关闭窗口")
                time.sleep(1)
                return 0
            time.sleep(POLL_INTERVAL)
    except KeyboardInterrupt:
        return 0


def main(argv=None):
    raw_argv = list(sys.argv[1:] if argv is None else argv)
    args = parse_args(raw_argv)
    configure_console()

    if args.tail:
        return run_tail(args)

    if args.stop:
        return stop_services(args.config)

    try:
        targets = load_targets(args.config)

        if not raw_argv:
            # 菜单 7/9 只切换配置, 切完继续回到菜单
            webui_enabled = not args.no_webui
            while True:
                menu_type, extra = prompt_choice(targets, webui_enabled, args.config)
                if menu_type == 7:
                    webui_enabled = not webui_enabled
                    print_ok("[gateway] 前端 Vite 已%s" % ("开启" if webui_enabled else "关闭"))
                    continue
                if menu_type == 9:
                    entered = extra or input("请输入实例根目录(相对仓库根或绝对路径): ").strip()
                    if entered:
                        args.config = entered
                        if not os.path.isdir(resolve_config_dir(args.config)):
                            print_error("[gateway] 目录不存在: %s" % resolve_config_dir(args.config))
                    targets = load_targets(args.config)
                    continue
                server_id = extra
                break
            args.no_webui = not webui_enabled
            if menu_type == 0:
                return 0
            if menu_type == 6:
                return stop_services(args.config)
        else:
            menu_type = args.type if args.type else 1
            server_id = args.server_id
            if menu_type == 2 and server_id is None:
                raise SystemExit("错误: --type 2 需要同时指定 --server-id")

        selected = select_targets(targets, menu_type, server_id, args.with_globalserver)

        gateway = Gateway(args, selected)
        if not gateway.detach:
            install_signal_handlers(gateway.stop_event)
            atexit.register(gateway.shutdown)
        return gateway.run()
    except KeyboardInterrupt:
        # 兜底: 个别环境把 SIGINT 解释成 KeyboardInterrupt
        return 0
    except SystemExit as error:
        print_error(str(error))
        return 1


if __name__ == "__main__":
    sys.exit(main())
