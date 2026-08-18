# -*- coding: utf-8 -*-
import os
import json
import datetime
import subprocess
from typing import Optional
from langchain_core.tools import tool

# ===== 日期时间工具 =====
_WEEKDAY_CN = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]


@tool
def get_current_time(format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    获取当前日期和时间的完整信息。

    可选参数 format_str 指定输出格式, 默认为 'YYYY-MM-DD HH:MM:SS'。
    不传参数时返回完整时间信息。
    """
    now = datetime.datetime.now()
    if format_str != "%Y-%m-%d %H:%M:%S":
        try:
            return now.strftime(format_str)
        except Exception as e:
            return f"时间格式错误: {str(e)}"

    # 完整时间信息
    year = now.year
    month = now.month
    day = now.day
    weekday = _WEEKDAY_CN[now.weekday()]
    hour = now.hour
    minute = now.minute
    second = now.second
    microsecond = now.microsecond

    # 一年中的第几天
    day_of_year = now.timetuple().tm_yday

    # 一年中的第几周 (ISO)
    week_of_year = now.isocalendar()[1]

    # 季度
    quarter = (month - 1) // 3 + 1

    # 是否为闰年
    is_leap = (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)

    # 月份天数
    days_in_month = [
        31, 29 if is_leap else 28, 31, 30, 31, 30,
        31, 31, 30, 31, 30, 31,
    ][month - 1]

    # 当年剩余天数
    days_left = (366 if is_leap else 365) - day_of_year

    # 今日已过百分比
    day_progress = (hour * 3600 + minute * 60 + second) / 86400 * 100

    # 当年已过百分比
    year_progress = day_of_year / (366 if is_leap else 365) * 100

    # 时区
    tz = datetime.datetime.now(datetime.timezone.utc).astimezone().tzinfo

    # 时辰 (中国传统)
    period_cn = _get_period_cn(hour)

    lines = [
        f"当前时间: {year}年{month}月{day}日 {weekday} {hour:02d}:{minute:02d}:{second:02d}",
        f"农历时辰: {period_cn}",
        f"",
        f"【日历信息】",
        f"  年/月/日: {year}-{month:02d}-{day:02d}",
        f"  星期: {weekday}",
        f"  季度: 第{quarter}季度",
        f"  一年第{day_of_year}天 / 第{week_of_year}周",
        f"  本月共{days_in_month}天, 当年剩余{days_left}天",
        f"  闰年: {'是' if is_leap else '否'}",
        f"",
        f"【进度】",
        f"  今日进度: {day_progress:.1f}%",
        f"  本年进度: {year_progress:.1f}%",
        f"",
        f"【时间戳】",
        f"  Unix时间戳: {int(now.timestamp())}",
        f"  毫秒级: {int(now.timestamp() * 1000)}",
        f"  微秒: {microsecond}",
        f"  时区: {tz}",
        f"  ISO格式: {now.isoformat()}",
    ]

    return "\n".join(lines)


def _get_period_cn(hour: int) -> str:
    """获取中国传统时辰"""
    periods = [
        (23, "子时"), (1, "丑时"), (3, "寅时"), (5, "卯时"),
        (7, "辰时"), (9, "巳时"), (11, "午时"), (13, "未时"),
        (15, "申时"), (17, "酉时"), (19, "戌时"), (21, "亥时"),
    ]
    for start, name in periods:
        if start <= hour < start + 2:
            return name
    return "子时"  # 23-0点


# ===== 文件搜索工具（只读、安全） =====
@tool
def search_files(
    keyword: str,
    directory: str = ".",
    file_extension: str = "",
    max_results: int = 10,
) -> str:
    """
    在指定目录下搜索包含关键字的文件名。
    参数:
      - keyword: 搜索关键字
      - directory: 搜索目录路径，默认为当前目录
      - file_extension: 文件扩展名过滤（如 '.py', '.txt'），可选
      - max_results: 最大返回结果数，默认 10
    """
    import glob
    try:
        # 安全检查：限制搜索深度和路径
        abs_dir = os.path.abspath(directory)
        if not os.path.isdir(abs_dir):
            return f"目录不存在: {directory}"

        pattern = f"**/*{keyword}*"
        if file_extension:
            pattern += file_extension
        pattern = os.path.join(abs_dir, pattern)

        matches = []
        for filepath in glob.iglob(pattern, recursive=True):
            if len(matches) >= max_results:
                break
            if os.path.isfile(filepath):
                rel_path = os.path.relpath(filepath, abs_dir)
                size = os.path.getsize(filepath)
                matches.append(f"{rel_path} ({_format_size(size)})")

        if not matches:
            return f"在 {directory} 中未找到匹配 '{keyword}' 的文件"
        return "找到以下文件:\n" + "\n".join(matches)

    except Exception as e:
        return f"搜索出错: {str(e)}"


def _format_size(size_bytes: int) -> str:
    """格式化文件大小"""
    for unit in ["B", "KB", "MB", "GB"]:
        if size_bytes < 1024:
            return f"{size_bytes:.1f}{unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f}TB"


# ===== 注册所有内置工具 =====
def register_builtin_tools(registry) -> None:
    """向工具注册中心注册所有内置工具"""
    registry.register(get_current_time, tag="datetime")
    registry.register(search_files, tag="file")