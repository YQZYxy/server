#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""服务器实例生成与部署模块.

读取配置:
  config/crossconfig.json  实例清单(实例名/进程/端口/数据库/集群端口)
  config/baseconfig.json   公共配置骨架
  config/script/config.json 脚本框架路径与默认参数

在部署目录下生成实例目录:
  <variant>/<name>/
    <exe>                    按 executables 复制或链接
    config/config.json       只保留本实例差异, extends baseconfig.json
    config/baseconfig.json   公共骨架
    config/crossconfig.json  实例清单, 网关生成选服列表需要
    config/logicconfig/      逻辑服需要
    luascript/               逻辑服需要
    dist/                    网关需要
"""

import copy
import json
import os
import shutil
import subprocess
from pathlib import Path

from ..core.errors import ModuleError
from ..core.instances import (
    DatabaseChoiceGroups,
    InstanceChoiceGroups,
    InstanceChoiceTips,
)
from ..core.menu import Module, Option
from ..core.platform_utils import (
    EXE_SUFFIX,
    FindMysql,
    LinkDir,
    LinkFile,
    RemovePath,
    RuntimeLibFiles,
)
from ..core.settings import write_json

# 运行时由 DeployRunner 注入的路径, 全部来自 config/script/config.json
ROOT_DIR = None
BLUEPRINT_PATH = None
BASECONFIG_PATH = None
MYSQL_SCHEMA_PATH = None
RUNTIME_LIBS_DIR = None
SETTINGS = None
DEFAULT_VARIANT = ""
MYSQL_PORT = 3306
MYSQL_CHARSET = "utf8mb4"
MYSQL_SEARCH_VERSIONS = []

# 可执行文件后缀
EXE_EXT = EXE_SUFFIX

# 节点类型, 与 PLUGIN_NODE_TYPE 保持一致
NODE_TYPE_GATEWAY = 1
NODE_TYPE_LOGIC = 2
NODE_TYPE_GLOBAL = 3
NODE_TYPE_DB = 4

SERVICE_NODE_TYPE = {
    "gatewayserver": NODE_TYPE_GATEWAY,
    "logicserver": NODE_TYPE_LOGIC,
    "globalserver": NODE_TYPE_GLOBAL,
    "dbserver": NODE_TYPE_DB,
}

# 各进程运行需要的资源目录: (仓库内源路径, 实例内目标路径)
# 实际内容由 ConfigurePaths 按 config/script/config.json 填充
SERVICE_RESOURCES = {}


def ConfigurePaths(settings):
    """把配置中的路径注入到本模块"""
    global ROOT_DIR, BLUEPRINT_PATH, BASECONFIG_PATH, MYSQL_SCHEMA_PATH
    global RUNTIME_LIBS_DIR, SETTINGS, DEFAULT_VARIANT, MYSQL_PORT, MYSQL_CHARSET
    global MYSQL_SEARCH_VERSIONS, SERVICE_RESOURCES

    SETTINGS = settings
    ROOT_DIR = Path(settings.project_root)
    BLUEPRINT_PATH = Path(settings.Path("paths.blueprint", must_exist=True))
    BASECONFIG_PATH = Path(settings.Path("paths.baseconfig", must_exist=True))
    MYSQL_SCHEMA_PATH = Path(settings.Path("paths.mysql_schema", must_exist=True))
    RUNTIME_LIBS_DIR = Path(settings.Path("paths.runtime_lib_dir", must_exist=True))
    DEFAULT_VARIANT = str(settings.Require("deploy.default_variant"))
    MYSQL_PORT = int(settings.Require("deploy.mysql_port"))
    MYSQL_CHARSET = str(settings.Require("deploy.mysql_character_set"))
    MYSQL_SEARCH_VERSIONS = list(settings.Get("deploy.windows_mysql_search_versions", list))
    SERVICE_RESOURCES = {
        "logicserver": [
            (settings.Path("paths.logic_config_dir"), "config/logicconfig"),
            (settings.Path("paths.luascript_dir"), "luascript"),
        ],
        "gatewayserver": [
            (settings.Path("paths.webui_dist"), "dist"),
        ],
    }

# 不参与集群的进程, 避免同一实例目录多进程抢占同一个集群端口
CLUSTER_DISABLED_SERVICES = ("gatewayserver", "dbserver")

# server_id 分段, 与 share/share.hpp 保持一致
SERVER_ID_CROSS_LARGE_END = 42800

PORT_KEYS = ("gateway_port", "logic_port", "battle_port", "db_port", "global_port", "cluster_port")
UNIQUE_PORT_KEYS = ("gateway_port", "logic_port", "battle_port", "db_port", "cluster_port")


def load_json(path):
    with open(path, "r", encoding="utf-8-sig") as handle:
        return json.load(handle)


def primary_service(node):
    """实例里负责集群身份的进程, 决定 peers 中的节点类型"""
    if "globalserver" in node["executables"]:
        return "globalserver"
    if "logicserver" in node["executables"]:
        return "logicserver"
    return ""


def validate_blueprint(blueprint):
    errors = []
    nodes = blueprint.get("nodes") or []
    if not nodes:
        errors.append("nodes 不能为空")
        return errors

    if not isinstance(blueprint.get("zone_server_ids"), list) or not blueprint["zone_server_ids"]:
        errors.append("zone_server_ids 不能为空")

    peers_ip = blueprint.get("peers_ip")
    if not isinstance(peers_ip, str) or not peers_ip:
        errors.append("peers_ip 不能为空")

    names = set()
    identities = set()
    db_names = set()
    used_ports = {key: set() for key in UNIQUE_PORT_KEYS}

    for node in nodes:
        name = node.get("name", "")
        if not name:
            errors.append("node 缺少 name")
            continue
        if name in names:
            errors.append(f"name 重复: {name}")
        names.add(name)

        executables = node.get("executables") or []
        if not executables:
            errors.append(f"{name}: executables 不能为空")
        for exe in executables:
            if exe not in SERVICE_NODE_TYPE:
                errors.append(f"{name}: 未知进程 {exe}")

        for exe in executables:
            if exe not in SERVICE_NODE_TYPE:
                continue
            identity = (node.get("server_id"), SERVICE_NODE_TYPE[exe])
            if identity in identities:
                errors.append(f"{name}: 节点身份重复 {identity}")
            identities.add(identity)

        server_id = node.get("server_id")
        if not isinstance(server_id, int) or server_id <= 0 or server_id > SERVER_ID_CROSS_LARGE_END:
            errors.append(f"{name}: server_id 非法或超出分段范围 {server_id}")

        db_name = node.get("db_name")
        if not isinstance(db_name, str) or not db_name:
            errors.append(f"{name}: db_name 非法")
        elif db_name in db_names:
            errors.append(f"db_name 重复: {db_name}")
        else:
            db_names.add(db_name)

        if not primary_service(node):
            errors.append(f"{name}: executables 必须包含 logicserver 或 globalserver")

        for key in PORT_KEYS:
            port = node.get(key)
            if not isinstance(port, int) or port <= 0 or port > 65535:
                errors.append(f"{name}: {key} 非法 {port}")
                continue
            if key not in UNIQUE_PORT_KEYS:
                continue
            if port in used_ports[key]:
                errors.append(f"{key} 重复: {port}")
            used_ports[key].add(port)

    return errors


def build_instance_config(node, blueprint, base):
    """生成实例差异配置, 公共部分由 extends 继承"""
    zone_id = base["plugin"]["node"]["zone_id"]
    instance_id = base["plugin"]["node"]["instance_id"]

    # 单向星型: 只有普通服/跨服主动连中心服, 中心服只接受连接
    # 避免双向同时建链时两边各自保留不同连接, 导致重复连接抖动
    hub_node = None
    for item in blueprint["nodes"]:
        if primary_service(item) == "globalserver":
            hub_node = item
            break

    peers = []
    if primary_service(node) != "globalserver" and hub_node is not None:
        peers.append(
            {
                "ip": blueprint["peers_ip"],
                "port": hub_node["cluster_port"],
                "zone_id": zone_id,
                "server_id": hub_node["server_id"],
                "node_type": SERVICE_NODE_TYPE["globalserver"],
                "instance_id": instance_id,
                "weight": 1,
            }
        )

    # 只声明本实例实际会启动的进程身份, 其余进程不会启动也不需要配置
    services = {}
    for exe in node["executables"]:
        entry = {
            "node_type": SERVICE_NODE_TYPE[exe],
            "server_id": node["server_id"],
            "instance_id": instance_id,
        }
        if exe in CLUSTER_DISABLED_SERVICES:
            entry["cluster"] = {"enabled": False}
        services[exe] = entry

    if node.get("zone_enabled") and "logicserver" in services:
        services["logicserver"]["zone"] = {
            "enabled": True,
            "zones": [
                {
                    "zone_id": zone_id,
                    "server_ids": list(blueprint["zone_server_ids"]),
                    "hub_name": "",
                }
            ],
        }

    return {
        "extends": BASECONFIG_PATH.name,
        "gatewayserver": {"ListenPort": node["gateway_port"]},
        "globalserver": {"ListenPort": node["global_port"]},
        "logicserver": {
            "ListenPort": node["logic_port"],
            "BattleListenPort": node["battle_port"],
            "ServerId": node["server_id"],
        },
        "dbserver": {
            "ListenPort": node["db_port"],
            "Counter": {"DBName": node["db_name"]},
        },
        "plugin": {
            "node": {
                "zone_id": zone_id,
                "server_id": node["server_id"],
                "node_type": SERVICE_NODE_TYPE[primary_service(node)],
                "instance_id": instance_id,
            },
            "cluster": {
                "enabled": True,
                "listen_port": node["cluster_port"],
                "peers": peers,
            },
            "zone": {"enabled": False, "zones": []},
            "services": services,
        },
    }


def merge_json(base, overlay):
    """与 ConfigInheritance::MergeJson 保持一致: 对象递归合并, 其它类型整体覆盖"""
    if isinstance(base, dict) and isinstance(overlay, dict):
        for key, value in overlay.items():
            if key in base:
                base[key] = merge_json(base[key], value)
            else:
                base[key] = copy.deepcopy(value)
        return base
    return copy.deepcopy(overlay)


def validate_merged(merged, node):
    errors = []
    name = node["name"]

    if "LogPath" in merged:
        errors.append(f"{name}: 不应再出现 LogPath")

    for section in ("gatewayserver", "globalserver", "logicserver", "dbserver"):
        if not isinstance(merged.get(section), dict):
            errors.append(f"{name}: 缺少 {section}")

    if (merged.get("logicserver") or {}).get("ServerId") != node["server_id"]:
        errors.append(f"{name}: logicserver.ServerId 与 server_id 不一致")

    counter = (merged.get("dbserver") or {}).get("Counter") or {}
    for key in ("DBName", "UserName", "Password", "AddrIP"):
        if not isinstance(counter.get(key), str) or not counter.get(key):
            errors.append(f"{name}: dbserver.Counter.{key} 缺失")

    plugin = merged.get("plugin") or {}
    cluster = plugin.get("cluster") or {}
    if cluster.get("listen_port") != node["cluster_port"]:
        errors.append(f"{name}: plugin.cluster.listen_port 不一致")
    # 单向星型: 中心服不主动连, 其它实例只连中心服
    expected_peers = 0 if primary_service(node) == "globalserver" else 1
    peers = cluster.get("peers") or []
    if len(peers) != expected_peers:
        errors.append(f"{name}: peers 数量应为 {expected_peers}, 实际 {len(peers)}")

    services = plugin.get("services") or {}
    for exe in node["executables"]:
        service = services.get(exe)
        if not isinstance(service, dict):
            errors.append(f"{name}: 缺少 services.{exe}")
            continue
        if service.get("node_type") != SERVICE_NODE_TYPE[exe]:
            errors.append(f"{name}: services.{exe}.node_type 不一致")
        if service.get("server_id") != node["server_id"]:
            errors.append(f"{name}: services.{exe}.server_id 不一致")
        if exe in CLUSTER_DISABLED_SERVICES:
            if (service.get("cluster") or {}).get("enabled") is not False:
                errors.append(f"{name}: services.{exe}.cluster 应关闭")

    return errors


def resolve_build_dir(name_or_path):
    """把构建目录解析成绝对路径, 相对路径按仓库根目录解析"""
    candidate = Path(str(name_or_path))
    if not candidate.is_absolute():
        candidate = ROOT_DIR / candidate
    return candidate


def resolve_variant(blueprint, cli_variant):
    """返回 (variant_dir, error), 找不到可执行文件时 variant_dir 为 None

    支持配置成任意目录(相对仓库根或绝对路径), 例如 build/debug、out/x64/Release
    """
    notes = []
    selected = str(cli_variant or DEFAULT_VARIANT).strip()
    if selected and selected != "auto":
        candidates = [selected]
    else:
        candidates = ["release", "debug"]

    for name in candidates:
        variant_dir = resolve_build_dir(name)
        if not variant_dir.is_dir():
            notes.append(f"{variant_dir} 目录不存在")
            continue
        if any(variant_dir.glob("*" + EXE_EXT)):
            return variant_dir, ""
        notes.append(f"{variant_dir} 目录里没有可执行文件")

    return None, ", ".join(notes)


def remove_path(path):
    RemovePath(str(path))


def link_file(src, dst):
    return LinkFile(str(src), str(dst))


def link_dir(src, dst):
    return LinkDir(str(src), str(dst))


def deploy_files(src_paths, instance_dir, use_link):
    results = []
    for src in src_paths:
        if not src.is_file():
            continue
        dst = instance_dir / src.name
        if use_link and link_file(src, dst):
            results.append((src.name, "link"))
        else:
            shutil.copy2(src, dst)
            results.append((src.name, "copy"))
    return results


def runtime_libs():
    """需要随实例分发的运行库"""
    return [Path(item) for item in RuntimeLibFiles(str(RUNTIME_LIBS_DIR))]


def deploy_resources(instance_dir, node, use_link):
    results = []
    for exe in node["executables"]:
        for src_rel, dst_rel in SERVICE_RESOURCES.get(exe, []):
            src = ROOT_DIR / src_rel
            dst = instance_dir / dst_rel
            if not src.is_dir():
                continue
            if dst.exists() or dst.is_symlink():
                continue
            if use_link and link_dir(src, dst):
                results.append((dst_rel, "link"))
            else:
                shutil.copytree(src, dst)
                results.append((dst_rel, "copy"))
    return results


def filter_nodes(context, nodes, instance_names):
    """按勾选的实例名过滤节点, 未选择时直接报错"""
    names = [str(name).strip() for name in (instance_names or []) if str(name).strip()]
    if not names:
        raise ModuleError("请至少选择一个服务器")
    selected_names = set(names)
    known_names = {node.get("name") for node in nodes if isinstance(node, dict)}
    unknown = [name for name in names if name not in known_names]
    if unknown:
        context.console.Warn(
            "  警告: 忽略不可用的服务器: %s" % ", ".join(unknown)
        )
    selected = [
        node for node in nodes
        if isinstance(node, dict) and node.get("name") in selected_names
    ]
    if not selected:
        raise ModuleError("选择的服务器都不可用: %s" % ", ".join(names))
    return selected


# ==============================================
# 数据库操作
# ==============================================
def find_mysql():
    """查找 mysql 客户端, 找不到直接报错"""
    try:
        return FindMysql(
            SETTINGS,
            str(SETTINGS.Require("deploy.mysql_executable")),
            MYSQL_SEARCH_VERSIONS,
        )
    except ModuleError as error:
        raise ModuleError("%s\n  请安装 MySQL 或在 config/script/config.json 中配置 deploy.mysql_executable" % error) from error


def mysql_counter(base):
    """数据库连接参数, 取自 baseconfig 的 Counter"""
    counter = base.get("dbserver", {}).get("Counter")
    if not isinstance(counter, dict):
        raise ModuleError("baseconfig 缺少 dbserver.Counter")
    for key in ("AddrIP", "UserName", "Password"):
        if not isinstance(counter.get(key), str) or not counter.get(key):
            raise ModuleError("baseconfig 缺少 dbserver.Counter.%s" % key)
    host = counter["AddrIP"].strip()
    if host.startswith("tcp://"):
        host = host[6:]
    return {
        "host": host,
        "port": MYSQL_PORT,
        "user": counter["UserName"].strip(),
        "password": counter["Password"].strip(),
    }


def run_mysql(mysql_exe, counter, args, stdin_path=None, capture=False):
    """执行 mysql 命令, 密码走 MYSQL_PWD 环境变量避免命令行告警"""
    env = os.environ.copy()
    env["MYSQL_PWD"] = counter["password"]
    command = [
        mysql_exe,
        "-h", counter["host"],
        "-P", str(counter["port"]),
        "-u", counter["user"],
        "--default-character-set=%s" % MYSQL_CHARSET,
    ] + args

    stdin_handle = open(stdin_path, "rb") if stdin_path else None
    try:
        # 始终捕获输出, 失败时才能把 mysql 的真实报错带回给调用方
        result = subprocess.run(
            command,
            stdin=stdin_handle,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            check=False,
        )
    finally:
        if stdin_handle:
            stdin_handle.close()

    stdout = result.stdout or b""
    stderr = result.stderr or b""
    if isinstance(stdout, bytes):
        stdout = stdout.decode("utf-8", errors="replace")
    if isinstance(stderr, bytes):
        stderr = stderr.decode("utf-8", errors="replace")

    if result.returncode != 0:
        raise RuntimeError((stderr or stdout).strip() or ("mysql 退出码 %d" % result.returncode))
    if capture:
        return stdout
    if stdout.strip():
        print(stdout.rstrip())
    return stdout


def database_exists(mysql_exe, counter, db_name):
    output = run_mysql(
        mysql_exe,
        counter,
        ["-N", "-B", "-e", "SHOW DATABASES LIKE '%s'" % db_name],
        capture=True,
    )
    return db_name in output.split()


def create_database(mysql_exe, counter, db_name):
    run_mysql(
        mysql_exe,
        counter,
        ["-e", "CREATE DATABASE IF NOT EXISTS `%s` DEFAULT CHARACTER SET %s" % (db_name, MYSQL_CHARSET)],
    )


def drop_database(mysql_exe, counter, db_name):
    run_mysql(mysql_exe, counter, ["-e", "DROP DATABASE IF EXISTS `%s`" % db_name])


def import_schema(mysql_exe, counter, db_name):
    if not MYSQL_SCHEMA_PATH.is_file():
        raise ModuleError("找不到建表脚本 %s" % MYSQL_SCHEMA_PATH)
    run_mysql(mysql_exe, counter, [db_name], stdin_path=str(MYSQL_SCHEMA_PATH))


def db_nodes(nodes):
    return [node for node in nodes if "dbserver" in node.get("executables", [])]


def prepare_databases(base, nodes, dry_run):
    """为每个带数据服的实例创建数据库, 已存在的库不覆盖"""
    targets = db_nodes(nodes)
    if not targets:
        return

    mysql_exe = find_mysql()
    counter = mysql_counter(base)
    print("数据库: %s:%d" % (counter["host"], counter["port"]))
    for node in targets:
        db_name = node["db_name"]
        if dry_run:
            print("    %-12s %-22s (dry-run)" % (node["name"], db_name))
            continue
        try:
            if database_exists(mysql_exe, counter, db_name):
                print("    %-12s %-22s 已存在, 跳过初始化" % (node["name"], db_name))
                continue
            create_database(mysql_exe, counter, db_name)
            import_schema(mysql_exe, counter, db_name)
            print("    %-12s %-22s 已创建并导入表结构" % (node["name"], db_name))
        except RuntimeError as error:
            raise ModuleError("%s 数据库初始化失败: %s" % (node["name"], error)) from error


def reset_database(base, node):
    """删除并重建指定服的数据库"""
    mysql_exe = find_mysql()
    counter = mysql_counter(base)
    db_name = node["db_name"]
    print("重置数据库: %s (%s)" % (db_name, node["name"]))
    try:
        drop_database(mysql_exe, counter, db_name)
        create_database(mysql_exe, counter, db_name)
        import_schema(mysql_exe, counter, db_name)
    except RuntimeError as error:
        raise ModuleError("%s 重置失败: %s" % (db_name, error)) from error
    print("[完成] %s 已重建并导入表结构" % db_name)


# ==============================================
# 模块入口
# ==============================================
class DeployModule(Module):
    """创建或更新服务器实例目录"""

    ID = "deploy"
    TITLE = "创建服务器"
    DESCRIPTION = "勾选服务器并按实例清单生成目录/配置, 并初始化不存在的数据库"

    OPTIONS = (
        Option("variant", "构建目录 (auto 或相对仓库根/绝对路径)", "string",
               default_from="deploy.default_variant"),
        Option("link", "可执行文件与资源目录使用链接", "bool",
               default_from="deploy.link"),
        Option("force", "实例目录已存在时删除重建", "bool", default=False),
        Option("update_config", "已存在实例只更新 config/config.json", "bool", default=False),
        Option("dry_run", "只校验并打印计划, 不写文件", "bool", default=False),
        Option("init_db", "初始化不存在的数据库", "bool",
               default_from="deploy.create_database"),
        Option("instances", "创建服务器", "multi_choice",
               default_from="deploy.instances",
               groups=InstanceChoiceGroups,
               item_tips=InstanceChoiceTips),
    )

    def Run(self, context, options):
        return DeployRunner(context, options).Run()


class ResetDatabaseModule(Module):
    """删除并重建指定实例的数据库"""

    ID = "reset_db"
    TITLE = "重置数据库"
    DESCRIPTION = "勾选服务器, 删除对应数据库并重新导入 sql/xygame.sql"

    OPTIONS = (
        Option("assume_yes", "跳过删除确认", "bool", default=False),
        Option("instances", "重置数据库", "multi_choice",
               default_from="reset_db.instances",
               groups=DatabaseChoiceGroups,
               item_tips=InstanceChoiceTips),
    )

    def Run(self, context, options):
        return ResetDatabaseRunner(context, options).Run()


class DeployRunner(object):
    """完整部署流程"""

    def __init__(self, context, options):
        self.m_context = context
        self.m_console = context.console
        self.m_options = options
        ConfigurePaths(context.settings)

    def Run(self):
        blueprint = load_json(BLUEPRINT_PATH)
        base = load_json(BASECONFIG_PATH)
        nodes = blueprint.get("nodes")
        if not isinstance(nodes, list) or not nodes:
            raise ModuleError("实例清单缺少非空 nodes 数组: %s" % BLUEPRINT_PATH)

        errors = validate_blueprint(blueprint)
        if errors:
            raise ModuleError("实例清单校验失败:\n  " + "\n  ".join(errors))

        variant_dir, resolve_error = resolve_variant(blueprint, self.m_options["variant"])
        if variant_dir is None:
            raise ModuleError(
                "找不到服务器可执行文件 (%s), 请先运行编译打包模块" % resolve_error
            )

        selected_nodes = filter_nodes(
            self.m_context, nodes, self.m_options["instances"]
        )

        use_link = bool(self.m_options["link"])
        skip_existing = bool(self.m_context.settings.Require("deploy.skip_existing")) and not self.m_options["force"]
        copy_pdb = bool(self.m_context.settings.Require("deploy.copy_pdb"))
        dry_run = bool(self.m_options["dry_run"])

        # 先构建并校验全部配置, 校验不过不落盘
        plans = []
        for node in selected_nodes:
            instance_config = build_instance_config(node, blueprint, base)
            merged = merge_json(copy.deepcopy(base), instance_config)
            merged.pop("extends", None)
            errors.extend(validate_merged(merged, node))
            plans.append((node, instance_config))

        if errors:
            raise ModuleError("实例配置校验失败:\n  " + "\n  ".join(errors))

        self.m_console.Line("  实例清单: %s" % BLUEPRINT_PATH)
        self.m_console.Line(
            "  目标目录: %s (link=%s, force=%s, dry_run=%s)"
            % (variant_dir, use_link, self.m_options["force"], dry_run)
        )

        created = 0
        skipped = 0
        for node, instance_config in plans:
            instance_dir = variant_dir / node["name"]
            if instance_dir.exists() and skip_existing:
                if self.m_options["update_config"] and not dry_run and (instance_dir / "config").is_dir():
                    write_json(instance_dir / "config" / "config.json", instance_config)
                    # 实例清单同步一份, 网关 /api/servers 依赖它
                    shutil.copy2(BLUEPRINT_PATH, instance_dir / "config" / BLUEPRINT_PATH.name)
                    self.m_console.Line("  [更新配置] %s: config/config.json" % node["name"])
                else:
                    self.m_console.Line("  [跳过] %s: 目录已存在 %s" % (node["name"], instance_dir))
                skipped += 1
                continue

            self.m_console.Step("生成实例 %s" % node["name"])
            if dry_run:
                created += 1
                continue

            if instance_dir.exists():
                remove_path(instance_dir)
            instance_dir.mkdir(parents=True, exist_ok=True)

            exe_paths = [variant_dir / (exe + EXE_EXT) for exe in node["executables"]]
            missing = [path.name for path in exe_paths if not path.is_file()]
            if missing:
                raise ModuleError("%s: 缺少可执行文件 %s" % (node["name"], ", ".join(missing)))

            pdb_paths = []
            if copy_pdb:
                pdb_paths = [
                    variant_dir / (exe + ".pdb")
                    for exe in node["executables"]
                    if (variant_dir / (exe + ".pdb")).is_file()
                ]

            for name, mode_text in deploy_files(exe_paths + pdb_paths, instance_dir, use_link):
                self.m_console.Line("    %-24s %s" % (name, mode_text))

            config_dir = instance_dir / "config"
            config_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(BASECONFIG_PATH, config_dir / BASECONFIG_PATH.name)
            # 实例清单同步一份, 网关 /api/servers 依赖它生成选服列表
            shutil.copy2(BLUEPRINT_PATH, config_dir / BLUEPRINT_PATH.name)
            write_json(config_dir / "config.json", instance_config)
            self.m_console.Line("    %-24s write" % "config/config.json")
            self.m_console.Line("    %-24s copy" % ("config/" + BASECONFIG_PATH.name))
            self.m_console.Line("    %-24s copy" % ("config/" + BLUEPRINT_PATH.name))

            for name, mode_text in deploy_resources(instance_dir, node, use_link):
                self.m_console.Line("    %-24s %s" % (name, mode_text))

            for lib_path in runtime_libs():
                shutil.copy2(lib_path, instance_dir / lib_path.name)
                self.m_console.Line("    %-24s copy" % lib_path.name)

            created += 1

        self.m_console.Success("  完成: 生成 %d 个, 跳过 %d 个" % (created, skipped))

        if self.m_options["init_db"]:
            prepare_databases(base, [node for node, _ in plans], dry_run)
        return 0


class ResetDatabaseRunner(object):
    """重置数据库流程"""

    def __init__(self, context, options):
        self.m_context = context
        self.m_console = context.console
        self.m_options = options
        ConfigurePaths(context.settings)

    def Run(self):
        blueprint = load_json(BLUEPRINT_PATH)
        base = load_json(BASECONFIG_PATH)
        nodes = blueprint.get("nodes")
        if not isinstance(nodes, list) or not nodes:
            raise ModuleError("实例清单缺少非空 nodes 数组: %s" % BLUEPRINT_PATH)

        targets = db_nodes(nodes)
        if not targets:
            raise ModuleError("实例清单里没有带 dbserver 的实例")

        selected = filter_nodes(
            self.m_context, targets, self.m_options["instances"]
        )

        if not self.m_options["assume_yes"]:
            db_names = ", ".join(node["db_name"] for node in selected)
            if not self.m_console.Confirm(
                "将删除数据库 %s 并重新导入表结构, 继续?" % db_names, False
            ):
                self.m_console.Line("已取消")
                return 0

        for node in selected:
            reset_database(base, node)
        return 0
