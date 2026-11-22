-- ====================================================================
-- 背包模块
-- ====================================================================

local GLO = GLO
local EventManager = GLO.EventManager
local Item = GLO.Item
local Protobuf = GLO.Protobuf
local MHT = GLO.MHT

local M = {}
local LOC = {}

-- 物品变化原因
M.ITEM_REASON = {
    UNKNOWN = 0,
    GM = 1,
    TASK_REWARD = 2,
    PURCHASE = 3,
    USE = 4,
}

-- 道具使用类型
M.USE_TYPE = {
    NONE = 0,           -- 不可使用
    ADD_EXP = 1,        -- 增加角色经验
    GIVE_ITEMS = 2,     -- 开礼包 / 直接发放物品
    GAS_EFFECT = 3,     -- 触发 GAS 效果
}

-- 使用类型处理器 use_type -> function(role, item_config, num) -> bool
local s_use_handlers = {}

-- 注册道具使用处理器
function M.RegisterUseHandler(use_type, handler)
    if not use_type or type(handler) ~= "function" then
        LOG_ERROR("Knapsack.RegisterUseHandler: 参数无效 " .. tostring(use_type))
        return false
    end

    s_use_handlers[use_type] = handler
    return true
end

-- 取使用处理器
function LOC.GetUseHandler(use_type)
    if not use_type or M.USE_TYPE.NONE == use_type then
        return nil
    end
    return s_use_handlers[use_type]
end

-- ==================== 基础查询 ====================

-- 空槽位索引(全空), 供 Lua 侧复用
local EMPTY_SLOTS = {}

-- 取全部格子(按槽位升序), 角色不在线返回空表
function M.GetSlots(role)
    if not role or not role.uid or role.uid <= 0 then
        return EMPTY_SLOTS
    end
    return cpp_KnapsackGetAll(role.uid) or EMPTY_SLOTS
end

-- 取单个格子
function M.GetSlotData(role, slot_index)
    if not role or not role.uid or role.uid <= 0 then
        return nil
    end
    return cpp_KnapsackGetSlot(role.uid, slot_index)
end

-- 总格子数
function M.GetMaxSlots(role)
    if not role or not role.uid or role.uid <= 0 then
        return 0
    end
    return cpp_KnapsackMaxSlots(role.uid) or 0
end


-- ==================== 协议同步 ====================

-- 下发整包背包数据
function M.SendAllMsg(role)
    if not role or not role.uid or role.uid <= 0 then
        return
    end

    Protobuf.SendMsgToRole(role, MHT.MHT_SYNC_KNAPSACK_DATA_SC,
    {
        knapsack_data = {
            slots = M.GetSlots(role),
        }
    })
end

-- 物品变化事件: 下发协议后再抛事件
function LOC.TriggerItemEvent(event_name, role, item_id, num, extra_data)
    M.SendAllMsg(role)
    LOC.FireItemEvent(event_name, role, item_id, num, extra_data)
end

-- 只抛事件不发协议
function LOC.FireItemEvent(event_name, role, item_id, num, extra_data)
    local event_data = {
        role = role,
        item_id = item_id,
        item_name = Item.GetItemName(item_id),
        num = num
    }

    if extra_data then
        for key, value in pairs(extra_data) do
            event_data[key] = value
        end
    end

    EventManager.TriggerEvent(event_name, event_data)
end

-- ==================== 配置校验 ====================

-- 验证并解析物品信息
function LOC.ValidateItemInfo(item_info)
    local item_id = item_info.item_id
    local num = item_info.num or 1

    if not item_id or num <= 0 then
        LOG_ERROR("物品参数无效 item_id:" .. tostring(item_id) .. " num:" .. tostring(num))
        return nil
    end

    local item_config = Item.GetItemConfig(item_id)
    if not item_config then
        LOG_ERROR("无法找到物品配置 ID: " .. tostring(item_id))
        return nil
    end

    return { item_id = item_id, num = num, config = item_config }
end

-- 兼容 { { item_id = , num = }, ... } 与 { [item_id] = num } 两种物品表
function LOC.ForEachItem(items, func)
    for key, value in pairs(items or {}) do
        if type(value) == "table" then
            local item_id = value.item_id
            local num = value.num or 1
            if item_id and item_id > 0 and num > 0 then
                func(item_id, num)
            end
        elseif type(key) == "number" then
            local item_id = key
            local num = value
            if item_id > 0 and type(num) == "number" and num > 0 then
                func(item_id, num)
            end
        end
    end
