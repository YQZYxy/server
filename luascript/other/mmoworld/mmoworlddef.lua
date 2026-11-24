-- ====================================================================
-- MMO 世界常量定义, 与 C++ MMO_EVENT_* 保持一致
-- ====================================================================

local M = {}

-- 事件类型
M.EVENT_ENTER = 1       -- 进入场景
M.EVENT_LEAVE = 2       -- 离开场景
M.EVENT_MOVE = 3        -- 移动
M.EVENT_LEAVE_VIEW = 4  -- 离开视野
M.EVENT_DAMAGE = 5      -- 受到伤害
M.EVENT_DEAD = 6        -- 死亡
M.EVENT_REVIVE = 7      -- 复活
M.EVENT_SETTLE = 8      -- 战斗结算

-- 实体类型: 1=玩家
M.ENTITY_TYPE_PLAYER = 1

return M
