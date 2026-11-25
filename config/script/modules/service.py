#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""服务器启停与日志模块.

替代原来的 gateway.py / start.sh / stop.sh / restart.sh / taillog.sh:
    启服: 勾选实例启动, 可选前台跟随或后台独立日志窗口
    停服: 按 pid 文件停止勾选实例
    重启: 先停所选实例, 再按启动参数启动
    日志: 跟随指定实例的指定服务日志, 支持正则过滤
"""

import atexit
import os
import re
import signal
import subprocess
import threading
import time

from ..core.errors import ModuleError
from ..core.instances import (
    InstanceChoiceGroups,
    InstanceChoiceTips,
    PickFollowTarget,
    ReadInstanceValue,
    SERVER_DB,
    SERVER_GATEWAY,
    SERVER_GLOBAL,
    SERVER_LOGIC,
    SERVER_WEBUI,
    LoadTargets,
    ServiceResources,
    SyncDirIfChanged,
    SyncFileIfChanged,
    SyncRuntimeLibs,
)
from ..core.log_follower import CurrentLogFile, LogFollower
from ..core.menu import Module, Option
from ..core.platform_utils import (
    CREATE_NEW_CONSOLE,
    EXE_SUFFIX,
    IS_WINDOWS,
    EntryCommand,
    ResolveTool,
    RunHidden,
    SetProcessTitle,
)
from ..core.process import (
    ExecutablePath,
    IsPidAlive,
    ManagedProcess,
    PidMatchesExecutable,
    ReadPidFile,
    RemovePidFile,
    SendConsoleCtrlC,
    WritePidFile,
)

# 轮询间隔
POLL_INTERVAL = 0.25

# 前台跟随的服务
FOLLOW_SERVER = SERVER_LOGIC


def FilterTargets(context, targets, instance_names):
    """按选中的实例名过滤实例清单, 未选择时直接报错"""
    names = [str(name).strip() for name in (instance_names or []) if str(name).strip()]
    if not names:
        raise ModuleError("请至少选择一个服务器")

    selected_names = set(names)
    known_names = {target.name for target in targets}
    unknown = [name for name in names if name not in known_names]
    if unknown:
        context.console.Warn(
            "  警告: 忽略实例清单中不存在的服务器: %s" % ", ".join(unknown)
        )

    selected = [target for target in targets if target.name in selected_names]
    if not selected:
        raise ModuleError("选择的服务器都不在实例清单中: %s" % ", ".join(names))
    return selected


def SelectedTargets(context, instance_names, all_instances=False):
    """读取实例清单并按勾选结果返回目标, 实例根目录统一使用部署目录"""
    targets, root_dir, _blueprint = LoadTargets(context.settings)
    if all_instances:
        return targets, root_dir
    return FilterTargets(context, targets, instance_names), root_dir


class StartModule(Module):
    """启动选中的服务器实例"""

    ID = "start"
    TITLE = "启动服务器"
    DESCRIPTION = "勾选要启动的服务器, 支持 Vite 开发服, 跟随日志和独立日志窗口"

    OPTIONS = (
        Option("webui", "启动前端 Vite 开发服务器", "bool",
               default_from="service.webui_enabled"),
        Option("foreground", "前台管理服务 (Ctrl+C 停止全部)", "bool",
               default_from="service.foreground"),
        Option("follow", "跟随日志", "bool",
               default_from="service.follow"),
        Option("open_log_windows", "Windows 下每个逻辑服独立日志窗口", "bool",
               default_from="service.open_log_windows"),
        Option("instances", "启动服务器", "multi_choice",
               default_from="service.start_instances",
               groups=InstanceChoiceGroups,
               item_tips=InstanceChoiceTips,
               layout="list"),
    )

    def Run(self, context, options):
        return StartRunner(context, options).Run()


class StartAllModule(Module):
    """一键启动全部服务器"""

    ID = "start_all"
    TITLE = "启动全部服务器"
    DESCRIPTION = "一键启动实例清单中的全部服务器"

    OPTIONS = tuple(
        option for option in StartModule.OPTIONS if option.name != "instances"
    )

    def Run(self, context, options):
        return StartRunner(context, options, all_instances=True).Run()


class StopModule(Module):
    """停止选中的服务器实例"""

    ID = "stop"
    TITLE = "停止服务器"
    DESCRIPTION = "勾选要停止的服务器, 按 pid 文件精确停止, 可同时停止前端 Vite"

    OPTIONS = (
        Option("webui", "同时停止前端 Vite 开发服务器", "bool",
               default_from="service.stop_webui"),
        Option("instances", "停止服务器", "multi_choice",
               default_from="service.stop_instances",
               groups=InstanceChoiceGroups,
               item_tips=InstanceChoiceTips,
               layout="list"),
    )

    def Run(self, context, options):
        return StopServices(
            context,
            options["instances"],
            stop_webui=bool(options["webui"]),
        )


class StopAllModule(Module):
    """一键停止全部服务器"""

    ID = "stop_all"
    TITLE = "停止全部服务器"
    DESCRIPTION = "一键停止实例清单中的全部服务器和前端 Vite 开发服"

    OPTIONS = ()

    def Run(self, context, options):
        return StopServices(context, None, True)


class RestartModule(Module):
    """先停后启"""

    ID = "restart"
    TITLE = "重启服务器"
    DESCRIPTION = "先停止勾选的服务器, 再按启动参数重新启动"

    OPTIONS = StartModule.OPTIONS

    def Run(self, context, options):
        StopServices(
            context,
            options["instances"],
            stop_webui=bool(options["webui"]),
        )
        return StartRunner(context, options).Run()


class ClearLogsModule(Module):
    """清理实例日志文件"""

    ID = "clean_logs"
    TITLE = "清理日志"
    DESCRIPTION = "删除实例 log/runlog 下的日志文件, 保留 pid 与目录结构"

    OPTIONS = (
        Option("scope", "清理范围", "choice",
               default_from="service.default_clear_scope",
               items=[
                   ("服务器日志 log/", "log"),
                   ("运行日志 runlog/", "runlog"),
                   ("全部", "all"),
               ]),
        Option("assume_yes", "跳过删除确认", "bool", default=False),
    )

    def Run(self, context, options):
        return ClearLogsRunner(context, options).Run()


class LogsModule(Module):
    """查看或跟随日志"""

    ID = "logs"
    TITLE = "查看日志"
    DESCRIPTION = "跟随实例日志, 支持服务类型与正则过滤"

    OPTIONS = (
        Option("instance", "实例名 (空=第一个逻辑服)", "string",
               default_from="service.default_log_instance"),
        Option("service", "服务名", "choice",
               default_from="service.default_log_service",
               items=[
                   ("logicserver", "logicserver"),
                   ("globalserver", "globalserver"),
                   ("dbserver", "dbserver"),
                   ("gatewayserver", "gatewayserver"),
               ]),
        Option("lines", "首屏历史行数", "int",
               default_from="service.log_view_lines"),
        Option("pattern", "正则过滤 (空=全部)", "string", default=""),
        Option("auto_close", "服务停止后自动关闭", "bool",
               default_from="service.log_auto_close"),
    )

    def Run(self, context, options):
        return LogsRunner(context, options).Run()


class StartRunner(object):
    """启动流程"""

    def __init__(self, context, options, all_instances=False):
        self.m_context = context
        self.m_settings = context.settings
        self.m_console = context.console
        self.m_options = options
        self.m_all_instances = all_instances
        self.m_targets = []
        self.m_exe_dir = ""
        self.m_manager = None

    def Run(self):
        self.m_targets, self.m_exe_dir = SelectedTargets(
            self.m_context,
            self.m_options.get("instances"),
            self.m_all_instances,
        )

        foreground = bool(self.m_options["foreground"])
        if foreground and not self.m_context.is_cli:
            self.m_console.Warn("  GUI 模式不支持前台跟随, 已改为后台启动")
            foreground = False

        self.m_manager = ServiceManager(
            self.m_context,
            self.m_targets,
            self.m_exe_dir,
            foreground,
            bool(self.m_options["webui"]),
        )
        return self.m_manager.Run(
            bool(self.m_options["follow"]),
            bool(self.m_options["open_log_windows"]),
        )


class ServiceManager(object):
    """按实例目录管理服务启停与日志跟随"""

    def __init__(self, context, targets, exe_dir, foreground, webui):
        self.m_context = context
        self.m_settings = context.settings
        self.m_console = context.console
        self.m_targets = targets
        self.m_exe_dir = exe_dir
        self.m_runlog_dir = os.path.join(exe_dir, "runlog")
        self.m_foreground = foreground
        self.m_webui = webui
        self.m_stop_event = threading.Event()
        self.m_processes = {}
        self.m_log_windows = []
        self.m_stopped = False
        self.m_logic_exit_warned = False

    def Run(self, follow, open_log_windows):
        self.Prepare()
        self.StartAll()

        if not self.m_foreground:
            if IS_WINDOWS and follow and open_log_windows:
                self.OpenLogWindows()
            self.ReleaseHandles()
            self.m_console.Line()
            self.m_console.Success("[service] 服务已在后台启动, 本窗口即将退出")
            self.m_console.Line(
                "[service] 停止服务请运行: python auto.py --cli --module stop"
            )
            return 0

        if IS_WINDOWS and follow and open_log_windows and self.LogicTargets():
            if len(self.LogicTargets()) > 1:
                self.OpenLogWindows()

        if self.m_context.is_cli:
            InstallSignalHandlers(self.m_stop_event)
            atexit.register(self.Shutdown)

        try:
            self.Follow(follow)
        finally:
            self.Shutdown()
        return 0

    def Prepare(self):
        """检查实例目录并同步资源"""
        if not os.path.isdir(self.m_exe_dir):
            raise ModuleError(
                "找不到部署目录 %s\n  请先运行创建服务器模块" % self.m_exe_dir
            )

        missing = [target.name for target in self.m_targets if not os.path.isdir(target.path)]
        if missing:
            raise ModuleError(
                "实例目录不存在: %s\n  请先运行创建服务器模块" % ", ".join(missing)
            )

        os.makedirs(self.m_runlog_dir, exist_ok=True)
        self.SyncResources()

        self.m_console.Line("[service] 部署目录: %s" % self.m_exe_dir)
        for target in self.m_targets:
            self.m_console.Line(
                "[service] 实例: %-10s %s" % (target.name, ", ".join(target.services))
            )
        self.m_console.Line()

    def SyncResources(self):
        """启动前同步 exe/运行库/配置/前端, 源有变化才覆盖"""
        changed = []
        for target in self.m_targets:
            changed.extend(self.SyncTarget(target))

        if changed:
            preview = ", ".join(changed[:6])
            if len(changed) > 6:
                preview += " ..."
            self.m_console.Line("[sync] 已更新 %d 项: %s" % (len(changed), preview))
        else:
            self.m_console.Line("[sync] 实例文件已是最新")

    def SyncTarget(self, target):
        """同步一个实例目录, 返回发生变化的项目"""
        changed = []

        # 可执行文件与调试符号
        for service in target.services:
            for suffix in (EXE_SUFFIX, ".pdb"):
                src = os.path.join(self.m_exe_dir, service + suffix)
                if not os.path.isfile(src):
                    continue
                if SyncFileIfChanged(src, os.path.join(target.path, service + suffix)):
                    changed.append("%s/%s%s" % (target.name, service, suffix))

        # 运行库
        for name in SyncRuntimeLibs(self.m_settings, target.path):
            changed.append("%s/%s" % (target.name, name))

        # 逻辑配置 / Lua / 前端产物
        resources = ServiceResources(self.m_settings)
        for service in target.services:
            for src_dir, dst_rel in resources.get(service, []):
                if not os.path.isdir(src_dir):
                    continue
                if SyncDirIfChanged(src_dir, os.path.join(target.path, dst_rel)):
                    changed.append("%s/%s" % (target.name, dst_rel))

        # 网关的选服列表由实例清单生成
        if SERVER_GATEWAY in target.services:
            blueprint = self.m_settings.Path("paths.blueprint")
            if os.path.isfile(blueprint):
                blueprint_name = os.path.basename(blueprint)
                dst = os.path.join(target.path, "config", blueprint_name)
                if SyncFileIfChanged(blueprint, dst):
                    changed.append("%s/config/%s" % (target.name, blueprint_name))

        return changed

    def LogicTargets(self):
        return [target for target in self.m_targets if SERVER_LOGIC in target.services]

    def OpenLogWindows(self):
        """Windows 下为每个逻辑服实例单独开一个日志窗口"""
        targets = self.LogicTargets()
        if not targets:
            return

        opened = 0
        for target in targets:
            if self.OpenLogWindow(target, FOLLOW_SERVER):
                opened += 1

        if opened:
            self.m_console.Success("[service] 已为 %d 个逻辑服打开独立日志窗口" % opened)
        else:
            self.m_console.Warn("[service] 警告: 打开日志窗口失败, 改为当前窗口跟随")

    def OpenLogWindow(self, target, service):
        """启动独立控制台窗口跟随指定实例日志"""
        options = {
            "instance": target.name,
            "service": service,
            "lines": str(self.m_settings.Require("service.tail_lines")),
            "auto_close": "true",
        }
        command = EntryCommand(self.m_context.entry_script, "logs", options)
        try:
            popen = subprocess.Popen(
                command,
                cwd=self.m_context.project_root,
                creationflags=CREATE_NEW_CONSOLE,
            )
        except OSError as error:
            self.m_console.Error("[service] 打开 %s 日志窗口失败: %s" % (target.name, error))
            return False
        self.m_log_windows.append(popen)
        return True

    def StartAll(self):
        """启动顺序: 中心服 -> 数据服 -> 逻辑服 -> 网关"""
        for target in self.m_targets:
            if SERVER_GLOBAL in target.services:
                self.StartService(target, SERVER_GLOBAL)

        for target in self.m_targets:
            if SERVER_DB in target.services:
                self.StartService(target, SERVER_DB)

        for target in self.m_targets:
            if SERVER_LOGIC in target.services:
                self.StartService(target, SERVER_LOGIC)

        if any(SERVER_GATEWAY in target.services for target in self.m_targets):
            delay = float(self.m_settings.Require("service.start_delay"))
            self.m_console.Line("[service] 等待 %.0f 秒后启动 gatewayserver ..." % delay)
            if not self.SleepInterruptible(delay):
                return
            for target in self.m_targets:
                if SERVER_GATEWAY in target.services:
                    self.StartService(target, SERVER_GATEWAY)
            if self.m_webui:
                self.StartWebui()
            else:
                self.m_console.Line("[service] 未启动前端 Vite")

    def StartService(self, target, name):
        exe_path = ExecutablePath(target.path, name)
        key = "%s/%s" % (target.name, name)
        if not os.path.isfile(exe_path):
            self.m_console.Warn("[service] 警告: 找不到可执行文件 %s, 跳过" % exe_path)
            return None

        runlog_dir = os.path.join(target.path, "runlog")
        os.makedirs(runlog_dir, exist_ok=True)

        reused_pid = self.ReclaimPid(runlog_dir, name, exe_path)
        if reused_pid is not None:
            managed = ManagedProcess(
                key, None, target.path, "",
                reuse_pid=reused_pid,
                detached=not self.m_foreground,
                console=self.m_console,
            )
            self.m_processes[key] = managed
            self.m_console.Line("%s 已在运行 (PID: %d), 复用" % (key, reused_pid))
            return managed

        log_path = os.path.join(runlog_dir, name + ".log")
        managed = ManagedProcess(
            key, [exe_path], target.path, log_path,
            detached=not self.m_foreground,
            console=self.m_console,
        )
        try:
            pid = managed.Start()
        except OSError as error:
            managed.Release()
            self.m_console.Error("[service] 错误: 启动 %s 失败: %s" % (key, error))
            return None

        WritePidFile(runlog_dir, name, pid)
        self.m_processes[key] = managed
        self.m_console.Success(
            "%s 启动 (PID: %d) 日志: %s"
            % (key, pid, os.path.join(target.name, "runlog", name + ".log"))
        )
        return managed

    def StartWebui(self):
        """启动前端 Vite 开发服务器"""
        try:
            webui_dir = self.m_settings.Path("paths.webui_dir", must_exist=True)
            npm_path = ResolveTool(self.m_settings, "npm")
        except ModuleError as error:
            self.m_console.Warn("[service] 跳过 webui: %s" % error)
            return None

        log_path = os.path.join(self.m_runlog_dir, SERVER_WEBUI + ".log")
        env = os.environ.copy()
        gateway_target = self.WebuiGatewayTarget()
        if gateway_target:
            env["VITE_GATEWAY_URL"] = gateway_target
            self.m_console.Line("[service] 前端代理目标: %s" % gateway_target)

        managed = ManagedProcess(
            SERVER_WEBUI, [npm_path, "run", "dev"], webui_dir, log_path,
            env=env, detached=not self.m_foreground, console=self.m_console,
        )
        try:
            pid = managed.Start()
        except OSError as error:
            managed.Release()
            self.m_console.Error("[service] 错误: 启动 webui 失败: %s" % error)
            return None

        WritePidFile(self.m_runlog_dir, SERVER_WEBUI, pid)
        self.m_processes[SERVER_WEBUI] = managed
        self.m_console.Success("webui 启动 (PID: %d) 日志: runlog/%s.log" % (pid, SERVER_WEBUI))
        return managed

    def WebuiGatewayTarget(self):
        """Vite 开发代理指向第一个网关实例"""
        for target in self.m_targets:
            if SERVER_GATEWAY not in target.services:
                continue
            port = ReadInstanceValue(self.m_settings, target.path, "gatewayserver", "ListenPort")
            if isinstance(port, int) and port > 0:
                return "http://127.0.0.1:%d" % port
        return ""

    def ReclaimPid(self, runlog_dir, name, exe_path):
        """pid 文件仍然有效时复用, 失效则清掉避免误杀"""
        pid = ReadPidFile(runlog_dir, name)
        if pid is None:
            return None
        if IsPidAlive(pid) and PidMatchesExecutable(pid, exe_path):
            return pid
        RemovePidFile(runlog_dir, name)
        return None

    def Follow(self, follow):
        """前台跟随日志, 同时轮询服务状态, 直到收到停止信号"""
        self.m_console.Line()
        self.m_console.Success("[service] 全部启动完成, Ctrl+C 停止全部服务")

        follower = None
        if self.m_log_windows:
            self.m_console.Line("[service] 逻辑服日志已在独立窗口显示")
        elif follow:
            target, server_name = PickFollowTarget(self.m_targets)
            if target is not None:
                log_dir = os.path.join(target.path, "log", server_name)
                follower = LogFollower(
                    lambda: CurrentLogFile(log_dir),
                    int(self.m_settings.Require("service.tail_lines")),
                    False,
                    self.m_console,
                )
                self.m_console.Line("[service] 跟随日志: %s/log/%s" % (target.name, server_name))

        while not self.m_stop_event.is_set():
            if follower is not None:
                follower.Poll()
            self.CheckServices()
            self.m_stop_event.wait(POLL_INTERVAL)

    def CheckServices(self):
        """逻辑服意外退出时提示一次"""
        if self.m_logic_exit_warned:
            return
        for key, managed in self.m_processes.items():
            if not key.endswith("/" + SERVER_LOGIC):
                continue
            if not managed.IsAlive():
                self.m_logic_exit_warned = True
                self.m_console.Warn()
                self.m_console.Warn("[service] 警告: %s 已退出, 详见 runlog" % key)
                return

    def SleepInterruptible(self, seconds):
        """可被停止请求打断的等待"""
        deadline = time.time() + seconds
        while time.time() < deadline:
            if self.m_stop_event.is_set():
                return False
            remaining = deadline - time.time()
            self.m_stop_event.wait(min(POLL_INTERVAL, max(remaining, 0.01)))
        return not self.m_stop_event.is_set()

    def ReleaseHandles(self):
        """后台模式: 只释放句柄, 不停止进程, 也不关闭日志窗口"""
        for managed in self.m_processes.values():
            managed.Release()
        self.m_processes.clear()
        self.m_log_windows = []

    def Shutdown(self):
        """按启动逆序停止服务"""
        if self.m_stopped:
            return
        self.m_stopped = True

        for popen in self.m_log_windows:
            try:
                if popen.poll() is None:
                    popen.terminate()
            except OSError:
                pass
        self.m_log_windows = []

        names = list(reversed(list(self.m_processes.keys())))
        if not names:
            return

        self.m_console.Line()
        self.m_console.Line("[service] 正在停止服务 ...")

        broadcast = IS_WINDOWS and SendConsoleCtrlC()
        stop_timeout = float(self.m_settings.Require("service.stop_timeout"))

        failed = []
        for key in names:
            managed = self.m_processes.pop(key)
            if not managed.Stop(stop_timeout, send_signal=not broadcast):
                failed.append(key)
            if "/" in key:
                instance_name, _, service_name = key.partition("/")
                RemovePidFile(os.path.join(self.m_exe_dir, instance_name, "runlog"), service_name)
            else:
                RemovePidFile(self.m_runlog_dir, key)

        if failed:
            self.m_console.Warn("[service] 警告: %s 仍未退出, 请手动检查" % ", ".join(failed))
        self.m_console.Success("[service] 已停止")


def InstallSignalHandlers(stop_event):
    """Ctrl+C / SIGTERM / 关闭终端时只置标志, 清理交给主流程"""

    def handler(_signum, _frame):
        stop_event.set()

    for signal_name in ("SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK"):
        signal_value = getattr(signal, signal_name, None)
        if signal_value is None:
            continue
        try:
            signal.signal(signal_value, handler)
        except (ValueError, OSError):
            pass


def CollectStopEntries(targets, stop_webui, root_dir):
    """收集需要停止的进程: (显示名, pid, 工作目录, pid目录, pid文件名)"""
    entries = []
    services = (SERVER_GATEWAY, SERVER_LOGIC, SERVER_GLOBAL, SERVER_DB)

    # 前端 Vite 的 pid 写在部署目录的 runlog 下
    if stop_webui:
        webui_runlog = os.path.join(root_dir, "runlog")
        webui_pid = ReadPidFile(webui_runlog, SERVER_WEBUI)
        if webui_pid is not None:
            entries.append((SERVER_WEBUI, webui_pid, root_dir, webui_runlog, SERVER_WEBUI))

    for target in targets:
        runlog_dir = os.path.join(target.path, "runlog")
        for service in services:
            pid = ReadPidFile(runlog_dir, service)
            if pid is None:
                continue
            entries.append(("%s/%s" % (target.name, service), pid, target.path, runlog_dir, service))
    return entries


def StopPid(context, name, pid, working_dir):
    """停止单个 pid, 返回进程是否已退出"""
    console = context.console
    if not IsPidAlive(pid):
        return True

    console.Line("停止 %s (PID: %d)" % (name, pid))
    if IS_WINDOWS:
        # Windows 直接结束进程树, 避免服务端不响应控制台事件时长时间等待
        try:
            # RunHidden 保证 GUI 无控制台时不会为每个 taskkill 闪一个窗口
            RunHidden(["taskkill", "/F", "/T", "/PID", str(pid)])
        except OSError:
            pass
        return not IsPidAlive(pid)

    timeout = float(context.settings.Require("service.stop_timeout"))
    managed = ManagedProcess(
        name, None, working_dir, "", reuse_pid=pid, console=console
    )
    return managed.Stop(timeout)


def StopServices(context, instance_names=None, stop_webui=None):
    """停止勾选的实例服务并清理 pid 文件.

    instance_names 为 None 时表示全部实例; stop_webui 默认只在停止全部时关闭 Vite.
    """
    settings = context.settings
    console = context.console
    targets, root_dir, _blueprint = LoadTargets(settings)
    if instance_names is None:
        selected = targets
    else:
        selected = FilterTargets(context, targets, instance_names)
    if stop_webui is None:
        stop_webui = instance_names is None

    entries = CollectStopEntries(selected, stop_webui, root_dir)
    if not entries:
        console.Success("[service] 没有需要停止的服务进程")
        return 0

    stopped = 0
    failed = []

    if IS_WINDOWS:
        for display_name, pid, working_dir, runlog_dir, pid_name in entries:
            if StopPid(context, display_name, pid, working_dir):
                stopped += 1
                RemovePidFile(runlog_dir, pid_name)
            elif IsPidAlive(pid):
                failed.append(display_name)
    else:
        # POSIX: 先给全部进程发 SIGTERM, 再逐个等待, 避免串行等待叠加
        timeout = float(settings.Require("service.stop_timeout"))
        pending = []
        for display_name, pid, working_dir, runlog_dir, pid_name in entries:
            if not IsPidAlive(pid):
                RemovePidFile(runlog_dir, pid_name)
                continue
            managed = ManagedProcess(
                display_name, None, working_dir, "", reuse_pid=pid, console=console
            )
            managed.BeginStop()
            pending.append((managed, display_name, runlog_dir, pid_name))

        for managed, display_name, runlog_dir, pid_name in pending:
            if managed.Stop(timeout, send_signal=False):
                stopped += 1
                RemovePidFile(runlog_dir, pid_name)
            else:
                failed.append(display_name)

    if failed:
        console.Warn(
            "[service] 警告: %s 仍未退出, pid 文件已保留, 可重试停止" % ", ".join(failed)
        )
    console.Success("[service] 已停止 %d 个服务进程" % stopped)
    return 0


def _FormatSize(size):
    if size < 1024:
        return "%d B" % size
    if size < 1024 * 1024:
        return "%.1f KB" % (size / 1024.0)
    if size < 1024 * 1024 * 1024:
        return "%.1f MB" % (size / (1024.0 * 1024.0))
    return "%.2f GB" % (size / (1024.0 * 1024.0 * 1024.0))


def _CollectLogFiles(root_dir, only_log_suffix=False):
    """收集目录下的文件, runlog 模式只删 .log, 保留 .pid"""
    result = []
    if not os.path.isdir(root_dir):
        return result
    for current, _dirs, files in os.walk(root_dir):
        for name in files:
            if only_log_suffix and not name.lower().endswith(".log"):
                continue
            path = os.path.join(current, name)
            if os.path.isfile(path):
                result.append(path)
    return result


class ClearLogsRunner(object):
    """清理实例日志文件"""

    def __init__(self, context, options):
        self.m_context = context
        self.m_settings = context.settings
        self.m_console = context.console
        self.m_options = options

    def Run(self):
        targets, root_dir, _blueprint = LoadTargets(self.m_settings)
        scope = self.m_options["scope"]
        files = []

        if scope in ("log", "all"):
            # log/ 下全部是服务日志, 直接清空文件
            for target in targets:
                files.extend(_CollectLogFiles(os.path.join(target.path, "log"), False))

        if scope in ("runlog", "all"):
            # runlog/ 下有 pid 文件, 只删除 .log
            for target in targets:
                files.extend(_CollectLogFiles(os.path.join(target.path, "runlog"), True))
            files.extend(_CollectLogFiles(os.path.join(root_dir, "runlog"), True))

        files = sorted(set(files))
        if not files:
            self.m_console.Success("没有需要清理的日志文件")
            return 0

        total_size = 0
        for path in files:
            try:
                total_size += os.path.getsize(path)
            except OSError:
                pass

        self.m_console.Line(
            "将删除 %d 个日志文件, 共 %s" % (len(files), _FormatSize(total_size))
        )
        for path in files[:10]:
            self.m_console.Line("  %s" % path)
        if len(files) > 10:
            self.m_console.Line("  ... 其余 %d 个" % (len(files) - 10))

        if not self.m_options["assume_yes"]:
            if not self.m_console.Confirm("确认删除以上日志文件?", False):
                self.m_console.Line("已取消")
                return 0

        deleted = 0
        failed = []
        for path in files:
            try:
                os.remove(path)
                deleted += 1
            except OSError as error:
                failed.append("%s (%s)" % (path, error))

        self.m_console.Success("已删除 %d 个日志文件" % deleted)
        if failed:
            for item in failed[:10]:
                self.m_console.Warn("  " + item)
            raise ModuleError("有 %d 个日志文件删除失败" % len(failed))
        return 0


class LogsRunner(object):
    """日志跟随流程"""

    def __init__(self, context, options):
        self.m_context = context
        self.m_settings = context.settings
        self.m_console = context.console
        self.m_options = options

    def Run(self):
        targets, _root, _blueprint = LoadTargets(self.m_settings)
        service = self.m_options["service"]
        instance_name = str(self.m_options["instance"]).strip()
        target = None
        if instance_name:
            for item in targets:
                if item.name == instance_name:
                    target = item
                    break
            if target is None:
                raise ModuleError("找不到实例: %s" % instance_name)
        else:
            # 未指定实例时优先选第一个运行该服务的实例
            for item in targets:
                if service in item.services:
                    target = item
                    break
            if target is None:
                target, _service = PickFollowTarget(targets)
            if target is None:
                target = targets[0]

        if service not in target.services:
            raise ModuleError("实例 %s 没有启动 %s" % (target.name, service))

        log_dir = os.path.join(target.path, "log", service)
        runlog_dir = os.path.join(target.path, "runlog")
        self.m_console.Line("[tail] %s/%s" % (target.name, service))
        self.m_console.Line("[tail] 日志目录: %s" % log_dir)
        SetProcessTitle("%s %s" % (target.name, service))

        pattern = str(self.m_options["pattern"]).strip()
        if pattern:
            try:
                re.compile(pattern)
            except re.error as error:
                raise ModuleError("日志过滤正则不合法: %s (%s)" % (pattern, error)) from error

        follower = LogFollower(
            lambda: CurrentLogFile(log_dir),
            int(self.m_options["lines"]),
            False,
            self.m_console,
            pattern,
        )

        auto_close = bool(self.m_options["auto_close"])
        try:
            while True:
                follower.Poll()
                if auto_close:
                    pid = ReadPidFile(runlog_dir, service)
                    if pid is None or not IsPidAlive(pid):
                        self.m_console.Line("[tail] 服务已停止, 关闭窗口")
                        time.sleep(1)
                        return 0
                time.sleep(POLL_INTERVAL)
        except KeyboardInterrupt:
            return 0
