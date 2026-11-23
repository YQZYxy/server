#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Luban 配置生成脚本 (Python 版本)
支持多语言多路径输出配置
"""

import glob
import os
import subprocess

from ..core.errors import ModuleError
from ..core.menu import Module
from ..core.platform_utils import ResolveTool

# 结果日志收集 (在脚本末尾统一打印)
_RESULT_LOG = []


def _log(msg):
    _RESULT_LOG.append(msg)


# 运行时由 RunGeneration 注入
SCRIPT_DIR = ""
LUBAN_DLL = ""
CONF_FILE = ""
CONF_DIR = ""
DOTNET = ""
OUTPUTS = []


def _run_luban(output_cfg):
    """运行 Luban 生成配置"""
    env = os.environ.copy()
    env["DOTNET_ROLL_FORWARD"] = "LatestMajor"

    target_flag = "-d" if output_cfg["type"] == "data" else "-c"
    output_dir = os.path.normpath(os.path.join(SCRIPT_DIR, output_cfg["path"]))

    result = subprocess.run([
        DOTNET, LUBAN_DLL,
        "-t", "all",
        target_flag, output_cfg["target"],
        "--conf", CONF_FILE,
        "-x", "%s=%s" % (output_cfg["output_key"], output_dir),
    ], cwd=CONF_DIR, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
       text=True, encoding="utf-8", errors="replace", check=False)

    if result.stdout:
        print(result.stdout.rstrip("\r\n"))
    return result.returncode == 0


def _log_generated_files(output_dir, target):
    """打印生成目录下的配置文件列表"""
    pattern = f"*.{target}"
    files = sorted(glob.glob(os.path.join(output_dir, pattern)))
    if not files:
        _log(f"  [注意] {target} 目录未找到生成文件")
        return 0

    for f in files:
        filename = os.path.basename(f)
        if filename == "configmanager.lua":
            continue
        _log(f"    - {filename}")
    return len(files)


def _gen_loader(output_dir):
    """为 lua 输出生成 configmanager.lua 加载器"""
    loader_file = os.path.join(output_dir, "configmanager.lua")
    config_count = 0

    _log(f"  lua配置加载管理器: {loader_file}")

    with open(loader_file, "w", encoding="utf-8") as f:
        f.write("-- ============================================================================\n")
        f.write("-- 自动生成的配置加载器\n")
        f.write("-- 请勿手动编辑此文件\n")
        f.write("-- ============================================================================\n")
        f.write("\n")
        f.write("local M = {}\n")
        f.write("\n")

        for lua_file in sorted(glob.glob(os.path.join(output_dir, "*.lua"))):
            filename = os.path.splitext(os.path.basename(lua_file))[0]
            if filename == "configmanager":
                continue
            rel_path = os.path.relpath(output_dir, os.path.dirname(output_dir))
            f.write(f"M.{filename} = require(\"config.{filename}\")\n")
            config_count += 1

        f.write("\n")
        f.write("return M\n")

    return config_count


class ConfigTableModule(Module):
    """导出 Luban 配置表"""

    ID = "config_table"
    TITLE = "导出配置表"
    DESCRIPTION = "调用 Luban 导出 Lua/JSON 配置到逻辑服与客户端目录"

    OPTIONS = ()

    def Run(self, context, options):
        return RunGeneration(context.settings)


def RunGeneration(settings):
    """执行全部配置表输出"""
    global SCRIPT_DIR, LUBAN_DLL, CONF_FILE, CONF_DIR, DOTNET, OUTPUTS

    SCRIPT_DIR = settings.project_root
    LUBAN_DLL = settings.Path("config_table.luban_dll", must_exist=True)
    CONF_FILE = settings.Path("config_table.conf_file", must_exist=True)
    CONF_DIR = os.path.dirname(CONF_FILE)
    DOTNET = ResolveTool(settings, str(settings.Require("config_table.dotnet")))
    OUTPUTS = settings.Require("config_table.outputs")
    if not isinstance(OUTPUTS, list) or not OUTPUTS:
        raise ModuleError("config_table.outputs 必须是非空数组")
    for item in OUTPUTS:
        if not isinstance(item, dict):
            raise ModuleError("config_table.outputs 元素必须是对象")
        for key in ("type", "target", "path", "output_key"):
            if not isinstance(item.get(key), str) or not item.get(key):
                raise ModuleError("config_table.outputs 缺少字符串字段 %s" % key)
    _RESULT_LOG.clear()

    total_configs = 0
    failed = []
    for cfg in OUTPUTS:
        target = cfg["target"]
        output_dir = os.path.normpath(os.path.join(SCRIPT_DIR, cfg["path"]))
        gen_loader = bool(cfg.get("gen_loader", False))

        _log("[%s] 生成 -> %s" % (target, output_dir))

        if not _run_luban(cfg):
            _log("  [错误] %s 配置生成失败" % target)
            failed.append(target)
            continue

        _log_generated_files(output_dir, target)

        if gen_loader:
            total_configs = total_configs + _gen_loader(output_dir)

        _log("  [完成] %s 配置生成成功" % target)

    _print_final_report(total_configs)
    if failed:
        raise ModuleError("配置表生成失败: %s" % ", ".join(failed))
    return 0


def _print_final_report(config_count):
    """打印最终执行报告"""
    print()
    if _RESULT_LOG:
        for msg in _RESULT_LOG:
            print(msg)
    print()
    print("  输出目标数: %d" % len(OUTPUTS))
    print("  配置文件数: %d" % config_count)