end

-- ==================== 初始化 ====================

-- 初始化背包(角色创建或加载时调用)
function M.Init(role)
    if not role or not role.uid or role.uid <= 0 then
        LOG_ERROR("背包初始化失败: 角色无效")
        return false
    end

    for _, slot in ipairs(M.GetSlots(role)) do
        local item_id = slot.item_id
        if not Item.GetItemConfig(item_id) then
            LOG_WARN("清理无效物品 ID: " .. tostring(item_id))
            cpp_KnapsackClearSlot(role.uid, slot.slot_index)
        end
    end

    return true
end

-- 登录后下发背包
EventManager.RegisterListener(EventManager.cpp_OnRoleLogin, function(event_data)
    local role = GLO.RoleManager.GetRole(event_data.uid)
    if not role then
        return
    end
    M.SendAllMsg(role)
end)

-- ==================== 自动使用 ====================

-- C++ 自动使用道具: C++ 判定不占格子后, 通过事件回来执行效果
-- 执行失败时强转回背包, 保证道具不丢
EventManager.RegisterListener(EventManager.cpp_OnKnapsackAutoUse, function(event_data)
    local uid = event_data.uid
    local role = GLO.RoleManager.GetRole(uid)
    if not role then
        LOG_WARN("自动使用道具失败: 角色不在线 uid:" .. tostring(uid))
        return
    end

    local item_id = event_data.item_id
    local num = event_data.num or 0
    if not item_id or item_id <= 0 or num <= 0 then
        return
    end

    local item_config = Item.GetItemConfig(item_id)
    if not item_config then
        LOG_ERROR("自动使用道具失败: 配置不存在 ID:" .. tostring(item_id))
        cpp_KnapsackAddForce(role.uid, item_id, num, M.ITEM_REASON.UNKNOWN, "AutoUseNoConfig")
        M.SendAllMsg(role)
        return
    end

    local handler = LOC.GetUseHandler(item_config.use_type)
    if not handler then
        LOG_WARN(string.format("自动使用道具缺少处理器, 退回背包 (ID:%d use_type:%s)",
            item_id, tostring(item_config.use_type)))
        cpp_KnapsackAddForce(role.uid, item_id, num, M.ITEM_REASON.UNKNOWN, "AutoUseNoHandler")
        M.SendAllMsg(role)
        return
    end

    local ok, result = pcall(handler, role, item_config, num)
    if not ok or not result then
        LOG_ERROR(string.format("%s 自动使用道具失败, 已退回背包 (ID:%d x%d) %s",
            tostring(role.name), item_id, num, tostring(result)))
        cpp_KnapsackAddForce(role.uid, item_id, num, M.ITEM_REASON.UNKNOWN, "AutoUseRollback")
        M.SendAllMsg(role)
        return
    end

    LOG_INFO(string.format("%s 自动使用道具 (ID:%d %s x%d)",
        tostring(role.name), item_id, tostring(item_config.name), num))
    LOC.FireItemEvent(EventManager.lua_OnUseItem, role, item_id, num)
end)

-- ==================== 增加物品 ====================

-- 添加单个物品
function M.AddItem(role, item_id, num, reason, reason_text)
    num = num or 1

    local validated = LOC.ValidateItemInfo({ item_id = item_id, num = num })
    if not validated then
        return false
    end

    local item_config = validated.config

    local added_num = cpp_KnapsackAdd(role.uid, item_id, num,
        reason or M.ITEM_REASON.UNKNOWN, reason_text or "AddItem")
    if not added_num or added_num <= 0 then
        LOG_ERROR(string.format("%s 添加道具失败 (ID:%d %s x%d) 背包已满",
            tostring(role.name), item_id, tostring(item_config.name), num))
        return false
    end

    -- 自动使用的道具没有入包, 日志与事件由事件回调负责
    if not item_config.auto_use then
        LOG_INFO(string.format("%s 添加道具 (ID:%d %s x%d)",
            tostring(role.name), item_id, tostring(item_config.name), added_num))
        LOC.TriggerItemEvent(EventManager.lua_OnAddItem, role, item_id, added_num)
    end

    return added_num >= num
end

