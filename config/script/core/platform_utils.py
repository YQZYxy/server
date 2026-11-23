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

from .errors import ModuleError

# 平台标识
IS_WINDOWS = os.name == "nt"
IS_MACOS = sys.platform == "darwin"
IS_LINUX = sys.platform.startswith("linux")

# 可执行文件后缀
EXE_SUFFIX = ".exe" if IS_WINDOWS else ""

# Windows 创建独立控制台窗口
CREATE_NEW_CONSOLE = getattr(subprocess, "CREATE_NEW_CONSOLE", 0)

# Windows 进程创建标志
DETACHED_PROCESS = 0x00000008
CREATE_NEW_PROCESS_GROUP = 0x00000200
CREATE_NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0)


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
        "找不到可执行工具: %s\n  已尝试: %s\n  请检查 config/script/config.json 中的配置"
        % (value, ", ".join(searched))
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


def RunStreaming(command, cwd, console, env=None):
    """执行外部命令并逐行输出, 返回退出码.

    逐行读取可以同时兼容命令行和 GUI 的日志收集.
    """
    console.Line("  > %s" % " ".join(command))
    process_env = os.environ.copy()
    if env:
        process_env.update(env)

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
            stdin=subprocess.DEVNULL,
        )
    except OSError as error:
        raise ModuleError("执行命令失败: %s (%s)" % (" ".join(command), error)) from error

    if process.stdout is not None:
        for line in process.stdout:
            console.Line("  " + line.rstrip("\r\n"))
    return process.wait()


def RunCaptured(command, cwd, env=None, timeout=None):
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
