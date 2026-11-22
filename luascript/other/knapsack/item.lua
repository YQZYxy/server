-- ====================================================================
-- 物品模块
-- 消耗品使用GAS效果系统
-- ====================================================================

local GLO = GLO 
local ItemDef = GLO.ItemDef
local Utils = GLO.Utils
local EventManager = GLO.EventManager
local ConfigManager = GLO.ConfigManager

local M = {}

local Item = GLO.Class:Extend("Item")
local WeaponItem = Item:Extend("WeaponItem")
local ArmorItem = Item:Extend("ArmorItem")
local ConsumableItem = Item:Extend("ConsumableItem")
local MaterialItem = Item:Extend("MaterialItem")
local TaskItem = Item:Extend("TaskItem")

-- 获取配置
function M.GetItemConfig(item_id)
    local configs = ConfigManager.itemconfig
    return configs[item_id]
end

-- 获取道具名
function M.GetItemName(item_id)
    local config = M.GetItemConfig(item_id)
    return config and config.name or "未知道具"
end

function M.GetAllItemConfigs()
    return ConfigManager.itemconfig
end

function M.GetItemByTypeConfigs(item_type)
    local items = {}
    local configs = ConfigManager.itemconfig
    
    for item_id, config in pairs(configs) do
        if config.type == item_type then
            table.insert(items, item_id)
        end
    end
    
    return items
end

function M.CreateItemByNameConfigs(name)
    local configs = ConfigManager.itemconfig

    for item_id, config in pairs(configs) do
        if config.name == name then
            return M.CreateItem(item_id)
        end
    end
    
    LOG_ERROR("未按名称找到道具: " .. tostring(name))
    return nil
end


-- =================创建物品==============

function M.CreateItem(item_id)
    local config = M.GetItemConfig(item_id)
    if not config then
        LOG_ERROR("找不到道具配置 ID: " .. tostring(item_id))
        return nil
    end
    
    local item_type = config.type
    
    if item_type == ItemDef.ItemType.WEAPON then
        return WeaponItem:New(item_id)
    elseif item_type == ItemDef.ItemType.ARMOR then
        return ArmorItem:New(item_id)
    elseif item_type == ItemDef.ItemType.CONSUMABLE then
        return ConsumableItem:New(item_id)
    elseif item_type == ItemDef.ItemType.MATERIAL then
        return MaterialItem:New(item_id)
    elseif item_type == ItemDef.ItemType.TASK_ITEM then
        return TaskItem:New(item_id)
    else
        return Item:New(item_id)
    end
end

-- ==============物品基类===================

function Item:Ctor(item_id)
    local config = M.GetItemConfig(item_id)
    if not config then
        LOG_ERROR("配置未找到道具: " .. tostring(item_id))
        return
    end
    
    self.item_id = config.item_id
    self.name = config.name
    self.description = config.description
    self.type = config.type
    self.sub_type = config.sub_type
    self.quality = config.quality
    self.level = config.level
    self.auto_use = config.auto_use
    self.use_type = config.use_type
    self.discard = config.discard
    self.max_stack = config.max_stack
    self.sell_price = config.sell_price
    self.buy_price = config.buy_price
    self.gas_effects = config.gas_effects
end

function Item:GetQualityColor()
    if ItemDef.ItemQualityColor then
        return ItemDef.ItemQualityColor[self.quality] or "#ffffff"
    end
    return "#ffffff"
end

function Item:GetTooltip()
    local tooltip = {}
    table.insert(tooltip, self.name)
    table.insert(tooltip, "Level: " .. tostring(self.level))
    table.insert(tooltip, "品质: " .. tostring(self.quality))
    
    if self.description ~= "" then
        table.insert(tooltip, "")
        table.insert(tooltip, self.description)
    end
    
    if self.sell_price and 0 < self.sell_price then
        table.insert(tooltip, "")
        table.insert(tooltip, "售价: " .. tostring(self.sell_price) .. " 金币")
    end
    
    return table.concat(tooltip, "\n")
end

-- ===================武器类================

function WeaponItem:Ctor(item_id)
    self:CallSuper("Ctor", item_id)
    
    self.damage = 10
    self.attack_speed = 1.0
    
    local config = M.GetItemConfig(item_id)
    if config then
        self.damage = config.damage
        self.attack_speed = config.attack_speed
    end
end

function WeaponItem:GetDPS()
    return self.damage * self.attack_speed
end

-- ====================护甲类===============

function ArmorItem:Ctor(item_id)
    self:CallSuper("Ctor", item_id)
    
    self.armor = 10
    self.slot = ItemDef.EquipSlot.NONE
    
    local config = M.GetItemConfig(item_id)
    if config then
        self.armor = config.armor
        self.slot = config.slot or ItemDef.EquipSlot.NONE
    end
end

-- ==================消耗品类 (使用GAS)=============

function ConsumableItem:Ctor(item_id)
    self:CallSuper("Ctor", item_id)
end

function ConsumableItem:Use(role)
    if not role then
        return false
    end


    LOG_WARN("消耗品使用失败: Role不再直接持有ASC,hero_id:%d", role.uid)
    return false
end

-- ====================材料类===============

function MaterialItem:Ctor(item_id)
    self:CallSuper("Ctor", item_id)
    
end

-- ====================任务物品类===============

function TaskItem:Ctor(item_id)
    self:CallSuper("Ctor", item_id)

end


-- =================注册事件监听器===============
EventManager.RegisterListener(EventManager.lua_OnAddItem, function(event_data)
    local role = event_data.role
    local item_name = event_data.item_name
    local num = event_data.num

    if role and item_name then
        LOG_INFO(role.name .. " 获取: " .. item_name .. " x" .. tostring(num))
    end
end)

EventManager.RegisterListener(EventManager.lua_OnRemoveItem, function(event_data)
    local role = event_data.role
    local item_id = event_data.item_id
    local num = event_data.num

    if role then
        LOG_INFO(role.name .. " 删除道具 (ID: " .. tostring(item_id) .. ") x" .. tostring(num))
    end
end)

EventManager.RegisterListener(EventManager.lua_OnUseItem, function(event_data)
    local role = event_data.role
    local item_name = event_data.item_name

    if role and item_name then
        LOG_INFO(role.name .. " 使用: " .. item_name)
    end
end)

LOG_INFO("Item 加载完成")

return M