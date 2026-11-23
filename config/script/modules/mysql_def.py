#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MySQL 表定义头文件生成器
从 MySQL 数据库读取表结构, 生成 C++ 头文件 mysqltabledef.hpp
"""

import json
import os
import time

from ..core.errors import ModuleError
from ..core.menu import Module, Option

try:
    import pymysql
except ImportError:
    pymysql = None


# 运行时由 RunGeneration 注入
SOURCE_CONFIG = ""
COUNTER_PATH = "dbserver.Counter"
PORT = 3306
CHARACTER_SET = "utf8mb4"
NAMESPACE_NAME = "tbdef"
DB_VERSION = ""

# 结果日志收集 (在脚本末尾统一打印)
_RESULT_LOG = []


def _log(msg):
    _RESULT_LOG.append(msg)


def read_db_config(database):
    """从 baseconfig 中读取 MySQL 连接信息"""
    if not os.path.isfile(SOURCE_CONFIG):
        raise ModuleError("配置文件不存在: %s" % SOURCE_CONFIG)

    with open(SOURCE_CONFIG, "r", encoding="utf-8-sig") as f:
        cfg = json.load(f)

    counter = cfg
    for part in COUNTER_PATH.split("."):
        if not isinstance(counter, dict) or part not in counter:
            raise ModuleError("配置文件中未找到 %s 节点: %s" % (COUNTER_PATH, SOURCE_CONFIG))
        counter = counter[part]
    if not isinstance(counter, dict):
        raise ModuleError("%s 必须是对象: %s" % (COUNTER_PATH, SOURCE_CONFIG))

    for key in ("AddrIP", "UserName", "Password"):
        if not isinstance(counter.get(key), str) or not counter.get(key):
            raise ModuleError("配置缺少 %s.%s: %s" % (COUNTER_PATH, key, SOURCE_CONFIG))

    host = counter["AddrIP"].strip()
    # pymysql 需要纯主机名, 去掉协议前缀
    if host.startswith("tcp://"):
        host = host[6:]

    return {
        "host": host,
        "port": PORT,
        "user": counter["UserName"].strip(),
        "password": counter["Password"].strip(),
        "database": database,
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
        charset=CHARACTER_SET,
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


class MysqlDefModule(Module):
    """从数据库生成 C++ 表定义头文件"""

    ID = "mysql_def"
    TITLE = "生成数据库表定义"
    DESCRIPTION = "读取 MySQL 表结构, 生成 dbserver/db/mysqltabledef.hpp"

    OPTIONS = (
        Option("database", "目标数据库名", "string",
               default_from="mysql_def.database"),
        Option("output_header", "输出头文件 (相对仓库根或绝对路径)", "string",
               default_from="mysql_def.output_header"),
    )

    def Run(self, context, options):
        output_path = options["output_header"]
        if not os.path.isabs(output_path):
            output_path = os.path.join(context.project_root, output_path)
        return RunGeneration(
            context.settings,
            str(options["database"]),
            os.path.normpath(output_path),
        )


def RunGeneration(settings, database, output_path):
    """执行表结构读取与头文件生成"""
    global SOURCE_CONFIG, COUNTER_PATH, PORT, CHARACTER_SET, NAMESPACE_NAME, DB_VERSION

    if pymysql is None:
        raise ModuleError("缺少 pymysql, 请执行: pip install pymysql")

    SOURCE_CONFIG = settings.Path("mysql_def.source_config", must_exist=True)
    COUNTER_PATH = str(settings.Require("mysql_def.counter_path"))
    PORT = int(settings.Require("mysql_def.port"))
    CHARACTER_SET = str(settings.Require("mysql_def.character_set"))
    NAMESPACE_NAME = str(settings.Require("mysql_def.namespace"))
    DB_VERSION = str(settings.Require("mysql_def.db_version"))
    _RESULT_LOG.clear()

    db_config = read_db_config(database)
    print("数据库: %s @ %s" % (db_config["database"], db_config["host"]))
    table_fields = get_all_tables_and_fields(db_config)
    if not table_fields:
        raise ModuleError("获取表字段信息为空, 跳过生成头文件, 保留旧文件")

    generate_mysql_header(output_path, table_fields, db_config)

    for table, fields in table_fields.items():
        _log("  Table: %s" % table)
        for field in fields:
            _log("    Field: %s (%s)" % (field["name"], field["type"]))

    _print_final_report(True)
    return 0


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


