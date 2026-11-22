#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# 从 C++ 的 sol2 绑定代码生成 Lua 全局函数声明
# 手写声明放在 cppbindings.lua 的自动区块之前, 这里只补充还没手写过的函数
#   python generate_lua_bindings.py            更新声明文件
#   python generate_lua_bindings.py --check    只检查是否缺失, 不写文件
#   python generate_lua_bindings.py --file XXX 指定声明文件路径(调试用)

import argparse
import io
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# 声明文件默认位置
DEFAULT_DEFINE_FILE = os.path.join(SCRIPT_DIR, 'luascript', 'cppbindings.lua')

# 扫描绑定代码的目录, 相对仓库根目录
SCAN_DIRS = [
    'share/lua',
    'logicserver/luaext',
]

# 第三方目录不扫描
EXCLUDE_DIR_NAMES = {
    'lua-5.4',
    'lua-protobuf',
}

# 自动区块标记
AUTO_BEGIN = '-- ===== AUTO-BEGIN 由 generate_lua_bindings.py 自动生成, 请勿手改 ====='
AUTO_END = '-- ===== AUTO-END ====='

# C++ 类型到 Lua 类型的映射
SIMPLE_TYPE_MAP = {
    'bool': 'boolean',
    'int': 'integer',
    'int8_t': 'integer',
    'int16_t': 'integer',
    'int32_t': 'integer',
    'int64_t': 'integer',
    'uint8_t': 'integer',
    'uint16_t': 'integer',
    'uint32_t': 'integer',
    'uint64_t': 'integer',
    'Uid': 'integer',
    'size_t': 'integer',
    'long': 'integer',
    'unsigned': 'integer',
    'double': 'number',
    'float': 'number',
    'std::string': 'string',
    'sol::table': 'table',
    'sol::object': 'any',
    'sol::protected_function': 'fun()',
    'sol::function': 'fun()',
}

# 这些参数是 sol2 的隐藏参数, 不进入 Lua 参数表
SKIP_PARAM_TYPES = (
    'sol::this_state',
    'lua_State',
)

# 这些名字是 Lua 常用全局, 作为参数名会遮蔽全局, 生成的声明里统一改成 argN
LUA_GLOBAL_NAMES = {
    'assert', 'error', 'ipairs', 'next', 'pairs', 'print', 'require', 'select',
    'string', 'table', 'math', 'io', 'os', 'type', 'tonumber', 'tostring', 'self',
}


def mask_cpp_code(text):
    """把注释和字符串内容替换成空格, 保留长度和换行, 便于在原文上定位"""
    chars = list(text)
    index = 0
    length = len(text)
    while index < length:
        if text.startswith('//', index):
            while index < length and text[index] != '\n':
                chars[index] = ' '
                index += 1
        elif text.startswith('/*', index):
            end = text.find('*/', index + 2)
            end = length if end < 0 else end + 2
            for pos in range(index, end):
                if chars[pos] != '\n':
                    chars[pos] = ' '
            index = end
        elif text[index] == '"':
            chars[index] = ' '
            index += 1
            while index < length and text[index] != '"':
                if text[index] == '\\':
                    chars[index] = ' '
                    index += 1
                    if index < length:
                        chars[index] = ' '
                        index += 1
                    continue
                if chars[index] != '\n':
                    chars[index] = ' '
                index += 1
            if index < length:
                chars[index] = ' '
                index += 1
        elif text[index] == "'" and (index == 0 or not (text[index - 1].isalnum() or text[index - 1] == '_')):
            # 字符字面量, 例如 '"' 'a' '\n', 里面的引号不参与字符串配对
            # 数字分隔符 1'000 的前一个字符是数字, 不走这里
            chars[index] = ' '
            index += 1
            while index < length and text[index] != "'":
                if text[index] == '\\':
                    chars[index] = ' '
                    index += 1
                    if index < length:
                        chars[index] = ' '
                        index += 1
                    continue
                if chars[index] != '\n':
                    chars[index] = ' '
                index += 1
            if index < length:
                chars[index] = ' '
                index += 1
        else:
            index += 1
    return ''.join(chars)


def split_top_level(text, delimiter=','):
    """按顶层分隔符切分, 忽略 <> () [] {} 内部的分隔符"""
    parts = []
    depth = 0
    current = []
    for char in text:
        if char in '<([{':
            depth += 1
        elif char in '>)]}':
            depth -= 1
        if char == delimiter and depth == 0:
            parts.append(''.join(current))
            current = []
            continue
        current.append(char)
    parts.append(''.join(current))
    return parts


def normalize_type(type_text):
    """去掉 const 和引用/指针符号"""
    result = type_text.replace('const', ' ')
    result = result.replace('&', ' ')
    result = result.replace('*', ' ')
    return ' '.join(result.split())


