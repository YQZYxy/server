#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Luban 配置生成脚本 (Python 版本)
支持多语言多路径输出配置
"""

import os
import sys
import subprocess
import glob

# 结果日志收集 (在脚本末尾统一打印)
_RESULT_LOG = []

def _log(msg):
    _RESULT_LOG.append(msg)

# 脚本所在目录
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Luban DLL 路径 (相对 SCRIPT_DIR)
LUBAN_DLL = os.path.normpath(os.path.join(
    SCRIPT_DIR, r"..\..\luban-4.5.0\src\Luban\bin\Debug\net8.0\Luban.dll"
))
CONF_FILE = os.path.join(SCRIPT_DIR, "__luban__.conf")

# ==================== 输出配置 ====================
# type: "data" -> 用 -d (数据序列化), "code" -> 用 -c (代码生成)
# target: luban 目标名 (lua, json, typescript-json, typescript-bin, ...)
# path: 输出目录 (相对 SCRIPT_DIR)
# output_key: 传给 -x 的输出路径参数名 (data用outputDataDir, code用outputCodeDir)
# gen_loader: 是否自动生成配置加载器 (目前仅 lua data 需要)
OUTPUTS = [
    {"type": "data", "target": "lua",  "path": r"..\..\luascript\config", "output_key": "outputDataDir", "gen_loader": True},
    {"type": "data", "target": "json", "path": r"..\logicconfig", "output_key": "outputDataDir", "gen_loader": False},
]
# =================================================


def _run_luban(output_cfg):
    """运行 Luban 生成配置"""
    env = os.environ.copy()
    env["DOTNET_ROLL_FORWARD"] = "LatestMajor"

    target_flag = "-d" if output_cfg["type"] == "data" else "-c"
    output_dir = os.path.normpath(os.path.join(SCRIPT_DIR, output_cfg["path"]))

    result = subprocess.run([
        "dotnet", LUBAN_DLL,
        "-t", "all",
        target_flag, output_cfg["target"],
        "--conf", CONF_FILE,
        "-x", f"{output_cfg['output_key']}={output_dir}"
    ], env=env)

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


def main():
    total_configs = 0

    for cfg in OUTPUTS:
        target = cfg["target"]
        output_dir = os.path.normpath(os.path.join(SCRIPT_DIR, cfg["path"]))
        gen_loader = cfg.get("gen_loader", False)

        _log(f"[{target}] 生成 -> {output_dir}")

        if not _run_luban(cfg):
            _log(f"  [错误] {target} 配置生成失败")
            continue

        # 打印生成的文件列表
        _log_generated_files(output_dir, target)

        if gen_loader:
            count = _gen_loader(output_dir)
            total_configs = total_configs + count

        _log(f"  [完成] {target} 配置生成成功")

    _print_final_report(total_configs)
    wait_and_exit()


def _print_final_report(config_count):
    """打印最终执行报告"""
    print()
    if _RESULT_LOG:
        for msg in _RESULT_LOG:
            print(msg)
    print()
    print(f"  输出目标数: {len(OUTPUTS)}")
    print(f"  配置文件数: {config_count}")


def wait_and_exit():
    """等待按 Enter 后关闭窗口"""
    print()
    print("  脚本执行完毕, 按 Enter 关闭窗口...")
    try:
        input()
    except (KeyboardInterrupt, EOFError):
        pass


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        _log(f"  [错误] 脚本异常: {e}")
        import traceback
        traceback.print_exc()
        wait_and_exit()
