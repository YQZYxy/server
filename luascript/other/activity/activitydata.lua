-- ====================================================================
--  个人活动数据
-- ====================================================================

local GLO = GLO
local M = {}

local FIELD_PATH = "growth.activity"
local PROTO_TYPE = "PB_ActivityRoleData"

-- 读取角色活动数据, 不存在返回空表
local function Load(uid)
    local raw = cpp_RoleGetField(uid, FIELD_PATH)
    if not raw or raw == "" then
        return { nodes = {} }
    end

    local decoded = GLO.Protobuf.Decode(raw, PROTO_TYPE)
    if not decoded or not decoded.nodes then
        return { nodes = {} }
    end
    return decoded
end

-- 回写角色活动数据
local function Save(uid, data)
    local encoded = GLO.Protobuf.Encode(data or { nodes = {} }, PROTO_TYPE)
    if not encoded then
        LOG_ERROR("活动数据编码失败 uid:" .. tostring(uid))
        return false
    end
    return cpp_RoleSetField(uid, FIELD_PATH, encoded)
end

-- 取单个活动节点, 不存在返回 nil
function M.Get(uid, activity_id)
    local data = Load(uid)
    for _, node in ipairs(data.nodes) do
        if node.activity_id == activity_id then
            return node
        end
    end
    return nil
end

-- 更新单个活动节点, updater 直接在节点上改字段
function M.Update(uid, activity_id, updater)
    local data = Load(uid)
    local target = nil
    for _, node in ipairs(data.nodes) do
        if node.activity_id == activity_id then
            target = node
            break
        end
    end

    if not target then
        target = {
            activity_id = activity_id,
            round = 0,
            count = 0,
            score = 0,
            last_time = 0,
            rewarded = false,
            extra = "",
        }
        table.insert(data.nodes, target)
    end

    if updater then
        updater(target)
    end
    return Save(uid, data)
end

-- 清空某个活动的个人数据
function M.Reset(uid, activity_id)
    local data = Load(uid)
    local remain = {}
    for _, node in ipairs(data.nodes) do
        if node.activity_id ~= activity_id then
            table.insert(remain, node)
        end
    end
    data.nodes = remain
    return Save(uid, data)
end

return M