-- 添加多个物品(空间不足一件也不加)
-- items 支持 { { item_id = , num = }, ... } 或 { [item_id] = num }
-- 自动使用的道具由 C++ 判定不占格子, 效果通过 cpp_OnKnapsackAutoUse 事件回调执行
function M.AddItems(role, items, reason, reason_text)
    if not items or next(items) == nil then
        return true
    end

    local added_num, result = cpp_KnapsackAddBatch(role.uid, items,
        reason or M.ITEM_REASON.TASK_REWARD, reason_text or "AddItems")
    if not result then
        LOG_WARN(string.format("%s 批量添加失败: 背包空间不足", tostring(role.name)))
        return false
    end

    if added_num > 0 then
        -- 批量只发一次协议 事件逐物品抛
        M.SendAllMsg(role)
        LOC.ForEachItem(items, function(item_id, num)
            local item_config = Item.GetItemConfig(item_id)
            -- 自动使用的道具没有入包, 日志与事件由事件回调负责
            if item_config and item_config.auto_use then
                return
            end

            LOG_INFO(string.format("%s 添加道具 (ID:%d %s x%d)",
                tostring(role.name), item_id, Item.GetItemName(item_id), num))
            LOC.FireItemEvent(EventManager.lua_OnAddItem, role, item_id, num)
        end)
    end

    return added_num > 0
end

-- 合并多个物品列表到目标表
function M.MergeItems(dest, ...)
    for _, src in ipairs({...}) do
        for _, item in ipairs(src) do
            table.insert(dest, item)
        end
    end
end

-- ==================== 删除物品 ====================

-- 移除物品, 返回实际移除数量
function M.RemoveItem(role, item_id, num, reason, reason_text)
    num = num or 1
    if num <= 0 then
        LOG_ERROR("移除物品数量必须大于0")
        return 0
    end

    local removed = cpp_KnapsackRemove(role.uid, item_id, num,
        reason or M.ITEM_REASON.UNKNOWN, reason_text or "RemoveItem")
    if not removed or removed <= 0 then
        return 0
    end

    LOG_INFO(string.format("%s 删除道具 (ID:%d %s x%d) 剩余:%d",
        tostring(role.name), item_id, Item.GetItemName(item_id), removed, M.GetItemCount(role, item_id)))
    LOC.TriggerItemEvent(EventManager.lua_OnRemoveItem, role, item_id, removed)

    return removed
end

-- 移除多个物品(任意一种不足全部失败)
-- items 支持 { { item_id = , num = }, ... } 或 { [item_id] = num }
function M.RemoveItems(role, items, reason, reason_text)
    if not items or next(items) == nil then
        return true
    end

    local result = cpp_KnapsackRemoveBatch(role.uid, items,
        reason or M.ITEM_REASON.UNKNOWN, reason_text or "RemoveItems")
    if not result then
        LOG_WARN(string.format("%s 批量消耗失败: 道具数量不足", tostring(role.name)))
        return false
    end

    M.SendAllMsg(role)
    LOC.ForEachItem(items, function(item_id, num)
        LOC.FireItemEvent(EventManager.lua_OnRemoveItem, role, item_id, num)
    end)

    return true
end

-- ==================== 查询 ====================

-- 物品总数
function M.GetItemCount(role, item_id)
    if not role or not role.uid or role.uid <= 0 then
        return 0
    end
    return cpp_KnapsackCount(role.uid, item_id) or 0
end

-- 是否拥有物品
function M.HasItem(role, item_id, num)
    return M.GetItemCount(role, item_id) >= (num or 1)
end

-- 是否拥有多种物品
function M.HasItems(role, items)
    if not items or next(items) == nil then
        return true
    end

    return cpp_KnapsackHasItems(role.uid, items)
end

-- 空格子数
function M.GetFreeSlots(role)
    if not role or not role.uid or role.uid <= 0 then
        return 0
    end
    return cpp_KnapsackFreeSlots(role.uid) or 0
end

-- 背包是否已满
function M.IsFull(role)
    return M.GetFreeSlots(role) == 0
end

-- 容量信息 used, max_slots
function M.GetCapacityInfo(role)
    local max_slots = M.GetMaxSlots(role)
    return max_slots - M.GetFreeSlots(role), max_slots
end

-- ==================== 使用物品 ====================

