"""服务端进程采样

psutil 在 Windows 上遍历全部进程要逐个开句柄, 期间长时间持有 GIL, 会卡住界面。
所以:
    1. Windows 用 CreateToolhelp32Snapshot 一次拿到所有进程名(极快)
    2. 只对匹配到的目标进程用 psutil 取 CPU/内存
    3. 采样放后台线程, GUI 只读缓存
"""

import ctypes
import os
import threading
from ctypes import wintypes

DEFAULT_PROCESS_NAMES = ["logicserver", "gatewayserver", "dbserver"]
# 采样间隔(秒)
SAMPLE_INTERVAL = 2.0

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    psutil = None
    HAS_PSUTIL = False

# ---------------- Windows 快速枚举 ----------------

TH32CS_SNAPPROCESS = 0x00000002
INVALID_HANDLE_VALUE = ctypes.c_void_p(-1).value


class _ProcessEntry32(ctypes.Structure):
    _fields_ = [
        ("dwSize", wintypes.DWORD),
        ("cntUsage", wintypes.DWORD),
        ("th32ProcessID", wintypes.DWORD),
        ("th32DefaultHeapID", ctypes.POINTER(ctypes.c_ulong)),
        ("th32ModuleID", wintypes.DWORD),
        ("cntThreads", wintypes.DWORD),
        ("th32ParentProcessID", wintypes.DWORD),
        ("pcPriClassBase", ctypes.c_long),
        ("dwFlags", wintypes.DWORD),
        ("szExeFile", ctypes.c_char * 260),
    ]


def _list_process_names_windows():
    """返回 {pid: 小写进程名}, 失败时返回空字典"""
    kernel32 = ctypes.windll.kernel32
    snapshot = kernel32.CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0)
    if snapshot == INVALID_HANDLE_VALUE:
        return {}

    result = {}
    try:
        entry = _ProcessEntry32()
        entry.dwSize = ctypes.sizeof(_ProcessEntry32)
        if not kernel32.Process32First(snapshot, ctypes.byref(entry)):
            return result
        while True:
            name = entry.szExeFile.decode("mbcs", errors="ignore").lower()
            result[entry.th32ProcessID] = name
            if not kernel32.Process32Next(snapshot, ctypes.byref(entry)):
                break
    finally:
        kernel32.CloseHandle(snapshot)
    return result


def _list_process_names_psutil():
    """非 Windows 平台的回退实现"""
    result = {}
    try:
        for process in psutil.process_iter(["name"]):
            try:
                result[process.pid] = (process.info.get("name") or "").lower()
            except Exception:
                continue
    except Exception:
        return {}
    return result


class ProcessMonitor:
    """后台线程采样的进程监控"""

    def __init__(self, names=None, interval=SAMPLE_INTERVAL):
        self.names = [name.lower() for name in (names or DEFAULT_PROCESS_NAMES)]
        self.interval = interval

        self._lock = threading.Lock()
        self._latest = {}
        self._thread = None
        self._stop = threading.Event()
        # psutil 的 cpu_percent 依赖同一个 Process 实例的上一次采样, 所以要复用实例
        self._process_cache = {}

    def start(self):
        """启动后台采样, 重复调用无副作用"""
        if not HAS_PSUTIL or self._thread is not None:
            return
        self._thread = threading.Thread(target=self._loop, name="process-monitor", daemon=True)
        self._thread.start()

    def stop(self):
        self._stop.set()
        self._thread = None

    def latest(self):
        """返回最近一次采样结果, 不阻塞"""
        with self._lock:
            return dict(self._latest)

    # ---------------- 后台线程 ----------------

    def _loop(self):
        self._sample_once()     # 预热一次 cpu_percent 基线
        while not self._stop.wait(self.interval):
            self._sample_once()

    def _get_process(self, pid):
        """复用 Process 实例, 否则 cpu_percent 永远是 0"""
        process = self._process_cache.get(pid)
        if process is not None and process.is_running():
            return process
        try:
            process = psutil.Process(pid)
        except Exception:
            return None
        self._process_cache[pid] = process
        return process

    def _sample_once(self):
        if os.name == "nt":
            process_names = _list_process_names_windows()
        else:
            process_names = _list_process_names_psutil()

        result = {}
        seen_pids = set()
        for pid, process_name in process_names.items():
            for name in self.names:
                if not process_name.startswith(name):
                    continue
                seen_pids.add(pid)
                item = result.setdefault(name, {"count": 0, "cpu": 0.0, "mem_mb": 0.0})
                item["count"] += 1
                process = self._get_process(pid)
                if process is not None:
                    try:
                        item["cpu"] += process.cpu_percent()
                        item["mem_mb"] += process.memory_info().rss / (1024.0 * 1024.0)
                    except Exception:
                        pass    # 进程刚退出或没权限
                break

        # 清理已经退出的进程
        for pid in list(self._process_cache):
            if pid not in seen_pids:
                self._process_cache.pop(pid, None)

        with self._lock:
            self._latest = result
