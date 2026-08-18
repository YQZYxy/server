# -*- coding: utf-8 -*-
"""
日志模块 - 统一日志配置

用法:
    from logger import logger
    logger.info("消息")
    logger.warning("警告")
    logger.error("错误")

其他模块:
    from logger import get_logger
    log = get_logger(__name__)
    # 自动继承本模块配置的格式和级别，且 __main__ 自动变 main
"""

import logging


# ANSI 颜色码
_LOG_COLORS: dict[int, str] = {
    logging.DEBUG:    "\033[37m",     # 白色
    logging.INFO:     "\033[32m",     # 绿色
    logging.WARNING:  "\033[33m",     # 黄色
    logging.ERROR:    "\033[31m",     # 红色
    logging.CRITICAL: "\033[1;31;47m",  # 红字白底
}
_RESET: str = "\033[0m"

# 日志格式常量
LOG_FORMAT: str = "%(asctime)s %(levelname)s [%(name)s.%(funcName)s:%(lineno)d] %(message)s"
LOG_DATEFMT: str = "%Y-%m-%d %H:%M:%S"
LOG_LEVEL: int = logging.INFO


class _ColoredFormatter(logging.Formatter):
    """按日志级别着色"""
    def format(self, record: logging.LogRecord) -> str:
        color = _LOG_COLORS.get(record.levelno, _RESET)
        msg = super().format(record)
        return f"{color}{msg}{_RESET}"


# 配置根 Logger -> 所有 get_logger(__name__) 自动继承格式和颜色
_handler = logging.StreamHandler()
_handler.setFormatter(_ColoredFormatter(LOG_FORMAT, LOG_DATEFMT))
logging.getLogger().setLevel(LOG_LEVEL)
logging.getLogger().addHandler(_handler)

# 模块级默认日志器（直接 from logger import logger 用）
logger = logging.getLogger("webui")


def get_logger(name: str | None = None) -> logging.Logger:
    """获取日志器，自动清理 __main__ 的下划线

    用法:
        from logger import get_logger
        log = get_logger(__name__)  # 入口文件 -> [main], 子模块 -> [模块名]
    """
    if name == "__main__":
        name = "main"
    return logging.getLogger(name)


def setup_logger(
    name: str = "webui",
    level: int = LOG_LEVEL,
    fmt: str = LOG_FORMAT,
    datefmt: str = LOG_DATEFMT,
) -> logging.Logger:
    """配置并返回指定名称的日志器"""
    _logger = logging.getLogger(name)
    _logger.setLevel(level)

    # 避免重复添加 Handler
    if not _logger.handlers:
        _handler = logging.StreamHandler()
        _handler.setFormatter(_ColoredFormatter(fmt, datefmt))
        _logger.addHandler(_handler)

    return _logger
