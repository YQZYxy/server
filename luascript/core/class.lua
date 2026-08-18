local GLO = GLO 
local M = {}
M.__index = M

-- C3 线性化算法 - 计算方法解析顺序 (MRO)
local function merge(seqs)
    local result = {}
    while true do
        local non_empty = {}
        for _, seq in ipairs(seqs) do
            if #seq > 0 then
                table.insert(non_empty, seq)
            end
        end
        
        if #non_empty == 0 then
            return result
        end
        
        local candidate = nil
        for _, seq in ipairs(non_empty) do
            local head = seq[1]
            local is_good = true
            
            -- 检查head是否在其他序列的尾部
            for _, s in ipairs(non_empty) do
                for i = 2, #s do
                    if s[i] == head then
                        is_good = false
                        break
                    end
                end
                if not is_good then break end
            end
            
            if is_good then
                candidate = head
                break
            end
        end
        
        if not candidate then
            error("无法计算一致的方法解析顺序(MRO) - 继承层次结构存在冲突")
        end
        
        table.insert(result, candidate)
        
        -- 从所有序列中移除candidate
        for _, seq in ipairs(non_empty) do
            if seq[1] == candidate then
                table.remove(seq, 1)
            end
        end
    end
end

-- 计算C3线性化
local function c3_linearize(class, bases)
    if not bases or #bases == 0 then
        return {class}
    end
    
    local seqs = {}
    
    -- 添加每个基类的MRO
    for _, base in ipairs(bases) do
        local base_mro = {}
        if base.__mro then
            for _, c in ipairs(base.__mro) do
                table.insert(base_mro, c)
            end
        else
            table.insert(base_mro, base)
        end
        table.insert(seqs, base_mro)
    end
    
    -- 添加直接基类序列
    local direct_bases = {}
    for _, base in ipairs(bases) do
        table.insert(direct_bases, base)
    end
    table.insert(seqs, direct_bases)
    
    local mro = merge(seqs)
    table.insert(mro, 1, class)
    
    return mro
end

-- 创建实例
function M:New(...)
    local instance = setmetatable({}, self)
    instance.__is_instance = true  -- 标记为实例
    if instance.Ctor then
        if type(instance.Ctor) == "function" then
            instance:Ctor(...)
        else
            LOG_WARN("类没有实现Ctor函数" .. (self.__class_name or "AnonymousClass"))
        end
    end
    return instance
end

-- 单继承
function M:Extend(class_name)
    local subclass = {}
    subclass.__index = function(t, k)
        -- 使用MRO查找方法
        if subclass.__mro then
            for _, base in ipairs(subclass.__mro) do
                local v = rawget(base, k)
                if v ~= nil then
                    return v
                end
            end
        end
        return nil
    end
    
    subclass.__class_name = class_name or "AnonymousClass"
    subclass.__bases = {self}
    subclass.__is_instance = false  -- 标记为类
    
    -- 计算MRO
    subclass.__mro = c3_linearize(subclass, {self})
    
    -- 继承基类的所有方法
    setmetatable(subclass, {
        __index = self
    })
    
    return subclass
end

-- 多继承
function M:ExtendMultiple(class_name, ...)
    local bases = {...}
    
    if #bases == 0 then
        error("ExtendMultiple 需要至少一个基类")
    end
    
    local subclass = {}
    subclass.__index = function(t, k)
        -- 使用MRO查找方法
        if subclass.__mro then
            for _, base in ipairs(subclass.__mro) do
                local v = rawget(base, k)
                if v ~= nil then
                    return v
                end
            end
        end
        return nil
    end
    
    subclass.__class_name = class_name or "AnonymousClass"
    subclass.__bases = bases
    subclass.__is_instance = false
    
    -- 计算MRO
    subclass.__mro = c3_linearize(subclass, bases)
    
    -- 设置元表，默认查找第一个基类
    setmetatable(subclass, {
        __index = bases[1]
    })
    
    return subclass
end

-- 类型检查 - 支持多继承
function M:IsA(class_type)
    local current = self
    if self.__is_instance then
        current = getmetatable(self)
    end
    
    -- 检查MRO中是否包含目标类型
    if current.__mro then
        for _, base in ipairs(current.__mro) do
            if base == class_type then
                return true
            end
        end
    end
    
    -- 降级到简单检查
    if current == class_type then
        return true
    end
    
    return false
end

-- 获取类名
function M:GetClassName()
    return self.__class_name or "AnonymousClass"
end

-- 获取所有基类
function M:GetBases()
    return self.__bases or {}
end

-- 获取MRO（方法解析顺序）
function M:GetMRO()
    return self.__mro or {self}
end

-- 调用父类方法 - 支持多继承
function M:CallSuper(method_name, ...)
    local current_class = self
    if self.__is_instance then
        current_class = getmetatable(self)
    end
    
    if not current_class.__mro then
        LOG_WARN("No MRO found for CallSuper")
        return
    end
    
    -- 在MRO中查找方法（跳过当前类）
    for i = 2, #current_class.__mro do
        local base = current_class.__mro[i]
        local method = rawget(base, method_name)
        if method and type(method) == "function" then
            return method(self, ...)
        end
    end
    
    LOG_WARN("Super method '%s' not found in MRO", method_name or "nil")
end

-- 调用指定基类的方法
function M:CallBase(base_class, method_name, ...)
    if not base_class then
        LOG_WARN("CallBase: base_class is nil")
        return
    end
    
    local method = rawget(base_class, method_name)
    if method and type(method) == "function" then
        return method(self, ...)
    end
    
    LOG_WARN("Method '%s' not found in base class '%s'", 
        method_name or "nil", base_class.__class_name or "Unknown")
end

-- 转换为字符串
function M:ToString()
    local addr = tostring(self):match("0x%x+") or tostring(self):match(": (.+)") or "unknown"
    
    -- 显示所有基类
    local bases_str = ""
    if self.__bases and #self.__bases > 0 then
        local base_names = {}
        for _, base in ipairs(self.__bases) do
            table.insert(base_names, base.__class_name or "Unknown")
        end
        bases_str = " : " .. table.concat(base_names, ", ")
    end
    
    return string.format("[%s%s@%s]", self:GetClassName(), bases_str, addr)
end

-- 检查是否为实例
function M:IsInstance()
    return self.__is_instance == true
end

-- 打印MRO（调试用）
function M:PrintMRO()
    local current = self
    if self.__is_instance then
        current = getmetatable(self)
    end
    
    if not current.__mro then
        LOG_INFO("No MRO for " .. self:GetClassName())
        return
    end
    
    LOG_INFO("========== MRO for " .. self:GetClassName() .. " ==========")
    for i, base in ipairs(current.__mro) do
        LOG_INFO("[" .. tostring(i) .. "] " .. (base.__class_name or "Unknown"))
    end
    LOG_INFO("==========================================")
end

LOG_INFO("class 加载完成")

return M