-- ====================================================================
-- 物品模块
-- 消耗品使用GAS效果系统
-- ====================================================================

local GLO = GLO 
local Const = GLO.Const
local Utils = GLO.Utils
local EventManager = GLO.EventManager
local ConfigManager = GLO.ConfigManager

local M = {}

local Item = GLO.Class:Extend("Item")
local WeaponItem = Item:Extend("WeaponItem")
local ArmorItem = Item:Extend("ArmorItem")
local ConsumableItem = Item:Extend("ConsumableItem")
local MaterialItem = Item:Extend("MaterialItem")
local QuestItem = Item:Extend("QuestItem")

-- 获取配置
function M.GetItemConfig(id)
    local configs = ConfigManager.itemconfig
    return configs[id]
end

-- 获取道具名
function M.GetItemName(id)
    local config = M.GetItemConfig(id)
    return config and config.name or "未知道具"
end

function M.GetAllItemConfigs()
    return ConfigManager.itemconfig
end

function M.GetItemByTypeConfigs(item_type)
    local items = {}
    local configs = ConfigManager.itemconfig
    
    for id, config in pairs(configs) do
        if config.type == item_type then
            table.insert(items, id)
        end
    end
    
    return items
end

function M.CreateItemByNameConfigs(name)
    local configs = ConfigManager.itemconfig

    for id, config in pairs(configs) do
        if config.name == name then
            return M.CreateItem(id)
        end
    end
    
    LOG_ERROR("未按名称找到道具: " .. tostring(name))
    return nil
end


-- =================创建物品==============

function M.CreateItem(id)
    local config = M.GetItemConfig(id)
    if not config then
        LOG_ERROR("找不到道具配置 ID: " .. tostring(id))
        return nil
    end
    
    local item_type = config.type
    
    if item_type == Const.ItemType.WEAPON then
        return WeaponItem:New(id)
    elseif item_type == Const.ItemType.ARMOR then
        return ArmorItem:New(id)
    elseif item_type == Const.ItemType.CONSUMABLE then
        return ConsumableItem:New(id)
    elseif item_type == Const.ItemType.MATERIAL then
        return MaterialItem:New(id)
    elseif item_type == Const.ItemType.QUEST_ITEM then
        return QuestItem:New(id)
    else
        return Item:New(id)
    end
end

-- ==============物品基类===================

function Item:Ctor(id)
    local config = M.GetItemConfig(id)
    if not config then
        LOG_ERROR("配置未找到道具: " .. tostring(id))
        return
    end
    
    self.id = config.id
    self.name = config.name or ""
    self.description = config.description or ""
    self.type = config.type or Const.ItemType.NONE
    self.sub_type = config.sub_type or Const.ItemSubType.NONE
    self.quality = config.quality or Const.ItemQuality.COMMON
    self.level = config.level or 1
    self.auto_use = config.auto_use or false
    self.discard = config.discard or true
    self.max_stack = config.max_stack or 1
    self.sell_price = config.sell_price or 0
    self.buy_price = config.buy_price or 0
    self.gas_effects = config.gas_effects or {}
end

function Item:GetQualityColor()
    if Const.ItemQualityColor then
        return Const.ItemQualityColor[self.quality] or "#ffffff"
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

function WeaponItem:Ctor(id)
    self:CallSuper("Ctor", id)
    
    self.damage = 10
    self.attack_speed = 1.0
    
    local config = M.GetItemConfig(id)
    if config then
        self.damage = config.damage or 10
        self.attack_speed = config.attack_speed or 1.0
    end
end

function WeaponItem:GetDPS()
    return self.damage * self.attack_speed
end

-- ====================护甲类===============

function ArmorItem:Ctor(id)
    self:CallSuper("Ctor", id)
    
    self.armor = 10
    self.slot = Const.EquipSlot.NONE
    
    local config = M.GetItemConfig(id)
    if config then
        self.armor = config.armor or 10
        self.slot = config.slot or Const.EquipSlot.NONE
    end
end

-- ==================消耗品类 (使用GAS)=============

function ConsumableItem:Ctor(id)
    self:CallSuper("Ctor", id)
end

function ConsumableItem:Use(role)
    if not role then
        return false
    end


    LOG_WARN("消耗品使用失败: Role不再直接持有ASC,hero_id:%d", role.uid or 0)
    return false
end

-- ====================材料类===============

function MaterialItem:Ctor(id)
    self:CallSuper("Ctor", id)
    
end

-- ====================任务物品类===============

function QuestItem:Ctor(id)
    self:CallSuper("Ctor", id)

end


-- =================注册事件监听器===============
EventManager.RegisterListener(EventManager.lua_OnAddItem, function(event_data)
    local role = event_data.role
    local item_name = event_data.item_name
    local num = event_data.num

    if role and item_name then
        LOG_INFO("【事件】 " .. role.name .. " 获取: " .. item_name .. " x" .. tostring(num))
    end
end)

EventManager.RegisterListener(EventManager.lua_OnRemoveItem, function(event_data)
    local role = event_data.role
    local id = event_data.id
    local num = event_data.num

    if role then
        LOG_INFO("【事件】 " .. role.name .. " 删除道具 (ID: " .. tostring(id) .. ") x" .. tostring(num))
    end
end)

EventManager.RegisterListener(EventManager.lua_OnUseItem, function(event_data)
    local role = event_data.role
    local item = event_data.item

    if role and item then
        LOG_INFO("【事件】 " .. role.name .. " 使用: " .. item.name)
    end
end)

LOG_INFO("Item 加载完成")

return M