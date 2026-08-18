-- 背包模块
-- 管理玩家物品背包系统
local GLO = GLO 
local Const = GLO.Const
local Utils = GLO.Utils
local EventManager = GLO.EventManager
local ConfigManager = GLO.ConfigManager
local Item = GLO.Item
local Protobuf = GLO.Protobuf
local MHT = GLO.MHT
local LOC = {}

local M = {}

-- 角色登录事件
GLO.EventManager.RegisterListener(EventManager.cpp_OnRoleLogin, function(event_data)
    local uid = event_data.uid
    local netid = event_data.netid

    local role = GLO.RoleManager.GetRole(uid)
    if not role then
        return
    end
    LOC.SendAllMsg(role)
end)

function LOC.SendAllMsg(role)
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        LOG_ERROR("获取背包数据失败 uid:" .. tostring(role.uid))
        return
    end

    -- 构建背包协议数据
    local slots = {}
    for slot_idx, slot_data in pairs(inventory_data.slots or {}) do
        table.insert(slots, {
            slot_index = slot_idx,
            id = slot_data.id,
            num = slot_data.num
        })
    end

    -- 下发背包数据
    Protobuf.SendMsg(role:GetNetid(), MHT.MHT_SYNC_INVENTORY_DATA_SC,
    {
        inventory_data = {
            max_slots = inventory_data.max_slots,
            slots = slots
        }
    })
end

-- 获取角色背包数据
function LOC.GetOrSetInventoryData(role)
    if not role then
        LOG_ERROR("角色实例为空")
        return nil
    end
    
    local role_data = role:GetLuaRoleData()
    if not role_data then
        LOG_ERROR("角色数据为空")
        return nil
    end
    
    -- 确保数据结构存在
    if not role_data.inventory then
        role_data.inventory = {
            max_slots = ConfigManager.itemglobalconfig.max_inventory_slots or 50,
            slots = {} -- key: slot_index, value: { id, num }
        }
    end
    
    return role_data.inventory
end

-- 查找空槽位
function LOC.FindEmptySlot(inventory_data)
    for i = 1, inventory_data.max_slots do
        if not inventory_data.slots[i] then
            return i
        end
    end
    return nil
end

-- 获取空闲槽位数
function LOC.GetFreeSlots(inventory_data)
    local count = 0
    for i = 1, inventory_data.max_slots do
        if not inventory_data.slots[i] then
            count = count + 1
        end
    end
    return count
end

-- 验证槽位索引是否有效
function LOC.IsValidSlotIndex(inventory_data, slot_index)
    return slot_index and slot_index >= 1 and slot_index <= inventory_data.max_slots
end

-- 判断物品是否可堆叠
function LOC.CanStack(max_stack)
    return max_stack and (max_stack == 0 or max_stack > 1)
end

-- 计算单个物品需要的槽位数
function LOC.CalculateRequiredSlots(inventory_data, item_config, num)
    local max_stack = item_config.max_stack
    local can_stack = LOC.CanStack(max_stack)
    
    if not can_stack then
        -- 不可堆叠,每个物品需要一个槽位
        return num
    end
    
    if max_stack == 0 then
        -- 无限堆叠,查找是否有现有槽位
        for i = 1, inventory_data.max_slots do
            local slot = inventory_data.slots[i]
            if slot and slot.id == item_config.id then
                return 0 -- 已有槽位,不需要新槽位
            end
        end
        return 1 -- 需要一个新槽位
    end
    
    -- 有堆叠上限,计算需要额外的槽位
    local remaining_num = num
    
    -- 先查看现有槽位能堆叠多少
    for i = 1, inventory_data.max_slots do
        local slot = inventory_data.slots[i]
        if slot and slot.id == item_config.id then
            local can_add = max_stack - slot.num
            if can_add > 0 then
                remaining_num = remaining_num - can_add
                if remaining_num <= 0 then
                    return 0 -- 现有槽位足够
                end
            end
        end
    end
    
    -- 计算剩余数量需要的新槽位
    return math.ceil(remaining_num / max_stack)
end

-- 通用的遍历槽位并筛选物品
function LOC.FilterSlots(inventory_data, filter_func)
    local items = {}
    
    for i = 1, inventory_data.max_slots do
        local slot = inventory_data.slots[i]
        if slot then
            local item_config = Item.GetItemConfig(slot.id)
            if item_config and (not filter_func or filter_func(item_config)) then
                table.insert(items, {
                    slot_index = i,
                    id = slot.id,
                    item_config = item_config,
                    num = slot.num
                })
            end
        end
    end
    
    return items
end

