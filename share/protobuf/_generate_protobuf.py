#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Protobuf 生成脚本  
非必要不要改名字路径
"""

import os
import sys
import subprocess
import re
import shutil
import glob


# ==============================================
# C++:   --cpp_out		
# Java:  --java_out	
# Python: --python_out		
# Go:     --go_out		
# C#:  --csharp_out
# Lua: --descriptor_set_out
# ==============================================
CONFIG = {

    # 基础路径 (基于 share/ 目录)
    "BASE_DIR": os.path.dirname(os.path.dirname(__file__)),

    # proto 源文件目录 (相对 BASE_DIR)
    "PROTO_DIR": "protobuf",

    # ---- 输出路径 (相对 BASE_DIR) ----
    "OUTPUT_CPP_DIR": "protocol",                        # C++ .pb.h/.pb.cc

    # ---- C++ 消息定义生成路径 ----
    "OUTPUT_CPP_MHT": "protocol/protobufmht.hpp",         # C++ 枚举
    "OUTPUT_CPP_PROTOBUF_REGISTER": "protocol/protobufregister.cpp", # C++ 静态注册
    "OUTPUT_CPP_PROTOBUF_MSG_MAP": "protocol/protobufmsgmap.hpp",      # C++ msg_type 映射数据
    "OUTPUT_CPP_PROTOBUF_TEMPLATE": "protocol/protobuftemplate.hpp",

    # ---- Lua 侧 MHT 常量文件 ----
    "OUTPUT_LUA_MHT": r"..\luascript\proto\protobufmht.lua", # Lua MHT 常量
    "OUTPUT_LUA_PROTO_DIR": r"..\luascript\proto",                # Lua .pb 描述文件目录

    # ---- 前端 TS protobuf 静态模块 (mht/pbjs/pbts) ----
    "OUTPUT_FRONTEND_PROTOBUF_DIR": r"..\\client\\webui\\src\\types\\protobuf",  # 输出目录
    "OUTPUT_FRONTEND_PROTOBUF_MJS": "protocolbuf.mjs",   # pbjs 静态模块
    "OUTPUT_FRONTEND_PROTOBUF_DTS": "protocolbuf.d.ts",  # pbts 类型声明


    # ---- proto 编译选项 ----
    # 每个目标: (name, flag, output_config_key, clean_patterns, clean_recursive)
    # output_config_key 指向本 CONFIG 中的输出目录键名, 运行时解析为实际路径
    "TARGETS": [
        ("C++",     "--cpp_out",            "OUTPUT_CPP_DIR",       ["*.pb.cc", "*.pb.h", "*.cpp", "*.hpp"], True),
        ("Lua",     "--descriptor_set_out", "OUTPUT_LUA_PROTO_DIR", ["*.pb","*.lua"],              True),
    ],

    # ---- 复制到 battle_a ----
    "COPY_ENABLED": True,
    "COPY_SOURCE": "protocol",
    "COPY_TARGET": r"..\..\battle_a\Source\LyraGame\Protobuf\protocol",
    "COPY_PATTERNS": ["*.pb.cc", "*.pb.h", "*.h", "*.hpp"],

    # ---- 范围标记 ----
    "RANGE_MARKS": [
        ("MHT_BATTLE_MSG_TYPE_MAX", "30000", "战斗服与外部协议分界"),
    ],
}


# ==============================================

# 结果日志收集 (在脚本末尾统一打印)
_RESULT_LOG = []
def _log(msg):
    _RESULT_LOG.append(msg)


# ==============================================

def _resolve_targets(config):
    """将 TARGETS 中的输出目录键解析为实际路径"""
    result = []
    for name, flag, output_key, patterns, recursive in config["TARGETS"]:
        out_dir = config.get(output_key, output_key)
        result.append((name, flag, out_dir, patterns, recursive))
    return result


# ==============================================

def _check_protoc():
    """
    检查 protoc 是否可用, 返回完整路径或空字符串
    查找顺序: 系统 PATH -> 脚本同级目录
    """
    protoc_path = shutil.which("protoc")
    if not protoc_path:
        local_path = os.path.join(os.path.dirname(__file__), "protoc.exe")
        if os.path.isfile(local_path):
            protoc_path = local_path
            print(f"[信息] 在脚本目录找到 protoc: {protoc_path}")
        else:
            print(f"[错误] 未在 PATH 和脚本目录中找到 protoc 编译器")
            print(f"      脚本目录: {os.path.dirname(__file__)}")
            return ""
    try:
        result = subprocess.run([protoc_path, "--version"],
                                capture_output=True, text=True)
        if result.returncode == 0:
            print(f"[信息] 找到 protoc: {protoc_path} ({result.stdout.strip()})")
            return protoc_path
        return ""
    except OSError as e:
        print(f"[错误] 尝试执行 protoc 失败: {e}")
        return ""


def _clean_directory(dir_path, patterns, recursive):
    """清理目录中匹配的文件"""
    for pattern in patterns:
        if recursive:
            search_path = os.path.join(dir_path, "**", pattern)
        else:
            search_path = os.path.join(dir_path, pattern)
        for f in glob.glob(search_path, recursive=recursive):
            try:
                os.remove(f)
            except OSError:
                pass


def _prepare_output_dir(target, base_dir):
    """创建或清理目标输出目录, 返回完整路径"""
    name, flag, out_dir, patterns, recursive = target
    full_dir = os.path.normpath(os.path.join(base_dir, out_dir))
    if not os.path.exists(full_dir):
        print(f"正在创建 {name} 输出目录: {full_dir}")
        os.makedirs(full_dir, exist_ok=True)
    else:
        print(f"正在清理 {name} 输出目录中的文件: {full_dir}")
        _clean_directory(full_dir, patterns, recursive)
    return full_dir


def _scan_proto_files(proto_dir):
    """递归扫描所有 .proto 文件"""
    proto_files = []
    for root, dirs, files in os.walk(proto_dir):
        for f in files:
            if f.endswith(".proto"):
                proto_files.append(os.path.join(root, f))
    proto_files.sort()
    return proto_files


def _compile_proto(protoc_path, target, proto_file, proto_path_arg, output_dir):
    name, flag, out_dir, patterns, recursive = target

    if flag == "--descriptor_set_out":
        # Lua 模式: 每个 proto 生成独立的 .pb 文件
        stem = os.path.splitext(os.path.basename(proto_file))[0]
        out_path = os.path.join(output_dir, f"{stem}.pb")
        result = subprocess.run(
            [protoc_path, f"{flag}={out_path}", proto_path_arg, proto_file],
            capture_output=True, text=True
        )
    else:
        # C++ / Python 模式: 直接指定输出目录
        result = subprocess.run(
            [protoc_path, f"{flag}={output_dir}", proto_path_arg, proto_file],
            capture_output=True, text=True
        )

    if result.returncode == 0:
        _log(f"  [{name}] 成功: {os.path.basename(proto_file)}")
        return True, None
    else:
        err = result.stderr.strip() if result.stderr else ""
        _log(f"  [{name}] 失败: {os.path.basename(proto_file)}")
        if err:
            _log(f"      原因: {err}")
        return False, err


def _print_config(enabled_targets, full_proto_dir, output_dirs):
    """打印配置信息"""
    print()
    print("============= 配置信息 =============")
    print(f"父目录: {CONFIG['BASE_DIR']}")
    print(f"Proto 目录: {full_proto_dir}")
    for t in enabled_targets:
        print(f"{t[0]} 输出目录: {output_dirs[t[0]]}")
    print("===================================")
    print()
    print("开始扫描 proto 文件...")
    print()


def _print_final_report(total_count, success_counts, fail_count, output_dirs):
    """打印最终执行报告 (包含所有收集的结果)"""
    print()
    print("============= 执行结果汇总 =============")
    print(f"扫描文件数: {total_count}")
    for name, count in success_counts.items():
        print(f"{name} 成功: {count} 个")
    print(f"编译失败: {fail_count} 个")
    print()
    print("输出目录:")
    for name, out_dir in output_dirs.items():
        print(f"  {name}: {out_dir}")
    print()
    if _RESULT_LOG:
        for msg in _RESULT_LOG:
            print(msg)
    print("=========================================")

def _copy_output(config):
    """复制生成文件到指定路径"""
    source_dir = os.path.normpath(os.path.join(config["BASE_DIR"], config["COPY_SOURCE"]))
    target_dir = os.path.normpath(os.path.join(config["BASE_DIR"], config["COPY_TARGET"]))

    if not os.path.isdir(source_dir):
        _log(f"[复制] 源目录不存在, 跳过复制: {source_dir}")
        return
    if not os.path.isdir(target_dir):
        _log(f"[复制] 目标目录不存在, 跳过复制: {target_dir}")
        return

    _log(f"[复制] 源目录: {source_dir}")
    _log(f"[复制] 目标目录: {target_dir}")

    copied_count = 0
    for pattern in config["COPY_PATTERNS"]:
        for f in glob.glob(os.path.join(source_dir, "**", pattern), recursive=True):
            try:
                rel_path = os.path.relpath(f, source_dir)
                dest = os.path.join(target_dir, rel_path)
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                shutil.copy2(f, dest)
                copied_count += 1
            except Exception as e:
                _log(f"  [复制] 失败: {f} -> {e}")

    _log(f"[复制] 共复制 {copied_count} 个文件")

# ==============================================
# Proto → TypeScript 类型生成
# ==============================================

PROTO_TO_TS_TYPE = {
    'int32': 'number',
    'int64': 'number',
    'uint32': 'number',
    'uint64': 'number',
    'sint32': 'number',
    'sint64': 'number',
    'fixed32': 'number',
    'fixed64': 'number',
    'sfixed32': 'number',
    'sfixed64': 'number',
    'float': 'number',
    'double': 'number',
    'string': 'string',
    'bool': 'boolean',
    'bytes': 'string',
}


def _proto_type_to_ts(proto_type: str) -> str:
    """将 proto 字段类型转换为 TypeScript 类型"""
    # repeated 前缀
    repeated = False
    if proto_type.startswith('repeated '):
        repeated = True
        proto_type = proto_type[9:]

    # map<K, V>
    m = re.match(r'map<(.+),\s*(.+?)>', proto_type)
    if m:
        k = _proto_type_to_ts(m.group(1).strip())
        v = _proto_type_to_ts(m.group(2).strip())
        ts = f'Record<{k}, {v}>'
        return ts + '[]' if repeated else ts

    # optional 前缀
    if proto_type.startswith('optional '):
        proto_type = proto_type[9:]

    ts_type = PROTO_TO_TS_TYPE.get(proto_type, proto_type)
    return ts_type + '[]' if repeated else ts_type


def _build_file_header(comment_prefix, source=None):
    """生成文件头部注释
    Args:
        comment_prefix: 注释前缀, 如 '//', '--', '#'
        source: 来源描述, 如 '*.proto', 为 None 时省略来源行
    Returns:
        list[str]: 头部注释行列表
    """
    lines = [
        f'{comment_prefix} ============================================================',
        f'{comment_prefix}  此文件由 _generate_protobuf.py 自动生成 请勿手动修改',
    ]
    if source:
        lines.append(f'{comment_prefix}  来源: share/protobuf/{source}')
    lines.append(f'{comment_prefix} ============================================================')
    lines.append('')
    return lines


def generate_mht_ts(results, ts_dir: str):
    """生成ts (MHT 常量 + PROTO_BODY_TYPE 映射)"""
    path = os.path.join(ts_dir, 'mht.ts')
    lines = _build_file_header('//', '*.proto')

    # MHT 常量表
    lines.append('// ==================== MHT 协议号常量 ====================')
    lines.append('')
    lines.append('export const MHT = {')
    for number, enum_name, _, _, _, _, proto_cmts in results:
        cmt = (' '.join(proto_cmts)) if proto_cmts else ''
        if cmt:
            lines.append(f'  {enum_name}: {number},  // {cmt}')
        else:
            lines.append(f'  {enum_name}: {number},')
    lines.append('} as const')
    lines.append('')

    # 消息类型映射
    lines.append('// ==================== 消息类型映射 ====================')
    lines.append('')
    lines.append('/** msg_type → 消息体类型名 */')
    lines.append('export const PROTO_BODY_TYPE: Record<number, string> = {')
    for number, _, _, _, _, msg_name, _ in results:
        if msg_name:
            lines.append(f'  {number}: \'{msg_name}\',')
    lines.append('}')
    lines.append('')

    write_file(path, '\n'.join(lines) + '\n')
    _log(f'  已生成: {path}')


# ==============================================
# MHT_ 注释解析
# ==============================================

def _capture_proto_comments(lines, sym_line_index):
    """从 MHT_ 注释行往前找, 捕获连续的行注释行"""
    comments = []
    for i in range(sym_line_index - 1, -1, -1):
        stripped = lines[i].strip()
        if stripped == "" or stripped.startswith("// MHT_"):
            break
        m = re.match(r'^\s*//+\s*(.*)', stripped)
        if m:
            text = m.group(1).strip()
            if text:
                comments.insert(0, text)
            continue
        if stripped.startswith("enum ") or stripped.startswith("}"):
            break
        break
    return comments


def scan_mht_annotations(proto_dir):
    """扫描所有 .proto 文件中的 // MHT_XXX = N 注释"""
    results = []
    errors = []
    pattern = re.compile(r'//\s*(MHT_\w+)\s*=\s*(0x[\dA-Fa-f]+|\d+)\s*(?://\s*(.*))?')

    proto_files = glob.glob(os.path.join(proto_dir, "*.proto"))
    proto_files.sort()
    if not proto_files:
        return []

    for proto_path in proto_files:
        basename = os.path.basename(proto_path)
        with open(proto_path, "r", encoding="utf-8") as f:
            content = f.read()
        lines = content.split("\n")

        for i, line in enumerate(lines):
            m = pattern.search(line)
            if not m:
                continue
            line_num = i + 1
            enum_name = m.group(1)
            number = int(m.group(2), 0)  # 0=auto base, 支持 0x 前缀
            inline_comment = m.group(3).strip() if m.group(3) else ""

            if number < 0 or number > 536870911:
                errors.append(f"[格式错误] {basename}:{line_num} 编号越界")

            proto_comments = _capture_proto_comments(lines, i)
            msg_name = _find_next_message(lines, i + 1)
            if not msg_name:
                errors.append(f"[格式错误] {basename}:{line_num} {enum_name} 后无 message 定义")

            results.append((number, enum_name, inline_comment, basename,
                           line_num, msg_name, proto_comments))

    if errors:
        print("\n[错误] 格式问题, 终止生成:")
        for e in errors:
            print(f"  ✖ {e}")
        sys.exit(1)

    # 重复编号检查
    seen_numbers = {}
    for number, enum_name, _, basename, line_num, _, _ in results:
        if number in seen_numbers:
            prev = seen_numbers[number]
            errors.append(
                f"[重复编号] {basename}:{line_num} {enum_name}={number} "
                f"与 {prev[0]}:{prev[1]} {prev[2]} 冲突")
        else:
            seen_numbers[number] = (basename, line_num, enum_name)

    # 重复名称检查 ,不同编号用同一枚举名
    seen_names = {}
    for number, enum_name, _, basename, line_num, _, _ in results:
        if enum_name in seen_names:
            prev = seen_names[enum_name]
            errors.append(
                f"[重复名称] {basename}:{line_num} {enum_name}={number} "
                f"与 {prev[0]}:{prev[1]} {enum_name}={prev[2]} 冲突")
        else:
            seen_names[enum_name] = (basename, line_num, number)

    if errors:
        print("\n[错误] 发现冲突, 终止生成:")
        for e in errors:
            print(f"   {e}")
        sys.exit(1)

    results.sort(key=lambda x: x[0])
    return results


