#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""模块注册与交互菜单.

扩展新模块只需要:
    1. 在 modules 下新建模块类, 继承 Module
    2. 在 modules/__init__.py 的 create_modules() 里追加实例
    3. 入口菜单会自动出现对应编号, GUI 也会自动出现对应列表项
"""

import traceback

from .errors import ConfigError, ModuleError, ScriptError
from .platform_utils import PlatformName


class Option(object):
    """模块参数定义, 同时服务于命令行提示与 GUI 表单"""

    def __init__(self, name, title, kind, default_from=None, default=None,
                 items=None, help_text="", required=False, persist=True,
                 item_tips=None, groups=None):
        self.m_name = name
        self.m_title = title
        self.m_kind = kind
        self.m_default_from = default_from
        self.m_default = default
        self.m_items = items or []
        self.m_help_text = help_text
        self.m_required = required
        self.m_persist = persist
        self.m_item_tips = item_tips
        self.m_groups = groups

    @property
    def name(self):
        return self.m_name

    @property
    def title(self):
        return self.m_title

    @property
    def kind(self):
        return self.m_kind

    @property
    def items(self):
        if callable(self.m_items):
            return []
        return list(self.m_items)

    def ResolveItems(self, context):
        """解析选项列表, items 可以是列表或 context -> 列表 的函数"""
        if self.m_groups is not None:
            items = []
            for _title, group_items in self.ResolveGroups(context):
                items.extend(group_items)
            return items
        return self.ResolveRawItems(context)

    def ResolveRawItems(self, context):
        items = self.m_items
        if callable(items):
            items = items(context)
        return list(items)

    def ResolveGroups(self, context):
        """解析选项分组, 未配置分组时返回一个无标题分组"""
        groups = self.m_groups
        if groups is None:
            return [("", self.ResolveRawItems(context))]
        if callable(groups):
            groups = groups(context)
        result = []
        for title, items in groups:
            result.append((str(title or ""), list(items)))
        return result

    def ResolveTips(self, context):
        """解析选项提示, item_tips 可以是字典或 context -> 字典 的函数"""
        tips = self.m_item_tips
        if callable(tips):
            tips = tips(context)
        if not isinstance(tips, dict):
            return {}
        return {str(key): str(value) for key, value in tips.items()}

    @property
    def help_text(self):
        return self.m_help_text

    @property
    def required(self):
        return self.m_required

    @property
    def default_from(self):
        return self.m_default_from

    @property
    def persist(self):
        return self.m_persist

    def Default(self, context):
        """读取默认值, 配置字段缺失时直接报错"""
        if self.m_default_from:
            value = context.settings.Require(self.m_default_from)
        else:
            value = self.m_default

        if self.m_kind == "choice" and value is not None:
            value = str(value)
            values = [item[1] for item in self.ResolveItems(context)]
            if value not in values:
                raise ModuleError(
                    "配置默认值不在可选范围内: %s = %s" % (self.m_default_from or self.m_name, value)
                )
        return self.Coerce(value)

    def Coerce(self, raw_value):
        """把字符串/JSON 值转换成模块需要的类型"""
        if raw_value is None:
            return None

        if self.m_kind == "bool":
            if isinstance(raw_value, bool):
                return raw_value
            text = str(raw_value).strip().lower()
            if text in ("1", "true", "yes", "y", "on"):
                return True
            if text in ("0", "false", "no", "n", "off", ""):
                return False
            raise ModuleError("参数 %s 需要布尔值: %s" % (self.m_name, raw_value))

        if self.m_kind == "int":
            if isinstance(raw_value, int) and not isinstance(raw_value, bool):
                return raw_value
            try:
                return int(str(raw_value).strip())
            except ValueError as error:
                raise ModuleError("参数 %s 需要整数: %s" % (self.m_name, raw_value)) from error

        if self.m_kind == "float":
            if isinstance(raw_value, (int, float)) and not isinstance(raw_value, bool):
                return float(raw_value)
            try:
                return float(str(raw_value).strip())
            except ValueError as error:
                raise ModuleError("参数 %s 需要数字: %s" % (self.m_name, raw_value)) from error

        if self.m_kind == "choice":
            text = str(raw_value)
            values = [item[1] for item in self.items]
            if text not in values:
                raise ModuleError(
                    "参数 %s 不在可选范围内: %s (可选: %s)"
                    % (self.m_name, text, ", ".join(values))
                )
            return text

        if self.m_kind == "multi_choice":
            if isinstance(raw_value, (list, tuple)):
                return [str(item) for item in raw_value if str(item) != ""]
            text = str(raw_value).strip()
            if text == "":
                return []
            return [item.strip() for item in text.split(",") if item.strip()]

        return str(raw_value)

    def PromptCli(self, context):
        """命令行逐项询问参数"""
        default = self.Default(context)
        console = context.console
        items = self.ResolveItems(context)
        if self.m_help_text:
            console.Line("  %s" % self.m_help_text)

        if self.m_kind == "choice":
            return console.Choose(self.m_title, items, default)

        if self.m_kind == "multi_choice":
            selected = set(default or [])
            groups = self.ResolveGroups(context)
            items = [item for _title, group_items in groups for item in group_items]
            index = 0
            for title, group_items in groups:
                if title:
                    console.Line("  [%s]" % title)
                for label, value in group_items:
                    index += 1
                    mark = "*" if value in selected else " "
                    console.Line("  %s %d. %s" % (mark, index, label))
            default_text = ",".join(
                str(index) for index, (_label, value) in enumerate(items, start=1)
                if value in selected
            )
            raw = console.Ask("%s (逗号分隔编号, 空=全不选)" % self.m_title, default_text)
            return self.ParseMultiChoice(raw, items)

        if self.m_kind == "bool":
            return console.Confirm(self.m_title, bool(default))

        if self.m_kind == "int":
            raw = console.Ask(self.m_title, str(default if default is not None else 0))
            return self.Coerce(raw)

        if self.m_kind == "float":
            raw = console.Ask(self.m_title, str(default if default is not None else 0))
            return self.Coerce(raw)

        raw = console.Ask(self.m_title, "" if default is None else str(default))
        return self.Coerce(raw)

    def ParseMultiChoice(self, raw_value, items):
        """命令行多选输入: 支持编号或原始值, 逗号分隔"""
        if isinstance(raw_value, (list, tuple)):
            return self.Coerce(raw_value)
        text = str(raw_value).strip()
        if text == "":
            return []
        index_map = {
            str(index): value
            for index, (_label, value) in enumerate(items, start=1)
        }
        allowed = {value for _label, value in items}
        result = []
        for item in text.split(","):
            token = item.strip()
            if not token:
                continue
            if token in index_map:
                result.append(index_map[token])
            elif token in allowed:
                result.append(token)
            else:
                raise ModuleError("参数 %s 包含未知选项: %s" % (self.m_name, token))
        return result


def _MatchConfigType(value, current):
    """按配置里已有值的类型转换参数, 避免把 int 写成 string"""
    if isinstance(current, bool):
        return bool(value)
    if isinstance(current, int):
        return int(value)
    if isinstance(current, float):
        return float(value)
    if isinstance(current, str):
        return str(value)
    if isinstance(current, list):
        values = value if isinstance(value, (list, tuple)) else [value]
        if current and all(isinstance(item, int) and not isinstance(item, bool) for item in current):
            return [int(item) for item in values]
        return [str(item) for item in values]
    return value


def PersistOptionValues(context, module, options, quiet=False):
    """把用户改过的模块参数写回 config.json.

    只处理同时满足以下条件的选项:
        1. Option 声明了 default_from
        2. Option.persist 为 True
        3. 本次值与配置当前值不同
    这样 force/dry_run/server_id 之类的临时开关不会被保存.
    """
    settings = context.settings
    changed = []
    for option in module.OPTIONS:
        if not option.persist or not option.default_from:
            continue
        if option.name not in options:
            continue
        current = settings.Require(option.default_from)
        value = _MatchConfigType(options[option.name], current)
        if value == current:
            continue
        settings.SetValue(option.default_from, value)
        changed.append(option.default_from)

    if not changed:
        return []
    try:
        settings.Save()
    except ConfigError as error:
        raise ModuleError(
            "写回模块参数失败 (%s): %s" % (settings.config_file, error)
        ) from error

    if not quiet:
        context.console.Line("[config] 已保存模块参数: %s" % ", ".join(changed))
    return changed


class Module(object):
    """脚本模块基类"""

    ID = ""
    TITLE = ""
    DESCRIPTION = ""

    # GUI 需要独立编辑器的模块可在子类设置该标记, 由 GUI 负责打开对应窗口
    GUI_EDITOR = ""

    OPTIONS = ()

    def Run(self, context, options):
        """执行模块, 子类必须实现"""
        raise NotImplementedError

    def Summary(self, context):
        """菜单里的简短描述, 子类可覆盖为动态内容"""
        return self.DESCRIPTION


class MenuRunner(object):
    """统一处理命令行菜单与单次模块执行"""

    def __init__(self, context, modules):
        self.m_context = context
        self.m_modules = modules

    def Find(self, selector):
        """按编号或模块 ID 查找模块"""
        text = str(selector).strip()
        if text.isdigit():
            index = int(text)
            if 1 <= index <= len(self.m_modules):
                return self.m_modules[index - 1]
        for module in self.m_modules:
            if module.ID == text:
                return module
        raise ModuleError("找不到模块: %s" % selector)

    def PrintMenu(self):
        context = self.m_context
        console = context.console
        console.Title("服务器脚本工具  (%s)" % PlatformName())
        console.Line("  工作目录: %s" % context.project_root)
        console.Line("  配置文件: %s" % context.settings.config_file)
        console.Line()
        for index, module in enumerate(self.m_modules, start=1):
            console.Line("  %2d. %-24s %s" % (index, module.TITLE, module.Summary(context)))
        console.Line("   0. 退出")

    def RunInteractive(self):
        """交互菜单, 直到用户选择退出"""
        while True:
            self.PrintMenu()
            raw = self.AskSelection()
            if raw in ("0", "q", "quit", "exit"):
                return 0
            try:
                module = self.Find(raw)
                options = self.PromptOptions(module)
                if options is None:
                    continue
                self.Execute(module, options)
            except KeyboardInterrupt:
                self.m_context.console.Line()
                continue
            except ScriptError as error:
                self.m_context.console.Error("[错误] %s" % error)
            except Exception:
                self.m_context.console.Error("[错误] 模块执行异常:")
                self.m_context.console.Line(traceback.format_exc())
            self.m_context.console.Pause()

    def AskSelection(self):
        """读取主菜单选择

        直接回车只是换行, 不会选中默认项; 只有显式输入 0 才退出.
        Ctrl+C / EOF 按退出处理, 避免管道输入结束后死循环.
        """
        console = self.m_context.console
        while True:
            try:
                raw = console.ReadLine("请选择 (0=退出): ").strip()
            except (EOFError, KeyboardInterrupt, RuntimeError):
                console.Line()
                return "0"
            if raw:
                return raw
            console.Line()

    def PromptOptions(self, module):
        """逐项询问模块参数.

        有默认值的模块先问一次是否直接使用默认参数, 避免每次都要回车确认一长串配置.
        """
        if not module.OPTIONS:
            return {}

        if self.m_context.console.Confirm("使用配置默认参数直接执行", True):
            return {option.name: option.Default(self.m_context) for option in module.OPTIONS}

        options = {}
        for option in module.OPTIONS:
            options[option.name] = option.PromptCli(self.m_context)
        return options

    def RunOneShot(self, module_id, raw_options):
        """单次执行, 不进入菜单.

        raw_options 来自 --option key=value.
        未传的选项使用配置默认值, 必填项缺失直接报错.
        """
        module = self.Find(module_id)
        known = {option.name for option in module.OPTIONS}
        unknown = sorted(set(raw_options) - known)
        if unknown:
            raise ModuleError(
                "模块 %s 不支持参数: %s (可用: %s)"
                % (module.ID, ", ".join(unknown), ", ".join(sorted(known)) or "无")
            )

        options = {}
        for option in module.OPTIONS:
            if option.name in raw_options:
                options[option.name] = option.Coerce(raw_options[option.name])
                continue
            default = option.Default(self.m_context)
            if option.required and default in (None, ""):
                raise ModuleError("缺少必填参数: %s" % option.name)
            options[option.name] = default
        return self.Execute(module, options)

    def Execute(self, module, options):
        """执行模块, 统一打印开始与结束"""
        console = self.m_context.console
        console.Step("执行模块: %s (%s)" % (module.TITLE, module.ID))
        PersistOptionValues(self.m_context, module, options)
        result = module.Run(self.m_context, options)
        console.Line()
        console.Success("[完成] %s" % module.TITLE)
        return result if isinstance(result, int) else 0
