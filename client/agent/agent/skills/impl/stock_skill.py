# -*- coding: utf-8 -*-
"""
股票查询技能

通过腾讯股票 API 获取实时行情数据, 无需 API Key。
"""
import re
import json
import urllib.request
from typing import Optional, List, Dict, Any
from langchain_core.tools import tool

from ..base import ToolSkill

# 腾讯股票 API 字段索引
# 格式: v_marketCode="market~name~code~current~yesterday_close~open~..."
_FIELDS = [
    "market", "name", "code", "price", "yesterday_close", "open",
    "volume", "bid_volume", "ask_volume",
    "bid1_price", "bid1_volume",
    "bid2_price", "bid2_volume",
    "bid3_price", "bid3_volume",
    "bid4_price", "bid4_volume",
    "bid5_price", "bid5_volume",
    "ask1_price", "ask1_volume",
    "ask2_price", "ask2_volume",
    "ask3_price", "ask3_volume",
    "ask4_price", "ask4_volume",
    "ask5_price", "ask5_volume",
    "",  # 预留
    "datetime", "change_amount", "change_percent",
    "high", "low",
    "price_volume_ratio",  # 价格/成交量/成交额
    "volume_raw", "amount_raw",
    "turnover_rate", "",
    "",  # 预留
    "high_52w", "low_52w",
    "amplitude", "market_cap", "float_market_cap",
    "pe_dynamic", "pb",
    "", "", "", "",
    "amount_unit",
]

_MARKET_MAP = {"1": "沪市", "0": "深市", "2": "北交所", "3": "港股"}
_MARKET_PREFIX = {"1": "sh", "0": "sz", "2": "bj", "3": "hk"}


def _parse_stock_code(code: str) -> str:
    """将用户输入的代码标准化为腾讯 API 可识别的格式"""
    code = code.strip().upper()
    # 去掉常见前缀
    for prefix in ["SH", "SZ", "BJ", "SH.", "SZ.", "BJ.", "600", "688"]:
        if code.startswith(prefix) and len(code) > len(prefix):
            pass
    # 已带市场前缀 sh/sz/bj
    if re.match(r"^(sh|sz|bj)\d+$", code, re.IGNORECASE):
        return code.lower()
    # 纯数字 A股
    if re.match(r"^\d{6}$", code):
        # 判断市场: 6xxxxx 上海, 0/3xxxx 深圳, 8/4xxxx 北交所
        if code.startswith(("6", "9")):
            return f"sh{code}"
        elif code.startswith(("0", "3")):
            return f"sz{code}"
        elif code.startswith(("8", "4", "2")):
            return f"bj{code}"
    # 纯数字港股
    if re.match(r"^\d{5}$", code):
        return code  # 腾讯 API 港股直接用数字
    # 美股代码
    if re.match(r"^[A-Z]{1,4}$", code):
        return f"gb_{code}"
    return code


def _parse_tencent_response(text: str) -> Optional[Dict[str, Any]]:
    """解析腾讯 API 返回的文本格式为字典"""
    # 格式: v_marketCode="field1~field2~...~fieldN"
    match = re.search(r'="(.+)"', text)
    if not match:
        return None
    parts = match.group(1).split("~")
    if len(parts) < 4:
        return None

    result = {}
    for i, key in enumerate(_FIELDS):
        if key and i < len(parts):
            result[key] = parts[i]

    # 补充计算字段
    market = result.get("market", "")
    result["market_name"] = _MARKET_MAP.get(market, "")
    result["market_prefix"] = _MARKET_PREFIX.get(market, "")

    price = _safe_float(result.get("price", "0"))
    change_pct = _safe_float(result.get("change_percent", "0"))
    high = _safe_float(result.get("high", "0"))
    low = _safe_float(result.get("low", "0"))
    open_p = _safe_float(result.get("open", "0"))
    yesterday = _safe_float(result.get("yesterday_close", "0"))
    amount = _safe_float(result.get("amount_raw", "0"))
    volume_val = _safe_float(result.get("volume_raw", "0"))
    pe = _safe_float(result.get("pe_dynamic", "0"))
    pb_val = _safe_float(result.get("pb", "0"))
    market_cap_val = _safe_float(result.get("market_cap", "0"))
    float_mcap = _safe_float(result.get("float_market_cap", "0"))
    turnover = _safe_float(result.get("turnover_rate", "0"))
    amp = _safe_float(result.get("amplitude", "0"))
    high_52w = _safe_float(result.get("high_52w", "0"))
    low_52w = _safe_float(result.get("low_52w", "0"))

    result["_price"] = price
    result["_change_pct"] = change_pct
    result["_high"] = high
    result["_low"] = low
    result["_open"] = open_p
    result["_yesterday_close"] = yesterday
    # amount_raw 是成交额(万元), volume_raw 是成交量(手)
    # market_cap/float_market_cap 已经是亿元
    result["_amount_yi"] = round(amount / 10000, 2) if amount else 0
    result["_volume_wan"] = round(volume_val / 10000, 2) if volume_val else 0
    result["_pe"] = pe
    result["_pb"] = pb_val
    result["_market_cap_yi"] = round(market_cap_val, 2) if market_cap_val else 0
    result["_float_mcap_yi"] = round(float_mcap, 2) if float_mcap else 0
    result["_turnover_rate"] = turnover
    result["_amplitude"] = amp
    result["_high_52w"] = high_52w
    result["_low_52w"] = low_52w

    return result


