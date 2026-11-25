#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GUI 启动阶段的通用弹窗.

用于 pythonw 启动、没有控制台可看 traceback 的场景.
"""


def ShowErrorDialog(title, message):
    """显示错误弹窗, Tk 不可用时静默失败"""
    try:
        import tkinter as tk
        from tkinter import messagebox

        root = tk.Tk()
        root.withdraw()
        messagebox.showerror(title, message[-4000:])
        root.destroy()
    except Exception:
        pass


def PromptDeployDirDialog(current=""):
    """无控制台时用弹窗选择部署目录

    返回输入的原始值, 取消返回空字符串.
    """
    try:
        import tkinter as tk
        from tkinter import messagebox, simpledialog
    except ImportError:
        return ""

    # 延迟导入, 避免 GUI 弹窗模块依赖配置模块的加载顺序
    from .settings import DEPLOY_DIR_PRESETS

    items = list(DEPLOY_DIR_PRESETS) + [("自定义目录", "custom")]
    default_index = 1
    if current == "release":
        default_index = 2
    elif current:
        default_index = len(items)

    lines = ["请选择部署目录 (输入编号):", ""]
    for index, (label, _value) in enumerate(items, start=1):
        lines.append("%d. %s" % (index, label))

    root = tk.Tk()
    root.withdraw()
    try:
        while True:
            raw = simpledialog.askstring(
                "选择部署目录", "\n".join(lines),
                initialvalue=str(default_index), parent=root,
            )
            if raw is None:
                return ""
            text = raw.strip()
            try:
                index = int(text) if text else default_index
            except ValueError:
                messagebox.showerror("部署目录", "请输入列表中的数字", parent=root)
                continue
            if 1 <= index <= len(items):
                break
            messagebox.showerror("部署目录", "选择超出范围: %s" % text, parent=root)

        value = items[index - 1][1]
        if value != "custom":
            return value

        path = simpledialog.askstring(
            "自定义部署目录", "相对仓库根或绝对路径:",
            initialvalue=current or "debug", parent=root,
        )
        if path is None:
            return ""
        return path.strip()
    finally:
        root.destroy()
