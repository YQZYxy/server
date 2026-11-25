#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""服务器脚本工具统一入口.

用法:
    python auto.py                          Windows 自动打开 GUI, 其它平台进入命令行菜单
    python auto.py --cli                    强制命令行菜单
    python auto.py --gui                    强制 GUI (仅 Windows 可用)
    python auto.py --deploy-dir debug       指定部署目录
    python auto.py --list                   列出全部模块
    python auto.py --module build --option build_type=release
    python auto.py --module deploy_config
    python auto.py --module validate_config --option instance=s1
    python auto.py --module svn_update
    python auto.py --module hot_update --option instances=s1,s2 --option content=lua,config
    python auto.py --config path/to/config.json

新增模块只需要修改 config/script/modules/__init__.py, 入口菜单会自动出现.

仓库里的 config/script/config.json, config/baseconfig.json, config/crossconfig.json
只作为默认模板: 启动时先确定部署目录(未设置时交互选择), 再复制到该目录,
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
from config.script.core.errors import ConfigError, ScriptError  # noqa: E402
from config.script.core.menu import MenuRunner  # noqa: E402
from config.script.core.platform_utils import IS_WINDOWS, IsGuiAvailable  # noqa: E402
from config.script.core.settings import (  # noqa: E402
    ApplyDeployDir,
    PromptDeployDir,
    Settings,
    default_config_path,
    open_settings,
)
from config.script.modules import create_modules  # noqa: E402


def ParseArgs(argv=None):
    parser = argparse.ArgumentParser(
        prog="auto.py",
        description="服务器脚本工具统一入口",
    )
    parser.add_argument("--config", default="", help="配置文件路径, 默认 config/script/config.json")
    parser.add_argument("--deploy-dir", default="", help="部署目录, 例如 debug / release / bin")
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


def IsInteractiveInput():
    """判断标准输入是否是可交互终端, 管道/重定向时不弹部署目录选择"""
    stream = sys.stdin
    checker = getattr(stream, "isatty", None)
    if checker is None:
        return False
    try:
        return bool(checker())
    except (AttributeError, OSError, ValueError):
        return False


def PrepareSettings(args, console, gui_ready=False):
    """确定部署目录并准备配置副本, 未设置时启动阶段先让用户选择

    有控制台时在终端里选择; pythonw 双击启动没有控制台, 改用弹窗.
    """
    config_file = args.config.strip() or default_config_path(__file__)
    base_settings = Settings(config_file)

    override = args.deploy_dir.strip()
    if override:
        if base_settings.GetDeployDirRaw() != override:
            ApplyDeployDir(base_settings, override)
    elif not base_settings.GetDeployDirRaw():
        if IsInteractiveInput():
            value = PromptDeployDir(base_settings, console)
        elif gui_ready:
            from config.script.core.dialogs import PromptDeployDirDialog
            value = PromptDeployDirDialog(base_settings.GetDeployDirRaw())
        else:
            raise ConfigError(
                "尚未选择部署目录: %s\n"
                "  请先运行 python auto.py 选择, 或使用 --deploy-dir 指定 (例如 debug / release)"
                % config_file
            )
        if not value:
            console.Line("未选择部署目录, 已取消")
            return None
        ApplyDeployDir(base_settings, value)

    settings, created_copies = open_settings(config_file)
    for path in created_copies:
        console.Line("  已生成部署配置副本: %s" % path)
    return settings


def ReportStartupError(args, message):
    """pythonw 双击启动没有控制台时, 用弹窗显示启动错误"""
    if not IS_WINDOWS or args is None or args.cli:
        return
    if IsInteractiveInput():
        return
    if not IsGuiAvailable():
        return
    from config.script.core.dialogs import ShowErrorDialog
    ShowErrorDialog("服务器脚本工具启动失败", str(message))


def RunMain(args):
    console = Console()
    modules = create_modules()

    if args.list:
        PrintModules(modules)
        return 0

    want_gui = args.gui or (IS_WINDOWS and not args.cli)
    # 单次执行模块不启动 GUI, 双击且未选择部署目录时仍可用弹窗选择
    needs_gui = not args.module
    gui_ready = bool(IS_WINDOWS and want_gui and needs_gui and IsGuiAvailable())

    # 先确定部署目录, 之后所有模块都以它为准
    settings = PrepareSettings(args, console, gui_ready)
    if settings is None:
        return 0
    context = Context(settings, console, True, os.path.abspath(__file__))

    runner = MenuRunner(context, modules)

    if args.module:
        return runner.RunOneShot(args.module, ParseOptions(args.option))

    if want_gui:
        if not IS_WINDOWS:
            console.Warn("当前平台不支持 GUI, 已回退命令行模式")
        elif not gui_ready:
            console.Warn("未检测到可用 GUI 环境, 已回退命令行模式")
        else:
            from config.script.gui.app import LaunchGui
            return LaunchGui(context, modules)

    return runner.RunInteractive()


def main(argv=None):
    ConfigureStdio()
    args = None
    try:
        args = ParseArgs(argv)
        return RunMain(args)
    except KeyboardInterrupt:
        print()
        return 0
    except ScriptError as error:
        print("[错误] %s" % error)
        ReportStartupError(args, error)
        return 1
    except Exception:
        print("[错误] 未处理的异常:")
        traceback.print_exc()
        ReportStartupError(args, "未处理的异常, 请改用命令行模式查看详细错误")
        return 1


if __name__ == "__main__":
    sys.exit(main())
