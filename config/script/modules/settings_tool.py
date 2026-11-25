#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""配置查看与修改模块.

支持在命令行窗口里直接修改部署目录中的配置副本(基础配置 config/script/config.json 的副本):
    修改后立即写回并重新校验, 校验失败会恢复原配置.
"""

import json

from ..core.errors import ConfigError, ModuleError
from ..core.menu import Module
from ..core.platform_utils import OpenPath


class SettingsModule(Module):
    """查看和修改脚本配置"""

    ID = "settings"
    TITLE = "配置管理"
    DESCRIPTION = "查看/修改部署目录中的配置副本, 支持路径热调整"

    OPTIONS = ()

    def Run(self, context, options):
        return SettingsEditor(context).Run()


class SettingsEditor(object):
    """命令行配置编辑器"""

    def __init__(self, context):
        self.m_context = context
        self.m_settings = context.settings
        self.m_console = context.console

    def Run(self):
        while True:
            self.PrintItems()
            self.m_console.Line()
            self.m_console.Line("  set <字段>   修改配置")
            self.m_console.Line("  open         用默认编辑器打开配置文件")
            self.m_console.Line("  reload       重新加载配置")
            self.m_console.Line("  q            返回")

            raw = self.m_console.Ask("配置操作", "q").strip()
            if raw.lower() in ("q", "quit", "exit"):
                return 0
            if raw.lower() == "open":
                OpenPath(self.m_settings.config_file)
                continue
            if raw.lower() == "reload":
                self.m_settings.Reload()
                self.m_console.Success("配置已重新加载")
                continue
            if raw.lower().startswith("set "):
                self.EditValue(raw[4:].strip())
                continue
            if raw.lower() == "set":
                key = self.m_console.Ask("字段路径", "")
                self.EditValue(key)
                continue

            self.m_console.Warn("未知操作: %s" % raw)

    def PrintItems(self):
        self.m_console.Step("当前配置")
        if self.m_settings.deploy_dir:
            self.m_console.Line("  部署目录: %s" % self.m_settings.deploy_dir)
            self.m_console.Line("  切换部署目录请使用“部署目录”模块, 全部模块统一以它为准")
        for key, value in self.m_settings.FlatItems():
            text = json.dumps(value, ensure_ascii=False)
            self.m_console.Line("  %-48s = %s" % (key, text))

    def EditValue(self, key):
        key = key.strip()
        if not key:
            return
        if key == "paths.deploy_dir":
            raise ModuleError(
                "paths.deploy_dir 由“部署目录”模块维护, 请在那里切换部署目录"
            )
        try:
            current = self.m_settings.Require(key)
        except ConfigError as error:
            self.m_console.Error("[错误] %s" % error)
            return

        self.m_console.Line("  当前值: %s" % json.dumps(current, ensure_ascii=False))
        raw = self.m_console.Ask("新值 (JSON, 字符串可直接输入)", "")
        if raw == "":
            self.m_console.Line("已取消")
            return

        try:
            value = json.loads(raw)
        except json.JSONDecodeError:
            # 当前是字符串时允许直接输入, 避免每次都写引号
            if isinstance(current, str):
                value = raw
            else:
                raise ModuleError("请输入合法的 JSON 值: %s" % raw)

        try:
            self.m_settings.SetValue(key, value)
            self.m_settings.Save()
        except ConfigError as error:
            raise ModuleError("配置保存失败, 已恢复原配置: %s" % error) from error

        self.m_console.Success("已更新: %s = %s" % (key, json.dumps(value, ensure_ascii=False)))
