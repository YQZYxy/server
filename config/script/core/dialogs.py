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
