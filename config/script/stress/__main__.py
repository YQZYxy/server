#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""压测工具入口.

    python -m config.script.stress
    python -m config.script.stress --check

新增场景: 编辑 stress/scenarios.py, 用 @register_scenario 注册, 重启后界面自动出现.
"""

import sys
import traceback

from ..core.console import ConfigureStdio
from ..core.dialogs import ShowErrorDialog
from .paths import StressStartupError, load_config


def _report_startup_error(message):
    """pythonw 启动时没有控制台, 用弹窗提示"""
    try:
        print(message)
    except Exception:
        pass
    ShowErrorDialog("压测工具启动失败", message)


def _format_startup_error(error):
    if isinstance(error, StressStartupError):
        return str(error)
    return traceback.format_exc()


def _print_check():
    """打印解析后的压测路径, 用于部署前自检"""
    config = load_config()
    print("压测配置检查通过")
    print("  project_root: %s" % config["project_root"])
    print("  proto_dir:    %s" % config["proto_dir"])
    print("  report_dir:   %s" % config["report_dir"])
    print("  state_file:   %s" % config["state_file"])


def main(argv=None):
    args = list(sys.argv[1:] if argv is None else argv)
    ConfigureStdio()

    if "--check" in args:
        _print_check()
        return 0

    # 配置缺失或路径非法直接抛 StressStartupError
    load_config()

    from .gui import launch
    from .protocol import load_codec

    launch(load_codec())
    return 0


if __name__ == "__main__":
    # SystemExit 单独放行, 正常退出不该弹框
    try:
        exit_code = main()
    except SystemExit as error:
        exit_code = error.code if isinstance(error.code, int) else 1
    except BaseException as error:
        _report_startup_error(_format_startup_error(error))
        exit_code = 1
    sys.exit(exit_code)
