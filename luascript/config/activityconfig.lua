-- ====================================================================
-- 自动生成配置 :活动配置
-- ====================================================================

--[[
字段结构说明:

  config_id - 配置行ID(唯一) (int)
  activity_id - 业务活动ID(可重复) (int)
  name - 活动名称 (string)
  type - 活动类型(1全服 2个人 3小跨服 4大跨服 100自定义) (int)
  zone_id - 分区ID(0本服) (int)
  scene_id - 关联场景ID (int)
  max_players - 最大参与人数(0不限) (int)
  time_rule_id - 时间规则ID(引用活动时间规则) (int)
  min_level - 最低等级(0不限) (int)
  max_level - 最高等级(0不限) (int)
  min_role_days - 最少创角天数(0不限) (int)
  max_role_days - 最多创角天数(0不限) (int)
--]]

local M = {
    [5101] = {
        config_id = 5101,
        activity_id = 5001,
        name = "跨服竞技场-元旦",
        type = 3,
        zone_id = 1,
        scene_id = 5001,
        max_players = 200,
        time_rule_id = 6101,
        min_level = 30,
        max_level = 0,
        min_role_days = 0,
        max_role_days = 0,
    },

    [5102] = {
        config_id = 5102,
        activity_id = 5001,
        name = "跨服竞技场-每周三到周日",
        type = 3,
        zone_id = 1,
        scene_id = 5001,
        max_players = 200,
        time_rule_id = 6102,
        min_level = 30,
        max_level = 0,
        min_role_days = 0,
        max_role_days = 0,
    },

    [5103] = {
        config_id = 5103,
        activity_id = 5002,
        name = "世界BOSS-开服第1天",
        type = 1,
        zone_id = 0,
        scene_id = 0,
        max_players = 0,
        time_rule_id = 6103,
        min_level = 1,
        max_level = 0,
        min_role_days = 0,
        max_role_days = 0,
    },

    [5104] = {
        config_id = 5104,
        activity_id = 5002,
        name = "世界BOSS-开服第10天",
        type = 1,
        zone_id = 0,
        scene_id = 0,
        max_players = 0,
        time_rule_id = 6104,
        min_level = 1,
        max_level = 0,
        min_role_days = 0,
        max_role_days = 0,
    },

    [5105] = {
        config_id = 5105,
        activity_id = 5002,
        name = "世界BOSS-每日",
        type = 1,
        zone_id = 0,
        scene_id = 0,
        max_players = 0,
        time_rule_id = 6105,
        min_level = 1,
        max_level = 0,
        min_role_days = 1,
        max_role_days = 30,
    },

    [5106] = {
        config_id = 5106,
        activity_id = 5002,
        name = "世界BOSS-每月1到7号",
        type = 1,
        zone_id = 0,
        scene_id = 0,
        max_players = 0,
        time_rule_id = 6106,
        min_level = 1,
        max_level = 0,
        min_role_days = 0,
        max_role_days = 0,
    },

    [5107] = {
        config_id = 5107,
        activity_id = 5002,
        name = "世界BOSS-每周二四",
        type = 1,
        zone_id = 0,
        scene_id = 0,
        max_players = 0,
        time_rule_id = 6107,
        min_level = 1,
        max_level = 0,
        min_role_days = 0,
        max_role_days = 0,
    },

    [5108] = {
        config_id = 5108,
        activity_id = 5002,
        name = "世界BOSS-手动",
        type = 1,
        zone_id = 0,
        scene_id = 0,
        max_players = 0,
        time_rule_id = 6108,
        min_level = 1,
        max_level = 0,
        min_role_days = 0,
        max_role_days = 0,
    },

}

LOG_INFO(" 加载完成")

return M
