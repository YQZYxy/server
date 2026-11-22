-- ====================================================================
-- 道具使用效果
-- ====================================================================

local M = {}

-- 注册全部使用类型处理器
function M.Init(knapsack)
    if not knapsack then
        LOG_ERROR("AutoUseItem.Init: 背包模块未加载")
        return false
    end

    -- 增加角色经验
    knapsack.RegisterUseHandler(knapsack.USE_TYPE.ADD_EXP, function(role, item_config, num)
        if not role then
            return false
        end
        role:AddExp(num)
        return true
    end)

    return true
end

LOG_INFO("AutoUseItem 加载完成")

return M
