#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""统一配置加载与路径解析.

配置文件: config/script/config.json
规则:
    1. 所有路径都相对 project_root 解析, project_root 相对配置文件目录解析.
       这样部署时搬动仓库或修改目录名只需要改 project_root.
    2. 读取不到配置直接抛 ConfigError, 不做任何默认值兜底.
    3. 修改配置后调用 Save(), 写回文件并重新加载.
"""

import copy
import json
import os

from .errors import ConfigError

# 支持的配置文件版本, 结构变化时同步修改
CONFIG_VERSION = 1

# 配置文件固定名称
CONFIG_FILE_NAME = "config.json"


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
    """配置访问器, 所有模块只通过它读取路径与参数"""

    def __init__(self, config_file):
        self.m_config_file = os.path.abspath(config_file)
        self.m_config_dir = os.path.dirname(self.m_config_file)
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
            project_root = os.path.join(self.m_config_dir, project_root)
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
        """读取路径字段并解析成绝对路径"""
        raw = self.Require(key_path)
        if not isinstance(raw, str) or not raw.strip():
            raise ConfigError("配置路径字段必须是非空字符串: %s" % key_path)
        value = raw.strip()
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
