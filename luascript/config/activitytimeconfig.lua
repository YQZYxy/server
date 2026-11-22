-- ====================================================================
-- 自动生成配置 :活动时间规则配置
-- ====================================================================

--[[
字段结构说明:

  time_rule_id - 时间规则ID (int)
  mode - 模式(0手动 1绝对日期 2开服天数 3每日 4每周 5每月 6每周星期段) (int)
  prepare_sec - 提前预告秒数 (int)
  begin_date - 开始日期(绝对日期模式) (string)
  end_date - 结束日期(绝对日期模式) (string)
  open_begin_day - 开服开始第N天(0=开服当天) (int)
  open_end_day - 开服结束第N天 (int)
  start_hour - 开始小时 (int)
  start_minute - 开始分钟 (int)
  duration_sec - 持续秒数(每日/每周) (int)
  week_days - 生效星期位(bit0=周日) (int)
  week_begin_day - 开始星期(0=周日) (int)
  week_end_day - 结束星期(0=周日) (int)
  month_begin_day - 每月开始日期 (int)
  month_end_day - 每月结束日期 (int)
  end_hour - 结束小时 (int)
  end_minute - 结束分钟 (int)
--]]

local M = {
    [6101] = {
        time_rule_id = 6101,
        mode = 1,
        prepare_sec = 300,
        begin_date = "2026-01-01 20:00:00",
        end_date = "2026-01-01 22:00:00",
        open_begin_day = 0,
        open_end_day = 0,
        start_hour = 20,
        start_minute = 0,
        duration_sec = 0,
        week_days = 0,
        week_begin_day = 0,
        week_end_day = 0,
        month_begin_day = 1,
        month_end_day = 1,
        end_hour = 22,
        end_minute = 0,
    },

    [6102] = {
        time_rule_id = 6102,
        mode = 6,
        prepare_sec = 300,
        begin_date = "",
        end_date = "",
        open_begin_day = 0,
        open_end_day = 0,
        start_hour = 20,
        start_minute = 0,
        duration_sec = 0,
        week_days = 0,
        week_begin_day = 3,
        week_end_day = 0,
        month_begin_day = 1,
        month_end_day = 1,
        end_hour = 22,
        end_minute = 0,
    },

    [6103] = {
        time_rule_id = 6103,
        mode = 2,
        prepare_sec = 300,
        begin_date = "",
        end_date = "",
        open_begin_day = 0,
        open_end_day = 0,
        start_hour = 20,
        start_minute = 0,
        duration_sec = 0,
        week_days = 0,
        week_begin_day = 0,
        week_end_day = 0,
        month_begin_day = 1,
        month_end_day = 1,
        end_hour = 22,
        end_minute = 0,
    },

    [6104] = {
        time_rule_id = 6104,
        mode = 2,
        prepare_sec = 300,
        begin_date = "",
        end_date = "",
        open_begin_day = 9,
        open_end_day = 9,
        start_hour = 20,
        start_minute = 0,
        duration_sec = 0,
        week_days = 0,
        week_begin_day = 0,
        week_end_day = 0,
        month_begin_day = 1,
        month_end_day = 1,
        end_hour = 22,
        end_minute = 0,
    },

    [6105] = {
        time_rule_id = 6105,
        mode = 3,
        prepare_sec = 300,
        begin_date = "",
        end_date = "",
        open_begin_day = 0,
        open_end_day = 0,
        start_hour = 12,
        start_minute = 30,
        duration_sec = 3600,
        week_days = 0,
        week_begin_day = 0,
        week_end_day = 0,
        month_begin_day = 1,
        month_end_day = 1,
        end_hour = 0,
        end_minute = 0,
    },

    [6106] = {
        time_rule_id = 6106,
        mode = 5,
        prepare_sec = 300,
        begin_date = "",
        end_date = "",
        open_begin_day = 0,
        open_end_day = 0,
        start_hour = 0,
        start_minute = 0,
        duration_sec = 0,
        week_days = 0,
        week_begin_day = 0,
        week_end_day = 0,
        month_begin_day = 1,
        month_end_day = 7,
        end_hour = 23,
        end_minute = 59,
    },

    [6107] = {
        time_rule_id = 6107,
        mode = 4,
        prepare_sec = 300,
        begin_date = "",
        end_date = "",
        open_begin_day = 0,
        open_end_day = 0,
        start_hour = 20,
        start_minute = 0,
        duration_sec = 5400,
        week_days = 20,
        week_begin_day = 0,
        week_end_day = 0,
        month_begin_day = 1,
        month_end_day = 1,
        end_hour = 0,
        end_minute = 0,
    },

    [6108] = {
        time_rule_id = 6108,
        mode = 0,
        prepare_sec = 300,
        begin_date = "",
        end_date = "",
        open_begin_day = 0,
        open_end_day = 0,
        start_hour = 0,
        start_minute = 0,
        duration_sec = 0,
        week_days = 0,
        week_begin_day = 0,
        week_end_day = 0,
        month_begin_day = 1,
        month_end_day = 1,
        end_hour = 0,
        end_minute = 0,
    },

}

LOG_INFO(" 加载完成")

return M