def _find_next_message(lines, start):
    for i in range(start, min(start + 10, len(lines))):
        s = lines[i].strip()
        if s.startswith("message ") or s.startswith("message\t"):
            parts = s.split()
            if len(parts) >= 2 and parts[1][0].isupper():
                return parts[1]
    return ""


def _get_group(number):
    if number < 20000:
        return "内部协议"
    elif number < 30000:
        return "战斗服协议"
    else:
        return "外部协议"


def generate_protobufmht_hpp(results, output_path):
    """生成 C++ MHT"""
    lines = _build_file_header('//')
    lines.append("#ifndef __MSG_HEAD_DEF_HPP__")
    lines.append("#define __MSG_HEAD_DEF_HPP__")
    lines.append("")
    lines.append("static const int MSG_HEAD_TYPE_MAX = 65536;")
    lines.append("enum MSG_HEAD_TYPE")
    lines.append("{")

    current_group = None
    for item in results:
        number, enum_name, _, _, _, msg_name, proto_cmts = item
        group = _get_group(number)
        if group != current_group:
            pad = "/////////////////////////////////////"
            lines.append("")
            lines.append(f"\t{pad}{group}{pad}")
            current_group = group

        parts = []
        if msg_name:
            parts.append(msg_name)
        if proto_cmts:
            parts.append(" ".join(proto_cmts))

        line_cmt = ("\t// " + " ".join(parts)) if parts else ""
        lines.append(f"\t{enum_name} = {number},{line_cmt}")

    lines.append("")
    lines.append("\t/////////////////////////////////////范围标记/////////////////////////////////////////////")
    for name, val, cmt in CONFIG["RANGE_MARKS"]:
        lines.append(f"\t{name} = {val},\t\t// {cmt}")
    lines.append("};")
    lines.append(f"static const int MSG_HEAD_TYPE_CHECK = __LINE__;")
    lines.append("#endif // __MSG_HEAD_DEF_HPP__")

    write_file(output_path, "\n".join(lines) + "\n")
    _log(f"  已生成: {output_path}")