def _safe_float(val) -> float:
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0


def _format_stock_result(data: Dict[str, Any]) -> str:
    """将解析后的股票数据格式化为可读文本"""
    name = data.get("name", "未知")
    code = data.get("code", "")
    market_name = data.get("market_name", "")
    dt = data.get("datetime", "")
    # 格式化日期时间
    if len(dt) >= 14:
        dt = f"{dt[:4]}-{dt[4:6]}-{dt[6:8]} {dt[8:10]}:{dt[10:12]}:{dt[12:14]}"

    price = data.get("_price", 0)
    change = _safe_float(data.get("change_amount", "0"))
    change_pct = data.get("_change_pct", 0)

    lines = [
        f"{name}({code}) {market_name}",
        f"时间: {dt}",
        f"",
        f"最新价: {price:.2f}",
    ]

    # 涨跌
    change_mark = "+" if change > 0 else ("-" if change < 0 else " ")
    lines.append(f"涨跌额: {change_mark}{abs(change):.2f}  ({change_pct:+.2f}%)")

    today_high = data.get("_high", 0)
    today_low = data.get("_low", 0)
    today_open = data.get("_open", 0)
    yesterday = data.get("_yesterday_close", 0)
    lines.append(
        f"今开: {today_open:.2f}  |  昨收: {yesterday:.2f}"
    )
    lines.append(
        f"最高: {today_high:.2f}  |  最低: {today_low:.2f}"
    )

    volume = data.get("_volume_wan", 0)
    amount = data.get("_amount_yi", 0)
    turnover = data.get("_turnover_rate", 0)
    amp = data.get("_amplitude", 0)
    lines.append(
        f"成交量: {volume:.2f}万手  |  成交额: {amount:.2f}亿"
    )
    lines.append(
        f"换手率: {turnover:.2f}%  |  振幅: {amp:.2f}%"
    )

    pe = data.get("_pe", 0)
    pb = data.get("_pb", 0)
    mcap = data.get("_market_cap_yi", 0)
    fmcap = data.get("_float_mcap_yi", 0)
    lines.append(
        f"市盈率(动): {pe:.2f}  |  市净率: {pb:.2f}"
    )
    lines.append(
        f"总市值: {mcap:.2f}亿  |  流通市值: {fmcap:.2f}亿"
    )

    high52 = data.get("_high_52w", 0)
    low52 = data.get("_low_52w", 0)
    if high52 or low52:
        lines.append(
            f"52周最高: {high52:.2f}  |  52周最低: {low52:.2f}"
        )

    lines.append(f"\n数据来源: 腾讯财经")
    return "\n".join(lines)


