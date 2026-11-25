#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""服务器热更模块.

不重启进程的前提下更新运行中的服务器:
    1. 把仓库里改过的资源同步到勾选的实例目录
    2. 通过实例网关发送 GM 指令让逻辑服重新加载
        改动 lua 脚本/配置表(lua)/protobuf -> reloadlua
        改动 config/logicconfig 配置表     -> reloadconfig
前端 dist 由网关静态服务直接读取, 同步后刷新页面即可.

用法:
    python auto.py --module hot_update --option instances=s1,s2 --option content=lua,config
    python auto.py --module hot_update --option instances=s1 --option content=lua,protobuf
"""

import glob
import os

from ..core.errors import ModuleError
from ..core.gm_client import GmClient
from ..core.instances import (
    InstanceChoiceGroups,
    InstanceChoiceTips,
    LoadTargets,
    ReadInstanceValue,
    SERVER_GATEWAY,
    SERVER_LOGIC,
    SyncDirIfChanged,
    SyncFileIfChanged,
)
from ..core.menu import Module, Option

# 热更内容标识
CONTENT_LUA = "lua"
CONTENT_CONFIG = "config"
CONTENT_PROTOBUF = "protobuf"
CONTENT_WEBUI = "webui"

# 热更内容选项: (显示名, 标识)
CONTENT_CHOICES = (
    ("lua 脚本", CONTENT_LUA),
    ("配置表", CONTENT_CONFIG),
    ("protobuf 协议", CONTENT_PROTOBUF),
    ("前端 dist", CONTENT_WEBUI),
)

# 默认热更 lua 与配置表
DEFAULT_CONTENT = (CONTENT_LUA, CONTENT_CONFIG)

# lua 同步时排除配置表与协议目录, 它们由对应选项单独同步
LUA_EXCLUDE_DIRS = ("config", "proto")

# 热更使用的 GM 指令
GM_RELOAD_LUA = "reloadlua"
GM_RELOAD_CONFIG = "reloadconfig"


def FilterTargets(console, targets, instance_names):
    """按勾选的实例名过滤实例清单, 未选择时直接报错"""
    names = [str(name).strip() for name in (instance_names or []) if str(name).strip()]
    if not names:
        raise ModuleError("请至少选择一个服务器")

    selected_names = set(names)
    known_names = {target.name for target in targets}
    unknown = [name for name in names if name not in known_names]
    if unknown:
        console.Warn("  警告: 忽略实例清单中不存在的服务器: %s" % ", ".join(unknown))

    selected = [target for target in targets if target.name in selected_names]
    if not selected:
        raise ModuleError("选择的服务器都不在实例清单中: %s" % ", ".join(names))
    return selected


def NormalizeContents(raw_contents):
    """过滤并去重热更内容, 保持选项顺序"""
    if isinstance(raw_contents, str):
        raw_contents = [item.strip() for item in raw_contents.split(",")]
    allowed = {value for _label, value in CONTENT_CHOICES}
    result = []
    for item in raw_contents or []:
        value = str(item).strip()
        if value and value in allowed and value not in result:
            result.append(value)
    if not result:
        raise ModuleError(
            "热更内容不能为空, 可选: %s" % ", ".join(value for _label, value in CONTENT_CHOICES)
        )
    return result


def SyncLua(settings, instance_dir):
    """同步 luascript 代码, 配置表与协议目录由各自选项负责"""
    src_dir = settings.Path("paths.luascript_dir", must_exist=True)
    return SyncDirIfChanged(
        src_dir,
        os.path.join(instance_dir, "luascript"),
        exclude=LUA_EXCLUDE_DIRS,
    )


def SyncConfig(settings, console, instance_dir):
    """同步配置表, 返回 (logicconfig 变化, lua 配置表变化)"""
    logic_changed = SyncDirIfChanged(
        settings.Path("paths.logic_config_dir", must_exist=True),
        os.path.join(instance_dir, "config", "logicconfig"),
    )

    lua_src = os.path.join(settings.Path("paths.luascript_dir", must_exist=True), "config")
    lua_changed = False
    if os.path.isdir(lua_src):
        lua_changed = SyncDirIfChanged(
            lua_src,
            os.path.join(instance_dir, "luascript", "config"),
        )
    else:
        console.Warn("  警告: 没有 lua 配置表目录, 跳过: %s" % lua_src)
    return logic_changed, lua_changed


def SyncProtobuf(settings, instance_dir):
    """同步 protoc 生成的 .pb 与 protobufmht.lua"""
    src_dir = settings.Path("protobuf.lua_output_dir", must_exist=True)
    dst_dir = os.path.join(instance_dir, "luascript", "proto")

    changed = False
    for src in sorted(glob.glob(os.path.join(src_dir, "*.pb"))):
        if SyncFileIfChanged(src, os.path.join(dst_dir, os.path.basename(src))):
            changed = True

    mht_src = os.path.join(src_dir, "protobufmht.lua")
    if os.path.isfile(mht_src) and SyncFileIfChanged(
        mht_src, os.path.join(dst_dir, "protobufmht.lua")
    ):
        changed = True
    return changed


def SyncWebui(settings, instance_dir):
    """同步前端构建产物到网关静态目录"""
    src_dir = settings.Path("paths.webui_dist")
    if not os.path.isdir(src_dir):
        raise ModuleError("前端产物不存在: %s\n  请先构建前端再热更 dist" % src_dir)
    return SyncDirIfChanged(src_dir, os.path.join(instance_dir, "dist"))


class HotUpdateModule(Module):
    """同步资源并触发逻辑服热重载"""

    ID = "hot_update"
    TITLE = "热更服务器"
    DESCRIPTION = "同步 lua/配置表/protobuf/前端到运行实例, 并通过 GM 指令重载, 不重启进程"

    OPTIONS = (
        Option(
            "instances", "热更服务器", "multi_choice",
            groups=InstanceChoiceGroups,
            item_tips=InstanceChoiceTips,
            required=True,
            layout="list",
        ),
        Option(
            "content", "热更内容", "multi_choice",
            items=CONTENT_CHOICES,
            default=list(DEFAULT_CONTENT),
            required=True,
            help_text="可多选: lua 脚本, config 配置表, protobuf 协议, webui 前端",
        ),
        Option(
            "reload", "同步后发送 GM 重载", "bool",
            default=True,
            help_text="关闭时只同步文件, 由你自行在 GM 面板重载",
        ),
    )

    def Run(self, context, options):
        return HotUpdateRunner(context, options).Run()


class HotUpdateRunner(object):
    """按实例执行同步与 GM 重载"""

    def __init__(self, context, options):
        self.m_context = context
        self.m_settings = context.settings
        self.m_console = context.console
        self.m_options = options
        self.m_client = None

    def Run(self):
        contents = NormalizeContents(self.m_options.get("content"))
        self.ValidateSources(contents)
        targets, _instance_root, _blueprint = LoadTargets(self.m_settings)
        targets = FilterTargets(self.m_console, targets, self.m_options.get("instances"))

        self.m_console.Step("热更服务器")
        self.m_console.Line("  热更内容: %s" % ", ".join(contents))
        self.m_console.Line()

        changed_count = 0
        reloaded_count = 0
        skipped_count = 0
        for target in targets:
            result = self.UpdateTarget(target, contents)
            if result is None:
                skipped_count += 1
                continue
            if result["changed"]:
                changed_count += 1
            if self.m_options.get("reload") and result["changed"]:
                status = self.ReloadTarget(target, result)
                if status is True:
                    reloaded_count += 1
                elif status is False:
                    skipped_count += 1
            elif result["changed"]:
                self.m_console.Line(
                    "  [sync] %s 文件已同步, 未发送 GM 重载" % target.name
                )

        self.m_console.Line()
        self.m_console.Line(
            "[hot_update] 实例: %d, 有变化: %d, 已重载: %d, 待处理: %d"
            % (len(targets), changed_count, reloaded_count, skipped_count)
        )
        return 0

    def ValidateSources(self, contents):
        """执行前检查源资源, 避免同步到一半才发现缺失"""
        if CONTENT_LUA in contents or CONTENT_CONFIG in contents:
            self.m_settings.Path("paths.luascript_dir", must_exist=True)
        if CONTENT_CONFIG in contents:
            self.m_settings.Path("paths.logic_config_dir", must_exist=True)
        if CONTENT_PROTOBUF in contents:
            proto_dir = self.m_settings.Path("protobuf.lua_output_dir", must_exist=True)
            if not glob.glob(os.path.join(proto_dir, "*.pb")):
                raise ModuleError(
                    "协议目录没有 .pb 描述符: %s\n  请先运行 protobuf 模块" % proto_dir
                )
        if CONTENT_WEBUI in contents:
            dist_dir = self.m_settings.Path("paths.webui_dist")
            if not os.path.isdir(dist_dir):
                raise ModuleError(
                    "前端产物不存在: %s\n  请先构建前端再热更 dist" % dist_dir
                )

    def UpdateTarget(self, target, contents):
        """同步单个实例, 返回变化信息; 完全跳过时返回 None

        返回值字段:
            changed      用于展示的变化内容集合
            lua_reload   需要发送 reloadlua
            logic_reload 需要发送 reloadconfig
        """
        if not os.path.isdir(target.path):
            self.m_console.Warn(
                "  [跳过] %s: 实例目录不存在 %s" % (target.name, target.path)
            )
            return None

        changed = set()
        lua_reload = False
        logic_reload = False
        applicable = False
        for content in contents:
            if content == CONTENT_LUA:
                if SERVER_LOGIC not in target.services:
                    continue
                applicable = True
                if SyncLua(self.m_settings, target.path):
                    changed.add(CONTENT_LUA)
                    lua_reload = True
            elif content == CONTENT_CONFIG:
                if SERVER_LOGIC not in target.services:
                    continue
                applicable = True
                logic_changed, lua_changed = SyncConfig(
                    self.m_settings, self.m_console, target.path
                )
                if logic_changed:
                    changed.add(CONTENT_CONFIG)
                    logic_reload = True
                if lua_changed:
                    changed.add(CONTENT_CONFIG)
                    lua_reload = True
            elif content == CONTENT_PROTOBUF:
                if SERVER_LOGIC not in target.services:
                    continue
                applicable = True
                if SyncProtobuf(self.m_settings, target.path):
                    changed.add(CONTENT_PROTOBUF)
                    lua_reload = True
            elif content == CONTENT_WEBUI:
                if SERVER_GATEWAY not in target.services:
                    continue
                applicable = True
                if SyncWebui(self.m_settings, target.path):
                    changed.add(CONTENT_WEBUI)

        if not applicable:
            self.m_console.Warn(
                "  [跳过] %s: 所选内容不需要该实例的进程: %s"
                % (target.name, ", ".join(target.services))
            )
            return None

        result = {
            "changed": changed,
            "lua_reload": lua_reload,
            "logic_reload": logic_reload,
        }
        if not changed:
            self.m_console.Line("  [sync] %s 已是最新" % target.name)
            return result

        self.m_console.Success(
            "  [sync] %s: %s" % (target.name, ", ".join(sorted(changed)))
        )
        if CONTENT_WEBUI in changed:
            self.m_console.Line(
                "  [提示] %s 前端 dist 已同步, 刷新浏览器后生效" % target.name
            )
        return result

    def ReloadTarget(self, target, result):
        """按变化内容发送 GM 重载指令

        返回 True 表示指令执行成功, False 表示失败, None 表示无需发送.
        """
        commands = []
        if result["lua_reload"]:
            commands.append(GM_RELOAD_LUA)
        if result["logic_reload"]:
            commands.append(GM_RELOAD_CONFIG)
        if not commands:
            return None

        if SERVER_GATEWAY not in target.services:
            self.m_console.Warn(
                "  [待处理] %s: 没有网关进程, 无法发送 GM 指令, 请重启后生效" % target.name
            )
            return False

        port = ReadInstanceValue(
            self.m_settings, target.path, SERVER_GATEWAY, "ListenPort"
        )
        if not isinstance(port, int) or port <= 0:
            self.m_console.Warn(
                "  [待处理] %s: 实例配置里没有 gatewayserver.ListenPort" % target.name
            )
            return False

        try:
            client = self.Client()
            responses = client.SendCommands("127.0.0.1", port, commands)
        except ModuleError as error:
            self.m_console.Warn(
                "  [待处理] %s: GM 重载失败(服务器可能未启动): %s" % (target.name, error)
            )
            return False

        failed = []
        for command, response in zip(commands, responses):
            ret = getattr(response, "ret", -1) if response is not None else -1
            if ret != 0:
                failed.append("%s(ret=%s)" % (command, ret))
        if failed:
            self.m_console.Warn(
                "  [待处理] %s: GM 指令执行失败: %s" % (target.name, ", ".join(failed))
            )
            return False

        self.m_console.Success(
            "  [reload] %s: %s" % (target.name, ", ".join(commands))
        )
        return True

    def Client(self):
        """复用同一个 GM 客户端, 只加载一次协议描述符"""
        if self.m_client is None:
            proto_dir = self.m_settings.Path("protobuf.lua_output_dir", must_exist=True)
            self.m_client = GmClient(proto_dir)
        return self.m_client