-- 触发物品变化事件
function LOC.TriggerItemEvent(event_name, role, id, num, extra_data)
    local item_name = Item.GetItemName(id) or "Unknown"
    local event_data = {
        role = role,
        id = id,
        item_name = item_name,
        num = num
    }
    
    -- 合并额外数据
    if extra_data then
        for k, v in pairs(extra_data) do
            event_data[k] = v
        end
    end
    
    LOC.SendAllMsg(role)
    EventManager.TriggerEvent(event_name, event_data)
end

-- 验证并解析物品信息
function LOC.ValidateItemInfo(item_info)
    local id = item_info.id
    local num = item_info.num or 1
    
    if num <= 0 then
        LOG_ERROR("物品数量必须大于0")
        return nil
    end
    
    local item_config = Item.GetItemConfig(id)
    if not item_config then
        LOG_ERROR("无法找到物品配置 ID: " .. tostring(id))
        return nil
    end
    
    return { id = id, num = num, config = item_config }
end

-- ==================== 公共接口 ==============================

-- 初始化背包（在角色创建或加载时调用）
function M.InitInventory(role)
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return false
    end
    
    -- 验证已有物品数据
    local valid_count = 0
    for slot_index, slot_data in pairs(inventory_data.slots) do
        if slot_data and slot_data.id and slot_data.num and slot_data.num > 0 then
            local item_config = Item.GetItemConfig(slot_data.id)
            if item_config then
                valid_count = valid_count + 1
            else
                LOG_WARN("无法找到物品配置 ID: " .. tostring(slot_data.id))
                inventory_data.slots[slot_index] = nil
            end
        else
            -- 清理无效数据
            inventory_data.slots[slot_index] = nil
        end
    end
    
    LOG_INFO("初始化背包: %s (%d/%d 格，验证 %d 种物品)", 
        role.name, 
        inventory_data.max_slots - LOC.GetFreeSlots(inventory_data),
        inventory_data.max_slots,
        valid_count)
    
    return true
end

-- 检查自动使用
function M.CheckAutoUse(role, item_config, num)
    if not role or not item_config then
        return false
    end
    LOG_INFO("自动使用道具 id:"..item_config.id .. " name:" .. item_config.name .. " x" .. tostring(num))
    
    -- 自动加经验
    if item_config.id == 2 then
        role:AddExp(num)
        return true
    end
    
    return false
end

-- 添加物品
function M.AddItem(role, id, num)
    num = num or 1
    
    local validated = LOC.ValidateItemInfo({ id = id, num = num })
    if not validated then
        return false
    end
    
    local item_config = validated.config
    
    -- 检查自动使用
    if item_config.auto_use then
        if M.CheckAutoUse(role, item_config, num) then
            return true
        end
    end

    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return false
    end
    
    local add_count = num
    local max_stack = item_config.max_stack
    local can_stack = LOC.CanStack(max_stack)
    
    -- 如果物品可堆叠,先尝试堆叠到现有格子
    if can_stack then
        for i = 1, inventory_data.max_slots do
            local slot = inventory_data.slots[i]
            if slot and slot.id == id then
                if max_stack == 0 then
                    -- 无限堆叠
                    slot.num = slot.num + num
                    LOG_INFO("%s 添加道具 (ID:%d %s x%d) 剩余:%d 格子:%d", 
                        role.name, item_config.id, item_config.name, num, slot.num, i)
                    LOC.TriggerItemEvent("OnAddItem", role, id, num)
                    return true
                else
                    -- 有堆叠上限
                    local can_stack_count = max_stack - slot.num
                    if can_stack_count > 0 then
                        local stack_count = math.min(can_stack_count, num)
                        slot.num = slot.num + stack_count
                        num = num - stack_count
                        
                        if num <= 0 then
                            LOG_INFO("%s 添加道具 (ID:%d %s x%d) 剩余:%d 格子:%d",
                                role.name, item_config.id, item_config.name, stack_count, slot.num, i)
                            LOC.TriggerItemEvent("OnAddItem", role, id, stack_count)
                            return true
                        end
                    end
                end
            end
        end
    end
    
    -- 如果还有剩余,放入空槽位
    while num > 0 do
        local empty_slot = LOC.FindEmptySlot(inventory_data)
        if not empty_slot then
            LOG_INFO("背包已满!")
            
            -- 如果成功添加了一部分，触发事件
            if add_count > num then
                LOC.TriggerItemEvent("OnAddItem", role, id, add_count - num)
            end
            
            return false
        end
        
        -- 计算本次放入的数量
        local stack_size
        if not can_stack then
            stack_size = 1
        elseif max_stack == 0 then
            stack_size = num
        else
            stack_size = math.min(num, max_stack)
        end
        
        inventory_data.slots[empty_slot] = { id = id, num = stack_size }
        num = num - stack_size
        
        LOG_INFO("%s 添加道具 (ID:%d %s x%d) 格子:%d",
            role.name, item_config.id, item_config.name, stack_size, empty_slot)
    end
    
    LOC.TriggerItemEvent("OnAddItem", role, id, add_count)
    return true
