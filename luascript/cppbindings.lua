---@meta

-- ===== 手写声明 =====



-- ===== AUTO-BEGIN 由 generate_lua_bindings.py 自动生成, 请勿手改 =====

---@return integer
function cpp_GetServerTime() end

---@return integer
function cpp_GetMonotonicMicros() end

---@param event_name string
---@param callback fun()
---@param priority integer?
---@param once boolean?
---@return string
function cpp_RegisterEvent(event_name, callback, priority, once) end

---@param listener_id string
function cpp_UnregisterEvent(listener_id) end

---@param event_name string
---@param params table?
function cpp_TriggerEvent(event_name, params) end

---@param event_name string
---@param params table?
function cpp_TriggerEventAsync(event_name, params) end

function cpp_ProcessAsyncEvents() end

---@param tag string
function cpp_ProfileBegin(tag) end

---@param tag string
function cpp_ProfileEnd(tag) end

function cpp_ProfileReset() end

function cpp_ProfilePrint() end

---@param enabled boolean
function cpp_ProfileEnable(enabled) end

---@return boolean
function cpp_ProtoInit() end

---@param msg_type integer
---@param arg2 table
---@return any
function cpp_ProtoEncodeBody(msg_type, arg2) end

---@param ... any
function cpp_ProtoDecodeBody(...) end

---@param type_name string
---@param arg2 table
---@return any
function cpp_ProtoEncode(type_name, arg2) end

---@param ... any
function cpp_ProtoDecode(...) end

---@param msg_type integer
---@return any
function cpp_ProtoGetBodyType(msg_type) end

---@param msg_type integer
---@param type_name string
function cpp_ProtoRegisterMsgType(msg_type, type_name) end

function cpp_ProtoListTypes() end

---@param type_name string
function cpp_ProtoListFields(type_name) end

---@param ... any
function LOG_INFO(...) end

---@param ... any
function LOG_WARN(...) end

---@param ... any
function LOG_ERROR(...) end

---@param ... any
function LOG_I(...) end

---@param ... any
function LOG_W(...) end

---@param ... any
function LOG_E(...) end

---@param ... any
---@return string
function cpp_FastSerialize(...) end

---@param interval number
---@param callback fun()
---@param loop boolean?
---@param immediate boolean?
---@return integer
function cpp_TimerCreate(interval, callback, loop, immediate) end

---@param timer_id integer
function cpp_TimerRemove(timer_id) end

---@param activity_id integer
---@return integer
function cpp_ActivityGetState(activity_id) end

---@param activity_id integer
---@return any
function cpp_ActivityGetInfo(activity_id) end

---@return table
function cpp_ActivityGetAll() end

---@param activity_id integer
---@param role_uid integer
---@return integer
function cpp_ActivityCheckJoin(activity_id, role_uid) end

---@param activity_id integer
---@param role_uid integer
---@return boolean
function cpp_ActivityEnter(activity_id, role_uid) end

---@param activity_id integer
---@param role_uid integer
---@return boolean
function cpp_ActivityLeave(activity_id, role_uid) end

---@param activity_id integer
---@return boolean
function cpp_ActivityStart(activity_id) end

---@param activity_id integer
---@return boolean
function cpp_ActivityStop(activity_id) end

---@param config_id integer
---@return boolean
function cpp_ActivityStartByConfig(config_id) end

---@param config_id integer
---@return boolean
function cpp_ActivityStopByConfig(config_id) end

---@param map_id integer
---@param start_x number
---@param start_y number
---@param end_x number
---@param end_y number
---@param max_expand_nodes integer?
---@return integer
function cpp_ComputeFindPath(map_id, start_x, start_y, end_x, end_y, max_expand_nodes) end

---@param scene_id integer
---@param center_x number
---@param center_y number
---@param radius number
---@return integer
function cpp_ComputeQueryRange(scene_id, center_x, center_y, radius) end

---@param request_id integer
---@return boolean
function cpp_ComputeCancel(request_id) end

---@param role_uid integer
---@param cross_type integer
---@param activity_id integer
---@param hero_table table
---@return boolean
function cpp_CrossApplyEnter(role_uid, cross_type, activity_id, hero_table) end

---@param role_uid integer
function cpp_CrossApplyLeave(role_uid) end

---@param role_uid integer
---@return boolean
function cpp_CrossIsInCross(role_uid) end

---@param role_uid integer
---@return boolean
function cpp_IsCrossRole(role_uid) end

---@param role_uid integer
---@return integer
function cpp_GetRoleLocation(role_uid) end

---@param role_uid integer
---@return integer
function cpp_GetCrossState(role_uid) end

---@param role_uid integer
---@return boolean
function cpp_IsLocalActive(role_uid) end

---@param role_uid integer
---@return integer
function cpp_CrossSceneServerId(role_uid) end

---@param role_uid integer
---@return boolean
function cpp_CrossReenterWorld(role_uid) end

---@param lua_uid integer
---@param item_id integer
---@param num integer
---@param reason integer
---@param reason_text string
---@return integer
function cpp_KnapsackAdd(lua_uid, item_id, num, reason, reason_text) end

---@param lua_uid integer
---@param item_id integer
---@param num integer
---@param reason integer
---@param reason_text string
---@return integer
function cpp_KnapsackAddForce(lua_uid, item_id, num, reason, reason_text) end