def generate_protoregister_cpp(results, output_path):
    """生成C++ 静态初始化自动注册 """
    lines = _build_file_header('//')
    lines.append('#include "protobuf/protobufmanager.hpp"')
    lines.append('#include "protobufmht.hpp"')
    lines.append("")
    lines.append("namespace {")
    lines.append("struct ProtoAutoRegistrar {")
    lines.append("    ProtoAutoRegistrar() {")

    for item in results:
        _, enum_name, _, _, _, msg_name, _ = item
        if msg_name:
            lines.append(f"        REGISTER_PROTO_MSG({msg_name});")

    lines.append("    }")
    lines.append("} g_registrar;")
    lines.append("}")

    write_file(output_path, "\n".join(lines) + "\n")
    _log(f"  已生成: {output_path}")


def generate_protomsgmap_header(results, output_path):
    """生成C++ msg_type → proto 类型名 映射数据
    """
    lines = _build_file_header('//')
    lines.append('// msg_type → proto 类型名 映射数据表')
    lines.append("#ifndef __PROTO_MSG_MAP_HPP__")
    lines.append("#define __PROTO_MSG_MAP_HPP__")
    lines.append("")
    lines.append("// {msg_type, \"proto_type_name\"} 映射表")
    lines.append("// 终止标记: {0, nullptr}")
    lines.append("static constexpr struct { int msg_type; const char* type_name; }")
    lines.append("    g_proto_msg_map[] = {")

    for item in results:
        number, enum_name, _, _, _, msg_name, _ = item
        if msg_name:
            lines.append(f"        {{ {number}, \"{msg_name}\" }},")

    lines.append("        { 0, nullptr }")
    lines.append("    };")
    lines.append("")
    lines.append("#endif // __PROTO_MSG_MAP_HPP__")

    # 校验: 重复编号
    numbers = [item[0] for item in results if item[5]]
    seen = set()
    for n in numbers:
        if n in seen:
            print(f"  [错误] 发现重复编号 {n}, 终止")
            sys.exit(1)
        seen.add(n)

    write_file(output_path, "\n".join(lines) + "\n")
    _log(f"  已生成: {output_path}  ({len(numbers)} 条映射)")


