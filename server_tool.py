#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""服务器脚本工具统一入口.

用法:
    python server_tool.py                          Windows 自动打开 GUI, 其它平台进入命令行菜单
    python server_tool.py --cli                    强制命令行菜单
    python server_tool.py --gui                    强制 GUI (仅 Windows 可用)
    python server_tool.py --list                   列出全部模块
    python server_tool.py --module build --option build_type=release
    python server_tool.py --module deploy_config
    python server_tool.py --module validate_config --option instance=s1
    python server_tool.py --config path/to/config.json

新增模块只需要修改 config/script/modules/__init__.py, 入口菜单会自动出现.
"""

import argparse
import os
import sys
import traceback

# 仓库根目录, 保证从任意工作目录启动都能导入 config.script
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from config.script.core.console import ConfigureStdio, Console  # noqa: E402
from config.script.core.context import Context  # noqa: E402
from config.script.core.errors import ScriptError  # noqa: E402
from config.script.core.menu import MenuRunner  # noqa: E402
from config.script.core.platform_utils import IS_WINDOWS, IsGuiAvailable  # noqa: E402
from config.script.core.settings import Settings, default_config_path  # noqa: E402
from config.script.modules import create_modules  # noqa: E402


def ParseArgs(argv=None):
    parser = argparse.ArgumentParser(
        prog="server_tool.py",
        description="服务器脚本工具统一入口",
    )
    parser.add_argument("--config", default="", help="配置文件路径, 默认 config/script/config.json")
    parser.add_argument("--cli", action="store_true", help="强制命令行模式")
    parser.add_argument("--gui", action="store_true", help="强制 GUI 模式 (仅 Windows)")
    parser.add_argument("--list", action="store_true", help="列出全部模块")
    parser.add_argument("--module", default="", help="直接执行指定模块, 不进入菜单")
    parser.add_argument(
        "--option", action="append", default=[],
        help="模块参数, 格式 key=value, 可重复",
    )
    return parser.parse_args(argv)


def ParseOptions(pairs):
    """把 --option key=value 解析成字典"""
    result = {}
    for pair in pairs:
        if "=" not in pair:
            raise ScriptError("--option 格式错误, 需要 key=value: %s" % pair)
        key, value = pair.split("=", 1)
        key = key.strip()
        if not key:
            raise ScriptError("--option 缺少参数名: %s" % pair)
        result[key] = value.strip()
    return result


def PrintModules(modules):
    """列出模块 ID 与标题"""
    print("可用模块:")
    for module in modules:
        print("  %-16s %-24s %s" % (module.ID, module.TITLE, module.DESCRIPTION))


def RunMain(args):
    config_file = args.config.strip() or default_config_path(__file__)
    settings = Settings(config_file)
    console = Console()
    context = Context(settings, console, True, os.path.abspath(__file__))
    modules = create_modules()

    if args.list:
        PrintModules(modules)
        return 0

    runner = MenuRunner(context, modules)

    if args.module:
        return runner.RunOneShot(args.module, ParseOptions(args.option))

    want_gui = args.gui or (IS_WINDOWS and not args.cli)
    if want_gui:
        if not IS_WINDOWS:
            console.Warn("当前平台不支持 GUI, 已回退命令行模式")
        elif not IsGuiAvailable():
            console.Warn("未检测到可用 GUI 环境, 已回退命令行模式")
        else:
            from config.script.gui.app import LaunchGui
            return LaunchGui(context, modules)

    return runner.RunInteractive()


def main(argv=None):
    ConfigureStdio()
    args = ParseArgs(argv)
    try:
        return RunMain(args)
    except KeyboardInterrupt:
        print()
        return 0
    except ScriptError as error:
        print("[错误] %s" % error)
        return 1
    except Exception:
        print("[错误] 未处理的异常:")
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
