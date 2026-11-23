#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""配置验证模块.

改完配置表后, 用独立的 logicserver 副本做一次真实启动验证:
    1. 读取实例生效配置 (实例 config.json 优先, 否则按 blueprint + baseconfig 生成)
    2. 复制一份运行目录到临时位置, 改用空闲端口并关闭集群/分区, 避免影响正在运行的服务
    3. 拉起 logicserver, 等待配置加载, 模块启动与 Lua 初始化结果
    4. 成功立即关闭失败打印错误日志
"""

import copy
import glob
import json
import os
import shutil
import socket
import subprocess
import threading
import time
from collections import deque

from ..core.console import StripAnsi
from ..core.errors import ModuleError
from ..core.instances import (
    SERVER_LOGIC,
    LoadBlueprint,
    LoadTargets,
)
from ..core.menu import Module, Option
from ..core.platform_utils import (
    CREATE_NO_WINDOW,
    IS_WINDOWS,
    IsRuntimeLib,
    LinkDir,
    LinkFile,
    ResolvePathFromRoot,
    RuntimeLibFiles,
)
from ..core.settings import write_json

# 启动过程轮询间隔(秒)
POLL_INTERVAL = 0.1

# 停止验证进程的等待时间(秒)
STOP_WAIT_SECONDS = 5.0

# 进程输出最多保留多少行, 防止异常刷屏占内存
OUTPUT_MAX_LINES = 2000

# 启动成功的必要日志
CONFIG_READY_MARKERS = (
    "逻辑服务器启动成功",
    "主循环开始运行",
)

# Lua 初始化完成的日志, 用于确认主循环真正跑起来了
LUA_DONE_MARKERS = (
    "Lua 启动成功",
    "Lua被禁用",
)

# 出现即判定为启动失败的关键日志
FAILURE_MARKERS = (
    "创建配置类型失败",
    "加载配置类型失败",
    "加载配置失败",
    "日志模块初始化失败",
    "工作线程模块初始化失败",
    "主线程模块初始化失败",
    "工作线程模块启动失败",
    "主线程模块启动失败",
    "模块启动失败",
    "主程注册失败",
    "Listen error",
    "启动Lua失败",
    "主线程模块更新失败",
    "主线程模块处理异常",
    "主线程模块未知异常",
)


def FindFreePort():
    """向系统申请一个空闲端口, 用于隔离验证"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def FindFreePorts(count):
    """申请多个互不重复的空闲端口"""
    ports = []
    while len(ports) < count:
        port = FindFreePort()
        if port not in ports:
            ports.append(port)
    return ports


def ReadJson(path):
    """读取 JSON, 失败时带路径报错"""
    try:
        with open(path, "r", encoding="utf-8-sig") as handle:
            return json.load(handle)
    except json.JSONDecodeError as error:
        raise ModuleError("JSON 格式错误: %s (%s)" % (path, error)) from error
    except OSError as error:
        raise ModuleError("读取 JSON 失败: %s (%s)" % (path, error)) from error


def MergeJson(base, overlay):
    """与 ConfigInheritance::MergeJson 保持一致: 对象递归合并, 其它类型整体覆盖"""
    if isinstance(base, dict) and isinstance(overlay, dict):
        for key, value in overlay.items():
            if key in base:
                base[key] = MergeJson(base[key], value)
            else:
                base[key] = copy.deepcopy(value)
        return base
    return copy.deepcopy(overlay)


def LoadConfigTree(path, depth=0):
    """展开 extends 继承链后返回完整配置"""
    if depth > 8:
        raise ModuleError("配置 extends 继承层级过深: %s" % path)

    data = ReadJson(path)
    if not isinstance(data, dict):
        raise ModuleError("配置根节点必须是对象: %s" % path)

    extends = data.pop("extends", None)
    parents = []
    if isinstance(extends, str):
        parents = [extends]
    elif isinstance(extends, list):
        parents = extends
    elif extends is not None:
        raise ModuleError("配置 extends 必须是字符串或数组: %s" % path)

    merged = {}
    for parent in parents:
        if not isinstance(parent, str) or not parent:
            raise ModuleError("配置 extends 元素必须是非空字符串: %s" % path)
        parent_path = os.path.normpath(os.path.join(os.path.dirname(path), parent))
        merged = MergeJson(merged, LoadConfigTree(parent_path, depth + 1))
    return MergeJson(merged, data)


