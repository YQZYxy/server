#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GUI 通用控件.

ttk clam 主题的复选框选中时显示叉号, 这里统一用 Canvas 自绘复选框:
    未选中: 空心方框
    选中:   蓝色对勾
主界面参数区和部署配置编辑器共用该控件.
"""

import tkinter as tk
from tkinter import ttk


class ToolTip(object):
    """鼠标悬停提示"""

    def __init__(self, widget, text, theme, delay=350):
        self.m_widget = widget
        self.m_text = str(text or "")
        self.m_theme = theme
        self.m_delay = delay
        self.m_after = None
        self.m_window = None
        widget.bind("<Enter>", self.Schedule, add="+")
        widget.bind("<Leave>", self.Hide, add="+")
        widget.bind("<ButtonPress>", self.Hide, add="+")

    def Schedule(self, _event=None):
        self.Cancel()
        if self.m_text:
            self.m_after = self.m_widget.after(self.m_delay, self.Show)

    def Cancel(self):
        if self.m_after is not None:
            try:
                self.m_widget.after_cancel(self.m_after)
            except tk.TclError:
                pass
            self.m_after = None

    def Show(self):
        self.m_after = None
        if not self.m_text or self.m_window is not None:
            return
        try:
            x = self.m_widget.winfo_rootx() + 18
            y = self.m_widget.winfo_rooty() + self.m_widget.winfo_height() + 4
        except tk.TclError:
            return

        window = tk.Toplevel(self.m_widget)
        window.wm_overrideredirect(True)
        window.attributes("-topmost", True)
        frame = tk.Frame(window, background=self.m_theme["border"], bd=1)
        frame.pack()
        label = tk.Label(
            frame,
            text=self.m_text,
            justify="left",
            anchor="w",
            background=self.m_theme["panel_bg"],
            foreground=self.m_theme["fg"],
            padx=8,
            pady=6,
            wraplength=420,
            font=(self.m_theme["font_family"], self.m_theme["font_size"]),
        )
        label.pack()
        window.geometry("+%d+%d" % (x, y))
        self.m_window = window

    def Hide(self, _event=None):
        self.Cancel()
        if self.m_window is not None:
            try:
                self.m_window.destroy()
            except tk.TclError:
                pass
            self.m_window = None


class MultiChoiceBox(tk.Frame):
    """可滚动的分组复选框列表"""

    ROW_HEIGHT = 26
    GROUP_COLUMNS = 5

    def __init__(self, parent, groups, selected, theme, command=None,
                 tips=None, visible_rows=3, width=300, **kwargs):
        super().__init__(parent, background=theme["window_bg"], **kwargs)
        self.m_groups = self.NormalizeGroups(groups)
        self.m_items = [
            item
            for _title, group_items in self.m_groups
            for item in group_items
        ]
        self.m_theme = theme
        self.m_command = command
        self.m_tips = tips or {}
        self.m_variables = {}
        self.m_tooltips = []

        total_rows = sum(
            (1 if title else 0) + max(1, (len(items) + self.GROUP_COLUMNS - 1) // self.GROUP_COLUMNS)
            for title, items in self.m_groups
        )
        rows = max(1, min(total_rows or 1, visible_rows))
        self.m_canvas = tk.Canvas(
            self,
            width=width,
            height=rows * self.ROW_HEIGHT,
            background=theme["window_bg"],
            highlightthickness=0,
            bd=0,
        )
        self.m_scrollbar = ttk.Scrollbar(self, orient="vertical", command=self.m_canvas.yview)
        self.m_canvas.configure(yscrollcommand=self.m_scrollbar.set)
        self.m_canvas.grid(row=0, column=0, sticky="nsew")
        self.rowconfigure(0, weight=1)
        self.columnconfigure(0, weight=1)

        self.m_body = ttk.Frame(self.m_canvas)
        self.m_window_id = self.m_canvas.create_window((0, 0), window=self.m_body, anchor="nw")
        self.m_body.bind("<Configure>", self.OnBodyConfigure)
        self.m_canvas.bind("<Configure>", self.OnCanvasConfigure)
        self.m_canvas.bind("<MouseWheel>", self.OnWheel)
        self.bind("<MouseWheel>", self.OnWheel, add="+")
        self.m_body.bind("<MouseWheel>", self.OnWheel, add="+")
        self.m_scrollbar.bind("<MouseWheel>", self.OnWheel, add="+")

        selected_values = set(selected or [])
        if not self.m_items:
            self.m_empty_label = ttk.Label(
                self.m_body,
                text="没有可选项",
                foreground=theme["muted"],
            )
            self.m_empty_label.pack(anchor="w", padx=4, pady=6)

        for title, group_items in self.m_groups:
            if title:
                header = ttk.Label(
                    self.m_body,
                    text=title,
                    foreground=theme["accent"],
                    font=(theme["font_family"], max(8, theme["font_size"] - 2), "bold"),
                )
                header.pack(anchor="w", padx=4, pady=0)
                header.bind("<MouseWheel>", self.OnWheel, add="+")
            grid_frame = ttk.Frame(self.m_body)
            grid_frame.pack(fill="x", anchor="w", padx=2, pady=0)
            grid_frame.bind("<MouseWheel>", self.OnWheel, add="+")
            for index, (label_text, value) in enumerate(group_items):
                cell = ttk.Frame(grid_frame)
                cell.grid(
                    row=index // self.GROUP_COLUMNS,
                    column=index % self.GROUP_COLUMNS,
                    sticky="w",
                    padx=(0, 8),
                    pady=0,
                )
                variable = tk.BooleanVar(value=value in selected_values)
                self.m_variables[value] = variable
                checkbox = Checkbox(cell, variable, theme, command=self.OnChanged)
                checkbox.pack(side="left", padx=(2, 5), pady=0)
                label = ttk.Label(
                    cell,
                    text=label_text,
                    font=(theme["font_family"], max(8, theme["font_size"] - 1)),
                )
                label.pack(side="left", anchor="w", pady=0)
                tip_text = self.m_tips.get(value, "")
                if tip_text:
                    self.m_tooltips.append(ToolTip(checkbox, tip_text, theme))
                    self.m_tooltips.append(ToolTip(label, tip_text, theme))
                for widget in (cell, checkbox, label):
                    widget.bind("<MouseWheel>", self.OnWheel, add="+")

        self.after_idle(self.UpdateLayout)

    @staticmethod
    def NormalizeGroups(groups):
        """兼容旧的扁平 items 列表"""
        value = list(groups or [])
        if value and len(value[0]) == 2 and not isinstance(value[0][1], (list, tuple)):
            return [("", value)]
        result = []
        for title, items in value:
            result.append((str(title or ""), list(items)))
        return result

    def OnBodyConfigure(self, _event=None):
        self.m_canvas.configure(scrollregion=self.m_canvas.bbox("all"))
        self.UpdateLayout()

    def OnCanvasConfigure(self, event):
        self.m_canvas.itemconfigure(self.m_window_id, width=event.width)
        self.UpdateLayout()

    def UpdateLayout(self):
        """按实际内容调整宽度和滚动条, 避免多余留白"""
        if not self.winfo_exists():
            return
        body_height = self.m_body.winfo_reqheight()
        canvas_height = self.m_canvas.winfo_height()
        need_scroll = body_height > canvas_height + 6
        if need_scroll:
            if not self.m_scrollbar.winfo_manager():
                self.m_scrollbar.grid(row=0, column=1, sticky="ns")
        elif self.m_scrollbar.winfo_manager():
            self.m_scrollbar.grid_remove()

        body_width = self.m_body.winfo_reqwidth()
        target_width = max(140, min(300, body_width + 12))
        try:
            current_width = int(self.m_canvas.cget("width"))
        except (TypeError, ValueError):
            current_width = 0
        if abs(current_width - target_width) > 2:
            self.m_canvas.configure(width=target_width)

        target_height = max(90, min(240, body_height + 8))
        try:
            current_height = int(self.m_canvas.cget("height"))
        except (TypeError, ValueError):
            current_height = 0
        if abs(current_height - target_height) > 2:
            self.m_canvas.configure(height=target_height)

    def OnWheel(self, event):
        if self.m_canvas.yview() == (0.0, 1.0):
            return "break"
        step = -1 if event.delta > 0 else 1
        self.m_canvas.yview_scroll(step, "units")
        return "break"

    def OnChanged(self):
        if self.m_command is not None:
            self.m_command()

    def Values(self):
        return [
            value for _label, value in self.m_items
            if self.m_variables[value].get()
        ]

    def SetValues(self, values):
        selected = set(values or [])
        for value, variable in self.m_variables.items():
            variable.set(value in selected)


class Checkbox(tk.Canvas):
    """带打勾样式的复选框"""

    def __init__(self, parent, variable, theme, command=None, **kwargs):
        self.m_variable = variable
        self.m_theme = theme
        self.m_command = command
        scale = max(parent.winfo_fpixels("1i") / 96.0, 1.0)
        self.m_size = max(18, int(18 * scale))
        self.m_pad = max(2, int(2 * scale))
        self.m_line_width = max(2, int(2 * scale))

        options = {
            "width": self.m_size,
            "height": self.m_size,
            "background": theme["window_bg"],
            "highlightthickness": 0,
            "bd": 0,
            "takefocus": 1,
            "cursor": "hand2",
        }
        options.update(kwargs)
        super().__init__(parent, **options)

        self.bind("<Button-1>", self.Toggle)
        self.bind("<space>", self.Toggle)
        self.bind("<Return>", self.Toggle)
        self.bind("<FocusIn>", lambda _event: self.Draw(focused=True))
        self.bind("<FocusOut>", lambda _event: self.Draw())
        self.m_variable.trace_add("write", self.Draw)
        self.Draw()

    def Toggle(self, _event=None):
        """点击或键盘切换选中状态"""
        self.m_variable.set(not self.m_variable.get())
        if self.m_command is not None:
            self.m_command()
        return "break"

    def Draw(self, *_args, focused=False):
        """按当前变量和主题重绘"""
        try:
            if not self.winfo_exists():
                return
        except tk.TclError:
            return

        self.delete("all")
        checked = bool(self.m_variable.get())
        fill = self.m_theme["input_bg"] if checked else self.m_theme["window_bg"]
        self.create_rectangle(
            self.m_pad,
            self.m_pad,
            self.m_size - self.m_pad,
            self.m_size - self.m_pad,
            outline=self.m_theme["border"],
            fill=fill,
            width=1,
        )
        if checked:
            self.create_line(
                self.m_size * 0.24,
                self.m_size * 0.52,
                self.m_size * 0.43,
                self.m_size * 0.72,
                self.m_size * 0.78,
                self.m_size * 0.28,
                fill=self.m_theme["accent"],
                width=self.m_line_width,
                capstyle="round",
                joinstyle="round",
            )
        if focused:
            self.create_rectangle(
                0,
                0,
                self.m_size - 1,
                self.m_size - 1,
                outline=self.m_theme["accent"],
                width=1,
            )
