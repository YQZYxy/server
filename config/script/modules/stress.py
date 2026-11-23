#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""压测工具入口模块.

压测实现已集成到 config/script/stress 包中:
    config/script/stress/gui.py       界面
    config/script/stress/scenarios.py 场景注册
    config/script/stress/runner.py    运行器

配置统一来自 config/script/config.json 的 stress 节点.
"""

import os
import subprocess

from ..core.errors import ModuleError
from ..core.menu import Module, Option
from ..core.platform_utils import (
    CREATE_NEW_PROCESS_GROUP,
    DETACHED_PROCESS,
    IS_WINDOWS,
    GuiPythonExecutable,
)
from ..stress.paths import StressStartupError, load_config


class StressModule(Module):
    """启动压测工具"""

    ID = "stress"
    TITLE = "压测工具"
    DESCRIPTION = "启动 config/script/stress 下的压测图形界面"

    OPTIONS = (
        Option("check", "只校验压测配置和协议路径, 不启动界面", "bool", default=False),
    )

    def Run(self, context, options):
        settings = context.settings

        # 先在主进程校验配置和协议路径, 错误直接显示在主工具日志里
        try:
            config = load_config()
        except StressStartupError as error:
            raise ModuleError(str(error)) from error

        if options["check"]:
            context.console.Line("压测配置检查通过")
            context.console.Line("  proto_dir:  %s" % config["proto_dir"])
            context.console.Line("  report_dir: %s" % config["report_dir"])
            context.console.Line("  state_file: %s" % config["state_file"])
            return 0

        command = [GuiPythonExecutable(), "-m", "config.script.stress"]
        env = os.environ.copy()
        python_path = env.get("PYTHONPATH", "")
        env["PYTHONPATH"] = (
            settings.project_root
            if not python_path
            else settings.project_root + os.pathsep + python_path
        )

        popen_kwargs = {"cwd": settings.project_root, "env": env}
        if IS_WINDOWS:
            # 独立进程, 主工具窗口关闭后压测窗口继续存在
            popen_kwargs["creationflags"] = DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP
        else:
            popen_kwargs["start_new_session"] = True

        try:
            subprocess.Popen(command, **popen_kwargs)
        except OSError as error:
            raise ModuleError("启动压测工具失败: %s" % error) from error

        context.console.Success(
            "压测工具已启动 (proto_dir: %s)" % config["proto_dir"]
        )
        return 0
