"""压测工具入口

    python run_stress.py

新增场景: 编辑 stress/scenarios.py, 用 @register_scenario 注册, 重启后界面自动出现
"""

import ctypes
import os
import subprocess
import sys


def _setup_console_utf8():
    """Windows 控制台默认 GBK, 中文日志会乱码"""
    try:
        ctypes.windll.kernel32.SetConsoleOutputCP(65001)
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


def main():
    _setup_console_utf8()

    from stress.gui import launch
    from stress.protocol import load_codec
    launch(load_codec())
    return 0


if __name__ == "__main__":
    if sys.platform == "win32" and sys.executable.lower().endswith("python.exe"):
        pythonw = os.path.join(os.path.dirname(sys.executable), "pythonw.exe")
        if os.path.exists(pythonw):
            subprocess.Popen([pythonw, os.path.abspath(__file__)] + sys.argv[1:])
            sys.exit(0)
    sys.exit(main())