def RemoveLinkAware(path):
    """删除临时目录, 遇到目录链接只删链接本身, 绝不递归目标目录"""
    if not path or not os.path.exists(path):
        return
    if os.path.islink(path) or os.path.isfile(path):
        os.unlink(path)
        return
    if os.path.isdir(path):
        real_path = os.path.realpath(path)
        if real_path != os.path.abspath(path):
            os.rmdir(path)
            return
        for name in os.listdir(path):
            RemoveLinkAware(os.path.join(path, name))
        os.rmdir(path)


class ValidateConfigModule(Module):
    """隔离启动 logicserver, 验证策划配置"""

    ID = "validate_config"
    TITLE = "验证配置"
    DESCRIPTION = "隔离拉起 logicserver 启动验证, 失败输出错误日志"

    OPTIONS = (
        Option("instance_root", "实例根目录", "string",
               default_from="service.default_instance_root"),
        Option("instance", "验证实例", "string",
               default_from="service.default_validate_instance"),
        Option("exe_dir", "可执行文件目录", "string",
               default_from="service.default_validate_exe_dir"),
        Option("timeout", "启动超时 (秒)", "int",
               default_from="service.validate_timeout"),
        Option("show_lines", "失败时显示日志行数", "int",
               default_from="service.validate_show_lines"),
        Option("keep_workdir", "保留验证临时目录", "bool",
               default_from="service.validate_keep_workdir"),
    )

    def Run(self, context, options):
        return ValidateConfigRunner(context, options).Run()


