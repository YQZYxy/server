#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""部署配置模块.

提供一个专门编辑两份部署配置副本的入口(部署目录, 默认 debug):
    <deploy_dir>/baseconfig.json   公共配置
    <deploy_dir>/crossconfig.json  实例清单

仓库里的 config/baseconfig.json, config/crossconfig.json 只作为默认模板.
GUI 模式打开独立编辑器, 命令行模式使用分步向导; 两者共用同一份字段定义与校验规则.
"""

from ..core.deploy_config import (
    BASE_TABS,
    CROSS_GENERAL_FIELDS,
    NODE_FIELDS,
    DeployConfigStore,
    FormatValue,
    GetValue,
    NodeSummary,
    SetValue,
    ValidateField,
)
from ..core.errors import ConfigError, ScriptError
from ..core.menu import Module


class DeployConfigModule(Module):
    """编辑部署配置"""

    ID = "deploy_config"
    TITLE = "部署配置"
    DESCRIPTION = "图形/命令行编辑 baseconfig 与 crossconfig, 保存前自动校验"

    # GUI 入口识别到该标记后打开独立编辑器
    GUI_EDITOR = "deploy_config"

    OPTIONS = ()

    def Run(self, context, options):
        return DeployConfigWizard(context).Run()


class DeployConfigWizard(object):
    """命令行分步编辑向导"""

    def __init__(self, context):
        self.m_context = context
        self.m_console = context.console
        self.m_store = DeployConfigStore(context.settings)
        self.m_dirty = False

    def Run(self):
        self.m_console.Step("部署配置")
        self.m_console.Line("  基础配置: %s" % self.m_store.base_path)
        self.m_console.Line("  实例清单: %s" % self.m_store.cross_path)
        self.m_console.Line("  实例数量: %d" % len(self.GetNodes()))

        while True:
            action = self.m_console.Choose(
                "请选择操作",
                [
                    ("编辑基础配置", "base"),
                    ("编辑实例清单", "cross"),
                    ("校验两份配置", "validate"),
                    ("保存并退出", "save"),
                    ("放弃修改并退出", "cancel"),
                ],
                "base",
            )
            if action == "base":
                self.EditBase()
            elif action == "cross":
                self.EditCross()
            elif action == "validate":
                self.Validate()
            elif action == "save":
                if self.Save():
                    return 0
            elif action == "cancel":
                if not self.m_dirty or self.m_console.Confirm("有未保存修改, 确定放弃吗", False):
                    self.m_console.Warn("  已放弃本次修改")
                    return 0

    def EditBase(self):
        """选择基础配置分组并逐项编辑"""
        items = [(title, key) for key, title, _fields in BASE_TABS]
        items.append(("返回", "back"))
        group = self.m_console.Choose("选择配置分组", items, items[0][1])
        if group == "back":
            return
        for key, _title, fields in BASE_TABS:
            if key == group:
                self.EditFieldList(self.m_store.base, fields, "基础配置")
                return

    def EditCross(self):
        """编辑部署选项或实例节点"""
        while True:
            action = self.m_console.Choose(
                "实例清单",
                [
                    ("编辑部署选项", "general"),
                    ("编辑实例节点", "node"),
                    ("新增实例节点", "add"),
                    ("复制实例节点", "duplicate"),
                    ("删除实例节点", "remove"),
                    ("返回", "back"),
                ],
                "general",
            )
            if action == "back":
                return
            if action == "general":
                self.EditFieldList(self.m_store.cross, CROSS_GENERAL_FIELDS, "部署选项")
            elif action == "node":
                index = self.PickNode("选择要编辑的实例")
                if index is not None:
                    self.EditFieldList(self.GetNodes()[index], NODE_FIELDS, "实例 %s" % self.GetNodes()[index].get("name", "?"))
            elif action == "add":
                self.AddNode()
            elif action == "duplicate":
                self.DuplicateNode()
            elif action == "remove":
                self.RemoveNode()

    def EditFieldList(self, data, fields, scope):
        """编辑一组字段, 直到用户返回"""
        while True:
            items = []
            for field in fields:
                try:
                    value = FormatValue(field, GetValue(data, field.path))
                except ConfigError as error:
                    value = "读取失败: %s" % error
                items.append(("%s = %s" % (field.title, value), field.path))
            items.append(("返回", "back"))

            selected = self.m_console.Choose("%s: 选择字段" % scope, items, items[0][1])
            if selected == "back":
                return

            field = next((item for item in fields if item.path == selected), None)
            if field is None:
                continue
            try:
                current = GetValue(data, field.path)
            except ConfigError as error:
                self.m_console.Error("  %s" % error)
                continue

            if field.help_text:
                self.m_console.Line("  %s" % field.help_text)
            value = self.PromptField(field, current)
            if value is None:
                continue
            try:
                SetValue(data, field.path, value)
            except ConfigError as error:
                self.m_console.Error("  %s" % error)
                continue
            self.m_dirty = True
            self.m_console.Success("  已更新: %s = %s" % (field.title, FormatValue(field, value)))
            self.m_console.Line("  (修改只在内存中, 记得保存)")

    def PromptField(self, field, current):
        """交互式读取一个字段, 校验失败时重新输入"""
        while True:
            try:
                raw = self.PromptRaw(field, current)
                if raw is None:
                    return None
                value = self.ParseRaw(field, raw, current)
            except (ValueError, ConfigError) as error:
                self.m_console.Error("  输入无效: %s" % error)
                continue
            errors = ValidateField(field, value)
            if errors:
                for error in errors:
                    self.m_console.Error("  %s" % error)
                continue
            return value

    def PromptRaw(self, field, current):
        """按字段类型显示提示"""
        if field.kind == "bool":
            value = self.m_console.Confirm(field.title, bool(current))
            return "1" if value else "0"
        if field.kind == "multi_choice":
            self.m_console.Line("  可选进程:")
            for index, (label, _value) in enumerate(field.choices, start=1):
                self.m_console.Line("    %d. %s" % (index, label))
            return self.m_console.Ask(field.title, self.MultiChoiceDefault(field, current))
        if field.kind == "int_list":
            default = ", ".join(str(item) for item in current)
            return self.m_console.Ask(field.title, default)
        if field.kind == "password":
            return self.m_console.Ask("%s (留空保持不变)" % field.title, "")
        return self.m_console.Ask(field.title, str(current))

    def ParseRaw(self, field, raw, current):
        """把命令行输入转换为字段值"""
        if field.kind == "bool":
            return raw == "1"
        if field.kind == "int":
            return int(raw)
        if field.kind in ("string", "password"):
            if field.kind == "password" and raw == "":
                return current
            return raw
        if field.kind == "int_list":
            text = raw.strip()
            if text == "":
                return current
            if text in ("-", "0", "none", "空"):
                return []
            return [int(item.strip()) for item in text.split(",") if item.strip()]
        if field.kind == "multi_choice":
            text = raw.strip()
            if text == "" or text == self.MultiChoiceDefault(field, current):
                return current
            values = []
            index_map = {str(index): value for index, (_label, value) in enumerate(field.choices, start=1)}
            allowed = {value for _label, value in field.choices}
            for item in text.split(","):
                token = item.strip()
                if not token:
                    continue
                if token in index_map:
                    values.append(index_map[token])
                elif token in allowed:
                    values.append(token)
                else:
                    raise ValueError("未知进程: %s" % token)
            return values
        raise ValueError("未知字段类型: %s" % field.kind)

    def MultiChoiceDefault(self, field, current):
        """多选字段的默认输入: 用编号表示"""
        index_map = {value: str(index) for index, (_label, value) in enumerate(field.choices, start=1)}
        return ",".join(index_map.get(item, str(item)) for item in current)

    def AddNode(self):
        """新增节点并自动分配端口/server_id"""
        try:
            index = self.m_store.AddNode()
        except ConfigError as error:
            self.m_console.Error("  %s" % error)
            return
        self.m_dirty = True
        node = self.GetNodes()[index]
        self.m_console.Success("  已新增: %s" % NodeSummary(node))
        if self.m_console.Confirm("是否立即编辑新节点", True):
            self.EditFieldList(node, NODE_FIELDS, "新实例")

    def DuplicateNode(self):
        """复制节点并自动分配新的身份和端口"""
        index = self.PickNode("选择要复制的实例")
        if index is None:
            return
        try:
            new_index = self.m_store.DuplicateNode(index)
        except ConfigError as error:
            self.m_console.Error("  %s" % error)
            return
        self.m_dirty = True
        self.m_console.Success("  已复制: %s" % NodeSummary(self.GetNodes()[new_index]))

    def RemoveNode(self):
        """删除节点"""
        index = self.PickNode("选择要删除的实例")
        if index is None:
            return
        node = self.GetNodes()[index]
        if not self.m_console.Confirm("确定删除实例 %s 吗" % node.get("name", "?"), False):
            return
        try:
            self.m_store.RemoveNode(index)
        except ConfigError as error:
            self.m_console.Error("  %s" % error)
            return
        self.m_dirty = True
        self.m_console.Success("  已删除实例: %s" % node.get("name", "?"))

    def PickNode(self, prompt):
        """从实例列表中选择一个节点, 返回索引"""
        nodes = self.GetNodes()
        items = [(NodeSummary(node), str(index)) for index, node in enumerate(nodes)]
        if not items:
            self.m_console.Error("  没有可操作的实例节点")
            return None
        value = self.m_console.Choose(prompt, items, items[0][1])
        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    def GetNodes(self):
        """读取实例节点数组"""
        nodes = GetValue(self.m_store.cross, "nodes")
        if not isinstance(nodes, list):
            raise ConfigError("crossconfig.nodes 必须是数组")
        return nodes

    def Validate(self):
        """校验并打印结果"""
        try:
            errors = self.m_store.Validate()
        except ScriptError as error:
            self.m_console.Error("  %s" % error)
            return False
        if errors:
            self.m_console.Error("  校验失败 %d 项:" % len(errors))
            for error in errors:
                self.m_console.Error("    - %s" % error)
            return False
        self.m_console.Success("  校验通过")
        return True

    def Save(self):
        """校验并保存两份配置"""
        if not self.Validate():
            return False
        try:
            self.m_store.Save()
        except ConfigError as error:
            self.m_console.Error("  保存失败: %s" % error)
            return False
        self.m_dirty = False
        self.m_console.Success("  已保存:")
        self.m_console.Line("    %s" % self.m_store.base_path)
        self.m_console.Line("    %s" % self.m_store.cross_path)
        return True
