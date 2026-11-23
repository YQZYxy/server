#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""压测工具路径配置.

统一读取 config/script/config.json 的 stress 节点:
    stress.proto_dir   protoc 生成的 .pb 描述符目录
    stress.report_dir  压测报告输出目录
    stress.state_file  界面状态(地址/端口/历史目标)

所有路径相对 project_root 解析
"""

import glob
import os

from ..core.errors import ConfigError, ScriptError
from ..core.settings import Settings, package_config_path

# 主配置文件: config/script/config.json
_CONFIG_FILE = package_config_path()

# 解析结果缓存, 一次进程只读一次
_CONFIG_CACHE = None


class StressStartupError(ScriptError):
    """启动阶段的配置/协议错误, 消息本身可以直接展示给用户"""


def config_path():
    """主配置文件完整路径, 供错误提示使用"""
    return _CONFIG_FILE


def _load_settings():
    """加载主配置, 配置错误统一转成 StressStartupError"""
    try:
        return Settings(_CONFIG_FILE)
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
        "report_dir": settings.Path("stress.report_dir"),
        "state_file": settings.Path("stress.state_file"),
        # 界面主题等模块直接复用主配置对象
        "settings": settings,
    }
    _CONFIG_CACHE = config
    return config
