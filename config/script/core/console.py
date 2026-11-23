#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""命令行输出与交互.

命令行和 GUI 共用 Console 接口:
    命令行: 直接在终端读写
    GUI: 由 gui 模块提供同接口实现, 把输出收集到日志区
"""

import ctypes
import locale
import os
import re
import sys

# 平台判断
IS_WINDOWS = os.name == "nt"

# Windows 控制台句柄与模式
WINDOWS_STD_OUTPUT_HANDLE = -11
WINDOWS_STD_ERROR_HANDLE = -12
WINDOWS_ENABLE_VIRTUAL_TERMINAL = 0x0004

# 终端颜色
COLOR_RESET = "\033[0m"
COLOR_GRAY = "\033[0;90m"
COLOR_RED = "\033[0;91m"
COLOR_GREEN = "\033[0;92m"
COLOR_YELLOW = "\033[0;93m"
COLOR_BLUE = "\033[0;94m"

# 日志级别 -> 颜色
LOG_LEVEL_COLORS = {
    "D": COLOR_GRAY,
    "I": COLOR_GREEN,
    "C": COLOR_GREEN,
    "W": COLOR_YELLOW,
    "E": COLOR_RED,
    "F": COLOR_RED,
}

# 日志行格式: [时间][级别]消息
LOG_LEVEL_PATTERN = re.compile(r"^\[[^\]]*\]\[([DICWEF])\]")

# ANSI 转义
ANSI_ESCAPE_PATTERN = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")

# 当前输出端是否支持颜色
_color_enabled = False


def ConfigureWindowsConsole():
    """Windows: 切换 UTF-8 代码页并开启 ANSI 转义"""
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
        kernel32.GetStdHandle.argtypes = [ctypes.c_uint32]
        kernel32.GetStdHandle.restype = ctypes.c_void_p
        kernel32.GetConsoleMode.argtypes = [ctypes.c_void_p, ctypes.POINTER(ctypes.c_uint32)]
        kernel32.GetConsoleMode.restype = ctypes.c_int
        kernel32.SetConsoleMode.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
        kernel32.SetConsoleMode.restype = ctypes.c_int
    except AttributeError:
        return False

    enabled = False
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


def DetectColorSupport(virtual_terminal_ready):
    """只有输出到真实终端且支持 ANSI 时才上色"""
    if os.environ.get("NO_COLOR") is not None:
        return False
    if not virtual_terminal_ready:
        return False
    try:
        return bool(sys.stdout.isatty())
    except (AttributeError, ValueError):
        return False


def ConfigurePosixLocale():
    """POSIX: 使用 UTF-8 locale, 保证 readline 按多字节字符处理回退键

    在 C/POSIX locale 下 readline 按字节编辑, 中文账号名按一次回退会删掉半个字符,
    终端上就会显示乱码.
    """
    if IS_WINDOWS:
        return
    try:
        locale.setlocale(locale.LC_CTYPE, "")
    except (locale.Error, OSError):
        pass

    try:
        codeset = locale.nl_langinfo(locale.CODESET)
    except (AttributeError, ValueError):
        codeset = ""
    normalized = str(codeset).lower().replace("-", "").replace("_", "")
    if normalized == "utf8":
        return
    # 已经是其它多字节 locale(如 GBK)时保持原样, 强行切 UTF-8 会和终端编码对不上
    ascii_codesets = ("", "ascii", "usascii", "ansix3.41968", "646")
    if normalized not in ascii_codesets:
        return

    for candidate in ("C.UTF-8", "C.utf8", "en_US.UTF-8", "en_US.utf8"):
        try:
            locale.setlocale(locale.LC_CTYPE, candidate)
            return
        except (locale.Error, OSError):
            continue


def RestoreTerminalInput():
    """POSIX: 输入前恢复终端规范模式, 回退键等编辑键才不会被当成普通字符"""
    if IS_WINDOWS:
        return
    try:
        import termios
    except ImportError:
        return

    try:
        fd = sys.stdin.fileno()
        if not os.isatty(fd):
            return
        attrs = termios.tcgetattr(fd)
    except (AttributeError, OSError, ValueError, termios.error):
        return

    changed = False
    if not attrs[0] & termios.ICRNL:
        attrs[0] |= termios.ICRNL
        changed = True
    for flag_name in ("ICANON", "ECHO", "ECHOE", "IEXTEN"):
        flag = getattr(termios, flag_name, 0)
        if flag and not attrs[3] & flag:
            attrs[3] |= flag
            changed = True

    if changed:
        try:
            termios.tcsetattr(fd, termios.TCSADRAIN, attrs)
        except (OSError, termios.error):
            pass


def ConfigureStdio():
    """统一 UTF-8 输出, 并初始化颜色支持"""
    global _color_enabled

    # pythonw.exe 没有控制台, stdout/stderr 可能为 None
    if sys.stdout is None:
        sys.stdout = open(os.devnull, "w", encoding="utf-8")
    if sys.stderr is None:
        sys.stderr = open(os.devnull, "w", encoding="utf-8")

    ConfigurePosixLocale()

    for stream in (sys.stdin, sys.stdout, sys.stderr):
        if stream is None:
            continue
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure is None:
            continue
        try:
            reconfigure(encoding="utf-8", errors="replace")
        except (OSError, ValueError):
            pass

    virtual_terminal_ready = ConfigureWindowsConsole() if IS_WINDOWS else True
    _color_enabled = DetectColorSupport(virtual_terminal_ready)


def Colorize(text, color):
    """给整段文本包上颜色, 未开启颜色时原样返回"""
    if not _color_enabled or not color or not text:
        return text
    return color + text + COLOR_RESET


def ColorizeLogLine(line):
    """按日志级别给整行着色, 行尾换行符保持原样"""
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


def StripAnsi(text):
    """去掉 ANSI 转义, 供不支持颜色的输出端使用"""
    return ANSI_ESCAPE_PATTERN.sub("", text)


class Console(object):
    """命令行控制台, 同时作为 GUI 控制台的接口基类"""

    def Write(self, text):
        """输出任意文本, 不自动换行"""
        if not text:
            return
        stream = sys.stdout
        if stream is None:
            return
        try:
            stream.write(text)
            stream.flush()
        except (AttributeError, OSError, ValueError):
            pass

    def Line(self, message="", color=None):
        """输出一行"""
        self.Write(Colorize(message, color) + "\n")

    def Plain(self, message=""):
        self.Line(message)

    def Success(self, message=""):
        self.Line(message, COLOR_GREEN)

    def Warn(self, message=""):
        self.Line(message, COLOR_YELLOW)

    def Error(self, message=""):
        self.Line(message, COLOR_RED)

    def Info(self, message=""):
        self.Line(message, COLOR_BLUE)

    def Title(self, message):
        """输出标题行"""
        self.Line()
        self.Line("=" * 64, COLOR_BLUE)
        self.Line(message, COLOR_BLUE)
        self.Line("=" * 64, COLOR_BLUE)

    def Step(self, message):
        """输出步骤标题"""
        self.Line()
        self.Line("[*] %s" % message, COLOR_GREEN)

    def ReadLine(self, prompt):
        """读取一行输入: POSIX 下先恢复终端规范模式, 保证回退键正常"""
        RestoreTerminalInput()
        return input(prompt)

    def Ask(self, prompt, default=""):
        """文本输入, 返回去掉首尾空白的字符串"""
        suffix = "" if default == "" else " [%s]" % default
        try:
            value = self.ReadLine("%s%s: " % (prompt, suffix))
        except (EOFError, KeyboardInterrupt, RuntimeError):
            self.Line()
            return default
        value = value.strip()
        return default if value == "" else value

    def Confirm(self, prompt, default=False):
        """是否确认, 直接回车使用默认值"""
        hint = "Y/n" if default else "y/N"
        try:
            value = self.ReadLine("%s [%s]: " % (prompt, hint))
        except (EOFError, KeyboardInterrupt, RuntimeError):
            self.Line()
            return default
        value = value.strip().lower()
        if value == "":
            return default
        return value in ("y", "yes", "1", "true")

    def Choose(self, prompt, items, default_value=None):
        """从列表中选择, items 为 [(显示文本, 返回值)]"""
        for index, item in enumerate(items, start=1):
            label, value = item
            mark = "*" if value == default_value else " "
            self.Line("  %s %d. %s" % (mark, index, label))

        for index, item in enumerate(items, start=1):
            if item[1] == default_value:
                default_text = str(index)
                break
        else:
            default_text = "1"

        raw = self.Ask(prompt, default_text)
        try:
            choice = int(raw)
        except ValueError:
            raise ValueError("请输入列表中的数字")
        if choice < 1 or choice > len(items):
            raise ValueError("选择超出范围: %s" % raw)
        return items[choice - 1][1]

    def Pause(self, prompt="按 Enter 继续..."):
        """等待用户确认, EOF 时直接返回"""
        try:
            self.ReadLine(prompt)
        except (EOFError, KeyboardInterrupt, RuntimeError):
            self.Line()

    def SetTitle(self, title):
        """Windows 控制台窗口标题"""
        if not IS_WINDOWS:
            return
        try:
            ctypes.windll.kernel32.SetConsoleTitleW(title)
        except (AttributeError, OSError):
            pass
