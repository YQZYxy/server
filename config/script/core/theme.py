#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tkinter 主题.

主题由部署目录中 config.json 副本的 ui 节点选择:
    ui.theme             vscode-dark / vscode-light
    ui.font_family       界面字体
    ui.font_size         界面字号
    ui.log_font_family   日志字体
    ui.log_font_size     日志字号

新增主题: 在 THEMES 里增加一份颜色表即可, 界面代码只读取颜色键.
"""

from .errors import ConfigError

# VS Code Dark+ 配色
VSCODE_DARK = {
    "window_bg": "#1e1e1e",
    "panel_bg": "#252526",
    "editor_bg": "#1e1e1e",
    "input_bg": "#3c3c3c",
    "fg": "#cccccc",
    "title_fg": "#e7e7e7",
    "muted": "#858585",
    "border": "#3f3f46",
    "accent": "#007acc",
    "accent_hover": "#1177bb",
    "selection_bg": "#094771",
    "selection_fg": "#ffffff",
    "button_bg": "#3c3c3c",
    "button_active": "#505050",
    "disabled_fg": "#6b6b6b",
    "error": "#f48771",
    "warning": "#cca700",
    "success": "#89d185",
    "info": "#75beff",
    "chart_qps": "#569cd6",
    "chart_online": "#6a9955",
    "log_bg": "#1e1e1e",
    "log_fg": "#d4d4d4",
    "caret": "#aeafad",
    "menu_bg": "#252526",
    "menu_fg": "#cccccc",
}

# VS Code Light+ 配色
VSCODE_LIGHT = {
    "window_bg": "#ffffff",
    "panel_bg": "#f3f3f3",
    "editor_bg": "#ffffff",
    "input_bg": "#ffffff",
    "fg": "#333333",
    "title_fg": "#1f1f1f",
    "muted": "#717171",
    "border": "#cecece",
    "accent": "#007acc",
    "accent_hover": "#0062a3",
    "selection_bg": "#add6ff",
    "selection_fg": "#000000",
    "button_bg": "#f3f3f3",
    "button_active": "#e5e5e5",
    "disabled_fg": "#a0a0a0",
    "error": "#a1260d",
    "warning": "#bf8803",
    "success": "#388a34",
    "info": "#1a85ff",
    "chart_qps": "#007acc",
    "chart_online": "#388a34",
    "log_bg": "#ffffff",
    "log_fg": "#333333",
    "caret": "#000000",
    "menu_bg": "#f3f3f3",
    "menu_fg": "#333333",
}

# 主题表, 键名就是 config.json 里 ui.theme 的取值
THEMES = {
    "vscode-dark": VSCODE_DARK,
    "vscode-light": VSCODE_LIGHT,
}


def GetTheme(settings):
    """从配置读取主题与字体, 返回完整颜色字典"""
    name = str(settings.Require("ui.theme")).strip()
    base = THEMES.get(name)
    if base is None:
        raise ConfigError(
            "未知 ui.theme: %s (可选: %s)" % (name, ", ".join(sorted(THEMES)))
        )

    theme = dict(base)
    theme["name"] = name
    theme["font_family"] = str(settings.Require("ui.font_family"))
    theme["log_font_family"] = str(settings.Require("ui.log_font_family"))
    theme["font_size"] = int(settings.Require("ui.font_size"))
    theme["module_list_font_size"] = int(settings.Require("ui.module_list_font_size"))
    theme["log_font_size"] = int(settings.Require("ui.log_font_size"))
    if theme["font_size"] <= 0 or theme["log_font_size"] <= 0:
        raise ConfigError("ui.font_size / ui.log_font_size 必须大于 0")
    if theme["module_list_font_size"] <= 0:
        raise ConfigError("ui.module_list_font_size 必须大于 0")
    return theme


def ApplyTkTheme(root, theme):
    """应用 ttk 样式与经典控件的公共选项"""
    from tkinter import ttk

    root.configure(background=theme["window_bg"])
    root.option_add("*Font", (theme["font_family"], theme["font_size"]))
    root.option_add("*Menu.background", theme["menu_bg"])
    root.option_add("*Menu.foreground", theme["menu_fg"])
    root.option_add("*Menu.activeBackground", theme["selection_bg"])
    root.option_add("*Menu.activeForeground", theme["selection_fg"])
    root.option_add("*TCombobox*Listbox.background", theme["input_bg"])
    root.option_add("*TCombobox*Listbox.foreground", theme["fg"])
    root.option_add("*TCombobox*Listbox.selectBackground", theme["selection_bg"])
    root.option_add("*TCombobox*Listbox.selectForeground", theme["selection_fg"])

    style = ttk.Style(root)
    # clam 主题允许完整自定义背景色, vista 在 Windows 下会忽略部分颜色
    try:
        style.theme_use("clam")
    except Exception:
        pass

    style.configure(
        ".",
        background=theme["window_bg"],
        foreground=theme["fg"],
        fieldbackground=theme["input_bg"],
        bordercolor=theme["border"],
        lightcolor=theme["border"],
        darkcolor=theme["border"],
        troughcolor=theme["panel_bg"],
        focuscolor=theme["accent"],
        font=(theme["font_family"], theme["font_size"]),
    )
    style.configure("TFrame", background=theme["window_bg"])
    style.configure("TLabelframe", background=theme["window_bg"],
                    foreground=theme["fg"], bordercolor=theme["border"])
    style.configure("TLabelframe.Label", background=theme["window_bg"],
                    foreground=theme["accent"])
    style.configure("TLabel", background=theme["window_bg"], foreground=theme["fg"])
    style.configure("TButton", background=theme["button_bg"], foreground=theme["fg"],
                    bordercolor=theme["border"], focuscolor=theme["accent"])
    style.map(
        "TButton",
        background=[("active", theme["button_active"]), ("pressed", theme["accent"])],
        foreground=[("disabled", theme["disabled_fg"])],
    )
    style.configure("TCheckbutton", background=theme["window_bg"], foreground=theme["fg"])
    style.map("TCheckbutton", background=[("active", theme["window_bg"])])
    style.configure("TRadiobutton", background=theme["window_bg"], foreground=theme["fg"])
    style.map("TRadiobutton", background=[("active", theme["window_bg"])])
    style.configure("TEntry", fieldbackground=theme["input_bg"], foreground=theme["fg"],
                    insertcolor=theme["caret"], bordercolor=theme["border"])
    style.configure("TCombobox", fieldbackground=theme["input_bg"],
                    background=theme["button_bg"], foreground=theme["fg"],
                    arrowcolor=theme["fg"], bordercolor=theme["border"])
    style.map(
        "TCombobox",
        fieldbackground=[("readonly", theme["input_bg"])],
        foreground=[("readonly", theme["fg"])],
        selectbackground=[("readonly", theme["input_bg"])],
        selectforeground=[("readonly", theme["fg"])],
    )
    style.configure("TSpinbox", fieldbackground=theme["input_bg"], foreground=theme["fg"],
                    background=theme["button_bg"], arrowcolor=theme["fg"],
                    bordercolor=theme["border"])
    style.configure("TScrollbar", background=theme["button_bg"],
                    troughcolor=theme["panel_bg"], bordercolor=theme["border"],
                    arrowcolor=theme["fg"])
    style.configure("TNotebook", background=theme["window_bg"],
                    bordercolor=theme["border"])
    style.configure("TNotebook.Tab", background=theme["button_bg"],
                    foreground=theme["fg"], padding=(8, 3))
    style.map(
        "TNotebook.Tab",
        background=[("selected", theme["panel_bg"])],
        foreground=[("selected", theme["accent"])],
    )
    style.configure("Treeview", background=theme["editor_bg"],
                    fieldbackground=theme["editor_bg"], foreground=theme["fg"],
                    bordercolor=theme["border"])
    style.map(
        "Treeview",
        background=[("selected", theme["selection_bg"])],
        foreground=[("selected", theme["selection_fg"])],
    )
    style.configure("TProgressbar", background=theme["accent"],
                    troughcolor=theme["panel_bg"])
    return style


def ThemeText(widget, theme):
    """给 tk.Text / ScrolledText 应用编辑器配色"""
    widget.configure(
        background=theme["log_bg"],
        foreground=theme["log_fg"],
        insertbackground=theme["caret"],
        selectbackground=theme["selection_bg"],
        selectforeground=theme["selection_fg"],
        highlightthickness=1,
        highlightbackground=theme["border"],
        highlightcolor=theme["accent"],
        relief="flat",
    )
    vbar = getattr(widget, "vbar", None)
    if vbar is not None:
        vbar.configure(
            background=theme["button_bg"],
            troughcolor=theme["panel_bg"],
            activebackground=theme["accent"],
            highlightbackground=theme["border"],
            relief="flat",
        )
    return widget


def ThemeListbox(widget, theme):
    """给 tk.Listbox 应用侧边栏配色"""
    widget.configure(
        background=theme["panel_bg"],
        foreground=theme["fg"],
        selectbackground=theme["selection_bg"],
        selectforeground=theme["selection_fg"],
        highlightthickness=1,
        highlightbackground=theme["border"],
        highlightcolor=theme["accent"],
        relief="flat",
    )
    return widget


def ThemeCanvas(widget, theme):
    """给 tk.Canvas 应用编辑器配色"""
    widget.configure(
        background=theme["editor_bg"],
        highlightthickness=1,
        highlightbackground=theme["border"],
        highlightcolor=theme["accent"],
    )
    return widget
