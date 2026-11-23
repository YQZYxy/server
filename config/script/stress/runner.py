"""压测编排

Runner 在独立线程里跑 asyncio 事件循环, GUI 通过 snapshot() 读指标, 不阻塞界面。
"""

import asyncio
import threading
import time
from collections import deque
from dataclasses import dataclass, field

from .bot import BotClient
from .metrics import Metrics
from .scenarios import REGISTRY, create_scenario

# 采样曲线长度(每秒一个点, 约 1 小时)
MAX_SERIES_POINTS = 3600
# 日志缓存行数
MAX_LOG_LINES = 3000


@dataclass
class GroupSpec:
    """一组机器人: 同一个场景 + 相同人数"""

    scenario: str
    bot_count: int = 0
    interval: float = 0.0          # 0 表示用场景默认值
    params: dict = field(default_factory=dict)


@dataclass
class RunSpec:
    """一轮压测的完整配置"""

    host: str = "127.0.0.1"
    port: int = 3723
    path: str = "/ws"
    prefix: str = "bot"
    run_tag: str = "run"
    unique_accounts: bool = False    # 账号名带时间戳, 避免和上一轮残留角色冲突
    duration: float = 60.0
    ramp_seconds: float = 10.0      # 多少秒内把机器人逐步拉起
    heartbeat_interval: float = 5.0
    connect_timeout: float = 5.0
    login_timeout: float = 10.0
    groups: list = field(default_factory=list)

    @property
    def total_bots(self):
        return sum(max(0, group.bot_count) for group in self.groups)

    def active_groups(self):
        return [group for group in self.groups if group.bot_count > 0]

    def describe(self):
        parts = [
            "%s:%d%s" % (self.host, self.port, self.path),
            "时长 %ds" % self.duration,
            "渐变 %ds" % self.ramp_seconds,
            "共 %d 人" % self.total_bots,
        ]
        for group in self.active_groups():
            parts.append("%s×%d" % (group.scenario, group.bot_count))
        return " | ".join(parts)