@tool
def stock_quote(code: str) -> str:
    """
    查询A股/港股/美股实时行情

    参数:
        code: 股票代码
            A股: 600410 或 sh600410 或 sz000001
            港股: 00700
            美股: AAPL

    返回实时行情数据, 包括最新价、涨跌幅、成交量、换手率、市盈率等。
    """
    try:
        api_code = _parse_stock_code(code)
        if not api_code:
            return f"无法识别的股票代码: {code}"

        url = f"https://qt.gtimg.cn/q={api_code}"
        req = urllib.request.Request(url, headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            text = resp.read().decode("gbk", errors="ignore")

        data = _parse_tencent_response(text)
        if not data:
            return f"未找到股票 {code} 的数据, 请检查代码是否正确"

        return _format_stock_result(data)

    except Exception as e:
        return f"查询股票时出错: {str(e)}"


# ===== 历史行情 =====

_KLT_MAP_TX = {
    "日K": "day", "日": "day", "daily": "day",
    "周K": "week", "周": "week", "weekly": "week",
    "月K": "month", "月": "month", "monthly": "month",
}

_FQT_MAP_TX = {
    "前复权": "qfq", "前": "qfq",
    "后复权": "hfq", "后": "hfq",
    "不复权": "", "不": "",
}


def _parse_code_for_tencent(code: str) -> Optional[str]:
    """将股票代码转为腾讯API格式 (sh600410)"""
    code = code.strip().upper()
    code_clean = re.sub(r"^(SH|SZ|BJ|SH\.|SZ\.|BJ\.)", "", code)
    if re.match(r"^\d{6}$", code_clean):
        if code_clean.startswith(("6", "9")):
            return f"sh{code_clean}"
        elif code_clean.startswith(("0", "3")):
            return f"sz{code_clean}"
        elif code_clean.startswith(("8", "4", "2")):
            return f"bj{code_clean}"
    if code.startswith("SH"):
        return f"sh{code_clean}"
    elif code.startswith("SZ"):
        return f"sz{code_clean}"
    elif code.startswith("BJ"):
        return f"bj{code_clean}"
    return None


def _format_history_result(
    name: str,
    code: str,
    period: str,
    klines: list,
) -> str:
    """格式化历史K线数据"""
    lines = [
        f"{name}({code}) — {period}历史行情(前复权)",
        f"共 {len(klines)} 条记录",
        "",
    ]

    lines.append(
        f"{'日期':<12} {'开盘':>8} {'收盘':>8} {'最高':>8} {'最低':>8} "
        f"{'成交量(手)':>12} {'涨跌幅':>8}"
    )
    lines.append("-" * 65)

    for k in klines:
        date_str = k[0]
        open_p = _safe_float(k[1])
        close = _safe_float(k[2])
        high = _safe_float(k[3])
        low = _safe_float(k[4])
        vol = _safe_float(k[5])

        # 计算涨跌幅(相比前一条)
        lines.append(
            f"{date_str:<12} {open_p:>8.2f} {close:>8.2f} {high:>8.2f} {low:>8.2f} "
            f"{vol:>12.0f}"
        )

    # 区间统计
    lines.append("")
    closes = [_safe_float(k[2]) for k in klines]
    if len(closes) >= 2:
        first_close = closes[-1]
        last_close = closes[0]
        max_close = max(closes)
        min_close = min(closes)
        total_chg = (last_close - first_close) / first_close * 100
        lines.append(f"区间涨幅: {total_chg:+.2f}%")
        lines.append(f"区间最高: {max_close:.2f}  区间最低: {min_close:.2f}")

    lines.append(f"\n数据来源: 腾讯财经")
    return "\n".join(lines)


@tool
def stock_history(
    code: str,
    period: str = "日K",
    fq_type: str = "前复权",
    count: int = 30,
) -> str:
    """
    查询股票历史K线行情

    参数:
        code: 股票代码, 如 600410 或 sh600410
        period: K线周期, 可选 日K/周K/月K, 默认日K
        fq_type: 复权类型, 可选 前复权/后复权/不复权, 默认前复权
        count: 返回K线条数, 默认30, 最大365

    返回历史K线数据, 包含日期、开盘、收盘、最高、最低、成交量。
    """
    try:
        api_code = _parse_code_for_tencent(code)
        if not api_code:
            return f"无法识别的股票代码: {code}, 仅支持A股"

        period_en = _KLT_MAP_TX.get(period, "day")
        fq = _FQT_MAP_TX.get(fq_type, "qfq")
        lmt = min(max(count, 1), 365)

        url = (
            f"https://web.ifzq.gtimg.cn/appstock/app/fqkline/get"
            f"?param={api_code},{period_en},,,{lmt},{fq}"
        )

        req = urllib.request.Request(url, headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        stock_data = data.get("data", {}).get(api_code, {})
        if not stock_data:
            return f"未找到 {code} 的历史数据"

        # 找到K线数组(键名可能是 qfqday, qfqweek, qfqmonth 或 day, week, month)
        klines = None
        for key_prefix in [fq, ""]:
            for suffix in ["day", "week", "month"]:
                key = f"{key_prefix}{suffix}"
                if key in stock_data:
                    klines = stock_data[key]
                    break
            if klines:
                break

        if not klines:
            return f"未找到 {code} 的{period}数据"

        return _format_history_result(code, code, period, klines)

    except Exception as e:
        return f"查询历史行情时出错: {str(e)}"


class StockSkill(ToolSkill):
    m_name = "stock"
    m_description = "股票查询技能, 查询A股/港股/美股实时行情及历史K线数据"
    m_version = "1.0.0"
    m_author = "小鱼"
    m_tags = ["stock", "finance", "market"]

    m_instructions = """
## 股票查询技能

提供两个工具:
1. stock_quote — 查询实时行情(最新价、涨跌幅、成交量、市盈率等)
2. stock_history — 查询历史K线(日K/周K/月K, 支持复权)

使用规则:
- 实时行情用 stock_quote
- 历史走势、K线分析用 stock_history
- 用户说公司名时, 先确定股票代码再调用
- A股代码规则: 6开头沪市(sh), 0/3开头深市(sz), 8开头北交所(bj)
- 港股代码(如 00700)和美股代码(如 AAPL)仅支持 stock_quote
"""

    def get_tools(self):
        return [stock_quote, stock_history]
