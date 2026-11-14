"""压测 GUI (tkinter, 无第三方依赖)

界面结构:
    顶部  服务器与运行参数
    左侧  场景列表(自动从 stress/scenarios.py 的注册表生成)
    右侧  实时指标 + 延迟分位
    中部  在线数 / 发送 QPS 曲线
    底部  控制按钮 + 日志
"""

import ctypes
import json
import os
import time
import tkinter as tk
from collections import deque
from tkinter import messagebox, ttk

from .runner import GroupSpec, Runner, RunSpec
from .scenarios import all_scenarios
from .sysmon import ProcessMonitor

# 指标刷新间隔(毫秒); 曲线和日志各占一半频率, 避免每帧都做重活
REFRESH_MS = 500
# 曲线保留点数
MAX_CHART_POINTS = 1800
# 单次刷新最多插入的日志行数
MAX_LOG_LINES_PER_REFRESH = 300
# 日志框保留的最大行数, 超过后丢弃最旧的
MAX_LOG_WIDGET_LINES = 3000
REPORT_DIR_NAME = "debug/stress_reports"
# 界面状态(最后的地址/端口 + 历史目标), 关闭时写入, 启动时读回
STATE_FILE_NAME = "debug/stress_gui.json"
# 历史目标保留条数
MAX_TARGET_HISTORY = 20


def _enable_dpi_awareness():
    """Windows 高分屏下避免字体发虚"""
    try:
        ctypes.windll.shcore.SetProcessDpiAwareness(1)
    except Exception:
        pass


def parse_params(text):
    """把 "battle_type=1,slot=0" 解析成 dict, 值自动转数字"""
    params = {}
    if not text or not text.strip():
        return params
    for item in text.split(","):
        item = item.strip()
        if not item or "=" not in item:
            continue
        key, _, raw_value = item.partition("=")
        key = key.strip()
        raw_value = raw_value.strip()
        if not key:
            continue
        params[key] = _to_number(raw_value)
    return params


def _to_number(text):
    try:
        return int(text)
    except ValueError:
        pass
    try:
        return float(text)
    except ValueError:
        return text


class ScenarioRow:
    """场景列表里的一行"""

    def __init__(self, parent, row, scenario_cls, column_widths):
        self.scenario_cls = scenario_cls
        enabled_by_default = scenario_cls.name in ("idle", "lineup")
        self.enabled_var = tk.BooleanVar(value=enabled_by_default)
        self.count_var = tk.StringVar(value="20" if enabled_by_default else "0")
        self.interval_var = tk.StringVar(value=str(scenario_cls.default_interval))
        self.params_var = tk.StringVar(value=self._format_params(scenario_cls.default_params))

        self.check = ttk.Checkbutton(parent, variable=self.enabled_var)
        self.check.grid(row=row, column=0, sticky="w", padx=(6, 2), pady=2)

        ttk.Label(parent, text=scenario_cls.name).grid(row=row, column=1, sticky="w", padx=2)
        ttk.Label(parent, text=scenario_cls.description).grid(row=row, column=2, sticky="w", padx=2)

        self.count_spin = ttk.Spinbox(parent, from_=0, to=10000, increment=10,
                                      width=column_widths["count"], textvariable=self.count_var)
        self.count_spin.grid(row=row, column=3, sticky="we", padx=2)

        self.interval_entry = ttk.Entry(parent, width=column_widths["interval"],
                                        textvariable=self.interval_var)
        self.interval_entry.grid(row=row, column=4, sticky="we", padx=2)

        self.params_entry = ttk.Entry(parent, width=column_widths["params"],
                                      textvariable=self.params_var)
        self.params_entry.grid(row=row, column=5, sticky="we", padx=(2, 6))

    @staticmethod
    def _format_params(params):
        return ",".join("%s=%s" % (key, value) for key, value in params.items())

    def to_group_spec(self):
        """转换成 GroupSpec, 未启用或人数为 0 返回 None"""
        if not self.enabled_var.get():
            return None
        try:
            count = int(self.count_var.get() or 0)
        except ValueError:
            count = 0
        if count <= 0:
            return None
        try:
            interval = float(self.interval_var.get() or 0)
        except ValueError:
            interval = self.scenario_cls.default_interval
        return GroupSpec(
            scenario=self.scenario_cls.name,
            bot_count=count,
            interval=max(0.0, interval),
            params=parse_params(self.params_var.get()),
        )


