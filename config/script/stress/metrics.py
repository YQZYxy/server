"""指标采集

机器人跑在独立线程的 asyncio 事件循环里, GUI 在主线程读, 所以全部加锁。
"""

import threading
import time
from collections import deque

# 延迟样本上限, 避免长时间压测把内存吃满
MAX_LATENCY_SAMPLES = 10000


class Metrics:
    """计数器 + 延迟直方图"""

    def __init__(self):
        self._lock = threading.Lock()
        self._counters = {}
        self._latencies = {}
        self._start_time = time.time()

    def inc(self, name, value=1):
        with self._lock:
            self._counters[name] = self._counters.get(name, 0) + value

    def dec(self, name, value=1):
        self.inc(name, -value)

    def set_gauge(self, name, value):
        with self._lock:
            self._counters[name] = value

    def observe(self, name, milliseconds):
        with self._lock:
            samples = self._latencies.get(name)
            if samples is None:
                samples = deque(maxlen=MAX_LATENCY_SAMPLES)
                self._latencies[name] = samples
            samples.append(milliseconds)

    def counter(self, name):
        with self._lock:
            return self._counters.get(name, 0)

    @property
    def start_time(self):
        """本轮压测开始时刻(time.time())"""
        with self._lock:
            return self._start_time

    def snapshot(self):
        """返回可直接给 GUI 用的普通 dict

        只在锁内做拷贝, 排序/分位计算放到锁外, 避免拖住机器人线程
        """
        with self._lock:
            counters = dict(self._counters)
            samples_copy = {name: list(samples) for name, samples in self._latencies.items()}
            start_time = self._start_time

        latencies = {}
        for name, samples in samples_copy.items():
            latencies[name] = _summarize(samples)

        return {
            "counters": counters,
            "latencies": latencies,
            "elapsed": time.time() - start_time,
        }

    def reset(self):
        with self._lock:
            self._counters.clear()
            self._latencies.clear()
            self._start_time = time.time()


def _summarize(samples):
    """计算 p50/p95/p99/max"""
    if not samples:
        return {"count": 0, "avg": 0.0, "p50": 0.0, "p95": 0.0, "p99": 0.0, "max": 0.0}
    ordered = sorted(samples)
    total = len(ordered)

    def pick(percent):
        index = int(total * percent) - 1
        if index < 0:
            index = 0
        return ordered[index]

    return {
        "count": total,
        "avg": sum(ordered) / total,
        "p50": pick(0.50),
        "p95": pick(0.95),
        "p99": pick(0.99),
        "max": ordered[-1],
    }
