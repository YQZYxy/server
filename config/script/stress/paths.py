#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""压测工具路径配置.

统一读取配置副本(部署目录里的 config.json) 的 stress 节点:
    stress.proto_dir   protoc 生成的 .pb 描述符目录
    stress.report_dir  压测报告输出目录
    stress.state_file  界面状态(地址/端口/历史目标)

proto_dir 相对仓库根解析, report_dir/state_file 相对统一部署目录解析
"""

import glob
import os

from ..core.errors import ConfigError, ScriptError
from ..core.settings import open_settings, package_config_path

# 基础配置文件: config/script/config.json (运行时使用部署目录里的副本)
_CONFIG_FILE = package_config_path()

# 解析结果缓存, 一次进程只读一次
_CONFIG_CACHE = None


class StressStartupError(ScriptError):
    """启动阶段的配置/协议错误, 消息本身可以直接展示给用户"""


def config_path():
    """主配置文件完整路径, 供错误提示使用

    配置已加载时返回部署副本, 否则返回基础配置.
    """
    if _CONFIG_CACHE is not None:
        return _CONFIG_CACHE["settings"].config_file
    return _CONFIG_FILE


def _load_settings():
    """加载主配置, 配置错误统一转成 StressStartupError

    与 auto.py 一致, 读取部署目录里的配置副本.
    """
    try:
        settings, _created = open_settings(_CONFIG_FILE)
        return settings
    except ConfigError as error:
        raise StressStartupError("读取压测配置失败: %s" % error) from error


def _check_proto_dir(proto_dir):
    """proto_dir 必须是目录且存在 .pb 描述符"""
    if not os.path.isdir(proto_dir):
        raise StressStartupError(
            "stress.proto_dir 不是有效目录: %s\n请检查 %s 里的 stress.proto_dir"
            % (proto_dir, config_path())
        )
    if not glob.glob(os.path.join(proto_dir, "*.pb")):
        raise StressStartupError(
            "stress.proto_dir 下没有 .pb 描述符: %s\n"
            "请运行 python auto.py --cli --module protobuf 生成"
            % proto_dir
        )


def load_config():
    """读取并校验配置, 返回路径字典, 结果缓存"""
    global _CONFIG_CACHE
    if _CONFIG_CACHE is not None:
        return _CONFIG_CACHE

    settings = _load_settings()
    proto_dir = settings.Path("stress.proto_dir")
    _check_proto_dir(proto_dir)

    config = {
        "project_root": settings.project_root,
        "proto_dir": proto_dir,
        # 压测报告与界面状态都放在统一部署目录下
        "report_dir": settings.DeployPath(settings.Require("stress.report_dir")),
        "state_file": settings.DeployPath(settings.Require("stress.state_file")),
        # 界面主题等模块直接复用主配置对象
        "settings": settings,
    }
    _CONFIG_CACHE = config
    return config
