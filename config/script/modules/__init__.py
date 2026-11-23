#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""脚本模块注册表.

扩展新模块:
    1. 新建模块文件, 继承 core.menu.Module
    2. 在 create_modules() 的列表里追加实例
    3. 命令行菜单编号和 GUI 列表会自动更新
"""

from .build import BuildModule
from .config_table import ConfigTableModule
from .deploy import DeployModule, ResetDatabaseModule
from .deploy_config import DeployConfigModule
from .doctor import DoctorModule
from .lua_bindings import LuaBindingsModule
from .mysql_def import MysqlDefModule
from .protobuf import ProtobufModule
from .service import (
    ClearLogsModule,
    LogsModule,
    RestartModule,
    StartAllModule,
    StartModule,
    StopAllModule,
    StopModule,
)
from .settings_tool import SettingsModule
from .stress import StressModule
from .validate_config import ValidateConfigModule


def create_modules():
    """返回按菜单顺序排列的模块"""
    return [
        BuildModule(),
        DeployConfigModule(),
        DeployModule(),
        ResetDatabaseModule(),
        StartModule(),
        StartAllModule(),
        StopModule(),
        StopAllModule(),
        RestartModule(),
        ValidateConfigModule(),
        LogsModule(),
        ClearLogsModule(),
        ProtobufModule(),
        LuaBindingsModule(),
        MysqlDefModule(),
        ConfigTableModule(),
        StressModule(),
        DoctorModule(),
        SettingsModule(),
    ]
