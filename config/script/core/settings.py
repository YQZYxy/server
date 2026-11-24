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
       只作为默认模板. 运行脚本时先复制到部署目录(由基础配置 paths.deploy_dir 决定),
       之后读写都针对副本, 原始默认配置不会被修改.
"""

import copy
import json
import os
import shutil

from .errors import ConfigError

# 支持的配置文件版本, 结构变化时同步修改
CONFIG_VERSION = 1

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
            raise ConfigError(
                "配置版本不支持: 期望 %d, 实际 %d, 请更新 %s"
                % (CONFIG_VERSION, version, self.m_config_file)
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


def prepare_deploy_copies(base_settings):
    """把仓库内的基础配置复制到部署目录, 已存在的副本不覆盖

    返回 (部署目录, 本次新建的副本列表)
    """
    deploy_dir = base_settings.Path("paths.deploy_dir")
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
    return deploy_dir, created


def open_settings(config_file):
    """准备部署目录副本, 返回 (指向副本的 Settings, 新建副本列表)

    仓库内的基础配置只当模板, 之后所有读写都针对部署目录里的副本.
    部署目录由基础配置的 paths.deploy_dir 决定, 修改副本里的这个字段不会生效.
    """
    base_settings = Settings(config_file)
    deploy_dir, created = prepare_deploy_copies(base_settings)
    settings = Settings(
        os.path.join(deploy_dir, DEPLOY_SCRIPT_CONFIG_NAME),
        project_root_file=base_settings.config_file,
        deploy_dir=deploy_dir,
    )

    # 副本里的部署目录改不了实际位置, 直接报错避免误解
    base_value = str(base_settings.Require("paths.deploy_dir")).strip()
    copy_value = str(settings.Require("paths.deploy_dir")).strip()
    if base_value != copy_value:
        raise ConfigError(
            "部署目录只能在基础配置中修改: 基础配置为 %s, 部署副本为 %s (%s)"
            % (base_value, copy_value, settings.config_file)
        )
    return settings, created
