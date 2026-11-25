#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""统一配置加载与路径解析.

配置文件: config/script/config.json
规则:
    1. 所有路径都相对 project_root 解析, project_root 相对基础配置文件目录解析.
       这样部署时搬动仓库或修改目录名只需要改 project_root.
    2. 读取不到配置直接抛 ConfigError, 不做任何默认值兜底.
    3. 修改配置后调用 Save(), 写回文件并重新加载.
    4. 仓库里的 config/script/config.json, config/baseconfig.json, config/crossconfig.json
       只作为默认模板. 运行脚本时先复制到部署目录(由部署目录选择决定),
       之后读写都针对副本, 原始默认配置不会被修改.
"""

import copy
import json
import os
import shutil

from .errors import ConfigError

# 支持的配置文件版本, 结构变化时同步修改
CONFIG_VERSION = 2

# 部署目录常用预设, 仅用于启动时的交互选择
DEPLOY_DIR_PRESETS = (
    ("开发环境 (debug)", "debug"),
    ("生产环境 (release)", "release"),
)

# 本地记录文件
LOCAL_STATE_FILE_NAME = "local.json"

# 配置文件固定名称
CONFIG_FILE_NAME = "config.json"

# 部署目录内的基础配置副本
DEPLOY_SCRIPT_CONFIG_NAME = "config.json"
DEPLOY_BASECONFIG_NAME = "baseconfig.json"
DEPLOY_CROSSCONFIG_NAME = "crossconfig.json"

# 需要重定向到部署目录副本的配置路径字段: 配置键 -> 副本文件名
DEPLOY_COPY_PATH_KEYS = {
    "paths.baseconfig": DEPLOY_BASECONFIG_NAME,
    "paths.blueprint": DEPLOY_CROSSCONFIG_NAME,
    "mysql_def.source_config": DEPLOY_BASECONFIG_NAME,
}


def load_json(path):
    """读取 JSON 文件, 失败时抛出带路径的 ConfigError"""
    try:
        with open(path, "r", encoding="utf-8-sig") as handle:
            return json.load(handle)
    except FileNotFoundError as error:
        raise ConfigError("配置文件不存在: %s" % path) from error
    except json.JSONDecodeError as error:
        raise ConfigError("配置文件 JSON 格式错误: %s (%s)" % (path, error)) from error
    except OSError as error:
        raise ConfigError("读取配置文件失败: %s (%s)" % (path, error)) from error


def write_json(path, data):
    """按项目统一格式写 JSON, 保持 UTF-8 与 4 空格缩进"""
    folder = os.path.dirname(path)
    if folder:
        os.makedirs(folder, exist_ok=True)
    text = json.dumps(data, ensure_ascii=False, indent=4) + "\n"
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)


def describe_type(value):
    """给错误消息用的类型名"""
    if isinstance(value, bool):
        return "bool"
    if isinstance(value, int):
        return "int"
    if isinstance(value, float):
        return "float"
    if isinstance(value, str):
        return "string"
    if isinstance(value, list):
        return "list"
    if isinstance(value, dict):
        return "object"
    return type(value).__name__


class Settings(object):
    """配置访问器, 所有模块只通过它读取路径与参数

    config_file        实际读写的配置文件, 启用部署目录后指向副本
    project_root_file  解析 project_root 的基准文件, 通常是仓库内的基础配置
    deploy_dir         部署目录, 非空时基础配置路径全部指向目录内的副本
    """

    def __init__(self, config_file, project_root_file="", deploy_dir=""):
        self.m_config_file = os.path.abspath(config_file)
        self.m_config_dir = os.path.dirname(self.m_config_file)
        self.m_project_root_file = os.path.abspath(project_root_file) if project_root_file else self.m_config_file
        self.m_deploy_dir = os.path.normpath(deploy_dir) if deploy_dir else ""
        self.m_data = {}
        self.m_last_saved_data = {}
        self.m_project_root = ""
        self.Reload()

    @property
    def config_file(self):
        return self.m_config_file

    @property
    def base_config_file(self):
        """解析 project_root 的基准配置, 通常是仓库内的 config/script/config.json"""
        return self.m_project_root_file

    @property
    def config_dir(self):
        return self.m_config_dir

    @property
    def project_root(self):
        return self.m_project_root

    @property
    def deploy_dir(self):
        return self.m_deploy_dir

    @property
    def data(self):
        """返回配置副本, 避免调用方直接修改内部结构"""
        return copy.deepcopy(self.m_data)

    def Reload(self):
        """重新读取配置文件并校验基础字段"""
        if not os.path.isfile(self.m_config_file):
            raise ConfigError("找不到脚本配置文件: %s" % self.m_config_file)

        data = load_json(self.m_config_file)
        if not isinstance(data, dict):
            raise ConfigError("配置文件顶层必须是 JSON 对象: %s" % self.m_config_file)

        version = data.get("config_version")
        if not isinstance(version, int):
            raise ConfigError("配置缺少整数字段 config_version: %s" % self.m_config_file)
        if version != CONFIG_VERSION:
            hint = "请删除该部署目录后重新创建" if self.m_deploy_dir else "请更新配置模板"
            raise ConfigError(
                "配置版本不支持: 期望 %d, 实际 %d, %s: %s"
                % (CONFIG_VERSION, version, hint, self.m_config_file)
            )

        raw_root = data.get("project_root")
        if not isinstance(raw_root, str) or not raw_root.strip():
            raise ConfigError("配置缺少字符串字段 project_root: %s" % self.m_config_file)

        project_root = raw_root.strip()
        if not os.path.isabs(project_root):
            project_root = os.path.join(os.path.dirname(self.m_project_root_file), project_root)
        project_root = os.path.normpath(project_root)
        if not os.path.isdir(project_root):
            raise ConfigError(
                "project_root 不是有效目录: %s (配置值: %s)"
                % (project_root, raw_root)
            )

        self.m_data = data
        self.m_last_saved_data = copy.deepcopy(data)
        self.m_project_root = project_root

    def Require(self, key_path):
        """按点分路径读取字段, 缺失或为 null 时直接报错"""
        node = self.m_data
        for part in key_path.split("."):
            if not isinstance(node, dict) or part not in node:
                raise ConfigError("配置缺少字段: %s (文件: %s)" % (key_path, self.m_config_file))
            node = node[part]
        if node is None:
            raise ConfigError("配置字段不能为 null: %s (文件: %s)" % (key_path, self.m_config_file))
        return node

    def Get(self, key_path, expected_type=None):
        """读取字段并按需校验类型"""
        value = self.Require(key_path)
        if expected_type is not None and not isinstance(value, expected_type):
            raise ConfigError(
                "配置字段类型错误: %s 期望 %s, 实际 %s"
                % (key_path, expected_type.__name__, describe_type(value))
            )
        return value

    def Path(self, key_path, must_exist=False):
        """读取路径字段并解析成绝对路径

        启用部署目录后, 基础配置相关字段直接指向部署目录里的副本.
        """
        raw = self.Require(key_path)
        if not isinstance(raw, str) or not raw.strip():
            raise ConfigError("配置路径字段必须是非空字符串: %s" % key_path)
        value = raw.strip()
        copy_name = DEPLOY_COPY_PATH_KEYS.get(key_path, "") if self.m_deploy_dir else ""
        if copy_name:
            path = os.path.join(self.m_deploy_dir, copy_name)
        else:
            path = value if os.path.isabs(value) else os.path.join(self.m_project_root, value)
        path = os.path.normpath(path)
        if must_exist and not os.path.exists(path):
            raise ConfigError("配置路径不存在: %s = %s" % (key_path, path))
        return path

    def OptionalPath(self, key_path):
        """允许空字符串的路径字段, 空字符串表示未启用"""
        raw = self.Require(key_path)
        if not isinstance(raw, str):
            raise ConfigError("配置路径字段必须是字符串: %s" % key_path)
        value = raw.strip()
        if not value:
            return ""
        return self.Path(key_path)

    def GetDeployDirRaw(self):
        """读取部署目录: config/script/local.json 记录优先, 其次模板里的 paths.deploy_dir"""
        local_path = LocalStatePath(self.m_config_file)
        if os.path.isfile(local_path):
            state = load_json(local_path)
            if isinstance(state, dict):
                value = state.get("deploy_dir")
                if isinstance(value, str) and value.strip():
                    return value.strip()

        paths = self.m_data.get("paths")
        if not isinstance(paths, dict):
            return ""
        value = paths.get("deploy_dir")
        return value.strip() if isinstance(value, str) else ""

    def DeployPath(self, relative):
        """把相对部署目录的路径解析成绝对路径, 绝对路径原样返回"""
        if not self.m_deploy_dir:
            raise ConfigError("尚未选择部署目录: %s" % self.m_config_file)
        value = str(relative or "").strip()
        if not value:
            raise ConfigError("部署目录内的相对路径不能为空")
        if os.path.isabs(value):
            return os.path.normpath(value)
        return os.path.normpath(os.path.join(self.m_deploy_dir, value))

    def FlatItems(self):
        """展开全部叶子字段, 供配置编辑界面使用"""
        result = []

        def walk(node, prefix):
            for key in node:
                value = node[key]
                full_key = key if not prefix else prefix + "." + key
                if isinstance(value, dict) and value:
                    walk(value, full_key)
                else:
                    result.append((full_key, copy.deepcopy(value)))

        walk(self.m_data, "")
        return result

    def SetValue(self, key_path, value):
        """修改已有字段, 不允许新增未知字段, 避免拼写错误写坏配置"""
        parts = key_path.split(".")
        node = self.m_data
        for part in parts[:-1]:
            if not isinstance(node, dict) or part not in node:
                raise ConfigError("配置字段不存在: %s" % key_path)
            node = node[part]
        last = parts[-1]
        if not isinstance(node, dict) or last not in node:
            raise ConfigError("配置字段不存在: %s" % key_path)
        node[last] = copy.deepcopy(value)

    def Save(self):
        """写回配置文件并重新加载校验, 校验失败时恢复上一次有效配置"""
        previous = copy.deepcopy(self.m_last_saved_data)
        write_json(self.m_config_file, self.m_data)
        try:
            self.Reload()
        except ConfigError:
            write_json(self.m_config_file, previous)
            self.m_data = copy.deepcopy(previous)
            raise

    def SaveData(self, data):
        """整体替换配置内容, 供 GUI 的 JSON 编辑器使用"""
        if not isinstance(data, dict):
            raise ConfigError("配置顶层必须是 JSON 对象")
        previous = copy.deepcopy(self.m_last_saved_data)
        write_json(self.m_config_file, data)
        try:
            self.Reload()
        except ConfigError:
            write_json(self.m_config_file, previous)
            self.m_data = copy.deepcopy(previous)
            raise


def default_config_path(entry_file):
    """从根入口脚本推导配置路径"""
    entry_dir = os.path.dirname(os.path.abspath(entry_file))
    return os.path.join(entry_dir, "config", "script", CONFIG_FILE_NAME)


def package_config_path():
    """从 config/script/core 反推 config/script/config.json"""
    core_dir = os.path.dirname(os.path.abspath(__file__))
    script_dir = os.path.dirname(core_dir)
    return os.path.join(script_dir, CONFIG_FILE_NAME)


def ResolveDeployDir(settings, raw_value):
    """把部署目录解析成绝对路径, 相对路径按仓库根解析"""
    value = str(raw_value or "").strip()
    if not value:
        raise ConfigError("部署目录不能为空")
    if not os.path.isabs(value):
        value = os.path.join(settings.project_root, value)
    return os.path.normpath(value)


def DeriveBuildType(raw_value):
    """部署目录名为 debug/release 时用它作为默认构建类型"""
    name = os.path.basename(os.path.normpath(str(raw_value or "").strip())).lower()
    if name in ("debug", "release"):
        return name
    return ""


def LocalStatePath(base_config_file):
    """本地记录文件路径: config/script/local.json"""
    return os.path.join(
        os.path.dirname(os.path.abspath(base_config_file)), LOCAL_STATE_FILE_NAME
    )


def LoadLocalState(base_config_file):
    """读取本地记录, 文件不存在时返回空字典"""
    path = LocalStatePath(base_config_file)
    if not os.path.isfile(path):
        return {}
    data = load_json(path)
    if not isinstance(data, dict):
        raise ConfigError("本地记录文件顶层必须是 JSON 对象: %s" % path)
    return data


def _ApplyDeploySelection(base_settings, settings, configured):
    """把当前选择同步到副本, 并消费一次性的默认构建类型记录"""
    state = LoadLocalState(base_settings.config_file)
    pending = str(state.get("build_type") or "").strip()
    changed = False

    # 副本里的 paths.deploy_dir 仅用于展示, 保持与当前选择一致
    if settings.GetDeployDirRaw() != configured:
        settings.SetValue("paths.deploy_dir", configured)
        changed = True
    if pending and settings.Require("build.default_type") != pending:
        settings.SetValue("build.default_type", pending)
        changed = True
    if changed:
        settings.Save()

    if pending:
        state.pop("build_type", None)
        write_json(LocalStatePath(base_settings.config_file), state)


def ApplyDeployDir(base_settings, raw_value):
    """把部署目录选择写到 config/script/local.json, 不改动基础配置"""
    value = str(raw_value or "").strip()
    if not value:
        raise ConfigError("部署目录不能为空")

    state = LoadLocalState(base_settings.config_file)
    if state.get("deploy_dir") == value:
        return value

    state["deploy_dir"] = value
    build_type = DeriveBuildType(value)
    if build_type:
        state["build_type"] = build_type
    else:
        state.pop("build_type", None)
    write_json(LocalStatePath(base_settings.config_file), state)
    return value


def _ReadDeployDirChoice(console, prompt, default_text):
    """读取选择编号, 命令行下要求真实输入, EOF 视为取消"""
    reader = getattr(console, "ReadLine", None)
    if reader is None:
        # GUI 控制台没有行读取, 退化为对话框输入
        return console.Ask(prompt, default_text)
    try:
        return reader("%s [%s]: " % (prompt, default_text))
    except (EOFError, KeyboardInterrupt, RuntimeError):
        raise ConfigError("未选择部署目录, 已取消") from None


def PromptDeployDir(base_settings, console):
    """启动时选择部署目录, 返回用户输入的原始值"""
    current = base_settings.GetDeployDirRaw()
    console.Step("选择部署目录")
    console.Line("  部署目录存放脚本配置副本与全部服务器实例, 构建/部署/启停等模块共用该目录")
    console.Line("  当前: %s" % (current or "未设置"))

    items = list(DEPLOY_DIR_PRESETS) + [("自定义目录", "custom")]
    for index, (label, _value) in enumerate(items, start=1):
        console.Line("  %d. %s" % (index, label))

    default_index = 1
    if current == "release":
        default_index = 2
    elif current and current not in ("debug", "release"):
        default_index = len(items)

    while True:
        raw = _ReadDeployDirChoice(console, "请选择部署目录", str(default_index))
        text = str(raw).strip()
        try:
            index = int(text) if text else default_index
        except ValueError:
            console.Error("  请输入列表中的数字")
            continue
        if 1 <= index <= len(items):
            break
        console.Error("  选择超出范围: %s" % text)

    value = items[index - 1][1]
    if value != "custom":
        return value

    raw = _ReadDeployDirChoice(
        console, "部署目录 (相对仓库根或绝对路径)", current or "debug"
    )
    return str(raw).strip() or current or "debug"


def prepare_deploy_copies(base_settings, deploy_dir):
    """把仓库内的基础配置复制到部署目录, 已存在的副本不覆盖

    返回本次新建的副本列表
    """
    try:
        os.makedirs(deploy_dir, exist_ok=True)
    except OSError as error:
        raise ConfigError("创建部署目录失败: %s (%s)" % (deploy_dir, error)) from error

    # 基础配置是副本的源头, 缺少任何一份都直接报错
    sources = (
        (DEPLOY_SCRIPT_CONFIG_NAME, base_settings.config_file),
        (DEPLOY_BASECONFIG_NAME, base_settings.Path("paths.baseconfig", must_exist=True)),
        (DEPLOY_CROSSCONFIG_NAME, base_settings.Path("paths.blueprint", must_exist=True)),
    )

    created = []
    for name, source in sources:
        target = os.path.join(deploy_dir, name)
        if os.path.exists(target):
            continue
        # 先写临时文件再替换, 避免中途退出留下半个副本
        temp_path = target + ".tmp"
        try:
            shutil.copy2(source, temp_path)
            os.replace(temp_path, target)
        except OSError as error:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            raise ConfigError("复制部署配置副本失败: %s -> %s (%s)" % (source, target, error)) from error
        created.append(target)
    return created


def open_settings(config_file, deploy_dir=""):
    """准备部署目录副本, 返回 (指向副本的 Settings, 新建副本列表)

    仓库内的基础配置只当模板, 之后所有读写都针对部署目录里的副本.
    部署目录选择记录在 config/script/local.json, 不修改基础配置.
    deploy_dir 非空时先更新本地记录, 再准备副本.
    """
    base_settings = Settings(config_file)
    override = str(deploy_dir or "").strip()
    if override:
        ApplyDeployDir(base_settings, override)

    configured = base_settings.GetDeployDirRaw()
    if not configured:
        raise ConfigError(
            "尚未选择部署目录.\n"
            "  请运行 python auto.py 选择部署目录, 或使用 --deploy-dir 指定 (例如 debug / release)"
        )

    deploy_dir_path = ResolveDeployDir(base_settings, configured)
    created = prepare_deploy_copies(base_settings, deploy_dir_path)
    settings = Settings(
        os.path.join(deploy_dir_path, DEPLOY_SCRIPT_CONFIG_NAME),
        project_root_file=base_settings.config_file,
        deploy_dir=deploy_dir_path,
    )
    _ApplyDeploySelection(base_settings, settings, configured)
    return settings, created
