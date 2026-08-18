# -*- coding: utf-8 -*-
"""
网络搜索技能

使用 Bing 搜索获取实时信息 (国内网络环境兼容)。
展示 ToolSkill 如何同时提供工具 + 指令。
"""
import re
import urllib.request
import urllib.parse
from typing import Optional, List, Dict, Any
from langchain_core.tools import tool

from ..base import ToolSkill


@tool
def web_search(query: str, max_results: int = 5) -> str:
    """
    执行网络搜索并返回结果摘要

    参数:
        query: 搜索关键词
        max_results: 最大返回结果数(1-10)

    返回搜索结果的标题、链接和摘要列表。
    """
    try:
        url = f"https://www.bing.com/search?q={urllib.parse.quote(query)}&count={max_results}"
        req = urllib.request.Request(url, headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "zh-CN,zh;q=0.9",
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="ignore")

        # 提取搜索结果区域
        start = html.find('<ol id="b_results"')
        if start == -1:
            return "未找到相关结果"
        end = html.find('</ol>', start)
        results_html = html[start:end + 5]

        # 解析每个 b_algo 结果
        items = re.findall(
            r'<li class="b_algo[^"]*".*?<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>',
            results_html,
            re.DOTALL,
        )

        if not items:
            return "未找到相关结果"

        # 提取摘要
        snippets = re.findall(
            r'<p[^>]*class="b_lineclamp[^"]*"[^>]*>(.*?)</p>',
            results_html,
            re.DOTALL,
        )
        snippet_list = []
        for s in snippets:
            text = re.sub(r'<[^>]+>', '', s)
            # 清理 HTML 实体
            text = text.replace('&ensp;', ' ').replace('&emsp;', '  ')
            text = re.sub(r'&#(\d+);', lambda m: chr(int(m.group(1))), text)
            text = text.replace('&nbsp;', ' ').replace('&amp;', '&')
            text = text.replace('&lt;', '<').replace('&gt;', '>')
            text = text.replace('&quot;', '"').replace('&#x27;', "'")
            snippet_list.append(text.strip())

        output_lines = [f"找到 {len(items)} 条结果:"]
        for i, (href, title) in enumerate(items[:max_results], 1):
            clean_title = re.sub(r'<[^>]+>', '', title).strip()
            output_lines.append(f"\n{i}. {clean_title}")
            output_lines.append(f"   链接: {href.strip()}")
            if i - 1 < len(snippet_list) and snippet_list[i - 1]:
                output_lines.append(f"   摘要: {snippet_list[i - 1][:200]}")

        return "\n".join(output_lines)

    except Exception as e:
        return f"搜索时出错: {str(e)}"


class WebSearchSkill(ToolSkill):
    m_name = "web_search"
    m_description = "网络搜索技能, 让 Agent 能够搜索互联网获取实时信息"
    m_version = "1.0.0"
    m_author = "小鱼"
    m_tags = ["search", "web", "information"]

    m_instructions = """
## 网络搜索技能

当用户需要以下信息时, 应使用 web_search 工具:
1. 实时新闻、事件、最新动态
2. 需要查阅的外部资料、文档
3. 需要验证的事实性信息
4. 当前市场价格、汇率等实时数据

使用规则:
- 先尝试用自己的知识回答, 不确定时再搜索
- 搜索关键词要精简, 提取核心概念
- 多个关键词用空格分隔
- **如果查询的公司/实体名称有歧义(同名不同公司), 加上股票代码或更精确的限定词来区分**
  - 例如: 搜"华胜天成"股价应加上股票代码"600410"
  - 例如: 搜"苹果"应区分是水果还是公司, 公司加"AAPL"或"Apple Inc."
- **对于需要精确匹配的专有名词, 可用引号包裹**, 如"华胜天成"
- 搜索后引用来源
- 如果搜索结果不相关, 换一组关键词重试
"""

    def get_tools(self):
        return [web_search]
