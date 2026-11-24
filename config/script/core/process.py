#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""受管子进程与 pid 文件.

启服模块和停服模块共用这里的进程探测与停止逻辑:
    pid 文件防止重复启动
    Windows 用 OpenProcess 避免进程号复用误判
    POSIX 优先对整个进程组发信号, 覆盖派生子进程
"""

import ctypes
import os
import signal
import subprocess
import time

from .console import Console
from .platform_utils import (
    CREATE_NEW_PROCESS_GROUP,
    DETACHED_PROCESS,
    IS_WINDOWS,
    RunHidden,
)

# Windows 进程查询常量
WINDOWS_CTRL_C_EVENT = 0
WINDOWS_STILL_ACTIVE = 259
WINDOWS_PROCESS_QUERY_LIMITED_INFORMATION = 0x1000

# 等待与强杀参数
FORCE_KILL_WAIT = 5.0
EXIT_WAIT_INTERVAL = 0.1


def PidFilePath(runlog_dir, name):
    return os.path.join(runlog_dir, name + ".pid")


def ReadPidFile(runlog_dir, name):
    """读取 pid 文件, 内容非法时返回 None"""
    try:
        with open(PidFilePath(runlog_dir, name), "r", encoding="utf-8") as handle:
            return int(handle.read().strip())
    except (OSError, ValueError):
        return None


def WritePidFile(runlog_dir, name, pid):
    try:
        with open(PidFilePath(runlog_dir, name), "w", encoding="utf-8") as handle:
            handle.write(str(pid))
    except OSError:
        pass


def RemovePidFile(runlog_dir, name):
    try:
        os.remove(PidFilePath(runlog_dir, name))
    except OSError:
        pass


def _IsPosixZombie(pid):
    """Linux: 进程已退出但父进程未回收时 /proc 状态为 Z, 不能当成存活"""
    try:
        with open("/proc/%d/stat" % pid, "r", encoding="utf-8", errors="replace") as handle:
            content = handle.read()
    except (OSError, ValueError):
        return False
    # comm 字段可能包含空格和括号, 状态字段在最后一个 ')' 之后
    parts = content.rsplit(")", 1)
    if len(parts) != 2:
        return False
    fields = parts[1].split()
    return len(fields) > 0 and fields[0] == "Z"


def IsPidAlive(pid):
    """判断 pid 是否存活, Windows 使用 OpenProcess 避免进程号复用"""
    if not pid or pid <= 0:
        return False

    if IS_WINDOWS:
        try:
            kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
        except (AttributeError, OSError):
            return False
        handle = kernel32.OpenProcess(WINDOWS_PROCESS_QUERY_LIMITED_INFORMATION, False, pid)
        if not handle:
            return False
        try:
            exit_code = ctypes.c_ulong()
            if not kernel32.GetExitCodeProcess(handle, ctypes.byref(exit_code)):
                return False
            return exit_code.value == WINDOWS_STILL_ACTIVE
        finally:
            kernel32.CloseHandle(handle)

    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    except OSError:
        return False
    # 僵尸进程 kill(0) 仍然成功, 但实际已经退出, 必须排除
    if _IsPosixZombie(pid):
        return False
    return True


def PidMatchesExecutable(pid, exe_path):
    """确认 pid 确实是目标可执行文件, 拿不到命令行时按匹配处理"""
    if IS_WINDOWS or not exe_path:
        return True
    try:
        result = subprocess.run(
            ["ps", "-p", str(pid), "-o", "command="],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            check=False,
        )
    except OSError:
        return True
    command = result.stdout.decode("utf-8", errors="replace")
    return os.path.basename(exe_path) in command


def ExecutablePath(exe_dir, name):
    """可执行文件路径, Windows 带 .exe 后缀"""
    candidates = [os.path.join(exe_dir, name + ".exe"), os.path.join(exe_dir, name)]
    if not IS_WINDOWS:
        candidates.reverse()
    for candidate in candidates:
        if os.path.isfile(candidate):
            return candidate
    return candidates[0]


def SendConsoleCtrlC():
    """Windows: 向当前控制台的所有进程广播 Ctrl+C

    子进程与脚本共享控制台, 广播后服务端信号处理函数会走自己的退出流程.
    """
    if not IS_WINDOWS:
        return False
    try:
        kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
    except (AttributeError, OSError):
        return False

    previous_handler = None
    try:
        previous_handler = signal.getsignal(signal.SIGINT)
        signal.signal(signal.SIGINT, signal.SIG_IGN)
    except (ValueError, OSError):
        previous_handler = None

    try:
        return bool(kernel32.GenerateConsoleCtrlEvent(WINDOWS_CTRL_C_EVENT, 0))
    except (AttributeError, OSError):
        return False
    finally:
        # 控制台事件异步派发, 等一小会儿再恢复 SIGINT, 避免广播打到脚本自己
        time.sleep(0.3)
        if previous_handler is not None:
            try:
                signal.signal(signal.SIGINT, previous_handler)
            except (ValueError, OSError):
                pass


class ManagedProcess(object):
    """一个受管子进程, 负责启动, 日志重定向, 停止与强杀"""

    def __init__(self, name, argv, working_dir, log_path, reuse_pid=None,
                 env=None, detached=False, console=None):
        self.m_name = name
        self.m_argv = argv
        self.m_working_dir = working_dir
        self.m_log_path = log_path
        self.m_env = env
        self.m_detached = detached
        self.m_console = console or Console()
        self.m_process = None
        self.m_pid = reuse_pid
        # 复用上一轮已在运行的进程, 它不在本脚本进程组里, 只能对单个 pid 发信号
        self.m_reused = reuse_pid is not None
        self.m_log_handle = None

    @property
    def pid(self):
        return self.m_pid

    def Start(self):
        """启动子进程, 标准输出与错误重定向到日志文件"""
        if self.m_reused:
            return self.m_pid

        self.m_log_handle = open(self.m_log_path, "wb")
        popen_kwargs = {
            "cwd": self.m_working_dir,
            "stdin": subprocess.DEVNULL,
            "stdout": self.m_log_handle,
            "stderr": subprocess.STDOUT,
        }
        if self.m_env:
            popen_kwargs["env"] = self.m_env
        if IS_WINDOWS:
            if self.m_detached:
                # 后台模式: 脱离控制台, 主窗口关闭后继续运行
                popen_kwargs["creationflags"] = DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP
            else:
                # 子进程共享控制台, 键盘 Ctrl+C 能直接送达
                popen_kwargs["creationflags"] = 0
        else:
            # 独立会话: 子进程不直接收终端 SIGINT, 由脚本按顺序统一发信号
            popen_kwargs["start_new_session"] = True

        self.m_process = subprocess.Popen(self.m_argv, **popen_kwargs)
        self.m_pid = self.m_process.pid
        return self.m_pid

    def IsAlive(self):
        if self.m_process is not None:
            return self.m_process.poll() is None
        return IsPidAlive(self.m_pid)

    def BeginStop(self):
        """发起优雅停止, 返回是否仍有存活进程需要等待

        先批量对所有进程调用本方法, 再逐个 Stop(send_signal=False),
        可以让多个服务并行走退出流程, 避免串行等待叠加.
        """
        if not self.IsAlive():
            self.Release()
            return False

        self.m_console.Line("  停止 %s (PID: %d) ..." % (self.m_name, self.m_pid))
        self.RequestStop()
        return True

    def Stop(self, timeout, send_signal=True):
        """停止进程, 超时强杀, 返回最终是否已退出"""
        if send_signal:
            if not self.BeginStop():
                return True
        elif not self.IsAlive():
            self.Release()
            return True

        if self.WaitExit(timeout):
            self.Release()
            return True

        self.m_console.Warn("  警告: %s 未在 %.0f 秒内退出, 强制结束" % (self.m_name, timeout))
        self.ForceKill()
        exited = self.WaitExit(FORCE_KILL_WAIT)
        self.Release()
        return exited

    def RequestStop(self):
        """请求退出: POSIX 发 SIGTERM, Windows 由控制台广播覆盖"""
        if IS_WINDOWS or not self.m_pid:
            return
        self.SignalTarget(signal.SIGTERM)

    def ForceKill(self):
        """强杀: Windows 结束整棵进程树, POSIX 发 SIGKILL"""
        if not self.m_pid:
            return
        if IS_WINDOWS:
            try:
                # 用 RunHidden 避免无控制台的 GUI 模式下闪窗口
                RunHidden(["taskkill", "/F", "/T", "/PID", str(self.m_pid)])
            except OSError:
                pass
            return
        self.SignalTarget(signal.SIGKILL)
        # 进程组信号可能因为进程已脱离原进程组而漏掉, 再对单 pid 补一次
        if IsPidAlive(self.m_pid):
            try:
                os.kill(self.m_pid, signal.SIGKILL)
            except (ProcessLookupError, OSError):
                pass

    def SignalTarget(self, signal_value):
        """优先对整个进程组发信号, 拿不到安全的进程组时只打单个 pid"""
        process_group = self.SafeProcessGroup()
        if process_group is not None:
            try:
                os.killpg(process_group, signal_value)
                return
            except (ProcessLookupError, OSError):
                pass
        try:
            os.kill(self.m_pid, signal_value)
        except (ProcessLookupError, OSError):
            pass

    def SafeProcessGroup(self):
        """本脚本启动的进程自成会话; 复用进程只有自成进程组时才敢整组发信号"""
        if not self.m_pid:
            return None
        if not self.m_reused:
            return self.m_pid
        try:
            process_group = os.getpgid(self.m_pid)
            own_group = os.getpgid(0)
        except OSError:
            return None
        if process_group == self.m_pid and process_group != own_group:
            return process_group
        return None

    def WaitExit(self, timeout):
        """等待进程退出, 超时返回 False"""
        deadline = time.time() + max(timeout, 0.0)
        while time.time() < deadline:
            if not self.IsAlive():
                return True
            time.sleep(EXIT_WAIT_INTERVAL)
        return not self.IsAlive()

    def Release(self):
        """回收日志句柄与进程状态, pid 文件由调用方删除"""
        if self.m_process is not None:
            try:
                self.m_process.poll()
            except OSError:
                pass
        if self.m_log_handle is not None:
            try:
                self.m_log_handle.close()
            except OSError:
                pass
            self.m_log_handle = None
