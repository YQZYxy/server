#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gateway.py -- 跨平台(macOS / Linux / Windows)一键起服

用法:
    python gateway.py [debug|release] [选项]
    ./gateway.sh [debug|release]      # macOS / Linux
    gateway.bat [debug|release]       # Windows

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

# 构建配置
DEFAULT_CONFIG = "debug"
VALID_CONFIGS = ("debug", "release")

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
DEFAULT_START_DELAY = 3.0        # dbserver/logicserver 之后等待多久再起 gatewayserver
DEFAULT_STOP_TIMEOUT = 30.0      # 单个服务退出的等待秒数
DEFAULT_TAIL_LINES = 200         # 首屏显示的历史日志行数
POLL_INTERVAL = 0.25             # 日志跟随与状态检查的轮询间隔
FORCE_KILL_WAIT = 5.0            # 强杀后等待退出的秒数
EXIT_WAIT_INTERVAL = 0.1         # 等待进程退出的轮询间隔

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

    def __init__(self, name, argv, working_dir, log_path, reuse_pid=None):
        self.name = name
        self.argv = argv
        self.working_dir = working_dir
        self.log_path = log_path
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
        if IS_WINDOWS:
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
class Gateway:
    """负责资源链接, 服务启停与日志跟随."""

    def __init__(self, args):
        self.args = args
        self.exe_dir = os.path.join(ROOT_DIR, args.config)
        self.runlog_dir = os.path.join(self.exe_dir, "runlog")
        self.config_files = (
            os.path.join(self.exe_dir, "config", "config.json"),
            os.path.join(ROOT_DIR, "config", "config.json"),
        )
        self.stop_event = threading.Event()
        self.processes = {}
        self.stopped = False
        self.logic_exit_warned = False

    def run(self):
        """主流程: 准备目录 -> 起服 -> 跟随日志, 退出时必定清理子进程."""
        self.prepare()
        self.start_all()
        try:
            self.follow()
        finally:
            self.shutdown()
        return 0

    def prepare(self):
        if not os.path.isdir(self.exe_dir):
            raise SystemExit(
                "错误: 找不到可执行文件目录 %s\n      请先构建: ./build.sh %s"
                % (self.exe_dir, self.args.config)
            )
        os.makedirs(self.runlog_dir, exist_ok=True)

        if not self.args.no_link:
            for name, relative in LINK_DIRS:
                self.ensure_link(name, os.path.join(ROOT_DIR, relative))

        print_line("[gateway] 配置: %s" % self.args.config)
        print_line("[gateway] 前端: Vite Dev Server (http://localhost:5173)")
        print_line("[gateway] 网关: gatewayserver (:3723)")
        print_line()

    def ensure_link(self, name, target_path):
        """让可执行文件目录引用仓库根的同名资源, 等价于旧脚本的 ln -s / mklink /J."""
        link_path = os.path.join(self.exe_dir, name)

        if is_dir_link(link_path):
            return
        if os.path.isdir(link_path):
            # 实体空目录且目标有内容时换成链接, 否则首次运行建的空 dist 会一直挡住前端产物
            if is_empty_dir(link_path) and os.path.isdir(target_path) and not is_empty_dir(target_path):
                try:
                    os.rmdir(link_path)
                except OSError:
                    return
                if create_dir_link(link_path, target_path):
                    print_line("[relink] %s -> %s (原空目录已替换为链接)" % (name, target_path))
            return
        if os.path.exists(link_path):
            return

        if os.path.isdir(target_path):
            if create_dir_link(link_path, target_path):
                print_line("[link] %s -> %s" % (name, target_path))
            else:
                print_warn("[gateway] 警告: 创建链接失败 %s -> %s" % (name, target_path))
            return

        try:
            os.makedirs(link_path, exist_ok=True)
            print_line("[mkdir] %s (空目录, 需要时再放文件)" % name)
        except OSError:
            pass

    def boot_order(self):
        """启动顺序: dbserver -> (globalserver) -> logicserver, gatewayserver 稍后单独起."""
        order = [SERVER_DB]
        if self.args.with_globalserver:
            order.append(SERVER_GLOBAL)
        order.append(SERVER_LOGIC)
        return order

    def start_all(self):
        for name in self.boot_order():
            self.start_service(name)

        print_line("[gateway] 等待 %.0f 秒后启动 gatewayserver ..." % self.args.start_delay)
        if not self.sleep_interruptible(self.args.start_delay):
            return

        self.start_service(SERVER_GATEWAY)

        if self.args.no_webui:
            print_line("[gateway] 跳过 webui (--no-webui)")
        else:
            self.start_webui()

    def start_service(self, name):
        exe_path = executable_path(self.exe_dir, name)
        if not os.path.isfile(exe_path):
            print_warn("[gateway] 警告: 找不到可执行文件 %s, 跳过" % exe_path)
            return None

        reused_pid = self.reclaim_pid(name, exe_path)
        if reused_pid is not None:
            managed = ManagedProcess(name, None, self.exe_dir, "", reuse_pid=reused_pid)
            self.processes[name] = managed
            print_line("%s 已在运行 (PID: %d), 复用" % (name, reused_pid))
            return managed

        log_path = os.path.join(self.runlog_dir, name + ".log")
        managed = ManagedProcess(name, [exe_path], self.exe_dir, log_path)
        try:
            pid = managed.start()
        except OSError as error:
            managed.release()
            print_error("[gateway] 错误: 启动 %s 失败: %s" % (name, error))
            return None

        write_pid_file(self.runlog_dir, name, pid)
        self.processes[name] = managed
        print_ok("%s 启动 (PID: %d) 日志: runlog/%s.log" % (name, pid, name))
        return managed

    def start_webui(self):
        webui_dir = os.path.join(ROOT_DIR, "client", "webui")
        npm_path = shutil.which("npm")
        if not os.path.isdir(webui_dir) or not npm_path:
            print_line("[gateway] 跳过 webui (未找到 client/webui 目录或 npm 命令)")
            return None

        log_path = os.path.join(self.runlog_dir, SERVER_WEBUI + ".log")
        managed = ManagedProcess(SERVER_WEBUI, [npm_path, "run", "dev"], webui_dir, log_path)
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

    def reclaim_pid(self, name, exe_path):
        """上一轮遗留的 pid 文件仍然有效时复用, 失效则清掉避免误杀."""
        pid = read_pid_file(self.runlog_dir, name)
        if pid is None:
            return None
        if is_pid_alive(pid) and pid_matches_executable(pid, exe_path):
            return pid
        remove_pid_file(self.runlog_dir, name)
        return None

    def follow(self):
        """前台跟随日志, 同时轮询服务状态, 直到收到停止信号."""
        print_line()
        print_ok("[gateway] 全部启动完成, Ctrl+C 停止全部服务")
        print_line("[gateway] 其它服务输出目录: %s" % self.runlog_dir)

        follower = None
        if not self.args.no_follow:
            log_dir = resolve_log_dir(self.exe_dir, self.config_files, FOLLOW_SERVER)
            follower = LogFollower(
                lambda: current_log_file(log_dir),
                self.args.lines,
                self.args.strip_color,
            )

        while not self.stop_event.is_set():
            if follower is not None:
                follower.poll()
            self.check_services()
            self.stop_event.wait(POLL_INTERVAL)

    def check_services(self):
        """逻辑服意外退出时提示一次, 方便定位崩溃."""
        managed = self.processes.get(SERVER_LOGIC)
        if managed is None or self.logic_exit_warned:
            return
        if not managed.is_alive():
            self.logic_exit_warned = True
            print_warn()
            print_warn("[gateway] 警告: logicserver 已退出, 详见 runlog/logicserver.log")

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

        names = list(reversed(list(self.processes.keys())))
        if not names:
            return

        print_line()
        print_line("[gateway] 正在停止服务 ...")

        # Windows 下子进程与本脚本共享控制台, 广播一次 Ctrl+C 让它们各自退出
        broadcast = IS_WINDOWS and send_console_ctrl_c()

        failed = []
        for name in names:
            managed = self.processes.pop(name)
            if not managed.stop(self.args.stop_timeout, send_signal=not broadcast):
                failed.append(name)
            remove_pid_file(self.runlog_dir, name)

        if failed:
            print_warn("[gateway] 警告: %s 仍未退出, 请手动检查" % ", ".join(failed))
        print_ok("[gateway] 已停止")