-- 通过槽位索引使用物品
-- 先由 C++ 扣数量, 再按配置的 use_type 分发效果, 效果失败则回滚数量
function M.UseItemBySlot(role, slot_index, num)
    num = num or 1
    if num <= 0 then
        LOG_ERROR("使用物品数量必须大于0")
        return false
    end

    local slot = M.GetSlotData(role, slot_index)
    if not slot then
        return false
    end

    local item_id = slot.item_id
    local item_config = Item.GetItemConfig(item_id)
    if not item_config then
        LOG_ERROR("无法找到物品配置 ID: " .. tostring(item_id))
        return false
    end

    if slot.num < num then
        LOG_WARN(string.format("%s 使用道具数量不足 (ID:%d 需要:%d 拥有:%d)",
            tostring(role.name), item_id, num, slot.num))
        return false
    end

    local handler = LOC.GetUseHandler(item_config.use_type)
    if not handler then
        LOG_WARN(string.format("道具不可使用 (ID:%d use_type:%s)",
            item_id, tostring(item_config.use_type)))
        return false
    end

    -- 先扣数量
    if not cpp_KnapsackUseItem(role.uid, slot_index, num, M.ITEM_REASON.USE, "UseItem") then
        return false
    end

    -- 再执行效果, 失败回滚
    local ok, result = pcall(handler, role, item_config, num)
    if not ok or not result then
        cpp_KnapsackAddForce(role.uid, item_id, num,
            M.ITEM_REASON.USE, "UseItemRollback")
        LOG_ERROR(string.format("%s 使用道具失败, 已回滚 (ID:%d x%d) %s",
            tostring(role.name), item_id, num, tostring(result)))
        return false
    end

    LOG_INFO(string.format("%s 使用道具 (ID:%d %s x%d)",
        tostring(role.name), item_id, tostring(item_config.name), num))
    LOC.TriggerItemEvent(EventManager.lua_OnUseItem, role, item_id, num, { slot_index = slot_index })

    return true
end

-- 通过物品 ID 使用物品
function M.UseItem(role, item_id, num)
    for _, slot in ipairs(M.GetSlots(role)) do
        if slot.item_id == item_id then
            return M.UseItemBySlot(role, slot.slot_index, num)
        end
    end
    return false
end

-- ==================== 整理 ====================

-- 交换槽位
function M.SwapSlots(role, slot_index_1, slot_index_2)
    if slot_index_1 == slot_index_2 then
        return true
    end

    return cpp_KnapsackSwap(role.uid, slot_index_1, slot_index_2)
end

-- 清空背包
function M.Clear(role)
    if not cpp_KnapsackClear(role.uid) then
        return false
    end

    LOG_INFO("清理背包 " .. tostring(role.name))
    return true
end

-- ==================== 遍历 ====================

-- 按主类型筛选
function M.GetItemsByType(role, item_type)
    return LOC.FilterSlots(role, function(config)
        return config.type == item_type
    end)
end

-- 按主类型和子类型筛选
function M.GetItemsByTypeAndSubType(role, item_type, item_sub_type)
    return LOC.FilterSlots(role, function(config)
        return config.type == item_type and config.sub_type == item_sub_type
    end)
end

-- 遍历槽位并筛选, 返回 { slot_index, item_id, item_config, num }
function LOC.FilterSlots(role, filter_func)
    local items = {}

    for _, slot in ipairs(M.GetSlots(role)) do
        local item_id = slot.item_id
        local item_config = Item.GetItemConfig(item_id)
        if item_config and (not filter_func or filter_func(item_config)) then
            table.insert(items, {
                slot_index = slot.slot_index,
                item_id = item_id,
                item_config = item_config,
                num = slot.num
            })
        end
    end

    return items
end

-- 获取所有物品
function M.GetAllItems(role)
    return LOC.FilterSlots(role)
end

-- 打印背包
function M.PrintKnapsack(role)
    local used, max_slots = M.GetCapacityInfo(role)
    LOG_INFO("========== " .. tostring(role.name) .. " 背包 ==========")
    LOG_INFO("插槽: " .. tostring(used) .. "/" .. tostring(max_slots))

    for _, slot in ipairs(M.GetSlots(role)) do
        local item_id = slot.item_id
        local item_config = Item.GetItemConfig(item_id)
        if item_config then
            LOG_INFO("[" .. tostring(slot.slot_index) .. "] " .. tostring(item_config.name) .. " x" .. tostring(slot.num))
        end
    end

    LOG_INFO("=============================================")
end

LOG_INFO("Knapsack 加载完成")

return M