end

-- 合并多个物品列表到目标表
-- dest: 目标表
-- ...: 一个或多个物品列表(每个元素为 {id, num})
function M.MergeItems(dest, ...)
    local sources = {...}
    for _, src in ipairs(sources) do
        for _, item in ipairs(src) do
            table.insert(dest, item)
        end
    end
end

-- ==================== 物品操作 ==============================

-- 添加多物品
function M.AddItems(role, items)
    if not items or #items == 0 then
        return true
    end
    
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return false
    end
    
    -- 预检查并验证所有物品
    local validated_items = {}
    local required_slots = 0
    
    for _, item_info in ipairs(items) do
        local validated = LOC.ValidateItemInfo(item_info)
        if not validated then
            return false
        end
        
        table.insert(validated_items, validated)
        
        -- 如果是自动使用物品,不需要占用槽位
        if not validated.config.auto_use then
            required_slots = required_slots + LOC.CalculateRequiredSlots(
                inventory_data, validated.config, validated.num)
        end
    end
    
    -- 检查背包空间
    if LOC.GetFreeSlots(inventory_data) < required_slots then
        LOG_INFO("背包空间不足，无法添加多道具 需要 %d 个空格 可用空格: %d",
            required_slots, LOC.GetFreeSlots(inventory_data))
        return false
    end
    
    -- 添加所有物品
    for _, validated in ipairs(validated_items) do
        if not M.AddItem(role, validated.id, validated.num) then
            LOG_ERROR("添加物品失败 ID: %d 数量: %d", validated.id, validated.num)
            return false
        end
    end
    
    return true
end

-- 移除物品
function M.RemoveItem(role, id, num)
    num = num or 1
    
    if num <= 0 then
        LOG_ERROR("移除物品数量必须大于0")
        return 0
    end
    
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return 0
    end
    
    local removed = 0
    
    -- 从后往前遍历,优先移除后面的
    for i = inventory_data.max_slots, 1, -1 do
        local slot = inventory_data.slots[i]
        if slot and slot.id == id then
            local remove_count = math.min(slot.num, num - removed)
            slot.num = slot.num - remove_count
            removed = removed + remove_count
            
            if slot.num <= 0 then
                inventory_data.slots[i] = nil
            end
            
            if removed >= num then
                break
            end
        end
    end
    
    if removed > 0 then
        LOG_INFO("%s 删除道具 (ID: %d %s x%d) 剩余: %d",
            role.name, id, Item.GetItemName(id) or "Unknown", removed, M.GetItemCount(role, id))
        LOC.TriggerItemEvent("OnRemoveItem", role, id, removed)
    end
    
    return removed
end

-- 移除多物品
function M.RemoveItems(role, items)
    if not items or #items == 0 then
        return true
    end
    
    -- 预检查所有物品数量
    for _, item_info in ipairs(items) do
        local validated = LOC.ValidateItemInfo(item_info)
        if not validated then
            return false
        end
        
        local current_count = M.GetItemCount(role, validated.id)
        if current_count < validated.num then
            LOG_INFO("物品不足，无法移除多道具 ID: %d 需要: %d 拥有: %d",
                validated.id, validated.num, current_count)
            return false
        end
    end
    
    -- 移除所有物品
    for _, item_info in ipairs(items) do
        local id = item_info.id
        local num = item_info.num or 1
        M.RemoveItem(role, id, num)
    end
    
    return true
end

-- 检查是否拥有物品
function M.HasItem(role, id, num)
    num = num or 1
    return M.GetItemCount(role, id) >= num
end

-- 检查是否拥有多种物品
function M.HasItems(role, items)
    for _, item_info in ipairs(items) do
        if not M.HasItem(role, item_info.id, item_info.num or 1) then
            return false
        end
    end
    return true
end

-- 获取物品数量
function M.GetItemCount(role, id)
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return 0
    end
    
    local count = 0
    for i = 1, inventory_data.max_slots do
        local slot = inventory_data.slots[i]
        if slot and slot.id == id then
            count = count + slot.num
        end
    end
    
    return count
end

-- 获取空闲槽位数
function M.GetFreeSlots(role)
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return 0
    end
    
    return LOC.GetFreeSlots(inventory_data)
end

-- 背包是否已满
function M.IsFull(role)
    return M.GetFreeSlots(role) == 0