def map_cpp_type(type_text):
    """把 C++ 类型映射成 Lua 类型"""
    clean = normalize_type(type_text)
    optional = clean.startswith('sol::optional<') and clean.endswith('>')
    if optional:
        clean = normalize_type(clean[len('sol::optional<'):-1])
    lua_type = SIMPLE_TYPE_MAP.get(clean, 'any')
    if optional:
        lua_type = lua_type + '?'
    return lua_type


def split_param(segment):
    """拆出参数名和类型文本, 取不到名字时整段当类型"""
    match = re.search(r'([A-Za-z_]\w*)\s*$', segment)
    if match:
        type_text = segment[:match.start()]
        if type_text.strip() and not type_text.strip().endswith('::'):
            return match.group(1), type_text
    return '', segment


def parse_params(param_text):
    """解析 lambda 的参数列表"""
    params = []
    for segment in split_top_level(param_text):
        segment = segment.strip()
        if not segment:
            continue
        if any(segment.startswith(skip) or skip in segment for skip in SKIP_PARAM_TYPES):
            continue
        if 'sol::variadic_args' in segment:
            params.append(('...', '...'))
            continue
        name, type_text = split_param(segment)
        if not name or name in LUA_GLOBAL_NAMES:
            name = 'arg%d' % (len(params) + 1)
        params.append((name, map_cpp_type(type_text)))
    return params


def has_meta_header(content):
    """判断声明文件是否带 ---@meta"""
    return content.lstrip('\ufeff \t\r\n').startswith('---@meta')


def ensure_meta_header(content):
    """声明文件必须带 ---@meta, 否则空函数体会被报 missing-return"""
    if has_meta_header(content):
        return content
    return '---@meta\n\n' + content.lstrip('\n')


def parse_returns(return_text):
    """解析 -> 后面的返回类型"""
    clean = normalize_type(return_text)
    if not clean or clean == 'void':
        return []
    if clean.startswith('std::tuple<') and clean.endswith('>'):
        return [map_cpp_type(item) for item in split_top_level(clean[len('std::tuple<'):-1])]
    return [map_cpp_type(clean)]


def find_matching_paren(text, open_index):
    """找到与 open_index 处左括号匹配的右括号下标"""
    depth = 0
    for pos in range(open_index, len(text)):
        if text[pos] == '(':
            depth += 1
        elif text[pos] == ')':
            depth -= 1
            if depth == 0:
                return pos
    return -1


def parse_registrations(source_text):
    """解析文件里所有 set_function("名字", ...) 的注册信息"""
    masked = mask_cpp_code(source_text)
    result = []
    for match in re.finditer(r'\bset_function\s*\(', masked):
        name_start = match.end()
        name_match = re.match(r'\s*"([^"]+)"', source_text[name_start:])
        if not name_match:
            continue
        name = name_match.group(1)
        cursor = name_start + name_match.end()

        # 跳过逗号, 匹配 lambda 的捕获列表和参数表
        lambda_match = re.match(r'\s*,\s*(?:\[[^\]]*\]\s*)?\(', masked[cursor:])
        if not lambda_match:
            result.append((name, [('...', '...')], []))
            continue

        open_index = cursor + lambda_match.end() - 1
        close_index = find_matching_paren(masked, open_index)
        if close_index < 0:
            result.append((name, [('...', '...')], []))
            continue

        params = parse_params(source_text[open_index + 1:close_index])

        # 返回类型: 参数表之后到函数体左大括号之间
        tail = masked[close_index + 1:]
        return_match = re.match(r'\s*->\s*([^{]+?)\s*\{', tail)
        returns = parse_returns(return_match.group(1)) if return_match else []
        result.append((name, params, returns))
    return result


def collect_registrations():
    """扫描表单里的全部绑定代码, 保持源码顺序并去重"""
    seen = set()
    collected = []
    for scan_dir in SCAN_DIRS:
        abs_dir = os.path.join(SCRIPT_DIR, scan_dir)
        for root, dirs, files in os.walk(abs_dir):
            dirs[:] = [name for name in dirs if name not in EXCLUDE_DIR_NAMES]
            for file_name in sorted(files):
                if not file_name.endswith(('.cpp', '.cc')):
                    continue
                path = os.path.join(root, file_name)
                with io.open(path, encoding='utf-8', errors='ignore') as handle:
                    content = handle.read()
                parsed = parse_registrations(content)
                masked_count = mask_cpp_code(content).count('set_function')
                if masked_count != len(parsed):
                    print('警告: %s 里 set_function 有 %d 处, 只解析出 %d 处'
                          % (path, masked_count, len(parsed)))
                for name, params, returns in parsed:
                    if name in seen:
                        continue
                    seen.add(name)
                    collected.append((name, params, returns))
    return collected


