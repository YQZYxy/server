#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""服务器实例生成与部署.

读取配置:
  config/crossconfig.json  实例清单(实例名/进程/端口/数据库/集群端口)
  config/baseconfig.json   公共配置骨架

在构建目录下生成实例目录(默认 release/debug, 可配置成任意路径):
  <variant>/<name>/
    <exe>                    按 executables 复制或链接
    config/config.json       只保留本实例差异, extends baseconfig.json
    config/baseconfig.json   公共骨架
    config/logicconfig/      逻辑服需要
    luascript/               逻辑服需要
    dist/                    网关需要

用法:
  python generate_server.py                 交互菜单 (可切换构建目录)
  python generate_server.py --type 1        完整部署(实例目录 + 配置 + 数据库)
  python generate_server.py --type 2 --server-id 2   重置指定服的数据库
  python generate_server.py --variant build/debug 指定构建目录(支持绝对路径)
  python generate_server.py --only s2       只处理指定实例, 逗号分隔
  python generate_server.py --link          可执行文件与资源目录改用链接
  python generate_server.py --force         实例目录已存在时删除重建
  python generate_server.py --dry-run       只校验并打印计划, 不写文件
  python generate_server.py --no-db         跳过数据库创建
"""

import argparse
import copy
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

# 仓库根目录
ROOT_DIR = Path(__file__).resolve().parent
BLUEPRINT_PATH = ROOT_DIR / "config" / "crossconfig.json"
BASECONFIG_PATH = ROOT_DIR / "config" / "baseconfig.json"
MYSQL_SCHEMA_PATH = ROOT_DIR / "sql" / "xygame.sql"
RUNTIME_LIBS_DIR = ROOT_DIR / "lib"

# 可执行文件后缀
EXE_EXT = ".exe" if os.name == "nt" else ""

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
SERVICE_RESOURCES = {
    "logicserver": [
        ("config/logicconfig", "config/logicconfig"),
        ("luascript", "luascript"),
    ],
    "gatewayserver": [
        ("client/webui/dist", "dist"),
    ],
}

# 不参与集群的进程, 避免同一实例目录多进程抢占同一个集群端口
CLUSTER_DISABLED_SERVICES = ("gatewayserver", "dbserver")

# server_id 分段, 与 share/share.hpp 保持一致
SERVER_ID_CROSS_LARGE_END = 42800

PORT_KEYS = ("gateway_port", "logic_port", "battle_port", "db_port", "global_port", "cluster_port")
UNIQUE_PORT_KEYS = ("gateway_port", "logic_port", "battle_port", "db_port", "cluster_port")


def load_json(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, ensure_ascii=False, indent=4) + "\n"
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)


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
    deploy = blueprint.get("deploy") or {}
    notes = []
    if cli_variant:
        candidates = [cli_variant]
    else:
        configured = str(deploy.get("variant") or "auto")
        candidates = ["release", "debug"] if configured == "auto" else [configured]

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
    if path.is_symlink() or path.is_file():
        path.unlink()
    elif path.is_dir():
        shutil.rmtree(path)


def link_file(src, dst):
    """优先符号链接, 其次硬链接, 失败返回 False"""
    dst.parent.mkdir(parents=True, exist_ok=True)
    remove_path(dst)
    for maker in (os.symlink, os.link):
        try:
            maker(src, dst)
            return True
        except (OSError, NotImplementedError):
            continue
    return False


def link_dir(src, dst):
    """Windows 用 junction, Linux/macOS 用符号链接, 失败返回 False"""
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists() or dst.is_symlink():
        return False
    if os.name == "nt":
        command = 'cmd /c mklink /J "{}" "{}"'.format(dst, src)
        if subprocess.run(command, shell=True, capture_output=True).returncode == 0:
            return True
    else:
        try:
            os.symlink(src, dst, target_is_directory=True)
            return True
        except OSError:
            pass
    return False


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
    if not RUNTIME_LIBS_DIR.is_dir():
        return []
    result = []
    for path in sorted(RUNTIME_LIBS_DIR.iterdir()):
        if not path.is_file():
            continue
        lower = path.name.lower()
        if lower.endswith((".dll", ".so", ".dylib")) or ".so." in lower:
            result.append(path)
    return result


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


def parse_only(value):
    if not value:
        return set()
    return {item.strip() for item in value.split(",") if item.strip()}


# ==============================================
# 数据库操作
# ==============================================
def find_mysql():
    """查找 mysql 客户端, 找不到返回空串"""
    mysql_exe = shutil.which("mysql")
    if mysql_exe:
        return mysql_exe
    if os.name == "nt":
        for version in ("8.0", "8.4", "9.0"):
            candidate = Path(r"C:\Program Files\MySQL\MySQL Server %s\bin\mysql.exe" % version)
            if candidate.is_file():
                return str(candidate)
    return ""


def mysql_counter(base):
    """数据库连接参数, 取自 baseconfig 的 Counter"""
    counter = base["dbserver"]["Counter"]
    return {
        "host": counter["AddrIP"],
        "port": 3306,
        "user": counter["UserName"],
        "password": counter["Password"],
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
        "--default-character-set=utf8mb4",
    ] + args

    stdin_handle = open(stdin_path, "rb") if stdin_path else None
    try:
        result = subprocess.run(command, stdin=stdin_handle, capture_output=capture, env=env, check=False)
    finally:
        if stdin_handle:
            stdin_handle.close()

    stdout = result.stdout if result.stdout is not None else b""
    stderr = result.stderr if result.stderr is not None else b""
    if isinstance(stdout, bytes):
        stdout = stdout.decode("utf-8", errors="replace")
    if isinstance(stderr, bytes):
        stderr = stderr.decode("utf-8", errors="replace")

    if result.returncode != 0:
        raise RuntimeError((stderr or stdout).strip() or ("mysql 退出码 %d" % result.returncode))
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
        ["-e", "CREATE DATABASE IF NOT EXISTS `%s` DEFAULT CHARACTER SET utf8mb4" % db_name],
    )


def drop_database(mysql_exe, counter, db_name):
    run_mysql(mysql_exe, counter, ["-e", "DROP DATABASE IF EXISTS `%s`" % db_name])


def import_schema(mysql_exe, counter, db_name):
    if not MYSQL_SCHEMA_PATH.is_file():
        raise RuntimeError("找不到建表脚本 %s" % MYSQL_SCHEMA_PATH)
    run_mysql(mysql_exe, counter, [db_name], stdin_path=MYSQL_SCHEMA_PATH)


def db_nodes(nodes):
    return [node for node in nodes if "dbserver" in node.get("executables", [])]


def prepare_databases(base, nodes, dry_run):
    """为每个带数据服的实例创建数据库, 已存在的库不覆盖"""
    targets = db_nodes(nodes)
    if not targets:
        return

    mysql_exe = find_mysql()
    if not mysql_exe:
        print("[错误] 未找到 mysql 客户端, 请安装 MySQL 或把 mysql.exe 加入 PATH", file=sys.stderr)
        raise SystemExit(1)

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
            print("[错误] %s 数据库初始化失败: %s" % (node["name"], error), file=sys.stderr)
            raise SystemExit(1)


def reset_database(base, node):
    """删除并重建指定服的数据库"""
    mysql_exe = find_mysql()
    if not mysql_exe:
        print("[错误] 未找到 mysql 客户端, 请安装 MySQL 或把 mysql.exe 加入 PATH", file=sys.stderr)
        raise SystemExit(1)

    counter = mysql_counter(base)
    db_name = node["db_name"]
    print("重置数据库: %s (%s)" % (db_name, node["name"]))
    try:
        drop_database(mysql_exe, counter, db_name)
        create_database(mysql_exe, counter, db_name)
        import_schema(mysql_exe, counter, db_name)
    except RuntimeError as error:
        print("[错误] %s 重置失败: %s" % (db_name, error), file=sys.stderr)
        raise SystemExit(1)
    print("[完成] %s 已重建并导入表结构" % db_name)


# ==============================================
# 交互菜单
# ==============================================
def print_menu(build_dir_text):
    print("=" * 56)
    print(" 服务器部署工具")
    print(" 1. 完整创建部署 (实例目录 + 配置 + 数据库)  [默认]")
    print(" 2. 重置指定服的数据库")
    print(" 3. 设置构建目录 (当前: %s)" % build_dir_text)
    print(" 0. 退出")
    print("=" * 56)


def prompt(text):
    try:
        return input(text)
    except (EOFError, KeyboardInterrupt):
        print()
        return ""


def confirm(text):
    return prompt("%s [y/N]: " % text).strip().lower() in ("y", "yes")


def choose_reset_node(nodes):
    """交互选择要重置的服, 返回节点或 None"""
    targets = db_nodes(nodes)
    print("可重置的服:")
    for node in targets:
        print("  %-6s %-12s %s" % (node["server_id"], node["name"], node["db_name"]))

    raw = prompt("请输入要重置的 server_id: ").strip()
    if not raw:
        return None
    try:
        server_id = int(raw)
    except ValueError:
        print("[错误] 请输入数值 server_id", file=sys.stderr)
        return None

    for node in targets:
        if node["server_id"] == server_id:
            return node
    print("[错误] 没有找到 server_id=%s 的数据库实例" % server_id, file=sys.stderr)
    return None


def main(argv=None):
    parser = argparse.ArgumentParser(description="按实例生成服务器目录与配置")
    parser.add_argument("--type", type=int, default=0, help="1=完整部署 2=重置数据库")
    parser.add_argument("--server-id", type=int, default=None, help="--type 2 时指定 server_id")
    parser.add_argument("--variant", default="",
                        help="构建目录(相对仓库根或绝对路径), 默认读 deploy.variant, auto 时依次尝试 release/debug")
    parser.add_argument("--only", default="", help="只处理指定实例, 逗号分隔")
    parser.add_argument("--link", action="store_true", help="可执行文件与资源目录使用链接")
    parser.add_argument("--force", action="store_true", help="实例目录已存在时删除重建")
    parser.add_argument("--dry-run", action="store_true", help="只校验并打印计划, 不写文件")
    parser.add_argument("--update-config", action="store_true", help="实例目录已存在时只更新 config/config.json")
    parser.add_argument("--no-db", action="store_true", help="跳过数据库创建")
    parser.add_argument("--yes", action="store_true", help="重置数据库时跳过确认")

    raw_argv = list(sys.argv[1:] if argv is None else argv)
    args = parser.parse_args(raw_argv)

    blueprint = load_json(BLUEPRINT_PATH)
    base = load_json(BASECONFIG_PATH)
    deploy_cfg = blueprint.get("deploy") or {}
    nodes = blueprint["nodes"]

    errors = validate_blueprint(blueprint)
    if errors:
        for item in errors:
            print(f"[错误] {item}", file=sys.stderr)
        return 1

    # 没有任何参数时进入交互菜单
    interactive = not raw_argv
    mode = args.type or 1
    if interactive:
        # 菜单 3 只切换构建目录, 切完重新回到菜单; 支持 "3 bin" 这种一行输入
        while True:
            print_menu(args.variant or str(deploy_cfg.get("variant") or "auto"))
            raw = prompt("请选择 [1]: ").strip()
            if raw == "":
                mode = 1
                break
            if raw == "0":
                return 0

            parts = raw.split(None, 1)
            if parts[0] == "3":
                entered = parts[1].strip() if len(parts) > 1 else ""
                if not entered:
                    entered = prompt("请输入构建目录(相对仓库根或绝对路径, 留空恢复 auto): ").strip()
                args.variant = entered
                continue

            try:
                mode = int(raw)
            except ValueError:
                print("[错误] 请输入数字, 设置构建目录用 3 <目录>", file=sys.stderr)
                return 1
            break

    # 类型 2: 重置指定服的数据库
    if mode == 2:
        if interactive:
            node = choose_reset_node(nodes)
            if node is None:
                return 1
        else:
            if args.server_id is None:
                print("[错误] 请用 --server-id 指定要重置的服", file=sys.stderr)
                return 1
            node = None
            for item in db_nodes(nodes):
                if item["server_id"] == args.server_id:
                    node = item
                    break
            if node is None:
                print("[错误] 没有找到 server_id=%s 的数据库实例" % args.server_id, file=sys.stderr)
                return 1
        if not args.yes:
            if not interactive:
                print("[错误] 重置数据库会删除数据, 请加 --yes 确认", file=sys.stderr)
                return 1
            if not confirm("将删除数据库 %s 并重新导入表结构, 继续?" % node["db_name"]):
                print("已取消")
                return 0
        reset_database(base, node)
        return 0

    if mode != 1:
        print(f"[错误] 未知类型 {mode}", file=sys.stderr)
        return 1

    # 类型 1: 完整创建部署
    variant_dir, resolve_error = resolve_variant(blueprint, args.variant)
    if variant_dir is None:
        print(f"[错误] 找不到服务器可执行文件 ({resolve_error}), 请先编译服务器后再运行本脚本", file=sys.stderr)
        return 1

    only = parse_only(args.only)
    unknown = only - {node["name"] for node in nodes}
    if unknown:
        print(f"[错误] --only 指定了未知实例: {', '.join(sorted(unknown))}", file=sys.stderr)
        return 1

    use_link = args.link or bool(deploy_cfg.get("link"))
    skip_existing = bool(deploy_cfg.get("skip_existing", True)) and not args.force
    copy_pdb = bool(deploy_cfg.get("copy_pdb", True))

    # 先构建并校验全部配置, 校验不过不落盘
    plans = []
    for node in nodes:
        if only and node["name"] not in only:
            continue
        instance_config = build_instance_config(node, blueprint, base)
        merged = merge_json(copy.deepcopy(base), instance_config)
        merged.pop("extends", None)
        errors.extend(validate_merged(merged, node))
        plans.append((node, instance_config))

    if errors:
        for item in errors:
            print(f"[错误] {item}", file=sys.stderr)
        return 1

    print(f"蓝图: {BLUEPRINT_PATH}")
    print(f"目标: {variant_dir}  (link={use_link}, force={args.force}, dry_run={args.dry_run})")

    created = 0
    skipped = 0
    for node, instance_config in plans:
        instance_dir = variant_dir / node["name"]
        if instance_dir.exists() and skip_existing:
            if args.update_config and not args.dry_run and (instance_dir / "config").is_dir():
                write_json(instance_dir / "config" / "config.json", instance_config)
                print(f"[更新配置] {node['name']}: config/config.json")
            else:
                print(f"[跳过] {node['name']}: 目录已存在 {instance_dir}")
            skipped += 1
            continue

        print(f"[生成] {node['name']}")
        if args.dry_run:
            created += 1
            continue

        if instance_dir.exists():
            remove_path(instance_dir)
        instance_dir.mkdir(parents=True, exist_ok=True)

        exe_paths = [variant_dir / (exe + EXE_EXT) for exe in node["executables"]]
        missing = [path.name for path in exe_paths if not path.is_file()]
        if missing:
            print(f"[错误] {node['name']}: 缺少可执行文件 {', '.join(missing)}", file=sys.stderr)
            return 1

        pdb_paths = []
        if copy_pdb:
            pdb_paths = [variant_dir / (exe + ".pdb") for exe in node["executables"] if (variant_dir / (exe + ".pdb")).is_file()]

        for name, mode_text in deploy_files(exe_paths + pdb_paths, instance_dir, use_link):
            print(f"    {name:<20} {mode_text}")

        config_dir = instance_dir / "config"
        config_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(BASECONFIG_PATH, config_dir / BASECONFIG_PATH.name)
        write_json(config_dir / "config.json", instance_config)
        print(f"    {'config/config.json':<20} write")
        print(f"    {'config/' + BASECONFIG_PATH.name:<20} copy")

        for name, mode_text in deploy_resources(instance_dir, node, use_link):
            print(f"    {name:<20} {mode_text}")

        for lib_path in runtime_libs():
            shutil.copy2(lib_path, instance_dir / lib_path.name)
            print(f"    {lib_path.name:<20} copy")

        created += 1

    print(f"完成: 生成 {created} 个, 跳过 {skipped} 个")

    if not args.no_db:
        prepare_databases(base, [node for node, _ in plans], args.dry_run)

    return 0


if __name__ == "__main__":
    sys.exit(main())