# ==============================================
# 命令行入口
# ==============================================
def parse_args(argv=None):
    parser = argparse.ArgumentParser(
        prog="gateway.py",
        description="跨平台一键起服脚本(替代 gateway.sh / gateway.bat)",
    )
    parser.add_argument(
        "config", nargs="?", default=DEFAULT_CONFIG, choices=VALID_CONFIGS,
        help="构建配置, 默认 %s" % DEFAULT_CONFIG,
    )
    parser.add_argument("--with-globalserver", action="store_true", help="同时启动 globalserver, 默认不启动")
    parser.add_argument("--no-webui", action="store_true", help="不启动前端 Vite 开发服务器")
    parser.add_argument("--no-link", action="store_true", help="跳过 config/luascript/dist 目录链接")
    parser.add_argument("--no-follow", action="store_true", help="不跟随日志, 只保持服务运行")
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


def main(argv=None):
    args = parse_args(argv)
    configure_console()

    gateway = Gateway(args)
    install_signal_handlers(gateway.stop_event)
    atexit.register(gateway.shutdown)

    try:
        return gateway.run()
    except KeyboardInterrupt:
        # 兜底: 个别环境把 SIGINT 解释成 KeyboardInterrupt
        return 0
    except SystemExit as error:
        print_error(str(error))
        return 1


if __name__ == "__main__":
    sys.exit(main())
