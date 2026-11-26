#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""跨平台适配.

把 Windows / Linux / macOS 的差异集中在这里:
    可执行文件后缀, 进程创建, 目录链接, 工具查找, GUI 可用性判断
"""

import ctypes
import glob
import os
import shutil
import subprocess
import sys

from .console import COLOR_RED, COLOR_YELLOW
from .diagnostics import AUTO_LINE_WIDTH, MAX_LINE_WIDTH, WrapDisplayLine
from .errors import ModuleError

# 平台标识
IS_WINDOWS = os.name == "nt"
IS_MACOS = sys.platform == "darwin"
IS_LINUX = sys.platform.startswith("linux")

# 可执行文件后缀
EXE_SUFFIX = ".exe" if IS_WINDOWS else ""

# 过滤器返回的级别 -> 输出颜色
FILTERED_LINE_COLORS = {
    "warning": COLOR_YELLOW,
    "error": COLOR_RED,
}

# Windows 创建独立控制台窗口
CREATE_NEW_CONSOLE = getattr(subprocess, "CREATE_NEW_CONSOLE", 0)

# Windows 进程创建标志
DETACHED_PROCESS = 0x00000008
CREATE_NEW_PROCESS_GROUP = 0x00000200
CREATE_NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0)

# ShowWindow 隐藏窗口
SW_HIDE = 0

# Windows 深色标题栏属性, 20 需要 Win10 20H1+, 19 兼容更早版本
DWMWA_USE_IMMERSIVE_DARK_MODE = 20
DWMWA_USE_IMMERSIVE_DARK_MODE_FALLBACK = 19

# SetWindowPos 标志
SWP_NOMOVE = 0x0002
SWP_NOZORDER = 0x0004
SWP_NOACTIVATE = 0x0010
SWP_NOOWNERZORDER = 0x0200


class WindowRect(ctypes.Structure):
    """Win32 RECT"""

    _fields_ = [
        ("left", ctypes.c_long),
        ("top", ctypes.c_long),
        ("right", ctypes.c_long),
        ("bottom", ctypes.c_long),
    ]


def RefreshWindowFrame(hwnd):
    """改一次窗口高度再改回来, 让 DWM 重画非客户区

    Win10 上只设置 DWM 属性不会重画标题栏, 必须有真实的尺寸变化.
    """
    user32 = ctypes.windll.user32
    if user32.IsZoomed(hwnd):
        return
    rect = WindowRect()
    if not user32.GetWindowRect(hwnd, ctypes.byref(rect)):
        return
    width = rect.right - rect.left
    height = rect.bottom - rect.top
    if width <= 0 or height <= 0:
        return
    flags = SWP_NOMOVE | SWP_NOZORDER | SWP_NOACTIVATE | SWP_NOOWNERZORDER
    user32.SetWindowPos(hwnd, 0, 0, 0, width, height + 1, flags)
    user32.SetWindowPos(hwnd, 0, 0, 0, width, height, flags)


def ApplyDarkTitleBar(window, dark=True):
    """Windows 下让系统标题栏跟随主题, 其它平台直接忽略

    非客户区由系统绘制, 只能通过 DWM 属性切换; 调用失败不影响界面本身.
    """
    if not IS_WINDOWS:
        return False
    try:
        hwnd = ctypes.windll.user32.GetParent(window.winfo_id())
        if not hwnd:
            return False
        value = ctypes.c_int(1 if dark else 0)
        size = ctypes.sizeof(value)
        applied = False
        for attribute in (DWMWA_USE_IMMERSIVE_DARK_MODE, DWMWA_USE_IMMERSIVE_DARK_MODE_FALLBACK):
            if ctypes.windll.dwmapi.DwmSetWindowAttribute(
                hwnd, attribute, ctypes.byref(value), size
            ) == 0:
                applied = True
                break
        if not applied:
            return False
        if window.winfo_viewable():
            RefreshWindowFrame(hwnd)
        return True
    except (AttributeError, OSError, ValueError):
        return False


def PlatformName():
    """可读的平台名称"""
    if IS_WINDOWS:
        return "Windows"
    if IS_MACOS:
        return "macOS"
    if IS_LINUX:
        return "Linux"
    return sys.platform


def ProcessorCount(jobs):
    """jobs <= 0 时按 CPU 核心数自动计算"""
    if isinstance(jobs, int) and jobs > 0:
        return jobs
    return os.cpu_count() or 1


def ResolvePathFromRoot(settings, raw_value):
    """相对仓库根解析路径, 绝对路径原样规范化"""
    value = str(raw_value or "").strip()
    if not value:
        raise ModuleError("路径配置不能为空")
    if not os.path.isabs(value):
        value = os.path.join(settings.project_root, value)
    return os.path.normpath(value)


def _windows_suffix_candidates(path):
    """Windows 下允许配置省略 .exe 后缀, 并且优先使用 .exe"""
    if not IS_WINDOWS or path.lower().endswith(".exe"):
        return [path]
    return [path + ".exe", path]


def ResolveTool(settings, raw_value, extra_candidates=None):
    """查找外部工具.

    配置成路径时按仓库根解析, 配置成命令名时走 PATH.
    找不到时抛出包含搜索位置的 ModuleError.
    """
    value = str(raw_value or "").strip()
    if not value:
        raise ModuleError("工具路径配置不能为空")

    searched = []
    is_path_like = os.path.isabs(value) or os.sep in value or (os.altsep and os.altsep in value)
    if is_path_like:
        candidate = ResolvePathFromRoot(settings, value)
        for item in _windows_suffix_candidates(candidate):
            searched.append(item)
            if os.path.isfile(item):
                return item
    else:
        found = shutil.which(value)
        searched.append("PATH:%s" % value)
        if found:
            return found

    for item in extra_candidates or []:
        searched.append(item)
        if item and os.path.isfile(item):
            return item

    raise ModuleError(
        "找不到可执行工具: %s\n  已尝试: %s\n  请检查 %s 中的配置"
        % (value, ", ".join(searched), settings.config_file)
    )


def FindMysql(settings, configured, search_versions):
    """查找 mysql 客户端.

    先按配置查找, Windows 下再查常见安装目录, 全部失败直接报错.
    """
    extra = []
    if IS_WINDOWS:
        for version in search_versions:
            extra.append(
                os.path.join(
                    r"C:\Program Files\MySQL\MySQL Server %s\bin" % version,
                    "mysql.exe",
                )
            )
    return ResolveTool(settings, configured, extra)


def FindCMake(settings, configured):
    """查找 CMake.

    Visual Studio 自带的 CMake 不在 PATH, Windows 下补查常见安装位置.
    """
    extra = []
    if IS_WINDOWS:
        patterns = (
            r"C:\Program Files\Microsoft Visual Studio\*\*\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe",
            r"C:\Program Files (x86)\Microsoft Visual Studio\*\*\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe",
            r"C:\Program Files\CMake\bin\cmake.exe",
        )
        for pattern in patterns:
            extra.extend(sorted(glob.glob(pattern), reverse=True))
    return ResolveTool(settings, configured, extra)


def DetectDefaultGenerator(cmake):
    """探测 CMake 默认生成器.

    cmake --help 的生成器列表里带 * 的那一项就是当前平台的默认生成器,
    探测不到返回空串.
    """
    code, output = RunCaptured([cmake, "--help"])
    if code != 0:
        return ""
    in_generators = False
    for line in output.splitlines():
        stripped = line.strip()
        if stripped == "Generators":
            in_generators = True
            continue
        if not in_generators:
            continue
        if stripped.startswith("* "):
            return stripped[2:].split("=")[0].strip()
    return ""


def IsRuntimeLib(name):
    """是否为需要随可执行文件分发的运行库"""
    lower = name.lower()
    return (
        lower.endswith(".dll")
        or lower.endswith(".so")
        or lower.endswith(".dylib")
        or ".so." in lower
    )


def RuntimeLibFiles(lib_dir):
    """列出运行库目录下需要分发的文件"""
    if not os.path.isdir(lib_dir):
        return []
    result = []
    for name in sorted(os.listdir(lib_dir)):
        path = os.path.join(lib_dir, name)
        if os.path.isfile(path) and IsRuntimeLib(name):
            result.append(path)
    return result


def RemovePath(path):
    """删除文件、链接或目录"""
    if not path:
        return
    if os.path.islink(path) or os.path.isfile(path):
        os.unlink(path)
    elif os.path.isdir(path):
        shutil.rmtree(path)


def IsDirLink(path):
    """判断目录是否已是链接, Windows junction 不走 islink"""
    if os.path.islink(path):
        return True
    if IS_WINDOWS and os.path.isdir(path):
        try:
            return os.path.realpath(path) != os.path.abspath(path)
        except OSError:
            return False
    return False


def CreateDirLink(link_path, target_path):
    """建目录链接: Windows 用 junction, 其它平台用符号链接"""
    if IS_WINDOWS:
        try:
            result = RunHidden(["cmd", "/c", "mklink", "/J", link_path, target_path])
        except OSError:
            return False
        return result.returncode == 0
    try:
        os.symlink(target_path, link_path)
    except OSError:
        return False
    return True


def LinkFile(src, dst):
    """优先符号链接, 其次硬链接, 失败返回 False"""
    folder = os.path.dirname(dst)
    if folder:
        os.makedirs(folder, exist_ok=True)
    RemovePath(dst)
    for maker in (os.symlink, os.link):
        try:
            maker(src, dst)
            return True
        except (OSError, NotImplementedError):
            continue
    return False


def LinkDir(src, dst):
    """目录改用链接, 已存在时不覆盖"""
    folder = os.path.dirname(dst)
    if folder:
        os.makedirs(folder, exist_ok=True)
    if os.path.exists(dst) or os.path.islink(dst):
        return False
    return CreateDirLink(dst, src)


def EnableDpiAwareness():
    """Windows 高分屏下让 Tk 字体清晰"""
    if not IS_WINDOWS:
        return
    try:
        ctypes.windll.shcore.SetProcessDpiAwareness(1)
    except (AttributeError, OSError):
        pass


def HideOwnConsoleWindow():
    """GUI 启动后隐藏脚本自带的控制台窗口.

    双击 auto.py 时 python.exe 会独占一个控制台窗口, GUI 起来后窗口会一直
    停在窗口后面; pythonw 启动时连控制台都没有, 子进程会各自弹出窗口.
    这里统一保证当前进程有一个隐藏的控制台:
        已有且独占: 直接隐藏
        已有但与 shell 共享: 不处理, 隐藏会连带隐藏用户终端
        没有: 分配一个隐藏控制台, 让后续子进程共用
    返回是否隐藏了控制台.
    """
    if not IS_WINDOWS:
        return False
    try:
        kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
        console = kernel32.GetConsoleWindow()
        if console:
            # 缓冲区只要区分 1 个和多个进程, 数量超过容量时返回所需数量
            process_list = (ctypes.c_ulong * 2)()
            if kernel32.GetConsoleProcessList(process_list, 2) > 1:
                return False
        else:
            if not kernel32.AllocConsole():
                return False
            console = kernel32.GetConsoleWindow()
            if not console:
                return False
        user32 = ctypes.WinDLL("user32", use_last_error=True)
        return bool(user32.ShowWindow(console, SW_HIDE))
    except (AttributeError, OSError):
        return False


def IsGuiAvailable():
    """判断当前 Windows 环境是否可用 Tkinter GUI.

    只有 Windows 尝试 GUI, Linux/macOS 统一使用命令行模式.
    """
    if not IS_WINDOWS:
        return False
    try:
        import tkinter as tk
    except ImportError:
        return False
    try:
        root = tk.Tk()
        root.withdraw()
        root.destroy()
        return True
    except Exception:
        return False


def OpenPath(path):
    """用系统默认程序打开文件或目录"""
    if not os.path.exists(path):
        raise ModuleError("路径不存在: %s" % path)
    try:
        if IS_WINDOWS:
            os.startfile(path)  # type: ignore[attr-defined]
        elif IS_MACOS:
            subprocess.Popen(["open", path])
        else:
            subprocess.Popen(["xdg-open", path])
    except OSError as error:
        raise ModuleError("打开路径失败: %s (%s)" % (path, error)) from error


def TerminalColumns():
    """折行宽度: 跟随终端列宽, 但不超过 AUTO_LINE_WIDTH, 拿不到时用该上限"""
    if MAX_LINE_WIDTH > 0:
        return MAX_LINE_WIDTH
    try:
        size = shutil.get_terminal_size(fallback=(0, 0))
        columns = size.columns
    except (OSError, ValueError):
        columns = 0
    if columns <= 0:
        columns = AUTO_LINE_WIDTH
    return min(columns, AUTO_LINE_WIDTH)


def IsInteractiveStdin():
    """判断标准输入是否是终端, 管道和 GUI 下都无法交互输入"""
    checker = getattr(sys.stdin, "isatty", None)
    if checker is None:
        return False
    try:
        return bool(checker())
    except (AttributeError, OSError, ValueError):
        return False


def RunStreaming(command, cwd, console, env=None, line_filter=None,
                 stdin_text=None, interactive=False, capture_lines=None):
    """执行外部命令并逐行输出, 返回退出码.

    逐行读取可以同时兼容命令行和 GUI 的日志收集.
    line_filter 可选, 传入带 Feed(text) 与 Flush() 的对象, 用于压缩工具的多行诊断输出.
    stdin_text 给子进程写入一行标准输入(例如密码), 不落命令行;
    interactive=True 时把终端完整交给子进程, 允许账号密码/证书提示正常显示;
    capture_lines 传入列表时顺带收集原始输出行, 便于失败后判断错误原因.
    """
    console.Line("  > %s" % " ".join(command))
    process_env = os.environ.copy()
    if env:
        process_env.update(env)

    # 交互模式必须直接占用终端, 提示语写进管道看不到
    if interactive and stdin_text is None:
        try:
            result = subprocess.run(command, cwd=cwd, env=process_env, check=False)
        except OSError as error:
            raise ModuleError("执行命令失败: %s (%s)" % (" ".join(command), error)) from error
        return result.returncode

    process_stdin = subprocess.PIPE if stdin_text is not None else subprocess.DEVNULL

    try:
        process = subprocess.Popen(
            command,
            cwd=cwd,
            env=process_env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            stdin=process_stdin,
        )
    except OSError as error:
        raise ModuleError("执行命令失败: %s (%s)" % (" ".join(command), error)) from error

    # 密码很短, 直接写入并关闭, 不会填满管道
    if stdin_text is not None and process.stdin is not None:
        try:
            process.stdin.write(stdin_text + "\n")
            process.stdin.flush()
        except OSError:
            pass
        finally:
            try:
                process.stdin.close()
            except OSError:
                pass

    # 终端宽度减一, 避免刚好顶到最后一列触发终端自己的折行
    wrap_width = TerminalColumns() - 1 if line_filter is not None else 0
    if process.stdout is not None:
        for line in process.stdout:
            text = line.rstrip("\r\n")
            if capture_lines is not None:
                capture_lines.append(text)
            if line_filter is None:
                console.Line("  " + text)
                continue
            for level, output in line_filter.Feed(text):
                for chunk in WrapDisplayLine("  " + output, wrap_width):
                    console.Line(chunk, FILTERED_LINE_COLORS.get(level))

    code = process.wait()
    # 进程结束后补齐被过滤器暂存的内容, 避免最后一条诊断丢失
    if line_filter is not None:
        for level, output in line_filter.Flush():
            for chunk in WrapDisplayLine("  " + output, wrap_width):
                console.Line(chunk, FILTERED_LINE_COLORS.get(level))
    return code


def RunCaptured(command, cwd=None, env=None, timeout=None):
    """执行外部命令并返回 (退出码, 合并输出)"""
    process_env = os.environ.copy()
    if env:
        process_env.update(env)
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            env=process_env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            stdin=subprocess.DEVNULL,
            timeout=timeout,
            check=False,
        )
    except OSError as error:
        raise ModuleError("执行命令失败: %s (%s)" % (" ".join(command), error)) from error
    except subprocess.TimeoutExpired as error:
        raise ModuleError("命令执行超时: %s" % " ".join(command)) from error

    output = result.stdout or b""
    if isinstance(output, bytes):
        output = output.decode("utf-8", errors="replace")
    return result.returncode, output


def RunHidden(command, cwd=None):
    """执行短命辅助命令, 输出丢弃.

    GUI 由 pythonw 启动时当前进程没有控制台, 直接 spawn taskkill / cmd 这类
    控制台程序会让每个子进程各弹一个窗口; Windows 下统一加 CREATE_NO_WINDOW,
    """
    popen_kwargs = {}
    if IS_WINDOWS:
        popen_kwargs["creationflags"] = CREATE_NO_WINDOW
    return subprocess.run(
        command,
        cwd=cwd,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
        **popen_kwargs,
    )


def ConsolePythonExecutable():
    """返回带控制台的 Python 解释器.

    GUI 如果由 pythonw.exe 启动, sys.executable 没有控制台,
    这里尽量换成同目录的 python.exe, 保证日志窗口能看到输出.
    """
    executable = sys.executable
    if IS_WINDOWS and executable.lower().endswith("pythonw.exe"):
        candidate = os.path.join(os.path.dirname(executable), "python.exe")
        if os.path.isfile(candidate):
            return candidate
    return executable


def GuiPythonExecutable():
    """返回启动 GUI 子进程用的解释器.

    Windows 优先 pythonw.exe, 避免压测窗口再附带一个控制台.
    """
    if IS_WINDOWS:
        candidate = os.path.join(os.path.dirname(sys.executable), "pythonw.exe")
        if os.path.isfile(candidate):
            return candidate
    return sys.executable


def EntryCommand(entry_script, module_id, options):
    """构造通过根入口执行指定模块的命令行"""
    command = [ConsolePythonExecutable(), entry_script, "--cli", "--module", module_id]
    for key in options:
        command.extend(["--option", "%s=%s" % (key, options[key])])
    return command


def SetProcessTitle(title):
    """设置当前控制台标题"""
    if not IS_WINDOWS:
        return
    try:
        ctypes.windll.kernel32.SetConsoleTitleW(title)
    except (AttributeError, OSError):
        pass
