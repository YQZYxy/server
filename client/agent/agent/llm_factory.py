# -*- coding: utf-8 -*-
from typing import Optional
import httpx
from langchain_openai import ChatOpenAI
from config.config import get_config


def create_llm(
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    streaming: bool = True,
    http_client: Optional[httpx.Client] = None,
) -> ChatOpenAI:
    """
    创建 LangChain 兼容的 ChatOpenAI 实例

    所有 OpenAI 兼容 API

    Args:
        http_client: 可选自定义 httpx.Client, 用于支持外部取消 HTTP 请求
    """
    config = get_config()

    # 决定 base_url: 外部 AI API > 默认
    if config.m_api_url:
        # 从完整 URL 中提取 base_url
        base_url = _extract_base_url(config.m_api_url)
        api_key = config.m_api_key or "not-needed"
    else:
        base_url = None
        api_key = config.m_api_key or "not-needed"

    kwargs = {
        "model": model or config.m_agent_default_model,
        "temperature": temperature if temperature is not None else config.m_agent_temperature,
        "max_tokens": max_tokens or 4096,
        "streaming": streaming,
        "api_key": api_key,
    }

    if base_url:
        kwargs["base_url"] = base_url

    if http_client is not None:
        kwargs["http_client"] = http_client

    return ChatOpenAI(**kwargs)


def _extract_base_url(api_url: str) -> str:
    """从完整 API URL 中提取 base_url"""
    # 去掉 /chat/completions 等路径后缀
    import re
    # 匹配到 /v1 为止
    match = re.match(r"(https?://[^/]+(?:/v1)?)", api_url)
    if match:
        return match.group(1)
    # 简单截取到域名+端口
    match = re.match(r"(https?://[^/]+)", api_url)
    if match:
        return f"{match.group(1)}/v1"
    return api_url