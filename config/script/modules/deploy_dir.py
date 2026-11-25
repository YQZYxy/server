#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""部署目录模块.

部署目录是构建打包/部署/启停/验证/日志/压测共用的唯一目录:
    <deploy_dir>/config.json       脚本配置副本
    <deploy_dir>/baseconfig.json   公共配置副本
    <deploy_dir>/crossconfig.json  实例清单副本
    <deploy_dir>/<实例名>/          服务器实例

切换后把三份配置副本重新准备到新目录, 并立即替换当前上下文配置.
"""

from ..core.menu import Module
from ..core.settings import (
    ApplyDeployDir,
    PromptDeployDir,
    Settings,
    open_settings,
)


class DeployDirModule(Module):
    """查看或切换部署目录"""

    ID = "deploy_dir"
    TITLE = "部署目录"
    DESCRIPTION = "查看/切换统一部署目录, 构建与运维模块都以该目录为准"

    OPTIONS = ()

    def Run(self, context, options):
        return DeployDirRunner(context).Run()


class DeployDirRunner(object):
    """部署目录查看与切换"""

    def __init__(self, context):
        self.m_context = context
        self.m_settings = context.settings
        self.m_console = context.console

    def Run(self):
        console = self.m_console
        console.Step("部署目录")
        console.Line("  当前部署目录: %s" % (self.m_settings.deploy_dir or "未设置"))
        console.Line("  基础配置: %s" % self.m_settings.base_config_file)
        console.Line("  切换后构建输出仍写入 %s, 由编译打包模块复制到新目录"
                     % self.m_settings.Path("build.build_root"))

        if not console.Confirm("是否切换部署目录", False):
            return 0

        base_settings = Settings(self.m_settings.base_config_file)
        value = PromptDeployDir(base_settings, console)
        ApplyDeployDir(base_settings, value)
        settings, created = open_settings(base_settings.config_file)
        self.m_context.SetSettings(settings)

        for path in created:
            console.Line("  已生成部署配置副本: %s" % path)
        console.Success("  部署目录已切换: %s" % settings.deploy_dir)
        console.Line("  默认构建类型: %s" % settings.Require("build.default_type"))
        return 0
