#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""部署配置读写与校验.

统一管理两份部署配置副本(部署目录, 默认 debug):
    <deploy_dir>/baseconfig.json   公共配置
    <deploy_dir>/crossconfig.json  实例清单

仓库里的 config/baseconfig.json, config/crossconfig.json 只作为默认模板.
GUI 编辑器和命令行向导共用这里的字段定义与校验规则, 避免两套逻辑漂移.
"""

import copy
import json
import os

from .errors import ConfigError
from .instances import LARGE_CROSS_END, NORMAL_MAX
from .settings import write_json

# 实例可选的进程
SERVICE_CHOICES = (
    ("网关 gatewayserver", "gatewayserver"),
    ("逻辑 logicserver", "logicserver"),
    ("数据 dbserver", "dbserver"),
    ("中心 globalserver", "globalserver"),
)

# 进程节点类型, 与 deploy.py 保持一致
SERVICE_NODE_TYPE = {
    "gatewayserver": 1,
    "logicserver": 2,
    "globalserver": 3,
    "dbserver": 4,
}

# 实例内唯一的端口字段
UNIQUE_PORT_KEYS = ("gateway_port", "logic_port", "battle_port", "db_port", "cluster_port")


class ConfigField(object):
    """一个可编辑配置字段的定义"""

    def __init__(self, path, title, kind, choices=None, help_text="",
                 minimum=None, maximum=None, allow_empty=False, min_items=None):
        self.m_path = path
        self.m_title = title
        self.m_kind = kind
        self.m_choices = choices or ()
        self.m_help_text = help_text
        self.m_minimum = minimum
        self.m_maximum = maximum
        self.m_allow_empty = allow_empty
        self.m_min_items = min_items

    @property
    def path(self):
        return self.m_path

    @property
    def title(self):
        return self.m_title

    @property
    def kind(self):
        return self.m_kind

    @property
    def choices(self):
        return list(self.m_choices)

    @property
    def help_text(self):
        return self.m_help_text

    @property
    def minimum(self):
        return self.m_minimum

    @property
    def maximum(self):
        return self.m_maximum

    @property
    def allow_empty(self):
        return self.m_allow_empty

    @property
    def min_items(self):
        return self.m_min_items


# 基础配置按标签页分组
BASE_TABS = (
    ("gatewayserver", "网关服务器", (
        ConfigField("gatewayserver.ListenIP", "监听 IP", "string"),
        ConfigField("gatewayserver.ListenPort", "监听端口", "int", minimum=1, maximum=65535),
        ConfigField("gatewayserver.ConnectIP", "连接 IP", "string"),
        ConfigField("gatewayserver.StaticDir", "静态目录", "string"),
    )),
    ("globalserver", "中心服务器", (
        ConfigField("globalserver.ListenIP", "监听 IP", "string"),
        ConfigField("globalserver.ListenPort", "监听端口", "int", minimum=1, maximum=65535),
        ConfigField("globalserver.ConnectIP", "连接 IP", "string"),
    )),
    ("logicserver", "逻辑服务器", (
        ConfigField("logicserver.ListenIP", "监听 IP", "string"),
        ConfigField("logicserver.ListenPort", "监听端口", "int", minimum=1, maximum=65535),
        ConfigField("logicserver.ConnectIP", "连接 IP", "string"),
        ConfigField("logicserver.BattleListenPort", "战斗监听端口", "int", minimum=1, maximum=65535),
        ConfigField("logicserver.ServerId", "默认 server_id", "int", minimum=1, maximum=LARGE_CROSS_END),
        ConfigField("logicserver.ServerBeginTimestamp", "开服时间", "string"),
        ConfigField("logicserver.LuaScriptDir", "Lua 脚本目录", "string"),
    )),
    ("dbserver", "数据库服务器", (
        ConfigField("dbserver.ListenIP", "监听 IP", "string"),
        ConfigField("dbserver.ListenPort", "监听端口", "int", minimum=1, maximum=65535),
        ConfigField("dbserver.ConnectIP", "连接 IP", "string"),
        ConfigField("dbserver.Counter.DBName", "默认数据库名", "string"),
        ConfigField("dbserver.Counter.UserName", "数据库用户", "string"),
        ConfigField("dbserver.Counter.Password", "数据库密码", "password", allow_empty=True),
        ConfigField("dbserver.Counter.AddrIP", "数据库地址", "string"),
    )),
    ("plugin", "插件与合服", (
        ConfigField("plugin.node.zone_id", "节点 zone_id", "int", minimum=0),
        ConfigField("plugin.node.instance_id", "节点 instance_id", "int", minimum=0),
        ConfigField("plugin.cluster.enabled", "启用集群", "bool"),
        ConfigField("plugin.cluster.listen_ip", "集群监听 IP", "string"),
        ConfigField("plugin.cluster.listen_port", "集群监听端口 (0=自动)", "int", minimum=0, maximum=65535),
        ConfigField("plugin.cluster.auth_token", "集群认证令牌", "string", allow_empty=True),
        ConfigField("plugin.cluster.heartbeat_interval", "心跳间隔 (秒)", "int", minimum=1),
        ConfigField("plugin.cluster.heartbeat_timeout", "心跳超时 (秒)", "int", minimum=1),
        ConfigField("plugin.cluster.connect_retry_interval", "重连间隔 (秒)", "int", minimum=1),
        ConfigField("plugin.cluster.request_timeout", "请求超时 (秒)", "int", minimum=1),
        ConfigField("plugin.cluster.max_frame_size", "最大帧大小", "int", minimum=1),
        ConfigField("plugin.zone.enabled", "启用分区", "bool"),
        ConfigField("plugin.merged_server_ids", "合服旧 server_id 列表", "int_list",
                    help_text="逗号分隔, 输入 - 表示清空"),
    )),
)

# 实例清单全局字段
CROSS_GENERAL_FIELDS = (
    ConfigField("deploy.link", "部署时使用链接", "bool"),
    ConfigField("deploy.skip_existing", "跳过已存在文件", "bool"),
    ConfigField("deploy.copy_pdb", "复制 PDB 文件", "bool"),
    ConfigField("peers_ip", "跨服互联 IP", "string"),
    ConfigField("zone_server_ids", "同区 server_id 列表", "int_list", minimum=1,
                min_items=1, help_text="逗号分隔"),
)

# 单个实例节点的字段
NODE_FIELDS = (
    ConfigField("name", "实例名", "string"),
    ConfigField("server_id", "server_id", "int", minimum=1, maximum=LARGE_CROSS_END),
    ConfigField("db_name", "数据库名", "string"),
    ConfigField("executables", "启动进程", "multi_choice", choices=SERVICE_CHOICES),
    ConfigField("gateway_port", "网关端口", "int", minimum=1, maximum=65535),
    ConfigField("logic_port", "逻辑端口", "int", minimum=1, maximum=65535),
    ConfigField("battle_port", "战斗端口", "int", minimum=1, maximum=65535),
    ConfigField("db_port", "数据服端口", "int", minimum=1, maximum=65535),
    ConfigField("global_port", "中心服端口", "int", minimum=1, maximum=65535),
    ConfigField("cluster_port", "集群端口", "int", minimum=1, maximum=65535),
    ConfigField("zone_enabled", "启用分区", "bool"),
)


def ReadJsonObject(path):
    """读取 JSON 对象, 配置缺失或格式错误时直接报错"""
    try:
        with open(path, "r", encoding="utf-8-sig") as handle:
            data = json.load(handle)
    except json.JSONDecodeError as error:
        raise ConfigError("JSON 格式错误: %s (%s)" % (path, error)) from error
    except OSError as error:
        raise ConfigError("读取配置失败: %s (%s)" % (path, error)) from error
    if not isinstance(data, dict):
        raise ConfigError("配置根节点必须是对象: %s" % path)
    return data


def GetValue(data, path):
    """按点号路径读取字段, 缺失时直接报错"""
    current = data
    for part in path.split("."):
        if not isinstance(current, dict):
            raise ConfigError("配置字段不是对象: %s" % path)
        if part not in current:
            raise ConfigError("配置缺少字段: %s" % path)
        current = current[part]
    return current


def SetValue(data, path, value):
    """按点号路径写入字段, 字段不存在时直接报错"""
    parts = path.split(".")
    current = data
    for part in parts[:-1]:
        if not isinstance(current, dict) or part not in current:
            raise ConfigError("配置缺少字段: %s" % path)
        current = current[part]
    if not isinstance(current, dict) or parts[-1] not in current:
        raise ConfigError("配置缺少字段: %s" % path)
    current[parts[-1]] = value


def FormatValue(field, value):
    """把字段值格式化为命令行展示文本"""
    if field.kind == "bool":
        return "是" if value else "否"
    if field.kind == "int_list":
        return ", ".join(str(item) for item in value)
    if field.kind == "multi_choice":
        labels = {item_value: item_label for item_label, item_value in field.choices}
        return ", ".join(labels.get(item, item) for item in value)
    return str(value)


def ValidateField(field, value, prefix=""):
    """校验单个字段, 返回错误列表"""
    label = "%s%s" % (prefix, field.title)
    if field.kind == "bool":
        if not isinstance(value, bool):
            return ["%s 必须是布尔值" % label]
        return []

    if field.kind == "int":
        if not isinstance(value, int) or isinstance(value, bool):
            return ["%s 必须是整数" % label]
        errors = []
        if field.minimum is not None and value < field.minimum:
            errors.append("%s 不能小于 %s" % (label, field.minimum))
        if field.maximum is not None and value > field.maximum:
            errors.append("%s 不能大于 %s" % (label, field.maximum))
        return errors

    if field.kind in ("string", "password"):
        if not isinstance(value, str):
            return ["%s 必须是字符串" % label]
        if not field.allow_empty and not value.strip():
            return ["%s 不能为空" % label]
        return []

    if field.kind == "int_list":
        if not isinstance(value, list):
            return ["%s 必须是整数数组" % label]
        errors = []
        if field.min_items is not None and len(value) < field.min_items:
            errors.append("%s 至少需要 %d 项" % (label, field.min_items))
        for item in value:
            if not isinstance(item, int) or isinstance(item, bool):
                errors.append("%s 包含非整数: %s" % (label, item))
                continue
            if field.minimum is not None and item < field.minimum:
                errors.append("%s 包含过小值: %s" % (label, item))
            if field.maximum is not None and item > field.maximum:
                errors.append("%s 包含过大值: %s" % (label, item))
        return errors

    if field.kind == "multi_choice":
        if not isinstance(value, list):
            return ["%s 必须是数组" % label]
        allowed = {item_value for _label, item_value in field.choices}
        errors = []
        if not value and not field.allow_empty:
            errors.append("%s 至少要选择一项" % label)
        for item in value:
            if item not in allowed:
                errors.append("%s 包含未知选项: %s" % (label, item))
        return errors

    return ["%s 的字段类型未知: %s" % (label, field.kind)]


def ValidateFields(data, fields, prefix=""):
    """按字段定义批量校验"""
    errors = []
    for field in fields:
        try:
            value = GetValue(data, field.path)
        except ConfigError as error:
            errors.append("%s%s" % (prefix, error))
            continue
        errors.extend(ValidateField(field, value, prefix))
    return errors


def PrimaryService(executables):
    """实例的主身份进程"""
    if "globalserver" in executables:
        return "globalserver"
    if "logicserver" in executables:
        return "logicserver"
    return ""


def ValidateBase(data):
    """校验 baseconfig"""
    errors = []
    for _key, _title, fields in BASE_TABS:
        errors.extend(ValidateFields(data, fields))
    return errors


def ValidateCross(data):
    """校验 crossconfig, 除字段类型外还检查重复端口/实例身份"""
    errors = ValidateFields(data, CROSS_GENERAL_FIELDS)
    nodes = data.get("nodes")
    if not isinstance(nodes, list) or not nodes:
        errors.append("nodes 不能为空")
        return errors

    names = set()
    identities = set()
    db_names = set()
    used_ports = {key: set() for key in UNIQUE_PORT_KEYS}

    for index, node in enumerate(nodes, start=1):
        if not isinstance(node, dict):
            errors.append("节点[%d] 必须是对象" % index)
            continue

        name = str(node.get("name") or "").strip()
        label = "节点[%d] %s: " % (index, name or "?")
        errors.extend(ValidateFields(node, NODE_FIELDS, label))

        if name:
            if name in names:
                errors.append("%s实例名重复" % label)
            names.add(name)

        server_id = node.get("server_id")
        executables = node.get("executables")
        if isinstance(server_id, int) and not isinstance(server_id, bool) and isinstance(executables, list):
            for exe in executables:
                node_type = SERVICE_NODE_TYPE.get(exe)
                if node_type is None:
                    continue
                identity = (server_id, node_type)
                if identity in identities:
                    errors.append("%s节点身份重复: %s" % (label, identity))
                identities.add(identity)
            if not PrimaryService(executables):
                errors.append("%s必须包含 logicserver 或 globalserver" % label)

        db_name = node.get("db_name")
        if isinstance(db_name, str) and db_name:
            if db_name in db_names:
                errors.append("%s数据库名重复: %s" % (label, db_name))
            db_names.add(db_name)

        for key in UNIQUE_PORT_KEYS:
            port = node.get(key)
            if not isinstance(port, int) or isinstance(port, bool):
                continue
            if port in used_ports[key]:
                errors.append("%s%s 端口重复: %d" % (label, key, port))
            used_ports[key].add(port)

    return errors


class DeployConfigStore(object):
    """两份部署配置的内存副本与保存入口"""

    def __init__(self, settings):
        self.m_settings = settings
        self.m_base_path = ""
        self.m_cross_path = ""
        self.m_base = {}
        self.m_cross = {}
        self.Reload()

    @property
    def base_path(self):
        return self.m_base_path

    @property
    def cross_path(self):
        return self.m_cross_path

    @property
    def base(self):
        return self.m_base

    @property
    def cross(self):
        return self.m_cross

    def Reload(self):
        """从磁盘重新读取两份配置"""
        self.m_base_path = self.m_settings.Path("paths.baseconfig", must_exist=True)
        self.m_cross_path = self.m_settings.Path("paths.blueprint", must_exist=True)
        self.m_base = ReadJsonObject(self.m_base_path)
        self.m_cross = ReadJsonObject(self.m_cross_path)

    def Validate(self):
        """校验两份配置, 返回错误列表"""
        return ValidateBase(self.m_base) + ValidateCross(self.m_cross)

    def Save(self):
        """校验通过后原子写入两份配置"""
        errors = self.Validate()
        if errors:
            raise ConfigError("部署配置校验失败:\n" + "\n".join(errors))
        WriteJsonAtomic(self.m_base_path, self.m_base)
        WriteJsonAtomic(self.m_cross_path, self.m_cross)

    def GetNode(self, index):
        """按索引读取实例节点"""
        nodes = GetValue(self.m_cross, "nodes")
        if not isinstance(nodes, list) or index < 0 or index >= len(nodes):
            raise ConfigError("实例节点索引无效: %s" % index)
        return nodes[index]

    def AddNode(self):
        """按现有节点自动分配端口和 server_id 后新增节点"""
        nodes = GetValue(self.m_cross, "nodes")
        if not isinstance(nodes, list):
            raise ConfigError("crossconfig.nodes 必须是数组")
        node = self.CreateNodeValues(nodes)
        nodes.append(node)
        return len(nodes) - 1

    def DuplicateNode(self, index):
        """复制节点并自动分配新 server_id 与端口"""
        nodes = GetValue(self.m_cross, "nodes")
        source = copy.deepcopy(self.GetNode(index))
        values = self.CreateNodeValues(nodes)
        values["executables"] = source.get("executables", values["executables"])
        values["zone_enabled"] = source.get("zone_enabled", values["zone_enabled"])
        source.update(values)
        nodes.append(source)
        return len(nodes) - 1

    def RemoveNode(self, index):
        """删除节点, 至少保留一个实例"""
        nodes = GetValue(self.m_cross, "nodes")
        if not isinstance(nodes, list):
            raise ConfigError("crossconfig.nodes 必须是数组")
        if len(nodes) <= 1:
            raise ConfigError("至少需要保留一个实例节点")
        if index < 0 or index >= len(nodes):
            raise ConfigError("实例节点索引无效: %s" % index)
        nodes.pop(index)
        return min(index, len(nodes) - 1)

    def CreateNodeValues(self, nodes):
        """给新节点生成不冲突的 server_id, 名称, 数据库名和端口"""
        server_id = NextServerId(nodes)
        name = UniqueName(nodes, "s%d" % server_id)
        db_name = UniqueDbName(nodes, "xygame_s%d" % server_id)
        return {
            "name": name,
            "server_id": server_id,
            "executables": ["gatewayserver", "logicserver", "dbserver"],
            "gateway_port": NextPort(nodes, "gateway_port", self.BasePort("gatewayserver", "ListenPort")),
            "logic_port": NextPort(nodes, "logic_port", self.BasePort("logicserver", "ListenPort")),
            "battle_port": NextPort(nodes, "battle_port", self.BasePort("logicserver", "BattleListenPort")),
            "db_port": NextPort(nodes, "db_port", self.BasePort("dbserver", "ListenPort")),
            "db_name": db_name,
            "global_port": self.BasePort("globalserver", "ListenPort"),
            "cluster_port": NextPort(nodes, "cluster_port", 38041),
            "zone_enabled": False,
        }

    def BasePort(self, section, key):
        """从基础配置取端口默认值"""
        return int(GetValue(self.m_base, "%s.%s" % (section, key)))


def NextServerId(nodes):
    """找下一个未占用的普通服 server_id"""
    used = set()
    for node in nodes:
        value = node.get("server_id") if isinstance(node, dict) else None
        if isinstance(value, int) and not isinstance(value, bool):
            used.add(value)
    candidate = 1
    while candidate in used and candidate <= NORMAL_MAX:
        candidate += 1
    if candidate > NORMAL_MAX:
        raise ConfigError("普通服 server_id 已用尽, 请手工调整")
    return candidate


def NextPort(nodes, key, fallback):
    """在同类型端口最大值基础上加一, 避免新节点端口冲突"""
    values = []
    for node in nodes:
        value = node.get(key) if isinstance(node, dict) else None
        if isinstance(value, int) and not isinstance(value, bool):
            values.append(value)
    port = max(values) + 1 if values else int(fallback)
    if port > 65535:
        raise ConfigError("端口已用尽: %s" % key)
    return port


def UniqueName(nodes, name):
    """生成不重复的实例名"""
    used = {str(node.get("name")) for node in nodes if isinstance(node, dict)}
    candidate = name
    index = 2
    while candidate in used:
        candidate = "%s_%d" % (name, index)
        index += 1
    return candidate


def UniqueDbName(nodes, db_name):
    """生成不重复的数据库名"""
    used = {str(node.get("db_name")) for node in nodes if isinstance(node, dict)}
    candidate = db_name
    index = 2
    while candidate in used:
        candidate = "%s_%d" % (db_name, index)
        index += 1
    return candidate


def NodeSummary(node):
    """节点列表里显示的摘要"""
    return "%s  server_id=%s  db=%s" % (
        node.get("name", "?"),
        node.get("server_id", "?"),
        node.get("db_name", "?"),
    )


def WriteJsonAtomic(path, data):
    """先写临时文件再替换, 避免写到一半损坏配置"""
    temp_path = path + ".tmp"
    try:
        write_json(temp_path, data)
        os.replace(temp_path, path)
    except OSError as error:
        try:
            if os.path.isfile(temp_path):
                os.unlink(temp_path)
        except OSError:
            pass
        raise ConfigError("写入配置失败: %s (%s)" % (path, error)) from error
