"""压测工具的路径配置

路径全部手工写在 stress_config.json 里, 工具不做任何向上查找。
相对路径以本模块所在目录(即 config/stress)为基准, 也可以直接写绝对路径。

配置项:
    project_root  仓库根目录(必填)
    proto_dir     protoc 生成的 .pb 描述符目录, 留空则用 <project_root>/luascript/proto
    report_dir    压测报告输出目录, 留空则用 <project_root>/debug/stress_reports
    state_file    界面状态(地址/端口/历史目标), 留空则用 <project_root>/debug/stress_gui.json
"""

import glob
import json
import os

# 配置文件与本模块同目录, 随工具一起搬动
CONFIG_FILE_NAME = "stress_config.json"

# 缺少配置文件时直接展示的模板
CONFIG_TEMPLATE = """{
  "project_root": "../..",
  "proto_dir": "../../luascript/proto",
  "report_dir": "../../debug/stress_reports",
  "state_file": "../../debug/stress_gui.json"
}"""

# 留空时的派生相对路径(相对 project_root)
DEFAULT_RELATIVE_PATHS = {
    "proto_dir": os.path.join("luascript", "proto"),
    "report_dir": os.path.join("debug", "stress_reports"),
    "state_file": os.path.join("debug", "stress_gui.json"),
}

# 解析结果缓存, 一次进程只读一次文件
_CONFIG_CACHE = None


class StressStartupError(RuntimeError):
    """启动阶段的配置/协议错误, 消息本身可以直接展示给用户"""


def stress_dir():
    """工具自身所在目录(config/stress), 也是相对路径的基准"""
    return os.path.dirname(os.path.abspath(__file__))


def config_path():
    """配置文件完整路径"""
    return os.path.join(stress_dir(), CONFIG_FILE_NAME)


def _resolve_path(raw_value):
    """相对路径按 stress 目录展开, 绝对路径原样规范化"""
    if os.path.isabs(raw_value):
        return os.path.normpath(raw_value)
    return os.path.normpath(os.path.join(stress_dir(), raw_value))


def _read_config_file():
    """读配置文件原始内容, 文件缺失或格式非法时抛出可读异常"""
    path = config_path()
    if not os.path.isfile(path):
        raise StressStartupError("找不到压测配置文件: %s\n\n请创建该文件, 内容示例:\n%s"
                                 % (path, CONFIG_TEMPLATE))
    try:
        # utf-8-sig: 兼容记事本/编辑器带 BOM 保存的 UTF-8
        with open(path, "r", encoding="utf-8-sig") as handler:
            data = json.load(handler)
    except Exception as error:
        raise StressStartupError("压测配置文件解析失败: %s\n%r" % (path, error)) from error
    if not isinstance(data, dict):
        raise StressStartupError("压测配置文件顶层必须是 JSON 对象: %s" % path)
    return data


def _check_proto_dir(proto_dir):
    """proto_dir 必须是目录且存在 .pb 描述符"""
    if not os.path.isdir(proto_dir):
        raise StressStartupError("proto_dir 不是有效目录: %s\n请检查 %s 里的 proto_dir"
                                 % (proto_dir, config_path()))
    if not glob.glob(os.path.join(proto_dir, "*.pb")):
        raise StressStartupError("proto_dir 下没有 .pb 描述符: %s\n请运行 generate_protobuf.py 生成"
                                 % proto_dir)


def load_config():
    """读取并校验配置, 返回各路径的绝对路径字典, 结果缓存"""
    global _CONFIG_CACHE
    if _CONFIG_CACHE is not None:
        return _CONFIG_CACHE

    data = _read_config_file()

    raw_root = str(data.get("project_root") or "").strip()
    if not raw_root:
        raise StressStartupError("压测配置缺少 project_root: %s" % config_path())
    project_root = _resolve_path(raw_root)
    if not os.path.isdir(project_root):
        raise StressStartupError("project_root 不是有效目录: %s\n(配置值 %r, 配置文件 %s)"
                                 % (project_root, raw_root, config_path()))

    config = {"project_root": project_root}
    for key, default_relative in DEFAULT_RELATIVE_PATHS.items():
        raw_value = str(data.get(key) or "").strip()
        if raw_value:
            config[key] = _resolve_path(raw_value)
        else:
            # 留空就按 project_root 派生, 不做任何查找
            config[key] = os.path.normpath(os.path.join(project_root, default_relative))

    _check_proto_dir(config["proto_dir"])

    _CONFIG_CACHE = config
    return config
