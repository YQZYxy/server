#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""压力测试工具包(GUI).

入口:
    python -m config.script.stress          # 终端启动
    python -m config.script.stress --check  # 只校验配置与协议路径

Windows 下由主工具的“压测工具”模块用 pythonw 启动, 不会出现控制台黑框.

配置: config/script/config.json 的 stress 节点
扩展场景: 在 stress/scenarios.py 里用 @register_scenario 注册新类, 界面自动识别
"""

__all__ = [
    "paths",
    "protocol",
    "metrics",
    "bot",
    "scenarios",
    "runner",
    "sysmon",
    "gui",
]