class Runner:
    """压测执行器"""

    def __init__(self, codec, on_log=None):
        self.codec = codec
        self.metrics = Metrics()
        self.on_log = on_log

        self.series = deque(maxlen=MAX_SERIES_POINTS)
        self.logs = deque(maxlen=MAX_LOG_LINES)

        self._spec = None
        self._thread = None
        self._loop = None
        self._stop_event = None
        self._running = False
        self._bots = []
        self._start_time = 0.0
        self._finished = False
        self._lock = threading.Lock()

    # ---------------- 对外接口 ----------------

    @property
    def is_running(self):
        return self._running

    @property
    def spec(self):
        return self._spec

    def start(self, spec):
        """启动压测, 已在运行返回 False"""
        if self._running:
            return False
        if spec.total_bots <= 0:
            self.log("ERROR", "机器人数为 0, 无法开始")
            return False

        unknown = [group.scenario for group in spec.active_groups() if group.scenario not in REGISTRY]
        if unknown:
            self.log("ERROR", "未注册的场景: %s" % ", ".join(unknown))
            return False

        self._spec = spec
        self._finished = False
        self.metrics.reset()
        with self._lock:
            self.series.clear()
        self._start_time = time.time()
        self._running = True

        self._thread = threading.Thread(target=self._thread_main, args=(spec,),
                                        name="stress-runner", daemon=True)
        self._thread.start()
        self.log("INFO", "开始压测: %s" % spec.describe())
        return True

    def stop(self):
        """请求停止(可在任意线程调用)"""
        if not self._running:
            return
        loop = self._loop
        event = self._stop_event
        if loop is not None and event is not None:
            try:
                loop.call_soon_threadsafe(event.set)
            except RuntimeError:
                pass
        for bot in self._bots:
            bot.stop_requested = True
        self.log("INFO", "收到停止请求, 正在收尾")

    def snapshot(self):
        """当前状态快照(线程安全)"""
        data = self.metrics.snapshot()
        data["running"] = self._running
        data["finished"] = self._finished
        data["elapsed"] = time.time() - self._start_time if self._start_time else 0.0
        data["total_bots"] = self._spec.total_bots if self._spec else 0
        data["describe"] = self._spec.describe() if self._spec else ""
        return data

    def series_snapshot(self):
        with self._lock:
            return list(self.series)

    def log_lines(self, since_index=0):
        """返回 (新增日志, 下次的起始下标)"""
        with self._lock:
            total = len(self.logs)
            if since_index >= total:
                return [], total
            return list(self.logs)[since_index:], total

    def log(self, level, message):
        line = "[%s][%s] %s" % (time.strftime("%H:%M:%S"), level, message)
        with self._lock:
            self.logs.append(line)
        if self.on_log:
            try:
                self.on_log(level, message)
            except Exception:
                pass

    # ---------------- 线程内实现 ----------------

    def _thread_main(self, spec):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        self._loop = loop
        try:
            loop.run_until_complete(self._main(spec))
        except Exception as error:
            self.log("ERROR", "压测线程异常: %r" % (error,))
        finally:
            try:
                loop.run_until_complete(loop.shutdown_asyncgens())
            except Exception:
                pass
            loop.close()
            self._loop = None
            self._running = False
            self._finished = True
            elapsed = time.time() - self._start_time
            data = self.metrics.snapshot()["counters"]
            self.log("INFO", "压测结束, 耗时 %.0fs, 登录成功 %d 失败 %d, 在线残留 %d"
                     % (elapsed,
                        data.get("login_ok", 0),
                        data.get("login_failed", 0),
                        data.get("online", 0)))

    async def _main(self, spec):
        self._stop_event = asyncio.Event()

        # 账号名带时间戳, 避免复用上一轮的角色(断线重连/顶号会互相干扰)
        tag = "%s_%d" % (spec.run_tag, int(time.time())) if spec.unique_accounts else spec.run_tag
        cfg = spec

        bots = []
        index = 0
        for group in spec.active_groups():
            for _ in range(group.bot_count):
                index += 1
                scenario = create_scenario(group.scenario, group.params)
                if scenario is None:
                    continue
                if group.interval > 0:
                    scenario.interval = group.interval
                name = "%s_%s_%05d" % (cfg.prefix, tag, index)
                bots.append(BotClient(index, name, scenario, cfg, self.codec,
                                      self.metrics, self.log))
        self._bots = bots

        total = len(bots)
        if total <= 0:
            return

        tasks = []
        # 采样器先启动, 否则渐变拉起阶段的数据全丢(曲线会从第 10 秒才开始)
        sampler = asyncio.create_task(self._sampler())

        # 渐变按"绝对时刻表"推进: Windows 上 asyncio.sleep 会被时钟粒度拉长
        # (实测 9.8ms 的 sleep 变成 15.6ms), 逐次 sleep 会让渐变实际时长失控
        ramp = max(0.0, spec.ramp_seconds)
        ramp_start = time.perf_counter()
        for position, bot in enumerate(bots):
            if ramp > 0:
                due = ramp_start + ramp * (position + 1) / total
                wait = due - time.perf_counter()
                if wait > 0:
                    await asyncio.sleep(wait)
            if self._stop_event.is_set():
                break
            tasks.append(asyncio.create_task(bot.run()))

        try:
            if spec.duration > 0:
                try:
                    await asyncio.wait_for(self._stop_event.wait(), spec.duration)
                except asyncio.TimeoutError:
                    pass
            else:
                await self._stop_event.wait()
        finally:
            for bot in bots:
                bot.stop_requested = True
            if tasks:
                # 给机器人一点时间收尾(心跳/断开), 超时强制取消
                done, pending = await asyncio.wait(tasks, timeout=5.0)
                for task in pending:
                    task.cancel()
                if pending:
                    await asyncio.wait(pending, timeout=2.0)
            sampler.cancel()

    async def _sampler(self):
        """每秒记录一个曲线点"""
        last_send = self.metrics.counter("send_msgs")
        last_recv = self.metrics.counter("recv_msgs")
        while True:
            await asyncio.sleep(1.0)
            send_now = self.metrics.counter("send_msgs")
            recv_now = self.metrics.counter("recv_msgs")
            point = {
                "t": time.time() - self._start_time,
                "online": self.metrics.counter("online"),
                "qps_send": max(0, send_now - last_send),
                "qps_recv": max(0, recv_now - last_recv),
                "errors": self.metrics.counter("scenario_error") + self.metrics.counter("timeout"),
            }
            last_send = send_now
            last_recv = recv_now
            with self._lock:
                self.series.append(point)
