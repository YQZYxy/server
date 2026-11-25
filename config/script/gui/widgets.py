#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GUI 通用控件.

ttk clam 主题的复选框选中时显示叉号, 这里统一用 Canvas 自绘复选框:
    未选中: 空心方框
    选中:   蓝色对勾
主界面参数区和部署配置编辑器共用该控件.
"""

import tkinter as tk
from tkinter import font as tkfont
from tkinter import ttk

# 帮助文本摘要默认长度, 超过后截断, 完整说明放到悬停提示
HELP_SUMMARY_LIMIT = 16

# 摘要截断时优先断开的标点
HELP_BREAK_CHARS = ",;，。;:： 、"


def ShortHelp(text, limit=HELP_SUMMARY_LIMIT):
    """把帮助文本压缩成一行摘要, 完整内容由悬停提示展示"""
    value = " ".join(str(text or "").split())
    if not value or len(value) <= limit:
        return value
    head = value[:limit]
    for index in range(len(head) - 1, 4, -1):
        if head[index] in HELP_BREAK_CHARS:
            return value[:index].rstrip() + "…"
    return head.rstrip() + "…"


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
        widget.bind("<Destroy>", self.Hide, add="+")

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
    """可滚动的分组复选框列表.

    expand=True 时跟随容器拉伸, 用满父级剩余空间;
    compact=True 时压缩行高与字体, 适合服务器清单这类条目较多的列表.
    内容超出高度或宽度时自动出现对应的滚动条.
    """

    # 单元格之间的水平间距
    CELL_PAD_X = 8
    # 单个分组最多排几列, 避免条目很少时拉得过散
    MAX_GROUP_COLUMNS = 8
    # 非拉伸模式下的尺寸上限
    MAX_WIDTH = 560
    MAX_HEIGHT = 420

    def __init__(self, parent, groups, selected, theme, command=None,
                 tips=None, visible_rows=3, width=300, expand=False,
                 compact=False, option_tip="", **kwargs):
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
        self.m_option_tip = str(option_tip or "")
        self.m_variables = {}
        self.m_tooltips = []
        self.m_grid_groups = []
        self.m_expand = bool(expand)
        self.m_compact = bool(compact)
        self.m_layout_job = None

        # 紧凑模式使用小一号字体和更小的勾选框
        font_size = theme["font_size"]
        self.m_item_font = (
            theme["font_family"],
            max(8, font_size - 2) if self.m_compact else max(8, font_size - 1),
        )
        self.m_header_font = (theme["font_family"], max(8, font_size - 2), "bold")
        self.m_checkbox_size = 15 if self.m_compact else 18
        self.m_row_height = self.MeasureRowHeight()

        total_rows = sum(
            (1 if title else 0)
            + max(1, (len(items) + self.MAX_GROUP_COLUMNS - 1) // self.MAX_GROUP_COLUMNS)
            for title, items in self.m_groups
        )
        rows = max(1, min(total_rows or 1, visible_rows))
        canvas_options = {
            "background": theme["window_bg"],
            "highlightthickness": 0,
            "bd": 0,
        }
        if not self.m_expand:
            canvas_options["width"] = width
            canvas_options["height"] = rows * self.m_row_height
        self.m_canvas = tk.Canvas(self, **canvas_options)
        self.m_vbar = ttk.Scrollbar(self, orient="vertical", command=self.m_canvas.yview)
        self.m_hbar = ttk.Scrollbar(self, orient="horizontal", command=self.m_canvas.xview)
        self.m_canvas.configure(yscrollcommand=self.m_vbar.set, xscrollcommand=self.m_hbar.set)
        self.m_canvas.grid(row=0, column=0, sticky="nsew")
        self.rowconfigure(0, weight=1)
        self.columnconfigure(0, weight=1)

        self.m_body = ttk.Frame(self.m_canvas)
        self.m_window_id = self.m_canvas.create_window((0, 0), window=self.m_body, anchor="nw")
        self.m_body.bind("<Configure>", self.OnBodyConfigure, add="+")
        self.m_canvas.bind("<Configure>", self.OnCanvasConfigure, add="+")
        self.BindWheel(self)
        self.BindWheel(self.m_canvas)
        self.BindWheel(self.m_body)
        self.BindWheel(self.m_vbar)
        self.BindWheel(self.m_hbar)

        selected_values = set(selected or [])
        if not self.m_items:
            self.m_empty_label = ttk.Label(
                self.m_body,
                text="没有可选项",
                foreground=theme["muted"],
                font=self.m_item_font,
            )
            self.m_empty_label.pack(anchor="w", padx=4)
            self.BindWheel(self.m_empty_label)

        for title, group_items in self.m_groups:
            if title:
                header = ttk.Label(
                    self.m_body,
                    text=title,
                    foreground=theme["accent"],
                    font=self.m_header_font,
                )
                header.pack(anchor="w", padx=2, pady=0)
                self.BindWheel(header)
            grid_frame = ttk.Frame(self.m_body)
            grid_frame.pack(fill="x", anchor="w", padx=0, pady=0)
            self.BindWheel(grid_frame)
            cells = []
            for label_text, value in group_items:
                cell = ttk.Frame(grid_frame)
                variable = tk.BooleanVar(value=value in selected_values)
                self.m_variables[value] = variable
                checkbox = Checkbox(
                    cell,
                    variable,
                    theme,
                    command=self.OnChanged,
                    size=self.m_checkbox_size,
                )
                checkbox.pack(side="left", padx=(0, 3), pady=0)
                label = ttk.Label(cell, text=label_text, font=self.m_item_font)
                label.pack(side="left", anchor="w", pady=0)
                tip_text = self.m_tips.get(value, "") or self.m_option_tip
                if tip_text:
                    self.m_tooltips.append(ToolTip(checkbox, tip_text, theme))
                    self.m_tooltips.append(ToolTip(label, tip_text, theme))
                for widget in (cell, checkbox, label):
                    self.BindWheel(widget)
                cells.append(cell)
            self.m_grid_groups.append({"frame": grid_frame, "cells": cells, "columns": 0})

        self.after_idle(self.Relayout)

    def MeasureRowHeight(self):
        """按字体行高计算单元格高度, 紧凑模式收紧留白"""
        try:
            item_font = tkfont.Font(root=self, font=self.m_item_font)
            linespace = int(item_font.metrics("linespace"))
        except tk.TclError:
            linespace = self.m_theme["font_size"] + 6
        padding = 1 if self.m_compact else 4
        return max(linespace, self.m_checkbox_size) + padding

    def BindWheel(self, widget):
        """列表内所有控件都响应滚轮与 Shift+滚轮"""
        widget.bind("<MouseWheel>", self.OnWheel, add="+")
        widget.bind("<Shift-MouseWheel>", self.OnShiftWheel, add="+")

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

    def OnCanvasConfigure(self, _event=None):
        """画布尺寸变化时重新分配列数, 让列表保持密集"""
        self.Relayout()

    def Relayout(self):
        """按可用宽度重新计算每组列数并刷新滚动区域"""
        if not self.winfo_exists():
            return
        available_width = self.LayoutWidth()
        for group in self.m_grid_groups:
            columns = self.CalcColumns(group["cells"], available_width)
            if columns == group["columns"]:
                continue
            group["columns"] = columns
            self.GridCells(group["frame"], group["cells"], columns)
        self.m_canvas.configure(scrollregion=self.m_canvas.bbox("all"))
        self.UpdateLayout()

    def LayoutWidth(self):
        """计算列数使用的宽度: 拉伸模式跟随画布, 否则按宽度上限排成紧凑的几行"""
        if self.m_expand:
            return self.AvailableWidth()
        return self.MAX_WIDTH

    def RecheckLayout(self):
        """滚动条显隐后重新校准尺寸"""
        self.m_layout_job = None
        self.UpdateLayout()

    def AvailableWidth(self):
        """画布当前可用宽度, 尚未完成布局时用配置宽度兜底"""
        try:
            width = self.m_canvas.winfo_width()
            if width <= 1:
                width = int(self.m_canvas.cget("width") or 0)
        except (tk.TclError, TypeError, ValueError):
            width = 0
        return width

    def CalcColumns(self, cells, available_width):
        """按单元格自然宽度决定每行排几列, 尽量排满一行"""
        if not cells or available_width <= 1:
            return 1
        try:
            cell_width = max(cell.winfo_reqwidth() for cell in cells) + self.CELL_PAD_X
        except tk.TclError:
            return 1
        if cell_width <= self.CELL_PAD_X:
            cell_width = 80 + self.CELL_PAD_X
        columns = int(available_width // cell_width)
        return max(1, min(columns, len(cells), self.MAX_GROUP_COLUMNS))

    def GridCells(self, grid_frame, cells, columns):
        """按列数重新摆放单元格"""
        for index, cell in enumerate(cells):
            cell.grid(
                row=index // columns,
                column=index % columns,
                sticky="w",
                padx=(0, self.CELL_PAD_X),
                pady=0,
            )

    def UpdateLayout(self):
        """同步内容宽度并按需要显示横竖滚动条"""
        if not self.winfo_exists():
            return
        body_width = self.m_body.winfo_reqwidth()
        body_height = self.m_body.winfo_reqheight()
        canvas_width = self.m_canvas.winfo_width()
        canvas_height = self.m_canvas.winfo_height()

        # 内容比画布窄时铺满, 比画布宽时保持自然宽度以支持横向滚动
        target_width = max(canvas_width, body_width)
        try:
            current_width = int(float(self.m_canvas.itemcget(self.m_window_id, "width") or 0))
        except (tk.TclError, TypeError, ValueError):
            current_width = 0
        if target_width > 0 and abs(current_width - target_width) > 1:
            self.m_canvas.itemconfigure(self.m_window_id, width=target_width)

        need_vscroll = body_height > canvas_height + 2
        need_hscroll = body_width > canvas_width + 2
        changed = False
        if need_vscroll != bool(self.m_vbar.winfo_manager()):
            if need_vscroll:
                self.m_vbar.grid(row=0, column=1, sticky="ns")
            else:
                self.m_vbar.grid_remove()
            changed = True
        if need_hscroll != bool(self.m_hbar.winfo_manager()):
            if need_hscroll:
                self.m_hbar.grid(row=1, column=0, sticky="ew")
            else:
                self.m_hbar.grid_remove()
            changed = True
        # 滚动条显隐会改变画布可用空间, 空闲时再校准一次
        if changed and self.m_layout_job is None:
            self.m_layout_job = self.after_idle(self.RecheckLayout)

        if self.m_expand:
            return

        # 非拉伸模式: 尺寸贴合内容, 避免出现大片空白
        try:
            current_width = int(self.m_canvas.cget("width"))
        except (TypeError, ValueError):
            current_width = 0
        target_width = max(160, min(self.MAX_WIDTH, body_width + 12))
        if abs(current_width - target_width) > 2:
            self.m_canvas.configure(width=target_width)
            return

        try:
            current_height = int(self.m_canvas.cget("height"))
        except (TypeError, ValueError):
            current_height = 0
        target_height = max(self.m_row_height, min(self.MAX_HEIGHT, body_height + 4))
        if abs(current_height - target_height) > 2:
            self.m_canvas.configure(height=target_height)

    def OnWheel(self, event):
        """滚轮纵向滚动, Shift+滚轮交给横向滚动"""
        if event.state & 0x0001:
            return self.OnShiftWheel(event)
        first, last = self.m_canvas.yview()
        if first <= 0.0 and last >= 1.0:
            return "break"
        step = -1 if event.delta > 0 else 1
        self.m_canvas.yview_scroll(step, "units")
        return "break"

    def OnShiftWheel(self, event):
        """Shift+滚轮横向滚动"""
        first, last = self.m_canvas.xview()
        if first <= 0.0 and last >= 1.0:
            return "break"
        step = -1 if event.delta > 0 else 1
        self.m_canvas.xview_scroll(step, "units")
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

    def __init__(self, parent, variable, theme, command=None, size=None, **kwargs):
        self.m_variable = variable
        self.m_theme = theme
        self.m_command = command
        scale = max(parent.winfo_fpixels("1i") / 96.0, 1.0)
        base_size = 18 if size is None else int(size)
        self.m_size = max(base_size, int(base_size * scale))
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
