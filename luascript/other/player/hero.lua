-- ====================================================================
--  Hero - 英雄实体
-- ====================================================================

local GLO = GLO
local M = {}
local Player = GLO.Player
local PlayerDef = GLO.PlayerDef
local ConfigManager = GLO.ConfigManager

local Hero = Player.Player:Extend('Hero')
M.Hero = Hero

function M.GetHeroConfig(hero_id)
    return ConfigManager.heroconfig[hero_id]
end

-- 英雄: 全局默认 + 英雄配置覆盖
function M.GetAttrBaseMap(hero_config)
    local map = {}
    for _, attr_id in pairs(PlayerDef.Attr) do
        local attr_cfg = ConfigManager.attrconfig and ConfigManager.attrconfig[attr_id]
        map[attr_id] = attr_cfg.base
    end
    if hero_config and hero_config.base_attr then
        for attr_id, val in pairs(hero_config.base_attr) do
            map[attr_id] = val
        end
    end
    return map
end

-- 英雄: 从 hero_config.attr_growth 提取成长值
function M.GetAttrGrowthMap(hero_config)
    local map = {}
    if hero_config and hero_config.attr_growth then
        for attr_id, val in pairs(hero_config.attr_growth) do
            map[attr_id] = val
        end
    end
    return map
end

-- 从快照计算英雄属性和战力(用于UI展示,不创建实例)
function M.GetAttrsAndPower(snapshot, hero_id)
    local hd = GLO.RoleBattleSnapshot.FindHero(snapshot, hero_id)
    if not hd then
        error("英雄数据缺失 hero_id:" .. tostring(hero_id))
    end

    local hero_config = ConfigManager.heroconfig[hero_id]
    if not hero_config then
        error("heroconfig 缺少英雄配置 hero_id:" .. tostring(hero_id))
    end
    local base_map = M.GetAttrBaseMap(hero_config)
    local growth_map = M.GetAttrGrowthMap(hero_config)
    if not hd.level or hd.level <= 0 then
        error("英雄等级缺失 hero_id:" .. tostring(hero_id))
    end
    local level = hd.level
    local attrs = Player.CalculateAttrsFromConfig(base_map, growth_map, level)

    local power = 0
    for _, val in pairs(attrs) do power = power + math.floor(val) end
    return attrs, power
end

function M.CreateHeroForBattle(hero_id, level, ability_ids, owner_role, snapshot)
    local config = M.GetHeroConfig(hero_id)
    if not config then
        error("heroconfig 缺少英雄配置 hero_id:" .. tostring(hero_id))
    end
    if not level or level <= 0 then
        error("创建战斗英雄等级无效 hero_id:" .. tostring(hero_id))
    end
    local hero = Hero:New(hero_id, level, config, owner_role, snapshot)
    if not hero then return nil end

    if ability_ids and next(ability_ids) then
        for _, aid in ipairs(ability_ids) do hero:AddAbility(aid, 1) end
    elseif config.starting_abilities then
        for _, aid in ipairs(config.starting_abilities) do hero:AddAbility(aid, 1) end
    end
    return hero
end

-- Hero类

function Hero:Ctor(hero_id, level, config, owner_role, snapshot)
    self:CallSuper('Ctor')

    self.obj_id = hero_id
    self.obj_type = PlayerDef.ObjType.HERO

    self.hero_id = hero_id
    self.level = level
    self.name = config.name
    self.config = config
    self.owner_role = owner_role
    self.snapshot = snapshot

    self:CalculateAttr()
end

function Hero:CalculateAttr()
    local base_map = M.GetAttrBaseMap(self.config)
    local growth_map = M.GetAttrGrowthMap(self.config)
    self.attrs = Player.CalculateAttrsFromConfig(base_map, growth_map, self.level)

    -- 满血满蓝
    self.attrs[PlayerDef.Attr.MAX_HEALTH] = self.attrs[PlayerDef.Attr.HEALTH]
    self.attrs[PlayerDef.Attr.MAX_MANA] = self.attrs[PlayerDef.Attr.MANA]
end

-- 属性缩放(用于怪物属性倍率,英雄暂不需要)
function Hero:ScaleAttributes(scale)
    for attr_id, val in pairs(self.attrs or {}) do
        self.attrs[attr_id] = val * scale
    end
end

-- 设置等级(重算属性)
function Hero:SetLevel(level)
    self.level = level
    self:CalculateAttr()
end

LOG_INFO(' Hero 加载完成')
return M
