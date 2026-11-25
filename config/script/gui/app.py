#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Windows Tkinter GUI.

入口在 Windows 且检测到可用 GUI 时加载本模块.
GUI 与命令行共用同一套 Module / Option 定义, 新增模块会自动出现在左侧列表.
"""

import json
import os
import queue
import subprocess
import sys
import threading
import traceback

from ..core.console import COLOR_BLUE, COLOR_GREEN, COLOR_RED, COLOR_YELLOW, StripAnsi
from ..core.errors import ScriptError
from ..core.menu import Module, PersistOptionValues  # noqa: F401
from ..core.platform_utils import (
    CREATE_NEW_CONSOLE,
    ConsolePythonExecutable,
    EnableDpiAwareness,
    HideOwnConsoleWindow,
    OpenPath,
)
from ..core.theme import THEMES, ApplyTkTheme, GetTheme, ThemeListbox, ThemeText
from .widgets import Checkbox, MultiChoiceBox, ShortHelp, ToolTip

# 默认窗口尺寸与最小尺寸, 启动时保持原有比例
DEFAULT_WINDOW_WIDTH = 1120
DEFAULT_WINDOW_HEIGHT = 720
DEFAULT_MIN_WIDTH = 760
DEFAULT_MIN_HEIGHT = 480

# 预留标题栏与任务栏, 避免初始窗口超出屏幕后边框拖不到
SCREEN_MARGIN_WIDTH = 32
SCREEN_MARGIN_HEIGHT = 96

# 屏幕再小也保留的最小可用尺寸
WINDOW_FLOOR_WIDTH = 480
WINDOW_FLOOR_HEIGHT = 360

# 分隔条宽度与最小可拖范围
SPLITTER_WIDTH = 6
SPLITTER_MIN_LEFT = 180
SPLITTER_MIN_RIGHT = 480
SPLITTER_MIN_OPTIONS = 120
SPLITTER_MIN_LOG = 80

# 固定参数行的上下间距, 尽量紧凑
PARAM_ROW_PADDING = 1

# 服务器列表区域最小可见高度
LIST_MIN_HEIGHT = 90

# 窗口停止缩放多久后重新校准列表区域
LIST_SETTLE_DELAY = 120


def ScreenMargin(root):
    """标题栏与任务栏的预留尺寸, 按 DPI 缩放换算"""
    scale = float(root.tk.call("tk", "scaling")) / (96.0 / 72.0)
    return int(SCREEN_MARGIN_WIDTH * scale), int(SCREEN_MARGIN_HEIGHT * scale)


def InitialWindowSize(root):
    """计算初始窗口尺寸与最小尺寸, 屏幕放不下时收窄到可见区域

    返回 (宽, 高, 最小宽, 最小高)
    """
    margin_width, margin_height = ScreenMargin(root)
    max_width = max(root.winfo_screenwidth() - margin_width, WINDOW_FLOOR_WIDTH)
    max_height = max(root.winfo_screenheight() - margin_height, WINDOW_FLOOR_HEIGHT)
    width = min(DEFAULT_WINDOW_WIDTH, max_width)
    height = min(DEFAULT_WINDOW_HEIGHT, max_height)
    return width, height, min(DEFAULT_MIN_WIDTH, width), min(DEFAULT_MIN_HEIGHT, height)


class GuiConsole(object):
    """把 Console 接口接到 Tkinter 日志区"""

    def __init__(self, root, text_widget):
        self.m_root = root
        self.m_text = text_widget
        self.m_queue = queue.Queue()

    def Write(self, text):
        """非线程安全, 只负责入队, 由主线程刷新"""
        if text:
            self.m_queue.put((StripAnsi(text), None))

    def Line(self, message="", color=None):
        tag = self._tag_for_color(color)
        self.m_queue.put((StripAnsi(message) + "\n", tag))

    def Plain(self, message=""):
        self.Line(message)

    def Success(self, message=""):
        self.Line(message, COLOR_GREEN)

    def Warn(self, message=""):
        self.Line(message, COLOR_YELLOW)

    def Error(self, message=""):
        self.Line(message, COLOR_RED)

    def Info(self, message=""):
        self.Line(message, COLOR_BLUE)

    def Title(self, message):
        self.Line()
        self.Line("=" * 64, COLOR_BLUE)
        self.Line(message, COLOR_BLUE)
        self.Line("=" * 64, COLOR_BLUE)

    def Step(self, message):
        self.Line()
        self.Line("[*] %s" % message, COLOR_GREEN)

    def Ask(self, prompt, default=""):
        from tkinter import simpledialog

        value = self._call_on_main(
            lambda: simpledialog.askstring(
                "输入", prompt, initialvalue=default, parent=self.m_root
            )
        )
        if value is None:
            return default
        value = value.strip()
        return default if value == "" else value

    def AskSecret(self, prompt):
        """密码输入, 用掩码输入框; 返回 None 表示取消, 空字符串表示空密码"""
        from tkinter import simpledialog

        value = self._call_on_main(
            lambda: simpledialog.askstring(
                "输入", prompt, show="*", parent=self.m_root
            )
        )
        if value is None:
            return None
        return value.strip()

    def Confirm(self, prompt, default=False):
        from tkinter import messagebox

        value = self._call_on_main(
            lambda: messagebox.askyesno("确认", prompt, parent=self.m_root)
        )
        return bool(default if value is None else value)

    def Choose(self, prompt, items, default_value=None):
        from tkinter import simpledialog

        default_index = 1
        lines = [prompt]
        for index, item in enumerate(items, start=1):
            label, value = item
            mark = "*" if value == default_value else " "
            lines.append("%s %d. %s" % (mark, index, label))
            if value == default_value:
                default_index = index

        raw = self._call_on_main(
            lambda: simpledialog.askstring(
                "请选择", "\n".join(lines), initialvalue=str(default_index),
                parent=self.m_root,
            )
        )
        if raw is None or raw.strip() == "":
            return items[default_index - 1][1]
        try:
            choice = int(raw.strip())
        except ValueError:
            raise ScriptError("请输入列表中的数字")
        if choice < 1 or choice > len(items):
            raise ScriptError("选择超出范围: %s" % raw)
        return items[choice - 1][1]

    def Pause(self, prompt="按 Enter 继续..."):
        """GUI 不需要暂停"""
        return

    def SetTitle(self, title):
        self._call_on_main(lambda: self.m_root.title(title))

    def Drain(self):
        """主线程定时把队列内容写入日志区"""
        lines = []
        while True:
            try:
                lines.append(self.m_queue.get_nowait())
            except queue.Empty:
                break
        if not lines:
            return
        self.m_text.configure(state="normal")
        for text, tag in lines:
            if tag:
                self.m_text.insert("end", text, tag)
            else:
                self.m_text.insert("end", text)
        self.m_text.see("end")
        self.m_text.configure(state="disabled")

    def _tag_for_color(self, color):
        if color == COLOR_RED:
            return "error"
        if color == COLOR_YELLOW:
            return "warn"
        if color == COLOR_GREEN:
            return "ok"
        if color == COLOR_BLUE:
            return "info"
        return None

    def _call_on_main(self, func):
        """从工作线程切换到主线程执行对话框"""
        done = threading.Event()
        box = {}

        def wrapper():
            try:
                box["value"] = func()
            except BaseException as error:  # noqa: BLE001
                box["error"] = error
            finally:
                done.set()

        try:
            self.m_root.after(0, wrapper)
        except Exception:  # noqa: BLE001
            return None
        done.wait()
        if "error" in box:
            raise box["error"]
        return box.get("value")


class TeeStream(object):
    """把模块里的 print 输出转发到 GUI 日志区"""

    def __init__(self, console):
        self.m_console = console

    def write(self, text):
        self.m_console.Write(text)
        return len(text)

    def flush(self):
        return

    def isatty(self):
        return False


class ToolWindow(object):
    """主窗口"""

    def __init__(self, root, context, modules):
        import tkinter as tk
        from tkinter import scrolledtext, ttk

        self.m_tk = tk
        self.m_ttk = ttk
        self.m_root = root
        self.m_context = context
        self.m_modules = modules
        self.m_current = None
        self.m_option_widgets = []
        self.m_option_cache = {}
        self.m_param_frame = None
        self.m_list_frame = None
        self.m_rebuilding_options = False
        self.m_running = False
        self.m_theme = GetTheme(context.settings)
        self.m_deploy_editor = None
        self.m_list_settle_job = None

        root.title("服务器脚本工具")
        width, height, min_width, min_height = InitialWindowSize(root)
        root.geometry("%dx%d" % (width, height))
        root.minsize(min_width, min_height)
        root.resizable(True, True)
        ApplyTkTheme(root, self.m_theme)

        self.BuildMenu()

        main = ttk.Frame(root, padding=8)
        main.pack(fill="both", expand=True)

        # 左侧模块列表与右侧内容之间用分隔条, 可以拖动调整宽度
        self.m_split_h = tk.PanedWindow(
            main, orient="horizontal",
            sashwidth=SPLITTER_WIDTH, sashrelief="flat",
            sashcursor="sb_h_double_arrow", opaqueresize=True, bd=0,
            background=self.m_theme["border"],
        )
        self.m_split_h.pack(fill="both", expand=True)

        left = ttk.Frame(self.m_split_h, width=280)
        left.pack_propagate(False)
        self.m_split_h.add(left, minsize=SPLITTER_MIN_LEFT, stretch="never")

        ttk.Label(
            left, text="模块",
            font=(self.m_theme["font_family"], self.m_theme["font_size"] + 1, "bold"),
        ).pack(anchor="w")
        self.m_listbox = tk.Listbox(
            left, exportselection=False,
            font=(self.m_theme["font_family"], self.m_theme["module_list_font_size"]),
        )
        ThemeListbox(self.m_listbox, self.m_theme)
        self.m_listbox.pack(fill="both", expand=True, pady=(4, 0))
        self.m_listbox.bind("<<ListboxSelect>>", self.OnSelectModule)
        for index, module in enumerate(self.m_modules, start=1):
            self.m_listbox.insert("end", "%2d. %s" % (index, module.TITLE))

        right = ttk.Frame(self.m_split_h)
        self.m_split_h.add(right, minsize=SPLITTER_MIN_RIGHT, stretch="always")
        right.columnconfigure(0, weight=1)
        right.rowconfigure(2, weight=1)
        self.m_title = ttk.Label(
            right, text="",
            font=(self.m_theme["font_family"], self.m_theme["font_size"] + 2, "bold"),
            foreground=self.m_theme["title_fg"],
        )
        self.m_title.grid(row=0, column=0, sticky="w")

        self.m_desc = ttk.Label(
            right, text="", wraplength=760, justify="left",
            foreground=self.m_theme["muted"],
        )
        self.m_desc.grid(row=1, column=0, sticky="w", pady=(2, 8))

        # 参数区与日志区之间同样用分隔条, 可以拖动调整日志高度
        self.m_split_v = tk.PanedWindow(
            right, orient="vertical",
            sashwidth=SPLITTER_WIDTH, sashrelief="flat",
            sashcursor="sb_v_double_arrow", opaqueresize=True, bd=0,
            background=self.m_theme["border"],
        )
        self.m_split_v.grid(row=2, column=0, sticky="nsew")

        self.m_option_frame = ttk.Frame(self.m_split_v, padding=8)
        log_frame = ttk.LabelFrame(self.m_split_v, text="输出日志", padding=4)
        self.m_split_v.add(self.m_option_frame, minsize=SPLITTER_MIN_OPTIONS, stretch="always")
        self.m_split_v.add(log_frame, minsize=SPLITTER_MIN_LOG, stretch="never")

        self.m_log = scrolledtext.ScrolledText(
            log_frame, height=6, state="disabled",
            font=(self.m_theme["log_font_family"], self.m_theme["log_font_size"]),
        )
        ThemeText(self.m_log, self.m_theme)
        self.m_log.pack(fill="both", expand=True)
        self.m_log.tag_configure("error", foreground=self.m_theme["error"])
        self.m_log.tag_configure("warn", foreground=self.m_theme["warning"])
        self.m_log.tag_configure("ok", foreground=self.m_theme["success"])
        self.m_log.tag_configure("info", foreground=self.m_theme["info"])

        bottom = ttk.Frame(right)
        bottom.grid(row=3, column=0, sticky="ew", pady=(8, 0))
        self.m_run_button = ttk.Button(bottom, text="运行", command=self.RunCurrent)
        self.m_run_button.pack(side="right")
        self.m_clear_button = ttk.Button(bottom, text="清空日志", command=self.ClearLog)
        self.m_clear_button.pack(side="right", padx=(0, 8))
        self.m_status = ttk.Label(bottom, text="就绪", foreground=self.m_theme["muted"])
        self.m_status.pack(side="left")

        self.m_console = GuiConsole(root, self.m_log)
        self.m_context.m_console = self.m_console

        root.protocol("WM_DELETE_WINDOW", self.OnClose)
        root.bind("<Configure>", self.OnWindowConfigure, add="+")
        self.m_listbox.selection_set(0)
        self.OnSelectModule(None)
        self.PollConsole()

    def BuildMenu(self):
        menu_bar = self.m_tk.Menu(self.m_root)
        config_menu = self.m_tk.Menu(menu_bar, tearoff=0)
        config_menu.add_command(label="编辑配置 (JSON)", command=self.OpenConfigEditor)
        config_menu.add_command(label="打开配置文件", command=self.OpenConfigFile)
        config_menu.add_command(label="重新加载配置", command=self.ReloadConfig)
        config_menu.add_separator()
        config_menu.add_command(label="部署配置 (baseconfig / crossconfig)", command=self.OpenDeployConfigEditor)
        config_menu.add_separator()

        theme_menu = self.m_tk.Menu(config_menu, tearoff=0)
        self.m_theme_var = self.m_tk.StringVar(value=self.m_theme["name"])
        for name in sorted(THEMES):
            theme_menu.add_radiobutton(
                label=name,
                variable=self.m_theme_var,
                value=name,
                command=lambda theme_name=name: self.SwitchTheme(theme_name),
            )
        config_menu.add_cascade(label="主题", menu=theme_menu)
        config_menu.add_separator()
        config_menu.add_command(label="退出", command=self.OnClose)
        menu_bar.add_cascade(label="配置", menu=config_menu)

        tools_menu = self.m_tk.Menu(menu_bar, tearoff=0)
        tools_menu.add_command(label="打开命令行模式", command=self.OpenCli)
        menu_bar.add_cascade(label="工具", menu=tools_menu)
        self.m_root.config(menu=menu_bar)

    def CurrentModule(self):
        selection = self.m_listbox.curselection()
        if not selection:
            return None
        index = int(selection[0])
        if 0 <= index < len(self.m_modules):
            return self.m_modules[index]
        return None

    def OnSelectModule(self, _event):
        module = self.CurrentModule()
        if module is None or module is self.m_current:
            return
        # 切换模块前保留当前表单值, 避免回来时恢复默认
        self.CaptureCurrentOptions()
        self.ShowModule(module)

    def ClearLog(self):
        """清空输出日志区"""
        self.m_log.configure(state="normal")
        self.m_log.delete("1.0", "end")
        self.m_log.configure(state="disabled")

    def SwitchTheme(self, theme_name):
        """切换主题并写回 config.json"""
        if theme_name == self.m_theme["name"]:
            return
        try:
            self.m_context.settings.SetValue("ui.theme", theme_name)
            self.m_context.settings.Save()
        except ScriptError as error:
            self.m_console.Error("[错误] 切换主题失败: %s" % error)
            self.m_theme_var.set(self.m_theme["name"])
            return
        self.RefreshTheme()
        self.m_console.Success("主题已切换: %s" % theme_name)

    def RefreshTheme(self):
        """配置里的 ui.* 变化后重新应用主题"""
        self.m_theme = GetTheme(self.m_context.settings)
        if hasattr(self, "m_theme_var"):
            self.m_theme_var.set(self.m_theme["name"])
        ApplyTkTheme(self.m_root, self.m_theme)
        ThemeListbox(self.m_listbox, self.m_theme)
        ThemeText(self.m_log, self.m_theme)
        for split in (self.m_split_h, self.m_split_v):
            split.configure(background=self.m_theme["border"])
        self.m_listbox.configure(
            font=(self.m_theme["font_family"], self.m_theme["module_list_font_size"])
        )
        self.m_log.configure(
            font=(self.m_theme["log_font_family"], self.m_theme["log_font_size"])
        )
        self.m_log.tag_configure("error", foreground=self.m_theme["error"])
        self.m_log.tag_configure("warn", foreground=self.m_theme["warning"])
        self.m_log.tag_configure("ok", foreground=self.m_theme["success"])
        self.m_log.tag_configure("info", foreground=self.m_theme["info"])
        self.m_title.configure(foreground=self.m_theme["title_fg"])
        self.m_desc.configure(foreground=self.m_theme["muted"])
        self.m_status.configure(foreground=self.m_theme["muted"])
        if self.m_current is not None:
            self.ShowModule(self.m_current)

    def ShowModule(self, module):
        self.m_current = module
        self.m_title.configure(text="%s  (%s)" % (module.TITLE, module.ID))
        self.m_desc.configure(text=module.DESCRIPTION)
        self.m_rebuilding_options = True
        try:
            for child in self.m_option_frame.winfo_children():
                child.destroy()
            self.m_option_widgets = []
            self.m_param_frame = None
            self.m_list_frame = None

            if not module.OPTIONS:
                hint = "点击“运行”打开编辑器" if getattr(module, "GUI_EDITOR", "") else "该模块没有参数"
                self.m_ttk.Label(self.m_option_frame, text=hint).pack(anchor="w")
                return

            cached = self.m_option_cache.get(module.ID, {})
            row_options = []
            list_options = []
            for option in module.OPTIONS:
                if self.OptionUsesListArea(option):
                    list_options.append(option)
                else:
                    row_options.append(option)

            # 固定参数固定在最上面, 服务器列表独占下方空间
            self.m_param_frame = self.m_ttk.Frame(self.m_option_frame)
            self.m_param_frame.pack(fill="x", anchor="nw")
            self.m_param_frame.columnconfigure(1, weight=1)
            for row, option in enumerate(row_options):
                self.BuildParamRow(option, cached, row)

            if list_options:
                self.m_list_frame = self.m_ttk.Frame(self.m_option_frame)
                self.m_list_frame.pack(fill="both", expand=True, anchor="nw", pady=(4, 0))
                self.m_list_frame.columnconfigure(0, weight=1)
                for index, option in enumerate(list_options):
                    self.BuildListSection(option, cached, index)
                self.ScheduleListSettle()
        finally:
            self.m_rebuilding_options = False

    def ScheduleListSettle(self):
        """等布局稳定后再检查列表可见高度"""
        if self.m_list_settle_job is not None:
            try:
                self.m_root.after_cancel(self.m_list_settle_job)
            except self.m_tk.TclError:
                pass
        self.m_list_settle_job = self.m_root.after(LIST_SETTLE_DELAY, self.EnsureListVisible)

    def OnWindowConfigure(self, event):
        """窗口尺寸变化后重新确认服务器列表的可见高度"""
        if event.widget is not self.m_root:
            return
        self.ScheduleListSettle()

    def EnsureListVisible(self):
        """列表被日志区挤到看不清时, 把分隔条往上提一点"""
        self.m_list_settle_job = None
        if self.m_list_frame is None or not self.m_list_frame.winfo_exists():
            return
        try:
            total_height = self.m_split_v.winfo_height()
            sash_x, sash_y = self.m_split_v.sash_coord(0)
            list_height = self.m_list_frame.winfo_height()
        except self.m_tk.TclError:
            return
        # 布局尚未完成时不做调整, 避免把日志区一次压到底
        if total_height <= 1 or list_height <= 1:
            return
        if list_height >= LIST_MIN_HEIGHT:
            return

        log_height = total_height - sash_y - SPLITTER_WIDTH
        movable = max(0, log_height - SPLITTER_MIN_LOG)
        move = min(LIST_MIN_HEIGHT - list_height, movable)
        if move <= 0:
            return
        self.m_split_v.sash_place(0, sash_x, sash_y + move)

    @staticmethod
    def OptionUsesListArea(option):
        """服务器清单这类参数独占下方滚动区域, 其余参数留在固定参数区"""
        layout = getattr(option, "layout", "auto")
        if layout == "list":
            return True
        if layout == "row":
            return False
        return option.kind == "multi_choice" and option.has_groups

    def CreateOptionLabel(self, parent, option):
        """标题 + 摘要说明, 省略的详细说明由悬停提示补全, 返回可挂提示的控件"""
        title = self.m_ttk.Label(parent, text=option.title)
        title.pack(side="left", anchor="w")
        labels = [title]
        summary = ShortHelp(option.help_text)
        if summary:
            summary_label = self.m_ttk.Label(
                parent,
                text=summary,
                foreground=self.m_theme["muted"],
                font=(self.m_theme["font_family"], max(8, self.m_theme["font_size"] - 1)),
            )
            summary_label.pack(side="left", anchor="w", padx=(6, 0))
            labels.append(summary_label)
        return labels

    def AttachOptionTip(self, option, widgets):
        """完整参数说明挂到标题上, 鼠标悬停时显示"""
        text = option.help_text
        if not text:
            return
        for widget in widgets:
            if widget is not None:
                ToolTip(widget, text, self.m_theme)

    def ResolveOptionDefault(self, option, cached):
        """表单缓存优先, 否则读取配置默认值"""
        if option.name in cached:
            return cached[option.name]
        try:
            return option.Default(self.m_context)
        except ScriptError as error:
            self.m_console.Error("[配置错误] %s" % error)
            return None

    def BuildParamRow(self, option, cached, row):
        """固定参数行: 左侧标题与摘要, 右侧控件"""
        label_box = self.m_ttk.Frame(self.m_param_frame)
        label_box.grid(row=row, column=0, sticky="w", padx=(0, 10), pady=PARAM_ROW_PADDING)
        label_widgets = self.CreateOptionLabel(label_box, option)

        default = self.ResolveOptionDefault(option, cached)
        try:
            widget = self.BuildOptionWidget(option, default, row)
        except ScriptError as error:
            self.m_console.Error("[参数加载失败] %s" % error)
            widget = self.m_ttk.Label(
                self.m_param_frame,
                text="加载失败: %s" % error,
                foreground=self.m_theme["error"],
            )
            widget.grid(row=row, column=1, sticky="w", pady=PARAM_ROW_PADDING)
        # 多选列表的每个条目有自己的悬停提示, 这里只给标题挂参数说明
        if option.kind != "multi_choice":
            self.AttachOptionTip(option, label_widgets + [widget])
        else:
            self.AttachOptionTip(option, label_widgets)

    def BuildListSection(self, option, cached, index):
        """服务器列表块: 标题一行, 列表占满剩余空间并支持上下左右滚动"""
        header = self.m_ttk.Frame(self.m_list_frame)
        header.grid(row=index * 2, column=0, sticky="w", pady=(0, 2))
        label_widgets = self.CreateOptionLabel(header, option)
        self.AttachOptionTip(option, label_widgets)

        # 列表单独加一圈边框, 和上面的固定参数区分开
        border = self.m_tk.Frame(
            self.m_list_frame,
            background=self.m_theme["window_bg"],
            highlightthickness=1,
            highlightbackground=self.m_theme["border"],
            bd=0,
        )
        border.grid(row=index * 2 + 1, column=0, sticky="nsew")

        default = self.ResolveOptionDefault(option, cached)
        try:
            groups = option.ResolveGroups(self.m_context)
            tips = option.ResolveTips(self.m_context)
        except ScriptError as error:
            self.m_console.Error("[参数加载失败] %s" % error)
            groups = []
            tips = {}

        widget = MultiChoiceBox(
            border,
            groups,
            default or [],
            self.m_theme,
            command=self.OnOptionChanged,
            tips=tips,
            option_tip=option.help_text,
            expand=True,
            compact=True,
        )
        widget.pack(fill="both", expand=True, padx=1, pady=1)
        self.m_list_frame.rowconfigure(index * 2 + 1, weight=1)
        self.m_option_widgets.append((option, "multi_choice", widget, groups))

    def BuildOptionWidget(self, option, default, row):
        """在固定参数区创建控件"""
        if option.kind == "bool":
            variable = self.m_tk.BooleanVar(value=bool(default))
            widget = Checkbox(
                self.m_param_frame,
                variable,
                self.m_theme,
                command=self.OnOptionChanged,
            )
            widget.grid(row=row, column=1, sticky="w", pady=PARAM_ROW_PADDING)
            self.m_option_widgets.append((option, "bool", variable, None))
            return widget

        if option.kind == "multi_choice":
            try:
                groups = option.ResolveGroups(self.m_context)
                tips = option.ResolveTips(self.m_context)
            except ScriptError as error:
                self.m_console.Error("[参数加载失败] %s" % error)
                groups = []
                tips = {}
            widget = MultiChoiceBox(
                self.m_param_frame,
                groups,
                default or [],
                self.m_theme,
                command=self.OnOptionChanged,
                tips=tips,
                option_tip=option.help_text,
                visible_rows=6,
                compact=True,
            )
            widget.grid(row=row, column=1, sticky="w", pady=PARAM_ROW_PADDING)
            self.m_option_widgets.append((option, "multi_choice", widget, groups))
            return widget

        if option.kind == "choice":
            items = option.ResolveItems(self.m_context)
            labels = [item[0] for item in items]
            mapping = {item[0]: item[1] for item in items}
            label = labels[0] if labels else ""
            for item_label, item_value in items:
                if item_value == default:
                    label = item_label
                    break
            variable = self.m_tk.StringVar(value=label)
            widget = self.m_ttk.Combobox(
                self.m_param_frame, textvariable=variable, values=labels, state="readonly"
            )
            widget.grid(row=row, column=1, sticky="ew", pady=PARAM_ROW_PADDING)
            widget.bind("<<ComboboxSelected>>", self.OnOptionChanged)
            self.m_option_widgets.append((option, "choice", variable, mapping))
            return widget

        variable = self.m_tk.StringVar(value="" if default is None else str(default))
        widget = self.m_ttk.Entry(
            self.m_param_frame,
            textvariable=variable,
            show="*" if option.secret else "",
        )
        widget.grid(row=row, column=1, sticky="ew", pady=PARAM_ROW_PADDING)
        widget.bind("<FocusOut>", self.OnOptionChanged)
        widget.bind("<Return>", self.OnOptionChanged)
        self.m_option_widgets.append((option, "value", variable, None))
        return widget

    def CollectOptions(self):
        options = {}
        for option, kind, variable, mapping in self.m_option_widgets:
            if kind == "bool":
                options[option.name] = bool(variable.get())
            elif kind == "multi_choice":
                options[option.name] = variable.Values()
            elif kind == "choice":
                label = variable.get()
                if label not in mapping:
                    raise ScriptError("参数 %s 选择无效: %s" % (option.name, label))
                options[option.name] = mapping[label]
            else:
                options[option.name] = option.Coerce(variable.get())
        return options

    def CaptureCurrentOptions(self, persist=True):
        """把当前表单值放入内存缓存, 并尝试写回配置.

        内存缓存保证切换模块再回来时不会恢复默认;
        配置写回只处理配置支持的选项, 临时开关只在本次运行期间保留.
        """
        module = self.m_current
        if module is None or not self.m_option_widgets or self.m_rebuilding_options:
            return

        raw = {}
        for option, kind, variable, mapping in self.m_option_widgets:
            if kind == "bool":
                raw[option.name] = bool(variable.get())
            elif kind == "multi_choice":
                raw[option.name] = variable.Values()
            elif kind == "choice":
                label = variable.get()
                raw[option.name] = mapping.get(label, label)
            else:
                raw[option.name] = variable.get()
        self.m_option_cache[module.ID] = raw

        if not persist:
            return
        try:
            typed = self.CollectOptions()
        except ScriptError:
            # 输入还不合法时只保留在内存缓存, 不写坏配置
            return
        try:
            PersistOptionValues(self.m_context, module, typed, quiet=True)
        except ScriptError as error:
            self.m_console.Warn("[配置回写失败] %s" % error)

    def OnOptionChanged(self, _event=None):
        """控件值变化时立即缓存并写回"""
        self.CaptureCurrentOptions()

    def RunCurrent(self):
        if self.m_running:
            return
        module = self.m_current
        if module is None:
            return

        # 特殊编辑器模块在 GUI 下直接打开独立窗口
        if getattr(module, "GUI_EDITOR", ""):
            self.OpenDeployConfigEditor()
            return

        try:
            options = self.CollectOptions()
        except ScriptError as error:
            self.m_console.Error("[参数错误] %s" % error)
            return

        # GUI 不能前台跟随, 明确关闭并写回, 避免下次反复提示
        if module.ID in ("start", "start_all", "restart") and options.get("foreground"):
            self.m_console.Warn("GUI 模式不支持前台跟随, foreground 已关闭并写回配置")
            options["foreground"] = False

        # 运行值同时作为下次打开该模块时的表单值
        self.m_option_cache[module.ID] = dict(options)

        self.m_console.Step("执行模块: %s (%s)" % (module.TITLE, module.ID))
        try:
            PersistOptionValues(self.m_context, module, options)
        except ScriptError as error:
            self.m_console.Error("[配置写回失败] %s" % error)
            return

        self.m_running = True
        self.m_run_button.configure(state="disabled")
        self.m_status.configure(text="运行中: %s" % module.TITLE)
        self.m_console.Line()
        self.m_console.Line("=" * 64, COLOR_BLUE)

        thread = threading.Thread(target=self.RunModuleThread, args=(module, options), daemon=True)
        thread.start()

    def RunModuleThread(self, module, options):
        old_stdout = sys.stdout
        old_stderr = sys.stderr
        sys.stdout = TeeStream(self.m_console)
        sys.stderr = TeeStream(self.m_console)
        try:
            module.Run(self.m_context, options)
        except SystemExit as error:
            code = error.code if isinstance(error.code, int) else 1
            if code:
                self.m_console.Error("[退出] 模块返回码: %d" % code)
        except ScriptError as error:
            self.m_console.Error("[错误] %s" % error)
        except BaseException:  # noqa: BLE001
            self.m_console.Error("[错误] 模块执行异常:")
            self.m_console.Line(traceback.format_exc())
        finally:
            sys.stdout = old_stdout
            sys.stderr = old_stderr
            try:
                self.m_root.after(0, self.OnRunFinished)
            except Exception:
                # 窗口已经关闭时不再更新界面
                pass

    def OnRunFinished(self):
        self.m_running = False
        try:
            self.m_run_button.configure(state="normal")
            self.m_status.configure(text="就绪")
        except Exception:  # noqa: BLE001
            pass

    def PollConsole(self):
        try:
            self.m_console.Drain()
        except Exception:  # noqa: BLE001
            pass
        self.m_root.after(80, self.PollConsole)

    def OpenConfigEditor(self):
        from tkinter import messagebox, scrolledtext

        window = self.m_tk.Toplevel(self.m_root)
        window.title("编辑配置 - %s" % self.m_context.settings.config_file)
        window.geometry("900x640")
        window.configure(background=self.m_theme["window_bg"])

        self.m_ttk.Label(
            window,
            text="部署目录请使用「部署目录」模块切换, 这里修改 paths.deploy_dir 不会生效",
            foreground=self.m_theme["muted"],
        ).pack(anchor="w", padx=8, pady=(8, 0))

        text = scrolledtext.ScrolledText(
            window,
            font=(self.m_theme["log_font_family"], self.m_theme["log_font_size"]),
        )
        ThemeText(text, self.m_theme)
        text.pack(fill="both", expand=True, padx=8, pady=8)
        content = json.dumps(self.m_context.settings.data, ensure_ascii=False, indent=4)
        text.insert("1.0", content + "\n")

        def save():
            try:
                data = json.loads(text.get("1.0", "end"))
            except json.JSONDecodeError as error:
                messagebox.showerror("JSON 错误", str(error), parent=window)
                return
            try:
                self.m_context.settings.SaveData(data)
            except ScriptError as error:
                messagebox.showerror("保存失败", str(error), parent=window)
                return
            self.m_console.Success("配置已保存并重新加载: %s" % self.m_context.settings.config_file)
            # 配置被整体替换后以文件内容为准
            self.m_option_cache.clear()
            self.RefreshTheme()
            window.destroy()

        bar = self.m_ttk.Frame(window)
        bar.pack(fill="x", padx=8, pady=(0, 8))
        self.m_ttk.Button(bar, text="保存并重载", command=save).pack(side="right")
        self.m_ttk.Button(bar, text="取消", command=window.destroy).pack(side="right", padx=(0, 8))

    def OpenConfigFile(self):
        try:
            OpenPath(self.m_context.settings.config_file)
        except ScriptError as error:
            self.m_console.Error("[错误] %s" % error)

    def OpenDeployConfigEditor(self):
        """打开部署配置编辑器, 已打开时只聚焦"""
        if self.m_deploy_editor is not None:
            try:
                if self.m_deploy_editor.m_window.winfo_exists():
                    self.m_deploy_editor.Focus()
                    return
            except Exception:  # noqa: BLE001
                pass
            self.m_deploy_editor = None

        from .deploy_config_editor import OpenDeployConfigEditor

        try:
            self.m_deploy_editor = OpenDeployConfigEditor(
                self.m_root,
                self.m_context,
                self.m_theme,
                self.m_console,
                on_closed=self.OnDeployEditorClosed,
            )
        except ScriptError as error:
            self.m_console.Error("[部署配置] 打开失败: %s" % error)
        except Exception:  # noqa: BLE001
            self.m_console.Error("[部署配置] 打开失败:")
            self.m_console.Line(traceback.format_exc())

    def OnDeployEditorClosed(self, editor):
        if self.m_deploy_editor is editor:
            self.m_deploy_editor = None

    def ReloadConfig(self):
        try:
            self.m_context.settings.Reload()
        except ScriptError as error:
            self.m_console.Error("[错误] %s" % error)
            return
        self.m_console.Success("配置已重新加载")
        # 外部配置优先, 清掉内存里的临时表单值
        self.m_option_cache.clear()
        self.RefreshTheme()

    def OpenCli(self):
        command = [ConsolePythonExecutable(), self.m_context.entry_script, "--cli"]
        try:
            subprocess.Popen(
                command,
                cwd=self.m_context.project_root,
                creationflags=CREATE_NEW_CONSOLE,
            )
        except OSError as error:
            self.m_console.Error("[错误] 打开命令行模式失败: %s" % error)

    def OnClose(self):
        # 关闭前保存当前表单里的有效参数
        self.CaptureCurrentOptions()
        if self.m_running:
            from tkinter import messagebox

            if not messagebox.askyesno("退出", "模块仍在运行, 确定退出吗?", parent=self.m_root):
                return
        self.m_root.destroy()


def LaunchGui(context, modules):
    """启动 GUI 主循环"""
    import tkinter as tk
    from tkinter import messagebox

    EnableDpiAwareness()
    # 双击启动时先藏掉脚本自带的控制台, 只留 GUI 窗口
    HideOwnConsoleWindow()
    root = tk.Tk()
    root.withdraw()
    try:
        ToolWindow(root, context, modules)
    except BaseException as error:
        try:
            messagebox.showerror("服务器脚本工具启动失败", str(error), parent=root)
        except Exception:
            pass
        root.destroy()
        raise
    root.deiconify()
    root.mainloop()
    return 0
