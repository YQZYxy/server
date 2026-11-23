#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""脚本框架的异常类型.

统一异常便于命令行和 GUI 分别处理:
    命令行: 只打印消息, 不打印堆栈
    GUI: 弹窗提示, 同时把详细信息写到日志区
"""


class ScriptError(RuntimeError):
    """可以直接展示给用户的脚本错误"""


class ConfigError(ScriptError):
    """配置文件缺失、字段缺失或类型不合法"""


class ModuleError(ScriptError):
    """模块执行期间的业务错误"""
