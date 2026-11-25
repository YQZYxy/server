#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""模块运行上下文.

模块只依赖 Context, 不直接关心当前是命令行还是 GUI:
    context.console   输出与交互
    context.settings  配置与路径
    context.is_cli    是否是命令行模式
"""


class Context(object):
    """模块共享的运行时上下文"""

    def __init__(self, settings, console, is_cli, entry_script):
        self.m_settings = settings
        self.m_console = console
        self.m_is_cli = is_cli
        self.m_entry_script = entry_script

    @property
    def settings(self):
        return self.m_settings

    def SetSettings(self, settings):
        """切换部署目录后替换配置对象, 后续模块立即使用新目录"""
        self.m_settings = settings

    @property
    def console(self):
        return self.m_console

    @property
    def is_cli(self):
        return self.m_is_cli

    @property
    def entry_script(self):
        return self.m_entry_script

    @property
    def project_root(self):
        return self.m_settings.project_root
