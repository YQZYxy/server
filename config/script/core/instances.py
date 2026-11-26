#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""服务器实例清单与资源同步.

实例清单来自部署目录中的 crossconfig.json 副本, 启服/部署/日志模块共用:
    读取实例清单
    按勾选过滤实例
    启动前同步可执行文件, 运行库与资源目录
"""

import json
import os
import shutil

from .errors import ModuleError
from .platform_utils import RuntimeLibFiles

# 服务名
SERVER_DB = "dbserver"
SERVER_GLOBAL = "globalserver"
SERVER_LOGIC = "logicserver"
SERVER_GATEWAY = "gatewayserver"
SERVER_WEBUI = "webui"

# server_id 分段, 与 share/share.hpp 保持一致
NORMAL_MAX = 40000
SMALL_CROSS_BEGIN = 40001
SMALL_CROSS_END = 42000
LARGE_CROSS_BEGIN = 42001
LARGE_CROSS_END = 42800


class InstanceTarget(object):
    """一个实例目录及其要启动的进程"""

    def __init__(self, name, path, services, server_id):
        self.m_name = name
        self.m_path = path
        self.m_services = services
        self.m_server_id = server_id

    @property
    def name(self):
        return self.m_name

    @property
    def path(self):
        return self.m_path

    @property
    def services(self):
        return self.m_services

    @property
    def server_id(self):
        return self.m_server_id

    @property
    def kind(self):
        if SERVER_GLOBAL in self.m_services:
            return "hub"
        if SMALL_CROSS_BEGIN <= self.m_server_id <= SMALL_CROSS_END:
            return "small_cross"
        if LARGE_CROSS_BEGIN <= self.m_server_id <= LARGE_CROSS_END:
            return "big_cross"
        return "normal"


def ResolveInstanceRoot(settings, raw_value=""):
    """实例根目录, 未指定时使用统一的部署目录"""
    value = str(raw_value or "").strip()
    if not value:
        if not settings.deploy_dir:
            raise ModuleError("尚未选择部署目录, 请先运行 python auto.py 选择")
        return settings.deploy_dir
    if not os.path.isabs(value):
        value = os.path.join(settings.project_root, value)
    return os.path.normpath(value)


def LoadBlueprint(settings):
    """读取实例清单 JSON"""
    blueprint_path = settings.Path("paths.blueprint", must_exist=True)
    try:
        with open(blueprint_path, "r", encoding="utf-8-sig") as handle:
            blueprint = json.load(handle)
    except json.JSONDecodeError as error:
        raise ModuleError("实例清单 JSON 格式错误: %s (%s)" % (blueprint_path, error)) from error
    except OSError as error:
        raise ModuleError("读取实例清单失败: %s (%s)" % (blueprint_path, error)) from error

    nodes = blueprint.get("nodes")
    if not isinstance(nodes, list) or not nodes:
        raise ModuleError("实例清单缺少非空 nodes 数组: %s" % blueprint_path)
    return blueprint


def LoadTargets(settings, instance_root_raw=""):
    """读取实例清单并解析出实例目录"""
    blueprint = LoadBlueprint(settings)
    instance_root = ResolveInstanceRoot(settings, instance_root_raw)
    targets = []
    for node in blueprint["nodes"]:
        if not isinstance(node, dict):
            raise ModuleError("实例清单 nodes 元素必须是对象")
        name = node.get("name")
        services = node.get("executables")
        server_id = node.get("server_id")
        if not isinstance(name, str) or not name:
            raise ModuleError("实例清单节点缺少 name")
        if not isinstance(services, list) or not services:
            raise ModuleError("实例 %s 缺少 executables" % name)
        if not isinstance(server_id, int):
            raise ModuleError("实例 %s 的 server_id 必须是整数" % name)
        targets.append(
            InstanceTarget(name, os.path.join(instance_root, name), list(services), server_id)
        )
    return targets, instance_root, blueprint


def BuildChoiceGroups(context, database_only=False):
    """按中心服/跨服/大跨服/分区生成服务器分组"""
    targets, _root, blueprint = LoadTargets(context.settings)
    nodes = {
        str(node.get("name")): node
        for node in blueprint["nodes"]
        if isinstance(node, dict) and node.get("name")
    }
    zone_size = int(context.settings.Require("service.zone_group_size"))
    if zone_size <= 0:
        raise ModuleError("service.zone_group_size 必须大于 0")

    groups = {}
    for target in targets:
        if database_only and SERVER_DB not in target.services:
            continue
        node = nodes.get(target.name, {})
        if target.kind == "hub":
            title = "中心服"
        elif target.kind == "small_cross":
            title = "跨服"
        elif target.kind == "big_cross":
            title = "大跨服"
        elif node.get("zone_enabled"):
            zone_index = (max(target.server_id, 1) - 1) // zone_size + 1
            title = "分区 cross_%d" % zone_index
        else:
            title = "普通服"
        groups.setdefault(title, []).append((target.name, target.name))

    def SortKey(title):
        fixed = {"中心服": 0, "跨服": 1, "大跨服": 2, "普通服": 3}
        if title in fixed:
            return (fixed[title], 0)
        if title.startswith("分区 cross_"):
            try:
                return (4, int(title.rsplit("_", 1)[1]))
            except ValueError:
                pass
        return (9, title)

    return [(title, groups[title]) for title in sorted(groups, key=SortKey)]


def InstanceChoiceGroups(context):
    """服务器多选列表: 按类型和分区分组"""
    return BuildChoiceGroups(context, database_only=False)


def DatabaseChoiceGroups(context):
    """带数据服的服务器多选列表: 按类型和分区分组"""
    return BuildChoiceGroups(context, database_only=True)


def InstanceChoiceItems(context):
    """服务器多选列表: 只显示实例名"""
    return [
        item
        for _title, items in InstanceChoiceGroups(context)
        for item in items
    ]


def DatabaseChoiceItems(context):
    """带数据服的实例多选列表: 只显示实例名"""
    return [
        item
        for _title, items in DatabaseChoiceGroups(context)
        for item in items
    ]


def InstanceChoiceTips(context):
    """服务器多选列表的鼠标提示: 显示该实例的部署配置"""
    targets, _root, blueprint = LoadTargets(context.settings)
    target_paths = {target.name: target.path for target in targets}
    tips = {}
    for node in blueprint["nodes"]:
        name = str(node.get("name", ""))
        if not name:
            continue
        services = node.get("executables") or []
        lines = [
            "实例: %s" % name,
            "默认目录: %s" % target_paths.get(name, ""),
            "server_id: %s" % node.get("server_id", ""),
            "数据库: %s" % node.get("db_name", ""),
            "进程: %s" % ", ".join(str(item) for item in services),
            "端口: gateway=%s logic=%s battle=%s db=%s global=%s cluster=%s"
            % (
                node.get("gateway_port", ""),
                node.get("logic_port", ""),
                node.get("battle_port", ""),
                node.get("db_port", ""),
                node.get("global_port", ""),
                node.get("cluster_port", ""),
            ),
            "分区: %s" % ("开启" if node.get("zone_enabled") else "关闭"),
        ]
        tips[name] = "\n".join(lines)
    return tips


def ReadInstanceValue(settings, instance_path, section, key):
    """读取实例生效值: baseconfig 打底, 实例 config.json 覆盖"""
    value = None
    base_path = settings.Path("paths.baseconfig", must_exist=True)
    paths = (base_path, os.path.join(instance_path, "config", "config.json"))
    for path in paths:
        if not os.path.isfile(path):
            continue
        try:
            with open(path, "r", encoding="utf-8-sig") as handle:
                data = json.load(handle)
        except (OSError, json.JSONDecodeError):
            continue
        section_data = data.get(section)
        if isinstance(section_data, dict) and key in section_data:
            value = section_data[key]
    return value


def ServiceResources(settings):
    """各进程运行需要的资源目录: (仓库内绝对源路径, 实例内相对目标路径)

    这里只解析路径, 不要求目录已经存在; 缺少的资源由同步逻辑跳过,
    避免只有中心服或未构建前端时不能启服.
    """
    return {
        SERVER_LOGIC: [
            (settings.Path("paths.logic_config_dir"), os.path.join("config", "logicconfig")),
            (settings.Path("paths.luascript_dir"), "luascript"),
        ],
        SERVER_GATEWAY: [
            (settings.Path("paths.webui_dist"), "dist"),
        ],
    }


def FileChanged(src, dst):
    """源文件比目标新或大小不同时视为有变更"""
    if not os.path.isfile(dst):
        return True
    try:
        src_stat = os.stat(src)
        dst_stat = os.stat(dst)
    except OSError:
        return True
    if src_stat.st_size != dst_stat.st_size:
        return True
    return src_stat.st_mtime > dst_stat.st_mtime + 1


def SyncFileIfChanged(src, dst):
    """复制有变化的文件, 目标被占用时跳过"""
    if not FileChanged(src, dst):
        return False
    try:
        folder = os.path.dirname(dst)
        if folder:
            os.makedirs(folder, exist_ok=True)
        shutil.copy2(src, dst)
    except OSError:
        return False
    return True


def SyncDirIfChanged(src_dir, dst_dir, exclude=None):
    """递归同步目录, 不删除目标多余文件

    exclude 为相对源目录的路径(文件或目录), 命中的条目不参与同步.
    """
    exclude_items = [
        os.path.normpath(str(item))
        for item in (exclude or ())
        if str(item).strip()
    ]

    def IsExcluded(rel_path):
        normalized = os.path.normpath(rel_path)
        for item in exclude_items:
            if normalized == item or normalized.startswith(item + os.sep):
                return True
        return False

    changed = False
    for root, dirs, files in os.walk(src_dir):
        rel = os.path.relpath(root, src_dir)
        # 被排除的目录整棵剪掉, 避免继续往下遍历
        dirs[:] = [
            name for name in dirs
            if not IsExcluded(name if rel == "." else os.path.join(rel, name))
        ]
        target_root = dst_dir if rel == "." else os.path.join(dst_dir, rel)
        for name in files:
            if IsExcluded(name if rel == "." else os.path.join(rel, name)):
                continue
            src = os.path.join(root, name)
            dst = os.path.join(target_root, name)
            if SyncFileIfChanged(src, dst):
                changed = True
    return changed


def SyncRuntimeLibs(settings, instance_dir):
    """同步运行库 lib/*.dll / *.so / *.dylib"""
    lib_dir = settings.Path("paths.runtime_lib_dir", must_exist=True)
    changed = []
    for src in RuntimeLibFiles(lib_dir):
        dst = os.path.join(instance_dir, os.path.basename(src))
        if SyncFileIfChanged(src, dst):
            changed.append(os.path.basename(src))
    return changed


def PickFollowTarget(targets):
    """优先跟随逻辑服日志, 只有中心服时跟随全局服"""
    for target in targets:
        if SERVER_LOGIC in target.services:
            return target, SERVER_LOGIC
    for target in targets:
        if SERVER_GLOBAL in target.services:
            return target, SERVER_GLOBAL
    return None, ""