end

-- 使用物品（通过槽位索引）
function M.UseItemBySlot(role, slot_index)
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return false
    end
    
    if not LOC.IsValidSlotIndex(inventory_data, slot_index) then
        LOG_ERROR("槽位索引越界: " .. tostring(slot_index))
        return false
    end
    
    local slot = inventory_data.slots[slot_index]
    if not slot then
        LOG_INFO("槽位为空")
        return false
    end
    
    -- 保存物品ID，因为使用后槽位可能被清空
    local item_id = slot.id
    
    -- 动态创建物品实例用于使用
    local item = GLO.Item.CreateItem(item_id)
    if not item then
        LOG_ERROR("无法创建物品实例 ID: " .. tostring(item_id))
        return false
    end
    
    -- 检查物品类型
    if item.type ~= Const.ItemType.CONSUMABLE then
        LOG_INFO("道具不是消耗品")
        return false
    end
    
    -- 使用物品
    if item:Use(role) then
        -- 减少数量
        slot.num = slot.num - 1
        
        if slot.num <= 0 then
            inventory_data.slots[slot_index] = nil
        end
        
        LOC.TriggerItemEvent("OnUseItem", role, item_id, 1, { slot_index = slot_index })
        return true
    end
    
    return false
end

-- 使用物品（通过物品ID）
function M.UseItem(role, id)
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return false
    end
    
    -- 查找第一个匹配的物品
    for i = 1, inventory_data.max_slots do
        local slot = inventory_data.slots[i]
        if slot and slot.id == id then
            return M.UseItemBySlot(role, i)
        end
    end
    
    LOG_INFO("背包中没有该物品 ID: " .. tostring(id))
    return false
end

-- 交换槽位
function M.SwapSlots(role, slot_index_1, slot_index_2)
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return false
    end
    
    if not LOC.IsValidSlotIndex(inventory_data, slot_index_1) or 
       not LOC.IsValidSlotIndex(inventory_data, slot_index_2) then
        LOG_ERROR("槽位索引越界")
        return false
    end
    
    if slot_index_1 == slot_index_2 then
        return true -- 相同槽位无需交换
    end
    
    local temp = inventory_data.slots[slot_index_1]
    inventory_data.slots[slot_index_1] = inventory_data.slots[slot_index_2]
    inventory_data.slots[slot_index_2] = temp
    
    LOG_INFO("交换插槽 " .. tostring(slot_index_1) .. " 和 " .. tostring(slot_index_2))
    return true
end

-- 获取槽位数据
function M.GetSlotData(role, slot_index)
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return nil
    end
    
    if not LOC.IsValidSlotIndex(inventory_data, slot_index) then
        return nil
    end
    
    return inventory_data.slots[slot_index]
end

-- 获取所有物品
function M.GetAllItems(role)
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return {}
    end
    
    return LOC.FilterSlots(inventory_data)
end

-- 获取主类型的所有物品
function M.GetItemsByType(role, item_type)
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return {}
    end
    
    return LOC.FilterSlots(inventory_data, function(config)
        return config.type == item_type
    end)
end

-- 获取主类型和子类型的所有物品
function M.GetItemsByTypeAndSubType(role, item_type, item_sub_type)
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return {}
    end
    
    return LOC.FilterSlots(inventory_data, function(config)
        return config.type == item_type and config.sub_type == item_sub_type
    end)
end

-- 清空背包
function M.Clear(role)
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return false
    end
    
    inventory_data.slots = {}
    
    LOG_INFO("清理背包 " .. role.name)
    return true
end

-- 打印背包
function M.PrintInventory(role)
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return
    end
    
    LOG_INFO("========== " .. role.name .. " 背包 ==========")
    LOG_INFO("插槽: " .. tostring(inventory_data.max_slots - LOC.GetFreeSlots(inventory_data)) .. "/" .. tostring(inventory_data.max_slots))
    
    for i = 1, inventory_data.max_slots do
        local slot = inventory_data.slots[i]
        if slot then
            local item_config = Item.GetItemConfig(slot.id)
            if item_config then
                LOG_INFO("[" .. tostring(i) .. "] " .. item_config.name .. " x" .. tostring(slot.num))
            end
        end
    end
    
    LOG_INFO("=============================================")
end

-- 获取背包容量信息
function M.GetCapacityInfo(role)
    local inventory_data = LOC.GetOrSetInventoryData(role)
    if not inventory_data then
        return 0, 0
    end
    
    local used = inventory_data.max_slots - LOC.GetFreeSlots(inventory_data)
    return used, inventory_data.max_slots
end


LOG_INFO("Inventory 加载完成")

return M