def generate_lua_mhtdef(results, output_path):
    """生成 lua MHT 协议号常量 """
    lines = _build_file_header('--')
    lines.append("local M = {}")
    lines.append("")

    for item in results:
        number, enum_name, inline_comment, _, _, msg_name, proto_cmts = item
        parts = []
        if msg_name:
            parts.append(msg_name)
        if proto_cmts:
            parts.append(" ".join(proto_cmts))
        cmt = (" -- " + " ".join(parts)) if parts else ""
        lines.append(f"M.{enum_name} = {number}{cmt}")

    # 范围标记 (RANGE_MARKS)
    for name, val, cmt in CONFIG["RANGE_MARKS"]:
        lines.append(f"M.{name} = {val}\t\t-- {cmt}")

    lines.append("")
    lines.append("return M")

    write_file(output_path, "\n".join(lines) + "\n")
    _log(f"  已生成: {output_path}  ({len(results)} 条常量)")


def generate_proto_msgtype_hpp(results, output_path):
    """ MsgClass → msg_type 模板特化"""
    lines = _build_file_header('//')
    lines.append('#ifndef __PROTOBUF_TEMPLATE_HPP__')
    lines.append('#define __PROTOBUF_TEMPLATE_HPP__')
    lines.append('')
    lines.append('#include "protobufmht.hpp"')
    lines.append('#include "protocol.pb.h"')
    lines.append('')
    lines.append('template<typename T> struct ProtoMsgType;')
    lines.append('')

    for item in results:
        _, enum_name, _, _, _, msg_name, _ = item
        if msg_name:
            lines.append(
                f'template<> struct ProtoMsgType<{msg_name}> '
                f'{{ static constexpr int type = {enum_name}; }};'
            )

    lines.append('')
    lines.append('#endif // __PROTOBUF_TEMPLATE_HPP__')
    write_file(output_path, '\n'.join(lines) + '\n')
    _log(f'  已生成: {output_path}  ({sum(1 for r in results if r[5])} 条映射)')