---@param lua_uid integer
---@param items table?
---@param reason integer
---@param reason_text string
---@return integer
---@return boolean
function cpp_KnapsackAddBatch(lua_uid, items, reason, reason_text) end

---@param lua_uid integer
---@param item_id integer
---@param num integer
---@param reason integer
---@param reason_text string
---@return integer
function cpp_KnapsackRemove(lua_uid, item_id, num, reason, reason_text) end

---@param lua_uid integer
---@param items table?
---@param reason integer
---@param reason_text string
---@return boolean
function cpp_KnapsackRemoveBatch(lua_uid, items, reason, reason_text) end

---@param lua_uid integer
---@param items table?
---@return boolean
function cpp_KnapsackHasItems(lua_uid, items) end

---@param lua_uid integer
---@param items table?
---@return boolean
function cpp_KnapsackCanAdd(lua_uid, items) end

---@param lua_uid integer
---@param slot_index integer
---@param num integer
---@param reason integer
---@param reason_text string
---@return boolean
function cpp_KnapsackUseItem(lua_uid, slot_index, num, reason, reason_text) end

---@param lua_uid integer
---@param item_id integer
---@return integer
function cpp_KnapsackCount(lua_uid, item_id) end

---@param lua_uid integer
---@return integer
function cpp_KnapsackFreeSlots(lua_uid) end

---@param lua_uid integer
---@return integer
function cpp_KnapsackMaxSlots(lua_uid) end

---@param lua_uid integer
---@param max_slots integer
---@return boolean
function cpp_KnapsackSetMaxSlots(lua_uid, max_slots) end

---@param lua_uid integer
---@param slot_a integer
---@param slot_b integer
---@return boolean
function cpp_KnapsackSwap(lua_uid, slot_a, slot_b) end

---@param lua_uid integer
---@param slot_index integer
---@param item_id integer
---@param num integer
---@return boolean
function cpp_KnapsackSetSlot(lua_uid, slot_index, item_id, num) end

---@param lua_uid integer
---@param slot_index integer
---@return boolean
function cpp_KnapsackClearSlot(lua_uid, slot_index) end

---@param lua_uid integer
---@return boolean
function cpp_KnapsackClear(lua_uid) end

---@param lua_uid integer
---@param slot_index integer
---@return any
function cpp_KnapsackGetSlot(lua_uid, slot_index) end

---@param lua_uid integer
---@return table
function cpp_KnapsackGetAll(lua_uid) end

---@param ... any
function cpp_SendMsg(...) end

---@param ... any
function cpp_SendMsgToUid(...) end

---@param ... any
function cpp_SendDBMsg(...) end

---@param ... any
function cpp_ExecuteBattle(...) end

---@param init_table table
---@return boolean
function cpp_MmoEnter(init_table) end

---@param role_uid integer
---@return boolean
function cpp_MmoLeave(role_uid) end

---@param role_uid integer
---@param x number
---@param y number
---@param z number
---@param speed number
---@return boolean
function cpp_MmoMove(role_uid, x, y, z, speed) end

---@param role_uid integer
---@param target_uid integer
---@return boolean
function cpp_MmoAttack(role_uid, target_uid) end

---@param role_uid integer
---@param skill_id integer
---@param target_uid integer
---@return boolean
function cpp_MmoCastSkill(role_uid, skill_id, target_uid) end

---@param role_uid integer
---@param hp integer
---@return boolean
function cpp_MmoRevive(role_uid, hp) end

---@param role_uid integer
---@return any
function cpp_MmoGetRole(role_uid) end

---@param role_uid integer
---@return integer
function cpp_MmoGetObjId(role_uid) end

---@param obj_id integer
---@return integer
function cpp_MmoGetOwnerUid(obj_id) end

---@param scene_id integer
---@return table
function cpp_MmoGetSceneRoles(scene_id) end

---@param rank_type integer
---@param orders_table table?
---@return boolean
function cpp_RankConfigure(rank_type, orders_table) end

---@param rank_type integer
---@param uid integer
---@param name string?
---@param value integer?
---@param param1 integer?
---@param param2 integer?
---@param param3 integer?
---@param data string?
---@return integer
---@return integer
function cpp_RankUpsert(rank_type, uid, name, value, param1, param2, param3, data) end

---@param rank_type integer
---@param uid integer
---@param name string?
---@param value integer?
---@param param1 integer?
---@param param2 integer?
---@param param3 integer?
---@param update_time integer?
---@param data string?
---@return integer
---@return integer
function cpp_RankLoadNode(rank_type, uid, name, value, param1, param2, param3, update_time, data) end

---@param rank_type integer
---@param uid integer
---@return boolean
function cpp_RankRemove(rank_type, uid) end

---@param rank_type integer
---@param uid integer
---@return integer
function cpp_RankGetRank(rank_type, uid) end

---@param rank_type integer
---@return integer
function cpp_RankCount(rank_type) end

---@param rank_type integer
---@param uid integer
---@return any
function cpp_RankGetNode(rank_type, uid) end

---@param rank_type integer
---@param offset integer?
---@param limit integer?
---@return any
function cpp_RankGetPage(rank_type, offset, limit) end

---@param rank_type integer
---@return table
function cpp_RankGetAll(rank_type) end

---@param rank_type integer
---@return boolean
function cpp_RankClear(rank_type) end

---@param ... any
function cpp_RoleGetField(...) end

---@param ... any
function cpp_RoleSetField(...) end

-- ===== AUTO-END =====
