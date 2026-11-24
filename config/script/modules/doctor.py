#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""环境自检模块.

检查配置、关键路径、外部工具与 Python 依赖, 方便换机器或部署时快速定位问题.
"""

import json
import sys

from ..core.errors import ModuleError
from ..core.menu import Module
from ..core.theme import GetTheme
from ..core.platform_utils import (
    IS_WINDOWS,
    FindCMake,
    FindMysql,
    IsGuiAvailable,
    PlatformName,
    ResolveTool,
)

# Python 最低版本
PYTHON_MIN_VERSION = (3, 8)


class DoctorModule(Module):
    """检查运行环境"""

    ID = "doctor"
    TITLE = "环境自检"
    DESCRIPTION = "检查配置路径、CMake/Node/protoc/MySQL 等依赖是否就绪"

    OPTIONS = ()

    def Run(self, context, options):
        return Doctor(context).Run()


class Doctor(object):
    """逐项检查并汇总"""

    def __init__(self, context):
        self.m_context = context
        self.m_settings = context.settings
        self.m_console = context.console
        self.m_errors = []
        self.m_warnings = []

    def Run(self):
        self.m_console.Step("基础环境")
        self.CheckPython()
        self.m_console.Line("  [OK] 平台: %s" % PlatformName())
        self.m_console.Line("  [OK] 项目根目录: %s" % self.m_settings.project_root)
        self.m_console.Line("  [OK] 配置文件: %s" % self.m_settings.config_file)
        self.m_console.Line("  [OK] 部署目录: %s" % self.m_settings.deploy_dir)

        self.m_console.Step("配置路径")
        self.CheckPath("paths.blueprint", "实例清单")
        self.CheckPath("paths.baseconfig", "公共配置")
        self.CheckPath("paths.mysql_schema", "建表 SQL")
        self.CheckPath("paths.logic_config_dir", "逻辑配置")
        self.CheckPath("paths.luascript_dir", "Lua 脚本")
        self.CheckPath("paths.webui_dir", "前端目录")
        self.CheckPath("paths.runtime_lib_dir", "运行库目录")

        self.m_console.Step("实例清单")
        self.CheckBlueprint()

        self.m_console.Step("界面主题")
        self.CheckTheme()

        self.m_console.Step("压测配置")
        self.CheckStress()

        self.m_console.Step("外部工具")
        self.CheckCMake()
        self.CheckTool("protobuf.protoc_executable", "protoc", required=True)
        self.CheckTool("config_table.dotnet", "dotnet", required=False)
        self.CheckTool("npm", "npm", required=False)
        self.CheckTool("node", "node", required=False)
        self.CheckMysql()

        self.m_console.Step("Python 依赖")
        self.CheckPythonModule("pymysql", "MySQL 表定义生成")
        self.CheckTkinter()

        self.m_console.Line()
        if self.m_warnings:
            self.m_console.Warn("警告 %d 项:" % len(self.m_warnings))
            for item in self.m_warnings:
                self.m_console.Warn("  - %s" % item)
        if self.m_errors:
            for item in self.m_errors:
                self.m_console.Error("  [FAIL] %s" % item)
            raise ModuleError("环境自检发现 %d 个问题" % len(self.m_errors))

        self.m_console.Success("环境自检通过")
        return 0

    def CheckPython(self):
        if sys.version_info < PYTHON_MIN_VERSION:
            self.m_errors.append(
                "Python 版本过低: %s, 需要 >= %d.%d"
                % (sys.version.split()[0], PYTHON_MIN_VERSION[0], PYTHON_MIN_VERSION[1])
            )
            return
        self.m_console.Line("  [OK] Python: %s" % sys.version.split()[0])

    def CheckPath(self, key, label):
        try:
            path = self.m_settings.Path(key, must_exist=True)
        except Exception as error:
            self.m_errors.append("%s (%s): %s" % (label, key, error))
            return
        self.m_console.Line("  [OK] %-12s %s" % (label, path))

    def CheckBlueprint(self):
        path = self.m_settings.Path("paths.blueprint", must_exist=True)
        try:
            with open(path, "r", encoding="utf-8-sig") as handle:
                data = json.load(handle)
        except Exception as error:
            self.m_errors.append("实例清单解析失败: %s" % error)
            return
        nodes = data.get("nodes")
        if not isinstance(nodes, list) or not nodes:
            self.m_errors.append("实例清单缺少非空 nodes 数组")
            return
        names = ", ".join(str(node.get("name", "?")) for node in nodes)
        self.m_console.Line("  [OK] 实例数量: %d (%s)" % (len(nodes), names))

    def CheckTool(self, key, label, required):
        try:
            if key in ("npm", "node"):
                path = ResolveTool(self.m_settings, key)
            else:
                path = ResolveTool(self.m_settings, str(self.m_settings.Require(key)))
        except Exception as error:
            message = "%s 不可用: %s" % (label, error)
            if required:
                self.m_errors.append(message)
            else:
                self.m_warnings.append(message)
            return
        self.m_console.Line("  [OK] %-12s %s" % (label, path))

    def CheckTheme(self):
        try:
            theme = GetTheme(self.m_settings)
        except Exception as error:
            self.m_errors.append("界面主题配置错误: %s" % error)
            return
        self.m_console.Line(
            "  [OK] %-12s %s (%s %dpt, 列表 %dpt)"
            % (
                "theme",
                theme["name"],
                theme["font_family"],
                theme["font_size"],
                theme["module_list_font_size"],
            )
        )

    def CheckStress(self):
        try:
            from ..stress.paths import load_config as load_stress_config

            config = load_stress_config()
        except Exception as error:
            self.m_warnings.append("压测配置不可用: %s" % error)
            return
        self.m_console.Line("  [OK] %-12s %s" % ("proto_dir", config["proto_dir"]))
        self.m_console.Line("  [OK] %-12s %s" % ("report_dir", config["report_dir"]))

    def CheckCMake(self):
        try:
            path = FindCMake(
                self.m_settings, str(self.m_settings.Require("build.cmake_executable"))
            )
        except Exception as error:
            self.m_errors.append("CMake 不可用: %s" % error)
            return
        self.m_console.Line("  [OK] %-12s %s" % ("cmake", path))

    def CheckMysql(self):
        try:
            path = FindMysql(
                self.m_settings,
                str(self.m_settings.Require("deploy.mysql_executable")),
                list(self.m_settings.Require("deploy.windows_mysql_search_versions")),
            )
        except Exception as error:
            self.m_warnings.append("MySQL 客户端不可用: %s" % error)
            return
        self.m_console.Line("  [OK] %-12s %s" % ("mysql", path))

    def CheckPythonModule(self, name, purpose):
        try:
            __import__(name)
        except ImportError:
            self.m_warnings.append("缺少 Python 模块 %s (%s): pip install %s" % (name, purpose, name))
            return
        self.m_console.Line("  [OK] %-12s (%s)" % (name, purpose))

    def CheckTkinter(self):
        if not IS_WINDOWS:
            self.m_console.Line("  [OK] 非 Windows 平台使用命令行模式")
            return
        if IsGuiAvailable():
            self.m_console.Line("  [OK] Tkinter GUI 可用")
            return
        self.m_warnings.append("Tkinter GUI 不可用, 入口会自动回退命令行模式")
