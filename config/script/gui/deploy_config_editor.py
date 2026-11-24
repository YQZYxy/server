#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""部署配置图形编辑器.

一个独立窗口同时编辑部署目录中的配置副本:
    baseconfig.json   基础配置
    crossconfig.json  实例清单

字段定义和校验规则在 core/deploy_config.py, 命令行向导与这里共用.
"""

import tkinter as tk
from tkinter import messagebox, ttk

from ..core.deploy_config import (
    BASE_TABS,
    CROSS_GENERAL_FIELDS,
    NODE_FIELDS,
    DeployConfigStore,
    GetValue,
    NodeSummary,
    SetValue,
)
from ..core.errors import ConfigError
from ..core.theme import ThemeListbox
from .widgets import Checkbox


class FieldBinding(object):
    """一个配置字段与 Tk 控件的绑定"""

    def __init__(self, editor, parent, field, row):
        self.m_editor = editor
        self.m_field = field
        self.m_tk = editor.tk
        self.m_ttk = editor.ttk
        self.m_theme = editor.theme
        self.m_variable = None
        self.m_multi_variables = {}
        self.m_widget = self.CreateWidget(parent, row)

    def CreateWidget(self, parent, row):
        field = self.m_field
        if field.kind == "bool":
            self.m_variable = self.m_tk.BooleanVar(value=False)
            self.m_variable.trace_add("write", self.OnChanged)
            widget = Checkbox(parent, self.m_variable, self.m_theme)
            widget.grid(row=row, column=1, sticky="w", pady=4)
            return widget

        if field.kind == "multi_choice":
            frame = self.m_ttk.Frame(parent)
            frame.grid(row=row, column=1, sticky="w", pady=4)
            for index, (label, value) in enumerate(field.choices):
                variable = self.m_tk.BooleanVar(value=False)
                variable.trace_add("write", self.OnChanged)
                self.m_multi_variables[value] = variable
                column = (index % 2) * 2
                line = index // 2
                checkbox = Checkbox(frame, variable, self.m_theme)
                checkbox.grid(row=line, column=column, sticky="w", padx=(0, 4), pady=2)
                self.m_ttk.Label(frame, text=label).grid(
                    row=line, column=column + 1, sticky="w", padx=(0, 16), pady=2
                )
            return frame

        self.m_variable = self.m_tk.StringVar(value="")
        self.m_variable.trace_add("write", self.OnChanged)
        show = "*" if field.kind == "password" else ""
        widget = self.m_ttk.Entry(parent, textvariable=self.m_variable, show=show)
        widget.grid(row=row, column=1, sticky="ew", pady=4)
        return widget

    def OnChanged(self, *_args):
        self.m_editor.MarkDirty()

    def Load(self, data):
        """从配置对象读取到控件"""
        value = GetValue(data, self.m_field.path)
        if self.m_field.kind == "bool":
            self.m_variable.set(bool(value))
            return
        if self.m_field.kind == "multi_choice":
            selected = set(value or [])
            for item_value, variable in self.m_multi_variables.items():
                variable.set(item_value in selected)
            return
        if self.m_field.kind == "int_list":
            self.m_variable.set(", ".join(str(item) for item in value))
            return
        self.m_variable.set("" if value is None else str(value))

    def Commit(self, data):
        """把控件值写回配置对象"""
        field = self.m_field
        try:
            if field.kind == "bool":
                value = bool(self.m_variable.get())
            elif field.kind == "multi_choice":
                value = [
                    item_value for _label, item_value in field.choices
                    if self.m_multi_variables[item_value].get()
                ]
            elif field.kind == "int":
                value = int(self.m_variable.get().strip())
            elif field.kind == "int_list":
                text = self.m_variable.get().strip()
                if text in ("", "-", "none", "空"):
                    value = []
                else:
                    value = [int(item.strip()) for item in text.split(",") if item.strip()]
            else:
                value = self.m_variable.get()
        except ValueError as error:
            raise ConfigError("%s 格式错误: %s" % (field.title, error)) from error
        SetValue(data, field.path, value)


class DeployConfigEditor(object):
    """部署配置独立窗口"""

    def __init__(self, parent, context, theme, console, on_saved=None, on_closed=None):
        self.m_parent = parent
        self.m_context = context
        self.m_theme = theme
        self.m_console = console
        self.m_on_saved = on_saved
        self.m_on_closed = on_closed
        self.m_store = DeployConfigStore(context.settings)
        self.m_tk = tk
        self.m_ttk = ttk
        self.m_base_bindings = []
        self.m_cross_bindings = []
        self.m_node_bindings = []
        self.m_node_index = None
        self.m_suppress_changes = False
        self.m_dirty = False

        self.m_window = tk.Toplevel(parent)
        self.m_window.title("部署配置 - baseconfig / crossconfig")
        screen_width = parent.winfo_screenwidth()
        screen_height = parent.winfo_screenheight()
        width = min(1080, max(900, screen_width - 60))
        height = min(760, max(600, screen_height - 100))
        left = max(0, (screen_width - width) // 2)
        top = max(0, (screen_height - height) // 3)
        self.m_window.geometry("%dx%d+%d+%d" % (width, height, left, top))
        self.m_window.minsize(min(900, width), min(600, height))
        self.m_window.configure(background=theme["window_bg"])
        self.m_window.transient(parent)
        self.m_window.protocol("WM_DELETE_WINDOW", self.Close)

        self.BuildUi()
        try:
            self.LoadAll()
        except Exception:
            try:
                self.m_window.destroy()
            except tk.TclError:
                pass
            raise
        self.m_window.grab_set()
        self.m_window.focus_force()

    @property
    def theme(self):
        return self.m_theme

    @property
    def tk(self):
        return self.m_tk

    @property
    def ttk(self):
        return self.m_ttk

    def BuildUi(self):
        outer = self.m_ttk.Frame(self.m_window, padding=8)
        outer.pack(fill="both", expand=True)

        self.m_notebook = self.m_ttk.Notebook(outer)
        self.m_notebook.pack(fill="both", expand=True)
        self.BuildBaseTab()
        self.BuildCrossTab()

        bar = self.m_ttk.Frame(outer)
        bar.pack(fill="x", pady=(8, 0))
        self.m_status = self.m_ttk.Label(bar, text="", foreground=self.m_theme["muted"])
        self.m_status.pack(side="left")
        self.m_ttk.Button(bar, text="关闭", command=self.Close).pack(side="right")
        self.m_ttk.Button(bar, text="保存", command=self.Save).pack(side="right", padx=(0, 8))
        self.m_ttk.Button(bar, text="校验", command=self.Validate).pack(side="right", padx=(0, 8))
        self.m_ttk.Button(bar, text="重新加载", command=self.Reload).pack(side="right", padx=(0, 8))

    def BuildBaseTab(self):
        tab = self.m_ttk.Frame(self.m_notebook, padding=8)
        self.m_notebook.add(tab, text="基础配置")
        inner = self.m_ttk.Notebook(tab)
        inner.pack(fill="both", expand=True)

        for _key, title, fields in BASE_TABS:
            frame = self.m_ttk.Frame(inner, padding=8)
            inner.add(frame, text=title)
            self.m_base_bindings.extend(self.BuildFields(frame, fields))

    def BuildCrossTab(self):
        tab = self.m_ttk.Frame(self.m_notebook, padding=8)
        self.m_notebook.add(tab, text="实例清单")
        inner = self.m_ttk.Notebook(tab)
        inner.pack(fill="both", expand=True)

        general_tab = self.m_ttk.Frame(inner, padding=8)
        inner.add(general_tab, text="部署选项")
        general = self.m_ttk.LabelFrame(general_tab, text="基础连接与部署策略", padding=8)
        general.pack(fill="x")
        self.m_cross_bindings.extend(self.BuildFields(general, CROSS_GENERAL_FIELDS))

        nodes_tab = self.m_ttk.Frame(inner, padding=8)
        inner.add(nodes_tab, text="实例节点")
        nodes = self.m_ttk.LabelFrame(nodes_tab, text="节点列表与参数", padding=8)
        nodes.pack(fill="both", expand=True)

        left = self.m_ttk.Frame(nodes, width=420)
        left.pack(side="left", fill="y")
        left.pack_propagate(False)

        self.m_node_list = tk.Listbox(
            left,
            exportselection=False,
            font=(self.m_theme["font_family"], self.m_theme["font_size"]),
        )
        ThemeListbox(self.m_node_list, self.m_theme)
        self.m_node_list.pack(fill="both", expand=True)
        self.m_node_list.bind("<<ListboxSelect>>", self.OnNodeSelected)

        buttons = self.m_ttk.Frame(left)
        buttons.pack(fill="x", pady=(6, 0))
        self.m_ttk.Button(buttons, text="新增", command=self.AddNode).pack(side="left")
        self.m_ttk.Button(buttons, text="复制", command=self.DuplicateNode).pack(side="left", padx=(4, 0))
        self.m_ttk.Button(buttons, text="删除", command=self.RemoveNode).pack(side="left", padx=(4, 0))

        right = self.m_ttk.LabelFrame(nodes, text="节点参数", padding=8)
        right.pack(side="left", fill="both", expand=True, padx=(10, 0))
        self.m_node_bindings.extend(self.BuildFields(right, NODE_FIELDS))

    def BuildFields(self, parent, fields):
        """按字段定义生成一行行表单"""
        bindings = []
        for row, field in enumerate(fields):
            self.m_ttk.Label(parent, text=field.title).grid(
                row=row, column=0, sticky="w", padx=(0, 12), pady=4
            )
            bindings.append(FieldBinding(self, parent, field, row))
            if field.help_text:
                self.m_ttk.Label(
                    parent,
                    text=field.help_text,
                    foreground=self.m_theme["muted"],
                ).grid(row=row, column=2, sticky="w", padx=(12, 0))
        parent.columnconfigure(1, weight=1)
        return bindings

    def LoadAll(self):
        """把配置加载到所有控件"""
        self.m_suppress_changes = True
        try:
            for binding in self.m_base_bindings:
                binding.Load(self.m_store.base)
            for binding in self.m_cross_bindings:
                binding.Load(self.m_store.cross)
            self.RefreshNodeList(0)
            self.LoadNode(0)
        finally:
            self.m_suppress_changes = False
        self.m_dirty = False
        self.SetStatus("已加载: %s" % self.m_store.cross_path)

    def LoadNode(self, index):
        """加载指定节点到右侧表单"""
        nodes = self.GetNodes()
        if not nodes:
            self.m_node_index = None
            return
        index = max(0, min(index, len(nodes) - 1))
        self.m_node_index = index
        self.m_suppress_changes = True
        try:
            node = nodes[index]
            for binding in self.m_node_bindings:
                binding.Load(node)
        finally:
            self.m_suppress_changes = False
        self.m_node_list.selection_clear(0, "end")
        self.m_node_list.selection_set(index)
        self.m_node_list.see(index)

    def RefreshNodeList(self, select_index=0):
        """刷新实例列表"""
        self.m_node_list.delete(0, "end")
        nodes = self.GetNodes()
        for node in nodes:
            self.m_node_list.insert("end", NodeSummary(node))
        if nodes:
            select_index = max(0, min(select_index, len(nodes) - 1))
            self.m_node_list.selection_set(select_index)

    def GetNodes(self):
        nodes = GetValue(self.m_store.cross, "nodes")
        if not isinstance(nodes, list):
            raise ConfigError("crossconfig.nodes 必须是数组")
        return nodes

    def OnNodeSelected(self, _event=None):
        """切换节点前先提交当前节点"""
        selection = self.m_node_list.curselection()
        if not selection:
            return
        index = int(selection[0])
        if index == self.m_node_index:
            return
        old_index = self.m_node_index
        try:
            self.CommitNode()
        except ConfigError as error:
            self.ShowError(str(error))
            if old_index is not None:
                self.m_node_list.selection_clear(0, "end")
                self.m_node_list.selection_set(old_index)
            return
        self.LoadNode(index)

    def CommitBase(self):
        for binding in self.m_base_bindings:
            binding.Commit(self.m_store.base)

    def CommitCross(self):
        for binding in self.m_cross_bindings:
            binding.Commit(self.m_store.cross)

    def CommitNode(self):
        if self.m_node_index is None:
            return
        node = self.GetNodes()[self.m_node_index]
        for binding in self.m_node_bindings:
            binding.Commit(node)

    def CommitAll(self):
        """提交所有表单到内存"""
        self.CommitBase()
        self.CommitCross()
        self.CommitNode()

    def Validate(self):
        """校验当前表单"""
        try:
            self.CommitAll()
        except ConfigError as error:
            self.ShowError(str(error))
            return False
        errors = self.m_store.Validate()
        if errors:
            self.ShowErrors(errors)
            return False
        self.SetStatus("校验通过")
        self.m_console.Success("[部署配置] 校验通过")
        return True

    def Save(self):
        """校验并保存"""
        if not self.Validate():
            return
        try:
            self.m_store.Save()
        except ConfigError as error:
            self.ShowError(str(error))
            return
        self.m_dirty = False
        self.SetStatus("已保存")
        self.m_console.Success("[部署配置] 已保存:")
        self.m_console.Line("  %s" % self.m_store.base_path)
        self.m_console.Line("  %s" % self.m_store.cross_path)
        if self.m_on_saved is not None:
            self.m_on_saved(self)

    def Reload(self):
        """丢弃内存修改, 从磁盘重新读取"""
        if self.m_dirty and not messagebox.askyesno(
            "重新加载", "有未保存修改, 确定重新加载吗?", parent=self.m_window
        ):
            return
        try:
            self.m_store.Reload()
        except ConfigError as error:
            self.ShowError(str(error))
            return
        self.LoadAll()

    def AddNode(self):
        """新增实例节点"""
        try:
            self.CommitNode()
            self.m_store.AddNode()
        except ConfigError as error:
            self.ShowError(str(error))
            return
        self.m_dirty = True
        self.RefreshNodeList(len(self.GetNodes()) - 1)
        self.LoadNode(len(self.GetNodes()) - 1)
        self.SetStatus("已新增实例节点, 记得保存")

    def DuplicateNode(self):
        """复制当前实例节点"""
        if self.m_node_index is None:
            return
        try:
            self.CommitNode()
            index = self.m_store.DuplicateNode(self.m_node_index)
        except ConfigError as error:
            self.ShowError(str(error))
            return
        self.m_dirty = True
        self.RefreshNodeList(index)
        self.LoadNode(index)
        self.SetStatus("已复制实例节点, 记得保存")

    def RemoveNode(self):
        """删除当前实例节点"""
        if self.m_node_index is None:
            return
        node = self.GetNodes()[self.m_node_index]
        if not messagebox.askyesno(
            "删除实例", "确定删除实例 %s 吗?" % node.get("name", "?"), parent=self.m_window
        ):
            return
        try:
            index = self.m_store.RemoveNode(self.m_node_index)
        except ConfigError as error:
            self.ShowError(str(error))
            return
        self.m_dirty = True
        self.RefreshNodeList(index)
        self.LoadNode(index)
        self.SetStatus("已删除实例节点, 记得保存")

    def MarkDirty(self):
        if self.m_suppress_changes:
            return
        self.m_dirty = True
        self.SetStatus("已修改, 尚未保存")

    def SetStatus(self, text):
        try:
            self.m_status.configure(text=text)
        except tk.TclError:
            pass

    def ShowError(self, message):
        self.m_console.Error("[部署配置] %s" % message)
        messagebox.showerror("部署配置", message, parent=self.m_window)

    def ShowErrors(self, errors):
        text = "\n".join(errors[:20])
        if len(errors) > 20:
            text += "\n... 还有 %d 项, 详见输出日志" % (len(errors) - 20)
        self.m_console.Error("[部署配置] 校验失败 %d 项:" % len(errors))
        for error in errors:
            self.m_console.Error("  - %s" % error)
        messagebox.showerror("配置校验失败", text, parent=self.m_window)

    def Focus(self):
        """把已打开的窗口提到前面"""
        try:
            self.m_window.deiconify()
            self.m_window.lift()
            self.m_window.focus_force()
        except tk.TclError:
            pass

    def Close(self):
        if self.m_dirty and not messagebox.askyesno(
            "关闭", "有未保存修改, 确定关闭吗?", parent=self.m_window
        ):
            return
        try:
            self.m_window.grab_release()
        except tk.TclError:
            pass
        self.m_window.destroy()
        if self.m_on_closed is not None:
            self.m_on_closed(self)


def OpenDeployConfigEditor(parent, context, theme, console, on_saved=None, on_closed=None):
    """创建并打开部署配置编辑器"""
    return DeployConfigEditor(parent, context, theme, console, on_saved, on_closed)