class StressApp:
    """主窗口"""

    def __init__(self, codec):
        self.codec = codec
        self.runner = Runner(codec)
        self.monitor = ProcessMonitor()
        self.rows = []
        self.log_cursor = 0
        self.last_counters = {}
        self.last_sample_time = 0.0
        self.history = deque(maxlen=MAX_CHART_POINTS)
        self._tick = 0
        # 界面是否处于"运行中", 不用读控件状态判断(ttk 的 ["state"] 返回 Tcl_Obj,
        # 和 "normal" 比较恒为 False, 会导致按钮永远恢复不了)
        self._ui_running = False
        self.targets = []       # 历史目标 [(host, port), ...], 最近的在前
        self.report_dir = os.path.join(os.path.dirname(os.path.dirname(
            os.path.abspath(__file__))), REPORT_DIR_NAME)
        self.state_path = os.path.join(os.path.dirname(os.path.dirname(
            os.path.abspath(__file__))), STATE_FILE_NAME)
        self.saved_state = self._load_state()

        self.root = tk.Tk()
        self.root.title("服务器压测工具")
        self.root.geometry("1240x860")
        self.root.minsize(1000, 700)

        self._build_ui()
        self.monitor.start()        # 进程采样放后台线程, 不占用界面
        self.root.protocol("WM_DELETE_WINDOW", self._on_close)
        self._refresh_job = self.root.after(REFRESH_MS, self._refresh)

    # ---------------- 配置持久化 ----------------

    def _load_state(self):
        """读回上次的地址/端口与历史目标, 读不到就用默认值"""
        state = {"host": "127.0.0.1", "port": "3723", "targets": []}
        try:
            with open(self.state_path, "r", encoding="utf-8") as handler:
                saved = json.load(handler)
        except Exception:
            return state
        if not isinstance(saved, dict):
            return state

        if str(saved.get("host", "")).strip():
            state["host"] = str(saved["host"]).strip()
        if str(saved.get("port", "")).strip():
            state["port"] = str(saved["port"]).strip()

        for item in saved.get("targets") or []:
            try:
                host, port = item
            except (TypeError, ValueError):
                continue
            host, port = str(host).strip(), str(port).strip()
            if host and port and (host, port) not in state["targets"]:
                state["targets"].append((host, port))
        del state["targets"][MAX_TARGET_HISTORY:]
        return state

    def _save_state(self):
        """把当前地址/端口写回磁盘(关闭窗口时调用)

        注意不要把当前值再塞回历史: 用户刚删掉的条目不该因为关窗口就复活。
        历史只在真正发起压测时追加(_on_start)。
        """
        host = self.host_var.get().strip()
        port = self.port_var.get().strip()
        data = {
            "host": host,
            "port": port,
            "targets": [list(target) for target in self.targets],
        }
        try:
            os.makedirs(os.path.dirname(self.state_path), exist_ok=True)
            with open(self.state_path, "w", encoding="utf-8") as handler:
                json.dump(data, handler, ensure_ascii=False, indent=2)
        except Exception as error:
            self.runner.log("WARN", "保存界面状态失败: %r" % (error,))

    def _remember_target(self, host, port):
        """把 host:port 记进历史(最近在前, 去重, 限量)"""
        if not host or not port:
            return
        target = (host, port)
        if target in self.targets:
            self.targets.remove(target)
        self.targets.insert(0, target)
        del self.targets[MAX_TARGET_HISTORY:]
        self._refresh_target_choices()

    def _refresh_target_choices(self):
        """刷新地址/端口下拉候选"""
        hosts, ports = [], []
        for host, port in self.targets:
            if host not in hosts:
                hosts.append(host)
            if port not in ports:
                ports.append(port)
        self.host_combo["values"] = hosts
        self.port_combo["values"] = ports

    def _on_host_selected(self, _event=None):
        """选地址时自动带出这个地址上次用的端口"""
        host = self.host_var.get().strip()
        for history_host, history_port in self.targets:
            if history_host == host:
                self.port_var.set(history_port)
                return

    def _on_delete_target(self):
        """从历史里删掉当前的 地址:端口"""
        host = self.host_var.get().strip()
        port = self.port_var.get().strip()
        target = (host, port)
        if target not in self.targets:
            messagebox.showinfo("提示", "%s:%s 不在历史记录里" % (host, port))
            return
        self.targets.remove(target)
        self._refresh_target_choices()
        self.runner.log("INFO", "已从历史删除 %s:%s" % (host, port))

    # ---------------- 界面构建 ----------------

    def _build_ui(self):
        style = ttk.Style()
        try:
            style.theme_use("vista")
        except tk.TclError:
            pass

        outer = ttk.Frame(self.root, padding=8)
        outer.pack(fill="both", expand=True)
        outer.rowconfigure(2, weight=3)
        outer.rowconfigure(4, weight=2)
        outer.columnconfigure(0, weight=1)

        self._build_server_frame(outer, row=0)
        self._build_middle(outer, row=2)
        self._build_chart(outer, row=3)
        self._build_bottom(outer, row=4)

    def _build_server_frame(self, parent, row):
        frame = ttk.LabelFrame(parent, text="服务器与运行参数", padding=8)
        frame.grid(row=row, column=0, sticky="we")

        self.host_var = tk.StringVar(value=self.saved_state["host"])
        self.port_var = tk.StringVar(value=self.saved_state["port"])
        self.path_var = tk.StringVar(value="/ws")
        self.prefix_var = tk.StringVar(value="bot")
        self.tag_var = tk.StringVar(value="r1")
        self.duration_var = tk.StringVar(value="60")
        self.ramp_var = tk.StringVar(value="10")
        self.heartbeat_var = tk.StringVar(value="5")
        self.login_timeout_var = tk.StringVar(value="10")
        self.unique_var = tk.BooleanVar(value=True)

        fields = [
            ("路径", self.path_var, 8),
            ("账号前缀", self.prefix_var, 10),
            ("本轮标记", self.tag_var, 10),
            ("时长(s)", self.duration_var, 8),
            ("渐变(s)", self.ramp_var, 8),
            ("心跳(s)", self.heartbeat_var, 8),
            ("登录超时(s)", self.login_timeout_var, 8),
        ]

        # 地址/端口用可编辑下拉框, 候选是历史记录
        ttk.Label(frame, text="地址").grid(row=1, column=1, sticky="e", padx=(8, 2), pady=2)
        self.host_combo = ttk.Combobox(frame, textvariable=self.host_var, width=16)
        self.host_combo.grid(row=1, column=2, sticky="w", pady=2)
        self.host_combo.bind("<<ComboboxSelected>>", self._on_host_selected)

        ttk.Label(frame, text="端口").grid(row=1, column=3, sticky="e", padx=(8, 2), pady=2)
        self.port_combo = ttk.Combobox(frame, textvariable=self.port_var, width=8)
        self.port_combo.grid(row=1, column=4, sticky="w", pady=2)

        ttk.Button(frame, text="删除历史", width=7,
                   command=self._on_delete_target).grid(row=1, column=5, sticky="w", padx=(4, 0))

        column = 6
        for label, variable, width in fields:
            ttk.Label(frame, text=label).grid(row=1, column=column, sticky="e", padx=(8, 2), pady=2)
            ttk.Entry(frame, textvariable=variable, width=width).grid(
                row=1, column=column + 1, sticky="w", pady=2)
            column += 2

        self.targets = list(self.saved_state["targets"])
        self._refresh_target_choices()

        ttk.Checkbutton(frame, text="账号名带时间戳(避免与上一轮角色冲突)",
                        variable=self.unique_var).grid(row=2, column=1, columnspan=6,
                                                      sticky="w", pady=(4, 0))

    def _build_middle(self, parent, row):
        container = ttk.Frame(parent)
        container.grid(row=row, column=0, sticky="nsew", pady=(8, 0))
        container.columnconfigure(0, weight=3)
        container.columnconfigure(1, weight=2)
        container.rowconfigure(0, weight=1)

        # 场景
        scenario_frame = ttk.LabelFrame(container, text="场景(勾选并填人数)", padding=6)
        scenario_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 8))
        scenario_frame.columnconfigure(2, weight=1)

        headers = ["启用", "场景", "说明", "人数", "间隔(s)", "参数(k=v,...)"]
        widths = {"count": 7, "interval": 8, "params": 34}
        for index, title in enumerate(headers):
            ttk.Label(scenario_frame, text=title, font=("", 9, "bold")).grid(
                row=0, column=index, sticky="w", padx=4, pady=(0, 4))

        for index, scenario_cls in enumerate(all_scenarios(), start=1):
            self.rows.append(ScenarioRow(scenario_frame, index, scenario_cls, widths))

        hint = ttk.Label(scenario_frame,
                         text="新增场景: 在 stress/scenarios.py 用 @register_scenario 注册即可自动出现",
                         foreground="#666666")
        hint.grid(row=len(self.rows) + 2, column=0, columnspan=6, sticky="w", pady=(8, 0))

        # 指标
        metric_frame = ttk.LabelFrame(container, text="实时指标", padding=6)
        metric_frame.grid(row=0, column=1, sticky="nsew")
        metric_frame.columnconfigure(1, weight=1)

        self.metric_vars = {}
        metric_rows = [
            ("online", "在线 / 目标"),
            ("login", "登录 成功 / 失败"),
            ("connect", "连接 成功 / 失败"),
            ("qps", "QPS 发送 / 接收"),
            ("total", "消息 发送 / 接收"),
            ("traffic", "流量 发送 / 接收"),
            ("connect_ms", "连接耗时 p50 / p99"),
            ("login_ms", "登录耗时 p50 / p99"),
            ("rtt", "RTT p50 / p99"),
            ("error", "超时 / 场景错误"),
            ("server", "服务端 CPU / 内存"),
        ]
        for index, (key, title) in enumerate(metric_rows):
            ttk.Label(metric_frame, text=title).grid(row=index, column=0, sticky="w", pady=2)
            variable = tk.StringVar(value="-")
            self.metric_vars[key] = variable
            ttk.Label(metric_frame, textvariable=variable,
                      font=("Consolas", 10)).grid(row=index, column=1, sticky="w", padx=(8, 0))

        self.status_var = tk.StringVar(value="就绪")
        ttk.Label(metric_frame, textvariable=self.status_var,
                  foreground="#004080").grid(row=len(metric_rows) + 1, column=0,
                                             columnspan=2, sticky="w", pady=(8, 0))

    def _build_chart(self, parent, row):
        frame = ttk.LabelFrame(parent, text="曲线(在线数 / 发送 QPS)", padding=4)
        frame.grid(row=row, column=0, sticky="nsew", pady=(8, 0))
        self.canvas = tk.Canvas(frame, height=180, background="#ffffff",
                                highlightthickness=1, highlightbackground="#cccccc")
        self.canvas.pack(fill="both", expand=True)

    def _build_bottom(self, parent, row):
        frame = ttk.Frame(parent)
        frame.grid(row=row, column=0, sticky="nsew", pady=(8, 0))
        frame.rowconfigure(1, weight=1)
        frame.columnconfigure(0, weight=1)

        buttons = ttk.Frame(frame)
        buttons.grid(row=0, column=0, sticky="we", pady=(0, 6))

        self.start_button = ttk.Button(buttons, text="开始压测", command=self._on_start)
        self.start_button.pack(side="left")
        self.stop_button = ttk.Button(buttons, text="停止", command=self._on_stop, state="disabled")
        self.stop_button.pack(side="left", padx=6)
        ttk.Button(buttons, text="导出报告", command=self._on_export).pack(side="left")
        ttk.Button(buttons, text="清空日志", command=self._on_clear_log).pack(side="left", padx=6)

        log_frame = ttk.Frame(frame)
        log_frame.grid(row=1, column=0, sticky="nsew")
        log_frame.rowconfigure(0, weight=1)
        log_frame.columnconfigure(0, weight=1)

        self.log_text = tk.Text(log_frame, height=10, wrap="none", font=("Consolas", 9))
        self.log_text.grid(row=0, column=0, sticky="nsew")
        scroll = ttk.Scrollbar(log_frame, orient="vertical", command=self.log_text.yview)
        scroll.grid(row=0, column=1, sticky="ns")
        self.log_text.configure(yscrollcommand=scroll.set)
        self.log_text.tag_configure("WARN", foreground="#a05000")
        self.log_text.tag_configure("ERROR", foreground="#c00000")

    # ---------------- 交互 ----------------

    def _collect_spec(self):
        groups = [group for group in (row.to_group_spec() for row in self.rows) if group]
        if not groups:
            messagebox.showwarning("提示", "请至少勾选一个场景并填写人数")
            return None

        try:
            spec = RunSpec(
                host=self.host_var.get().strip(),
                port=int(self.port_var.get()),
                path=self.path_var.get().strip() or "/ws",
                prefix=self.prefix_var.get().strip() or "bot",
                run_tag=self.tag_var.get().strip() or "run",
                unique_accounts=self.unique_var.get(),
                duration=float(self.duration_var.get() or 0),
                ramp_seconds=float(self.ramp_var.get() or 0),
                heartbeat_interval=float(self.heartbeat_var.get() or 5),
                login_timeout=float(self.login_timeout_var.get() or 10),
                groups=groups,
            )
        except ValueError as error:
            messagebox.showerror("参数错误", "请输入合法数字: %s" % error)
            return None
        return spec

    def _on_start(self):
        spec = self._collect_spec()
        if spec is None:
            return
        if not spec.path.startswith("/"):
            spec.path = "/" + spec.path
        self.history = []
        self.last_counters = {}
        self.last_sample_time = time.time()
        if not self.runner.start(spec):
            messagebox.showerror("启动失败", "压测已在运行")
            return
        self._remember_target(spec.host, str(spec.port))
        self._ui_running = True
        self.start_button.configure(state="disabled")
        self.stop_button.configure(state="normal")
        self.status_var.set("运行中: %s" % spec.describe())

    def _on_stop(self):
        if not self.runner.is_running:
            return
        self.runner.stop()
        self.stop_button.configure(state="disabled")
        self.status_var.set("正在停止...")

    def _on_clear_log(self):
        self.log_text.delete("1.0", "end")

    def _on_export(self):
        snapshot = self.runner.snapshot()
        spec = self.runner.spec
        if spec is None:
            messagebox.showwarning("提示", "还没有压测数据")
            return

        os.makedirs(self.report_dir, exist_ok=True)
        stamp = time.strftime("%Y%m%d_%H%M%S")
        path = os.path.join(self.report_dir, "report_%s.json" % stamp)
        report = {
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "spec": {
                "target": "%s:%d%s" % (spec.host, spec.port, spec.path),
                "duration": spec.duration,
                "ramp_seconds": spec.ramp_seconds,
                "heartbeat_interval": spec.heartbeat_interval,
                "total_bots": spec.total_bots,
                "groups": [group.__dict__ for group in spec.groups],
            },
            "metrics": snapshot,
            "series": self.runner.series_snapshot(),
            "logs": [line for line in self.runner.log_lines(0)[0]],
        }
        with open(path, "w", encoding="utf-8") as handler:
            json.dump(report, handler, ensure_ascii=False, indent=2)

        summary_path = path.replace(".json", ".txt")
        with open(summary_path, "w", encoding="utf-8") as handler:
            handler.write(self._build_text_summary(spec, snapshot))
        messagebox.showinfo("导出完成", "已保存:\n%s\n%s" % (path, summary_path))

    def _build_text_summary(self, spec, snapshot):
        counters = snapshot.get("counters", {})
        latencies = snapshot.get("latencies", {})
        lines = [
            "压测报告 %s" % time.strftime("%Y-%m-%d %H:%M:%S"),
            "目标: %s:%d%s" % (spec.host, spec.port, spec.path),
            "配置: %s" % spec.describe(),
            "",
            "登录成功 %d / 失败 %d" % (counters.get("login_ok", 0), counters.get("login_failed", 0)),
            "连接失败 %d / 游戏服连接失败 %d" % (counters.get("connect_failed", 0),
                                                counters.get("game_connect_failed", 0)),
            "发送 %d 条 / %d 字节" % (counters.get("send_msgs", 0), counters.get("send_bytes", 0)),
            "接收 %d 条 / %d 字节" % (counters.get("recv_msgs", 0), counters.get("recv_bytes", 0)),
            "超时 %d / 场景错误 %d / 坏包 %d" % (
                counters.get("timeout", 0),
                counters.get("scenario_error", 0),
                counters.get("bad_packet", 0)),
        ]
        for name in ("connect_ms", "login_send_ms", "login_ms", "rtt_ms"):
            stats = latencies.get(name)
            if stats and stats["count"]:
                lines.append("%s: p50 %.1fms p95 %.1fms p99 %.1fms max %.1fms (样本 %d)"
                             % (name, stats["p50"], stats["p95"], stats["p99"],
                                stats["max"], stats["count"]))
        return "\n".join(lines) + "\n"

    def _on_close(self):
        # 先摘掉挂起的刷新定时器, 否则 destroy 之后 Tcl 会报 invalid command name
        if self._refresh_job is not None:
            try:
                self.root.after_cancel(self._refresh_job)
            except Exception:
                pass
            self._refresh_job = None
        self._save_state()
        self.runner.stop()
        self.monitor.stop()
        time.sleep(0.2)
        self.root.destroy()

    # ---------------- 刷新 ----------------

    def _refresh(self):
        """每 500ms 一次; 曲线和日志降频, 避免界面卡顿"""
        try:
            self._tick += 1
            self._refresh_metrics()
            if self._tick % 2 == 0:
                self._draw_chart()
            else:
                self._refresh_log()
        finally:
            self._refresh_job = self.root.after(REFRESH_MS, self._refresh)

    def _refresh_metrics(self):
        snapshot = self.runner.snapshot()
        counters = snapshot.get("counters", {})
        latencies = snapshot.get("latencies", {})

        now = time.time()
        delta_time = max(0.001, now - self.last_sample_time) if self.last_sample_time else 1.0
        qps_send = max(0, counters.get("send_msgs", 0) - self.last_counters.get("send_msgs", 0)) / delta_time
        qps_recv = max(0, counters.get("recv_msgs", 0) - self.last_counters.get("recv_msgs", 0)) / delta_time
        self.last_counters = counters
        self.last_sample_time = now

        self.metric_vars["online"].set("%d / %d" % (counters.get("online", 0),
                                                   snapshot.get("total_bots", 0)))
        self.metric_vars["login"].set("%d / %d" % (counters.get("login_ok", 0),
                                                  counters.get("login_failed", 0)))
        self.metric_vars["connect"].set("%d / %d" % (
            counters.get("connect_ok", 0),
            counters.get("connect_failed", 0) + counters.get("game_connect_failed", 0)))
        self.metric_vars["qps"].set("%.0f / %.0f" % (qps_send, qps_recv))
        self.metric_vars["total"].set("%d / %d" % (counters.get("send_msgs", 0),
                                                  counters.get("recv_msgs", 0)))
        self.metric_vars["traffic"].set("%s / %s" % (_format_bytes(counters.get("send_bytes", 0)),
                                                    _format_bytes(counters.get("recv_bytes", 0))))

        connect_stats = latencies.get("connect_ms")
        self.metric_vars["connect_ms"].set(
            "-" if not connect_stats or not connect_stats["count"]
            else "%.0f / %.0f ms" % (connect_stats["p50"], connect_stats["p99"]))

        login_stats = latencies.get("login_ms")
        self.metric_vars["login_ms"].set(
            "-" if not login_stats or not login_stats["count"]
            else "%.0f / %.0f ms" % (login_stats["p50"], login_stats["p99"]))

        rtt_stats = latencies.get("rtt_ms")
        self.metric_vars["rtt"].set(
            "-" if not rtt_stats or not rtt_stats["count"]
            else "%.0f / %.0f ms" % (rtt_stats["p50"], rtt_stats["p99"]))

        self.metric_vars["error"].set("%d / %d" % (counters.get("timeout", 0),
                                                  counters.get("scenario_error", 0)))

        processes = self.monitor.latest()
        if processes:
            text = " ".join("%s %.0f%%/%.0fMB" % (name[:5], info["cpu"], info["mem_mb"])
                            for name, info in processes.items())
            self.metric_vars["server"].set(text)

        if snapshot.get("running"):
            self.history.append({
                "t": snapshot.get("elapsed", 0.0),
                "online": counters.get("online", 0),
                "qps_send": qps_send,
                "qps_recv": qps_recv,
            })
        elif self._ui_running:
            self._ui_running = False
            self.start_button.configure(state="normal")
            self.stop_button.configure(state="disabled")
            self.status_var.set("已结束")

    def _refresh_log(self):
        lines, cursor = self.runner.log_lines(self.log_cursor)
        if not lines:
            self.log_cursor = cursor
            return
        self.log_cursor = cursor

        # 日志暴涨时只插最新的一批, 避免一次性卡住界面
        truncated = len(lines) > MAX_LOG_LINES_PER_REFRESH
        if truncated:
            lines = lines[-MAX_LOG_LINES_PER_REFRESH:]

        for line in lines:
            tag = ""
            if "[ERROR]" in line:
                tag = "ERROR"
            elif "[WARN]" in line:
                tag = "WARN"
            self.log_text.insert("end", line + "\n", tag)
        if truncated:
            self.log_text.insert("end", "... 日志过多, 已省略中间部分\n", "WARN")

        # 只在用户停在底部时自动滚动
        if self.log_text.yview()[1] > 0.99:
            self.log_text.see("end")

        # 日志框不能无限增长, 否则越跑越卡
        total_lines = int(self.log_text.index("end-1c").split(".")[0])
        if total_lines > MAX_LOG_WIDGET_LINES:
            self.log_text.delete("1.0", "%d.0" % (total_lines - MAX_LOG_WIDGET_LINES + 1))

    def _draw_chart(self):
        canvas = self.canvas
        canvas.delete("all")
        width = canvas.winfo_width()
        height = canvas.winfo_height()
        if width <= 10 or height <= 10:
            return

        points = list(self.history)[-120:]
        if len(points) < 2:
            canvas.create_text(width / 2, height / 2, text="等待数据...", fill="#999999")
            return

        max_online = max(point["online"] for point in points) or 1
        max_qps = max(point["qps_send"] for point in points) or 1
        padding = 8

        def build_coords(key, max_value):
            coords = []
            for index, point in enumerate(points):
                x = padding + (width - 2 * padding) * index / (len(points) - 1)
                y = height - padding - (height - 2 * padding) * (point[key] / max_value)
                coords.extend([x, y])
            return coords

        canvas.create_line(*build_coords("qps_send", max_qps),
                           fill="#1f77b4", width=2, smooth=True)
        canvas.create_line(*build_coords("online", max_online),
                           fill="#2ca02c", width=2, smooth=True)

        canvas.create_text(padding + 4, padding + 6, anchor="w", fill="#1f77b4",
                           text="发送 QPS 峰值 %.0f" % max_qps)
        canvas.create_text(padding + 4, padding + 22, anchor="w", fill="#2ca02c",
                           text="在线数 峰值 %d" % max_online)

    def run(self):
        self.root.mainloop()


def _format_bytes(value):
    if value < 1024:
        return "%dB" % value
    if value < 1024 * 1024:
        return "%.1fKB" % (value / 1024.0)
    return "%.1fMB" % (value / (1024.0 * 1024.0))


def launch(codec):
    """启动 GUI"""
    _enable_dpi_awareness()
    StressApp(codec).run()