class ValidateConfigRunner(object):
    """配置验证流程"""

    def __init__(self, context, options):
        self.m_context = context
        self.m_settings = context.settings
        self.m_console = context.console
        self.m_options = options
        self.m_process = None
        self.m_reader = None
        self.m_work_dir = ""
        self.m_log_path = ""
        self.m_output = deque(maxlen=OUTPUT_MAX_LINES)
        self.m_output_lock = threading.Lock()
        self.m_source_desc = ""

    def Run(self):
        self.m_console.Step("准备隔离验证")
        target = self.PickTarget()
        merged, self.m_source_desc = self.LoadSourceConfig(target)
        ports = FindFreePorts(2)
        self.ApplyOverrides(merged, ports)

        self.CheckStaticFiles()
        self.PrepareWorkDir(target)
        try:
            self.PrepareRuntime()
            self.LinkResources()
            self.WriteValidationConfig(merged)
            self.m_console.Line("  配置来源: %s" % self.m_source_desc)
            self.m_console.Line(
                "  隔离端口: ListenPort=%d BattleListenPort=%d"
                % (ports[0], ports[1])
            )
            self.m_console.Line("  临时目录: %s" % self.m_work_dir)

            self.StartProcess()
            success, reason = self.WaitResult()
            if success:
                self.m_console.Success("  [OK] 配置验证通过: 配置加载, 模块启动与 Lua 初始化正常")
                return 0

            self.m_console.Error("  [FAIL] 配置验证失败: %s" % reason)
            self.StopProcess()
            self.PrintFailureLogs()
            raise ModuleError("配置验证失败: %s" % reason)
        finally:
            self.StopProcess()
            self.CleanupWorkDir()

    def PickTarget(self):
        """按名称挑选验证实例, 未指定时选第一个逻辑服"""
        names = []
        targets, _root, _blueprint = LoadTargets(
            self.m_settings, self.m_options["instance_root"]
        )
        for target in targets:
            if SERVER_LOGIC in target.services:
                names.append(target.name)

        raw_name = str(self.m_options["instance"] or "").strip()
        if raw_name:
            for target in targets:
                if target.name == raw_name:
                    if SERVER_LOGIC not in target.services:
                        raise ModuleError("实例 %s 没有 logicserver, 不能做配置验证" % raw_name)
                    return target
            raise ModuleError(
                "找不到实例 %s (可验证实例: %s)" % (raw_name, ", ".join(names) or "无")
            )

        for target in targets:
            if SERVER_LOGIC in target.services:
                return target
        raise ModuleError("实例清单里没有包含 logicserver 的实例")

    def LoadSourceConfig(self, target):
        """读取实例生效配置; 实例目录不存在时按实例清单生成"""
        instance_config = os.path.join(target.path, "config", "config.json")
        if os.path.isfile(instance_config):
            return LoadConfigTree(instance_config), instance_config

        blueprint = LoadBlueprint(self.m_settings)
        from . import deploy

        blueprint_errors = deploy.validate_blueprint(blueprint)
        if blueprint_errors:
            raise ModuleError(
                "实例清单配置错误:\n  " + "\n  ".join(blueprint_errors)
            )

        node = None
        for item in blueprint["nodes"]:
            if item.get("name") == target.name:
                node = item
                break
        if node is None:
            raise ModuleError("实例清单里找不到节点: %s" % target.name)

        # 复用部署模块的配置生成逻辑, 避免两处规则漂移
        deploy.ConfigurePaths(self.m_settings)
        base = ReadJson(self.m_settings.Path("paths.baseconfig", must_exist=True))
        if not isinstance(base, dict):
            raise ModuleError("公共配置根节点必须是对象")
        overlay = deploy.build_instance_config(node, blueprint, copy.deepcopy(base))
        overlay.pop("extends", None)
        merged = MergeJson(copy.deepcopy(base), overlay)
        return merged, "%s (实例未部署, 由实例清单 + 公共配置生成)" % target.name

    def ApplyOverrides(self, merged, ports):
        """替换成隔离端口并关闭集群/分区, 避免影响现有服务"""
        logic = merged.get("logicserver")
        if not isinstance(logic, dict):
            raise ModuleError("配置缺少 logicserver 节点")
        logic["ListenPort"] = ports[0]
        logic["BattleListenPort"] = ports[1]
        logic["LuaScriptDir"] = "luascript"

        plugin = merged.get("plugin")
        if isinstance(plugin, dict):
            cluster = plugin.get("cluster")
            if isinstance(cluster, dict):
                cluster["enabled"] = False
                cluster["listen_port"] = 0
                cluster["peers"] = []
            zone = plugin.get("zone")
            if isinstance(zone, dict):
                zone["enabled"] = False
                zone["zones"] = []

    def CheckStaticFiles(self):
        """启动前先做静态检查, 常见的 JSON 错误直接指出文件"""
        self.m_logic_config_dir = self.m_settings.Path(
            "paths.logic_config_dir", must_exist=True
        )
        self.m_luascript_dir = self.m_settings.Path(
            "paths.luascript_dir", must_exist=True
        )
        self.m_exe_dir = ResolvePathFromRoot(
            self.m_settings, self.m_options["exe_dir"]
        )
        self.m_exe_path = self.FindExecutable(self.m_exe_dir, "logicserver")
        if not os.path.isfile(self.m_exe_path):
            raise ModuleError(
                "找不到 logicserver 可执行文件: %s\n"
                "  请先编译, 或在 config/script/config.json 的 "
                "service.default_validate_exe_dir 配置可执行文件目录"
                % self.m_exe_path
            )

        count = 0
        for root, _dirs, files in os.walk(self.m_logic_config_dir):
            for name in sorted(files):
                if not name.lower().endswith(".json"):
                    continue
                ReadJson(os.path.join(root, name))
                count += 1
        self.m_console.Line(
            "  [OK] 配置 JSON: %s (%d 个文件)" % (self.m_logic_config_dir, count)
        )

    def FindExecutable(self, folder, name):
        """按平台查找可执行文件"""
        candidates = [os.path.join(folder, name + ".exe"), os.path.join(folder, name)]
        if not IS_WINDOWS:
            candidates.reverse()
        for candidate in candidates:
            if os.path.isfile(candidate):
                return candidate
        return candidates[0]

    def PrepareWorkDir(self, target):
        """创建独立验证目录, 不占用实例目录"""
        work_root = ResolvePathFromRoot(
            self.m_settings, self.m_settings.Require("service.validate_work_root")
        )
        stamp = time.strftime("%Y%m%d_%H%M%S")
        name = "%s_%s_%d" % (target.name, stamp, os.getpid())
        self.m_work_dir = os.path.join(work_root, name)
        RemoveLinkAware(self.m_work_dir)
        os.makedirs(self.m_work_dir, exist_ok=True)
        self.m_log_path = os.path.join(
            self.m_work_dir, "log", "logicserver", "server.log"
        )

    def PrepareRuntime(self):
        """复制可执行文件与运行库到临时目录"""
        self.CopyOrLink(self.m_exe_path, os.path.join(
            self.m_work_dir, os.path.basename(self.m_exe_path)
        ))

        # 实例目录里可能还有随 exe 一起部署的运行库
        for name in sorted(os.listdir(self.m_exe_dir)):
            src = os.path.join(self.m_exe_dir, name)
            if os.path.isfile(src) and IsRuntimeLib(name):
                self.CopyOrLink(src, os.path.join(self.m_work_dir, name))

        runtime_lib_dir = self.m_settings.Path("paths.runtime_lib_dir", must_exist=True)
        for src in RuntimeLibFiles(runtime_lib_dir):
            self.CopyOrLink(src, os.path.join(self.m_work_dir, os.path.basename(src)))

    def CopyOrLink(self, src, dst):
        """优先硬链接/符号链接, 失败再复制"""
        if os.path.exists(dst):
            return
        if LinkFile(src, dst):
            return
        try:
            shutil.copy2(src, dst)
        except OSError as error:
            raise ModuleError("复制运行文件失败: %s -> %s (%s)" % (src, dst, error)) from error

    def LinkResources(self):
        """链接配置目录与 Lua 目录, 不复制大目录"""
        self.LinkResource(
            self.m_logic_config_dir,
            os.path.join(self.m_work_dir, "config", "logicconfig"),
        )
        self.LinkResource(
            self.m_luascript_dir,
            os.path.join(self.m_work_dir, "luascript"),
        )

    def LinkResource(self, src, dst):
        """目录优先使用 junction/符号链接, 失败再复制"""
        if LinkDir(src, dst):
            return
        try:
            shutil.copytree(src, dst)
        except OSError as error:
            raise ModuleError("链接资源目录失败: %s -> %s (%s)" % (src, dst, error)) from error

    def WriteValidationConfig(self, merged):
        """写入展开后的验证配置"""
        config_path = os.path.join(self.m_work_dir, "config", "config.json")
        write_json(config_path, merged)

    def StartProcess(self):
        """启动独立 logicserver 进程"""
        command = [os.path.join(self.m_work_dir, os.path.basename(self.m_exe_path))]
        env = os.environ.copy()
        env["PATH"] = self.m_work_dir + os.pathsep + env.get("PATH", "")

        popen_kwargs = {
            "cwd": self.m_work_dir,
            "env": env,
            "stdin": subprocess.DEVNULL,
            "stdout": subprocess.PIPE,
            "stderr": subprocess.STDOUT,
            "text": True,
            "encoding": "utf-8",
            "errors": "replace",
            "bufsize": 1,
        }
        if IS_WINDOWS:
            # 不创建新窗口, 避免验证时弹黑框
            popen_kwargs["creationflags"] = CREATE_NO_WINDOW
        else:
            popen_kwargs["start_new_session"] = True

        try:
            self.m_process = subprocess.Popen(command, **popen_kwargs)
        except OSError as error:
            raise ModuleError("启动 logicserver 失败: %s (%s)" % (command[0], error)) from error

        self.m_reader = threading.Thread(target=self.ReadOutput, daemon=True)
        self.m_reader.start()

    def ReadOutput(self):
        """后台收集进程标准输出"""
        process = self.m_process
        if process is None or process.stdout is None:
            return
        try:
            for line in process.stdout:
                self.AppendOutput(line)
        except (OSError, ValueError):
            return

    def AppendOutput(self, line):
        text = StripAnsi(line.rstrip("\r\n"))
        if not text:
            return
        with self.m_output_lock:
            self.m_output.append(text)

    def WaitResult(self):
        """等待启动结果, 返回 (是否成功, 原因)"""
        timeout = max(int(self.m_options["timeout"]), 1)
        deadline = time.time() + timeout
        while time.time() < deadline:
            text = self.CombinedText()
            failure = self.FindFailure(text)
            if failure:
                return False, failure

            if self.IsSuccess(text):
                return True, ""

            returncode = self.m_process.poll()
            if returncode is not None:
                time.sleep(0.3)
                text = self.CombinedText()
                failure = self.FindFailure(text)
                if failure:
                    return False, failure
                if self.IsSuccess(text):
                    return True, ""
                return False, "logicserver 提前退出, 退出码 %s" % returncode
            time.sleep(POLL_INTERVAL)

        return False, "等待启动超时 (%d 秒)" % timeout

    def IsSuccess(self, text):
        """配置加载, 模块启动和 Lua 初始化都完成才算成功"""
        for marker in CONFIG_READY_MARKERS:
            if marker not in text:
                return False
        for marker in LUA_DONE_MARKERS:
            if marker in text:
                return True
        return False

    def FindFailure(self, text):
        """返回命中的失败关键字"""
        for marker in FAILURE_MARKERS:
            if marker in text:
                return marker
        for line in text.splitlines():
            if "[F]" in line:
                return "出现 FATAL 日志"
        return ""

    def CombinedText(self):
        """合并标准输出与日志文件内容, 供状态匹配"""
        with self.m_output_lock:
            stdout_text = "\n".join(self.m_output)
        return stdout_text + "\n" + self.ReadLogFile()

    def ReadLogFile(self):
        """读取 logicserver 日志文件.

        日志按天轮转后文件名为 serverYYYYMMDD.log, 因此要在日志目录里查找,
        兼容非 Windows 平台没有控制台输出的情况.
        """
        if not self.m_work_dir:
            return ""
        log_dir = os.path.join(self.m_work_dir, "log", "logicserver")
        paths = []
        if self.m_log_path and os.path.isfile(self.m_log_path):
            paths.append(self.m_log_path)
        paths.extend(glob.glob(os.path.join(log_dir, "server*.log")))
        contents = []
        for path in sorted(set(paths), key=self.LogFileTime):
            try:
                with open(path, "r", encoding="utf-8", errors="replace") as handle:
                    contents.append(handle.read())
            except OSError:
                continue
        return StripAnsi("\n".join(contents))

    def LogFileTime(self, path):
        """日志文件修改时间, 文件被清理时按 0 处理"""
        try:
            return os.path.getmtime(path)
        except OSError:
            return 0.0

    def StopProcess(self):
        """关闭验证进程, 确保不留下后台 logicserver"""
        if self.m_process is None:
            return
        if self.m_process.poll() is None:
            self.m_console.Line("  关闭验证进程 (PID: %d) ..." % self.m_process.pid)
            try:
                self.m_process.terminate()
            except OSError:
                pass
            try:
                self.m_process.wait(timeout=STOP_WAIT_SECONDS)
            except subprocess.TimeoutExpired:
                self.KillProcessTree()
                try:
                    self.m_process.wait(timeout=2.0)
                except subprocess.TimeoutExpired:
                    pass

        if self.m_reader is not None:
            self.m_reader.join(timeout=1.0)
            self.m_reader = None
        if self.m_process is not None and self.m_process.stdout is not None:
            try:
                self.m_process.stdout.close()
            except OSError:
                pass
        self.m_process = None

    def KillProcessTree(self):
        """超时后强杀整棵进程树"""
        if self.m_process is None:
            return
        if IS_WINDOWS:
            try:
                subprocess.run(
                    ["taskkill", "/F", "/T", "/PID", str(self.m_process.pid)],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    check=False,
                )
            except OSError:
                pass
            return
        try:
            os.killpg(self.m_process.pid, 9)
        except OSError:
            try:
                self.m_process.kill()
            except OSError:
                pass

    def PrintFailureLogs(self):
        """输出关键错误行和日志末尾"""
        text = self.CombinedText()
        lines = [line for line in text.splitlines() if line.strip()]
        if not lines:
            self.m_console.Warn("  没有可显示的启动日志")
            return

        error_lines = [
            line for line in lines
            if any(marker in line for marker in FAILURE_MARKERS) or "[F]" in line
        ]
        if error_lines:
            self.m_console.Step("错误日志")
            for line in error_lines[-20:]:
                self.m_console.Line("    " + line)

        show_lines = max(int(self.m_options["show_lines"]), 1)
        self.m_console.Step("日志末尾")
        for line in lines[-show_lines:]:
            self.m_console.Line("    " + line)

    def CleanupWorkDir(self):
        """清理临时目录, 链接目标不会被删除"""
        if not self.m_work_dir or not os.path.exists(self.m_work_dir):
            return
        if bool(self.m_options["keep_workdir"]):
            self.m_console.Warn("  已保留验证临时目录: %s" % self.m_work_dir)
            return
        try:
            RemoveLinkAware(self.m_work_dir)
        except OSError as error:
            self.m_console.Warn("  清理验证临时目录失败: %s (%s)" % (self.m_work_dir, error))
