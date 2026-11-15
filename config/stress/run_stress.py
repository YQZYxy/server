"""压测工具入口

    python config/stress/run_stress.py

新增场景: 编辑 stress/scenarios.py, 用 @register_scenario 注册, 重启后界面自动出现
"""

import ctypes
import os
import subprocess
import sys
import traceback

# 本文件在 stress 包内部, 直接运行时 sys.path[0] 就是包目录本身
_PACKAGE_DIR = os.path.dirname(os.path.abspath(__file__))
_PARENT_DIR = os.path.dirname(_PACKAGE_DIR)
if _PARENT_DIR not in sys.path:
    sys.path.insert(0, _PARENT_DIR)

from stress.paths import StressStartupError, load_config     # noqa: E402


def _setup_console_utf8():
    """Windows 控制台默认 GBK, 中文日志会乱码"""
    try:
        ctypes.windll.kernel32.SetConsoleOutputCP(65001)
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


def _report_startup_error(message):
    """pythonw 启动时没有控制台 """
    print(message)
    try:
        import tkinter as tk
        from tkinter import messagebox

        root = tk.Tk()
        root.withdraw()
        messagebox.showerror("压测工具启动失败", message[-2000:])
        root.destroy()
    except Exception:
        pass


def _format_startup_error(error):
    if isinstance(error, StressStartupError):
        return str(error)
    return traceback.format_exc()


def main():
    _setup_console_utf8()

    # 配置缺失或路径非法直接抛 StressStartupError
    load_config()

    from stress.gui import launch
    from stress.protocol import load_codec
    launch(load_codec())
    return 0


if __name__ == "__main__":
    # 用 python.exe 启动时转成 pythonw.exe
    if sys.platform == "win32" and sys.executable.lower().endswith("python.exe"):
        pythonw = os.path.join(os.path.dirname(sys.executable), "pythonw.exe")
        if os.path.exists(pythonw):
            subprocess.Popen([pythonw, os.path.abspath(__file__)] + sys.argv[1:])
            sys.exit(0)
    # SystemExit 单独放行 正常退出不该弹框
    try:
        exit_code = main()
    except SystemExit as error:
        exit_code = error.code if isinstance(error.code, int) else 1
    except BaseException as error:
        _report_startup_error(_format_startup_error(error))
        exit_code = 1
    sys.exit(exit_code)

