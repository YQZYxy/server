"""压力测试工具包(GUI)

入口:
    python run_stress.py

扩展场景: 在 stress/scenarios.py 里用 @register_scenario 注册新类即可, 界面自动识别
"""

__all__ = ["protocol", "metrics", "bot", "scenarios", "runner", "sysmon", "gui"]