def declared_names(text):
    """收集手写区块里已经声明的函数名"""
    return set(re.findall(r'^function\s+([A-Za-z_]\w*)\s*\(', text, re.MULTILINE))


def make_declaration(name, params, returns):
    """生成单个函数的声明文本"""
    lines = []
    for param_name, param_type in params:
        if param_type == '...':
            lines.append('---@param ... any')
        else:
            lines.append('---@param %s %s' % (param_name, param_type))
    for return_type in returns:
        lines.append('---@return %s' % return_type)
    arguments = ', '.join('...' if param_type == '...' else param_name
                          for param_name, param_type in params)
    lines.append('function %s(%s) end' % (name, arguments))
    return '\n'.join(lines)


def build_auto_block(registrations, manual_names):
    """生成自动区块内容, 跳过已经手写的函数"""
    blocks = []
    for name, params, returns in registrations:
        if name in manual_names:
            continue
        blocks.append(make_declaration(name, params, returns))
    return '\n\n'.join(blocks)


def split_define_file(text):
    """拆出 手写部分 / 自动区块 / 结尾部分"""
    begin_index = text.find(AUTO_BEGIN)
    if begin_index < 0:
        body = text.rstrip('\n')
        return body + '\n\n', '', ''
    end_index = text.find(AUTO_END, begin_index)
    if end_index < 0:
        body = text[:begin_index].rstrip('\n')
        return body + '\n\n', '', ''
    manual_part = text[:begin_index]
    auto_part = text[begin_index + len(AUTO_BEGIN):end_index]
    tail_part = text[end_index + len(AUTO_END):]
    return manual_part, auto_part, tail_part


def ensure_define_file(define_file):
    """目录或声明文件不存在时自动创建"""
    folder = os.path.dirname(define_file)
    if folder and not os.path.isdir(folder):
        os.makedirs(folder)
    if os.path.exists(define_file):
        return
    with io.open(define_file, 'w', encoding='utf-8', newline='\n') as handle:
        handle.write('---@meta\n')
    print('已创建声明文件: %s' % define_file)


def warn_other_lua_files(define_file):
    """同目录下其他 ---@meta 声明文件会被一起加载, 可能重复声明全局"""
    folder = os.path.dirname(define_file)
    if not folder or not os.path.isdir(folder):
        return
    base_name = os.path.basename(define_file)
    others = []
    for name in sorted(os.listdir(folder)):
        if not name.endswith('.lua') or name == base_name:
            continue
        path = os.path.join(folder, name)
        try:
            with io.open(path, encoding='utf-8', errors='ignore') as handle:
                if has_meta_header(handle.read()):
                    others.append(name)
        except OSError:
            continue
    if not others:
        return
    print('警告: %s 下还有其他 ---@meta 声明文件, 会重复声明全局:' % folder)
    for name in others:
        print('  ' + name)


def main():
    """脚本入口"""
    parser = argparse.ArgumentParser(description='生成 Lua 全局函数声明')
    parser.add_argument('--check', action='store_true', help='只检查是否有缺失, 不写文件')
    parser.add_argument('--file', default=DEFAULT_DEFINE_FILE, help='声明文件路径')
    args = parser.parse_args()

    if args.check and not os.path.exists(args.file):
        print('声明文件不存在: %s' % args.file)
        return 1

    ensure_define_file(args.file)
    warn_other_lua_files(args.file)

    with io.open(args.file, encoding='utf-8') as handle:
        content = handle.read()

    manual_part, auto_part, tail_part = split_define_file(content)
    manual_names = declared_names(manual_part)
    registrations = collect_registrations()
    auto_block = build_auto_block(registrations, manual_names)

    missing = [name for name, _, _ in registrations if name not in manual_names]
    if args.check:
        meta_ok = has_meta_header(content)
        block_ok = auto_block.strip() == auto_part.strip()
        if meta_ok and block_ok:
            print('声明文件已是最新')
            return 0
        print('声明文件需要更新')
        if not meta_ok:
            print('  (缺少 ---@meta 文件头)')
        if not block_ok:
            print('  缺失的函数:')
            for name in missing:
                print('    ' + name)
        return 1

    new_content = manual_part + AUTO_BEGIN + '\n'
    if auto_block:
        new_content += '\n' + auto_block + '\n\n'
    new_content += AUTO_END + tail_part
    new_content = ensure_meta_header(new_content.rstrip('\n') + '\n')

    if new_content != content:
        with io.open(args.file, 'w', encoding='utf-8', newline='\n') as handle:
            handle.write(new_content)
        print('已更新: %s' % args.file)
        print('自动补充的函数: %d 个' % len(missing))
    else:
        print('无需更新: %s' % args.file)
    return 0


if __name__ == '__main__':
    sys.exit(main())