def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def _generate_protobuf_index_ts(dts_path: str, index_path: str):
    """
    根据 protocol.d.ts 中的所有 export class, 自动生成 index.ts 的类型别名.
    通过 import type ... as _XXX + export type XXX = _XXX.\$Properties 的方式,
    """
    with open(dts_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 找到所有 export class XXX 且对应 namespace XXX { interface $Properties ... }
    aliases = []
    for m in re.finditer(r'^export class (\w+) ', content, re.MULTILINE):
        cls_name = m.group(1)
        # 跳过 IP_ 开头已废弃接口
        if cls_name.startswith('IP_'):
            continue
        # 确认有 namespace XXX { interface $Properties
        ns_pattern = rf'export namespace {cls_name} \{{[\s\S]*?interface \$Properties'
        if re.search(ns_pattern, content):
            aliases.append(cls_name)

    if not aliases:
        # 没有别名, 只保留基础导出
        lines = _build_file_header('//')
        lines.append("export * from './mht'")
        lines.append("export * from './protocolbuf'")
        write_file(index_path, '\n'.join(lines) + '\n')
        _log("  [index.ts] 已生成 (无别名)")
        return

    aliases.sort()

    lines = _build_file_header('//')
    lines.append("export * from './mht'")
    lines.append('import * as _proto from \'./protocolbuf\'')
    lines.append('')

    # export type + const for each class
    for name in aliases:
        lines.append(f'export const {name} = _proto.{name}')
        lines.append(f'export type {name} = _proto.{name}.$Properties')
        lines.append('')

    write_file(index_path, '\n'.join(lines) + '\n')
    _log(f"  已生成: {index_path} ({len(aliases)} 个别名)")


def _generate_frontend_proto(config):
    """生成前端静态 protobuf 模块 (pbjs + pbts + index.ts)"""
    bd = config["BASE_DIR"]
    frontend_proto_dir = os.path.normpath(os.path.join(bd, config["OUTPUT_FRONTEND_PROTOBUF_DIR"]))
    proto_files_glob = os.path.normpath(os.path.join(bd, config["PROTO_DIR"], "*.proto"))
    output_mjs = os.path.join(frontend_proto_dir, config["OUTPUT_FRONTEND_PROTOBUF_MJS"])
    output_dts = os.path.join(frontend_proto_dir, config["OUTPUT_FRONTEND_PROTOBUF_DTS"])

    os.makedirs(os.path.dirname(output_mjs), exist_ok=True)

    # 用 glob 获取所有 .proto 文件的完整路径
    proto_file_list = glob.glob(proto_files_glob)
    if not proto_file_list:
        return

    # 使用 protobufjs-cli 的 pbjs 生成静态模块
    try:
        # Windows 下 npx 可能是 npx.cmd
        npx_cmd = shutil.which("npx") or "npx"

        cmd_pbjs = [npx_cmd, "--package=protobufjs-cli", "pbjs",
                    "-t", "static-module", "-w", "es6",
                    "--force-number", "--keep-case",
                    "-o", output_mjs] + proto_file_list
        subprocess.run(cmd_pbjs, capture_output=True, text=True, check=True,
                       timeout=60, stdin=subprocess.DEVNULL)
        _log(f"  [pbjs] 已生成: {output_mjs}")

        cmd_pbts = [npx_cmd, "--package=protobufjs-cli", "pbts",
                    "-o", output_dts, output_mjs]
        subprocess.run(cmd_pbts, capture_output=True, text=True, check=True,
                       timeout=60, stdin=subprocess.DEVNULL)
        _log(f"  [pbts] 已生成: {output_dts}")

        # 生成 index.ts: $Properties 类型别名 (消除 .$Properties 后缀)
        index_ts_path = os.path.join(frontend_proto_dir, "index.ts")
        _generate_protobuf_index_ts(output_dts, index_ts_path)
    except subprocess.TimeoutExpired:
        _log("  [pbjs/pbts] 超时(60s), 可在 webui 目录手动运行 npx pbjs ...")
    except subprocess.CalledProcessError as e:
        _log(f"  [pbjs/pbts] 失败: {e.stderr or e}")
    except FileNotFoundError:
        _log("  [pbjs/pbts] npx 未找到, 跳过 (可在 webui 目录手动运行 npx pbjs ...)")



# ============================ 入口 ========================================

def main():
    has_error = False

    protoc_path = _check_protoc()
    if not protoc_path:
        print("[错误] 未找到 protoc 编译器!")
        has_error = True

    enabled_targets = _resolve_targets(CONFIG)
    if not enabled_targets:
        print("[错误] 没有启用的目标语言, 请检查 TARGETS 配置!")
        has_error = True

    full_proto_dir = os.path.join(CONFIG["BASE_DIR"], CONFIG["PROTO_DIR"])
    if not os.path.isdir(full_proto_dir):
        print(f"[错误] Proto 目录不存在: {full_proto_dir}")
        has_error = True

    if has_error:
        input("按任意键继续...")
        return

    output_dirs = {}
    for target in enabled_targets:
        output_dirs[target[0]] = _prepare_output_dir(target, CONFIG["BASE_DIR"])

    proto_files = _scan_proto_files(full_proto_dir)

    _print_config(enabled_targets, full_proto_dir, output_dirs)

    if not proto_files:
        print("[警告] 未找到任何 .proto 文件!")
        input("按任意键继续...")
        return

    total_count = 0
    fail_count = 0
    success_counts = {t[0]: 0 for t in enabled_targets}
    proto_path_arg = f"--proto_path={full_proto_dir}"

    for proto_file in proto_files:
        total_count += 1
        basename = os.path.basename(proto_file)
        print(f"[文件 {total_count}] 正在编译: {basename}")

        for target in enabled_targets:
            ok, _ = _compile_proto(
                protoc_path, target, proto_file, proto_path_arg,
                output_dirs[target[0]]
            )
            if ok:
                success_counts[target[0]] += 1
            else:
                fail_count += 1

        print()

    # 生成 c++ 消息映射表
    bd = CONFIG["BASE_DIR"]
    proto_path = os.path.join(bd, CONFIG["PROTO_DIR"])
    mht_results = scan_mht_annotations(proto_path)
    if mht_results:
        generate_protobufmht_hpp(mht_results, os.path.join(bd, CONFIG["OUTPUT_CPP_MHT"]))
        generate_protoregister_cpp(mht_results, os.path.join(bd, CONFIG["OUTPUT_CPP_PROTOBUF_REGISTER"]))

        # 生成 C++ 消息映射数据头文件 (ProtoLuaManager::Init 时注册)
        generate_protomsgmap_header(mht_results, os.path.join(bd, CONFIG["OUTPUT_CPP_PROTOBUF_MSG_MAP"]))

        # 生成 Lua MHT 常量文件 (供 Lua 侧使用 MHT_LOGIN_CS 等常量)
        generate_lua_mhtdef(mht_results, os.path.join(bd, CONFIG["OUTPUT_LUA_MHT"]))

        # 生成编译期 MsgClass → msg_type 模板特化
        generate_proto_msgtype_hpp(mht_results, os.path.join(bd, CONFIG["OUTPUT_CPP_PROTOBUF_TEMPLATE"]))

    # 生成 TypeScript 文件
    if mht_results:
        ts_dir = os.path.normpath(os.path.join(bd, CONFIG["OUTPUT_FRONTEND_PROTOBUF_DIR"]))
        os.makedirs(ts_dir, exist_ok=True)

        # 只生成 mht.ts (MHT 常量 + PROTO_BODY_TYPE 映射)
        generate_mht_ts(mht_results, ts_dir)

        _generate_frontend_proto(CONFIG)

    # 复制 C++ 输出到指定路径
    if CONFIG["COPY_ENABLED"]:
        _copy_output(CONFIG)

    _print_final_report(total_count, success_counts, fail_count, output_dirs)


# ============================ 入口 ========================================

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
        print(f"[错误] 脚本异常: {e}")
    finally:
        wait_and_exit()

