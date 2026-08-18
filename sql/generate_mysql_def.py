#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MySQL 表定义头文件生成器
从MySQL数据库读取表结构，生成 C++ 头文件 mysqltabledef.hpp

用法:
    python generate_mysql_def.py
"""

import os
import sys
import time
import json

try:
    import pymysql
except ImportError:
    print("请安装 pymysql: pip install pymysql")
    sys.exit(1)


# ========== 配置路径 ==========

# 配置文件路径 (相对于脚本所在目录)
CONFIG_REL_PATH = "../config/config.json"

# 输出头文件路径 (相对于脚本所在目录)
OUTPUT_REL_PATH = "../dbserver/db/mysqltabledef.hpp"

# 头文件中的命名空间
NAMESPACE_NAME = "tbdef"

# 数据库版本标识 (用于生成注释)
DB_VERSION = "3.7.2.3"

# ================================

# 脚本所在目录
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# 结果日志收集 (在脚本末尾统一打印)
_RESULT_LOG = []

def _log(msg):
    _RESULT_LOG.append(msg)


def read_db_config():
    """从 config.json 中读取 MySQL 连接信息"""
    config_path = os.path.normpath(os.path.join(_SCRIPT_DIR, CONFIG_REL_PATH))
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"配置文件不存在: {config_path}")

    with open(config_path, "r", encoding="utf-8") as f:
        cfg = json.load(f)

    dbserver = cfg.get("dbserver")
    if dbserver is None:
        raise ValueError("配置文件中未找到 dbserver 节点")

    counter = dbserver.get("Counter")
    if counter is None:
        raise ValueError("配置文件中未找到 dbserver.Counter 节点")

    host = counter.get("AddrIP", "127.0.0.1").strip()
    # 如果 AddrIP 没有 tcp:// 前缀则加上
    if not host.startswith("tcp://"):
        host = "tcp://" + host

    return {
        "host": host,
        "port": 3306,
        "user": counter.get("UserName", "root").strip(),
        "password": counter.get("Password", "123456").strip(),
        "database": counter.get("DBName", "mydb").strip(),
        "db_version": DB_VERSION,
    }


def sql_type_to_cpp_type(sql_type):
    """SQL类型映射到C++类型"""
    t = sql_type.lower()
    if "int" in t:
        if "bigint" in t:
            return "int64_t"
        if "tinyint" in t:
            return "int32_t"
        return "int32_t"
    if "char" in t or "text" in t:
        return "std::string"
    if "float" in t or "double" in t:
        return "double"
    if "decimal" in t:
        return "double"
    return "std::string"


def get_cpp_type_init(sql_type):
    """获取C++类型的默认初始化值"""
    cpp_type = sql_type_to_cpp_type(sql_type)
    if cpp_type in ("int32_t", "int64_t", "long long", "double", "float"):
        return " = 0"
    return ""


def to_camel_case(input_str, capitalize_first=True):
    """下划线命名转驼峰命名"""
    result = []
    capitalize_next = capitalize_first
    for c in input_str:
        if c == '_':
            capitalize_next = True
        else:
            if capitalize_next:
                result.append(c.upper())
                capitalize_next = False
            else:
                result.append(c)
    return "".join(result)


def get_all_tables_and_fields(config):
    """读取所有表和字段信息"""
    table_fields = {}

    # 去掉 tcp:// 前缀用于 pymysql 连接
    host_raw = config["host"]
    if host_raw.startswith("tcp://"):
        host_raw = host_raw[6:]

    conn = pymysql.connect(
        host=host_raw,
        port=config["port"],
        user=config["user"],
        password=config["password"],
        database=config["database"],
        charset="utf8mb4"
    )

    try:
        with conn.cursor() as cursor:
            # 获取所有表名
            cursor.execute("SHOW TABLES")
            tables = [row[0] for row in cursor.fetchall()]

            # 获取每个表的字段详细信息
            for table in tables:
                fields = []
                cursor.execute(f"SHOW FULL COLUMNS FROM `{table}`")
                col_rows = cursor.fetchall()
                # SHOW FULL COLUMNS 返回:
                # Field, Type, Collation, Null, Key, Default, Extra, Privileges, Comment
                for row in col_rows:
                    field_info = {
                        "name": row[0],
                        "type": row[1],
                        "is_nullable": row[3],
                        "key": row[4],
                        "default_value": row[5] if row[5] is not None else "",
                        "extra": row[6],
                        "comment": row[8] if len(row) > 8 else "",
                    }
                    fields.append(field_info)
                table_fields[table] = fields
    finally:
        conn.close()

    return table_fields


def get_current_time_string():
    """获取当前时间字符串"""
    return time.strftime("%Y-%m-%d %H:%M:%S")


def generate_mysql_header(filename, table_fields, config):
    """生成C++头文件"""
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    ns = NAMESPACE_NAME

    with open(filename, "w", encoding="utf-8") as f:
        f.write("// mysqltabledef.hpp\n")
        f.write("// 自动生成，请勿手动修改！\n")
        f.write(f"// 生成时间: {get_current_time_string()}\n")
        f.write(f"// 数据库: {config['database']}  版本: {config['db_version']}\n\n\n")
        f.write("#ifndef __MYSQL_TABLE_DEF_HPP__\n")
        f.write("#define __MYSQL_TABLE_DEF_HPP__\n\n")

        f.write("#ifdef _WIN32\n")
        f.write("#pragma warning(push, 0)\n")
        f.write("#endif\n\n")

        f.write("#include \"share/share.hpp\" \n")
        f.write("#include <string>\n")
        f.write("#include <tuple>\n")
        f.write("#include <map>\n\n")
        f.write("// 表结构体定义\n")
        f.write(f"namespace {ns}\n")
        f.write("{\n")

        # 字段处理宏定义
        f.write("// 字段处理宏定义\n")
        f.write("#define PROCESS_INT_FIELD(field_name) \\\n")
        f.write("\tif(!res || res->isNull(#field_name)){ \\\n")
        f.write("\t\tis_succeed = false; \\\n")
        f.write("\t\tLOG_ERROR(\"Warning: Column:%s not found in result set, using default value\",#field_name ); \\\n")
        f.write("    } else field_name = res->getInt(#field_name); \\\n\n")

        f.write("#define PROCESS_DOUBLE_FIELD(field_name) \\\n")
        f.write("\tif(!res || res->isNull(#field_name)){ \\\n")
        f.write("\t\tis_succeed = false; \\\n")
        f.write("\t\tLOG_ERROR(\"Warning: Column:%s not found in result set, using default value\",#field_name ); \\\n")
        f.write("    } else field_name = res->getDouble(#field_name); \\\n\n")

        f.write("#define PROCESS_STRING_FIELD(field_name) \\\n")
        f.write("\tif(!res || res->isNull(#field_name)){ \\\n")
        f.write("\t\tis_succeed = false; \\\n")
        f.write("\t\tLOG_ERROR(\"Warning: Column:%s not found in result set, using default value\",#field_name ); \\\n")
        f.write("    } else field_name = res->getString(#field_name); \\\n\n")

        # 遍历每个表生成结构体
        for table, fields in table_fields.items():
            table_upper = table.upper()

            f.write(f"// {table}字段常量名 表结构体\n")

            # 字段名常量
            f.write(f"inline const std::string {table_upper}_TABLE_NAME = \"{table}\";\n")
            for field in fields:
                field_upper = f"{table_upper}_{field['name'].upper()}"
                f.write(f"inline const std::string {field_upper} = \"{field['name']}\";\n")

            # 结构体
            struct_name = to_camel_case(table)
            f.write(f"struct {struct_name}\n")
            f.write("{\n")

            # 计算列宽用于格式化注释
            max_type_len = max(len(field['type']) for field in fields) if fields else 0
            max_nullable_len = max(len(field['is_nullable']) for field in fields) if fields else 0

            # 为每个字段生成注释和定义
            for field in fields:
                # 构建注释 (与C++的ostringstream + setw逻辑一致)
                comment_parts = []
                comment_parts.append(
                    f"类型: {field['type'].ljust(max_type_len)} | "
                    f"可空: {field['is_nullable'].ljust(max_nullable_len)}"
                )

                if field['key']:
                    comment_parts.append(f"索引: {field['key']}")
                if field['default_value']:
                    comment_parts.append(f"默认值: {field['default_value']}")
                if field['extra']:
                    comment_parts.append(f"额外: {field['extra']}")
                if field['comment']:
                    comment_parts.append(f"注释: {field['comment']}")

                f.write(f"    // {' | '.join(comment_parts)}\n")
                cpp_type = sql_type_to_cpp_type(field['type'])
                init_val = get_cpp_type_init(field['type'])
                f.write(f"    {cpp_type} {field['name']}{init_val};\n")

            # ToMap 成员函数
            f.write("    std::map<std::string, QueryBuilder::ParamType> ToMap() const\n")
            f.write("    {\n")
            f.write("        std::map<std::string, QueryBuilder::ParamType> m;\n")
            for field in fields:
                field_upper = f"{table_upper}_{field['name'].upper()}"
                f.write(f"        m[{field_upper}] = {field['name']};\n")
            f.write("        return m;\n")
            f.write("    }\n")

            # FromResultSet 成员函数
            f.write("    bool FromResultSet(SafeResultSet* res)\n")
            f.write("    {\n")
            f.write("\t\tbool is_succeed = true;\n")
            for field in fields:
                cpp_type = sql_type_to_cpp_type(field['type'])
                if cpp_type in ("int32_t", "int64_t"):
                    f.write(f"        PROCESS_INT_FIELD({field['name']})\n")
                elif cpp_type == "double":
                    f.write(f"        PROCESS_DOUBLE_FIELD({field['name']})\n")
                else:
                    f.write(f"        PROCESS_STRING_FIELD({field['name']})\n")
            f.write("\t\treturn is_succeed;\n")
            f.write("    }\n\n")

            f.write("};\n\n")

        f.write(f"}} // namespace {ns}\n\n")
        f.write("#ifdef _WIN32  \n")
        f.write("#pragma warning(pop) \n")
        f.write("#endif\n\n")
        f.write("#endif // __MYSQL_TABLE_DEF_HPP__\n")

    _log(f"  [生成] 头文件成功: {filename}")


def main():
    has_error = False

    # 读取配置
    try:
        db_config = read_db_config()
    except Exception as e:
        _log(f"  [错误] 读取配置失败: {e}")
        has_error = True

    if not has_error:
        print(f"数据库: {db_config['database']} @ {db_config['host']}")

        # 获取表字段信息
        try:
            table_fields = get_all_tables_and_fields(db_config)
        except Exception as e:
            _log(f"  [错误] 获取表字段信息失败: {e}")
            has_error = True

    if not has_error:
        if not table_fields:
            _log("  [错误] 获取表字段信息为空，跳过生成头文件，保留旧文件")
            has_error = True

    if not has_error:
        # 生成头文件
        output_path = os.path.normpath(os.path.join(_SCRIPT_DIR, OUTPUT_REL_PATH))
        generate_mysql_header(output_path, table_fields, db_config)

        # 输出预览
        for table, fields in table_fields.items():
            _log(f"  Table: {table}")
            for field in fields:
                _log(f"    Field: {field['name']} ({field['type']})")

    _print_final_report(not has_error)


def _print_final_report(success):
    """打印最终执行报告 (包含所有收集的结果)"""
    print()
    print("============= 执行结果汇总 =============")
    if success:
        print("  状态: 成功")
    else:
        print("  状态: 失败")
    print()
    if _RESULT_LOG:
        for msg in _RESULT_LOG:
            print(msg)
    print("=========================================")


def wait_and_exit():
    """等待关闭窗口 (Ctrl+C)"""
    print()
    print("=" * 70)
    print("  脚本执行完毕, 按 Ctrl+C 关闭窗口...")
    print("=" * 70)
    try:
        # 阻塞等待输入, Ctrl+C 退出
        input()
    except (KeyboardInterrupt, EOFError):
        pass


if __name__ == "__main__":
    main()
    wait_and_exit()
