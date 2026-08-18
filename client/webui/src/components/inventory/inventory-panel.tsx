// ====================================================================
//  背包面板
// ====================================================================

import { useState } from 'react'
import { gameStore } from '@/store/game-store'
import gameSocket from '@/services/socket'
import { MHT } from '@/types'
import { getItemConfig } from '@/types'
import { ItemType, ITEM_TYPES, ITEM_TYPE_TABS } from '@/types'
import PanelShell from '@/components/panel-shell'

// 注册背包数据协议
gameSocket.onMsg(MHT.MHT_SYNC_INVENTORY_DATA_SC, (body) => gameStore.setState({ inventory: body }))

/** 根据物品类型返回图标 */
function getTypeIcon(type: ItemType): string {
  return ITEM_TYPES[type]?.icon || '📦'
}

/** 从配置查找物品名称 (同步,需要已缓存) */
function getItemName(id: number): string {
  const configs = getItemConfig()
  const cfg = configs?.find(c => c.id === id)
  if (cfg) return cfg.name
  return `物品#${id}`
}

/** 从配置查找物品类型 */
function getItemType(id: number): ItemType {
  const configs = getItemConfig()
  const cfg = configs?.find(c => c.id === id)
  if (cfg) return cfg.type as ItemType
  // 配置未加载时的后备逻辑
  if (id >= 100 && id < 200) return ItemType.WEAPON
  if (id >= 200 && id < 300) return ItemType.ARMOR
  if (id >= 300 && id < 400) return ItemType.CONSUMABLE
  if (id >= 400 && id < 500) return ItemType.MATERIAL
  if (id >= 500) return ItemType.QUEST_ITEM
  return ItemType.WEAPON
}

export default function InventoryPanel() {
  const inventory = gameStore((s) => s.inventory)
  const [activeTab, setActiveTab] = useState<ItemType>(ItemType.NONE)

  const slots = inventory?.inventory_data?.slots || []
  const maxSlots = inventory?.inventory_data?.max_slots || 50

  // 按物品类型过滤
  const filteredSlots = activeTab === ItemType.NONE
    ? slots
    : slots.filter((s) => s.id != null && getItemType(s.id) === activeTab)

  return (
    <PanelShell title="背包" className="inventory-panel">
      {/* 容量条 */}
      <div className="inv-capacity">
        <div className="inv-capacity-text">容量 {slots.length}/{maxSlots}</div>
        <div className="inv-capacity-bar">
          <div
            className="inv-capacity-fill"
            style={{ width: `${maxSlots > 0 ? (slots.length / maxSlots) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 物品列表 */}
      <div className="panel-scroll">
        {filteredSlots.length === 0 ? (
          <div className="empty-hint inv-empty-hint">这个分类还是空的</div>
        ) : (
          <div className="inv-grid">
            {filteredSlots.map((slot) => (
              <div key={slot.slot_index} className="inv-item">
                <div className="inv-item-icon">
                  {slot.id != null ? getTypeIcon(getItemType(slot.id)) : '❓'}
                </div>
                <div className="inv-item-name">{slot.id != null ? getItemName(slot.id) : '未知'}</div>
                <div className="inv-item-num">x{slot.num ?? 0}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 分类标签 (固定在底部) */}
      <div className="inv-tabs">
        {ITEM_TYPE_TABS.map((type) => (
          <button
            key={type}
            className={`inv-tab ${activeTab === type ? 'active' : ''}`}
            onClick={() => setActiveTab(type)}
          >
            <span>{ITEM_TYPES[type]?.icon}</span>
            <span>{ITEM_TYPES[type]?.label}</span>
          </button>
        ))}
      </div>
    </PanelShell>
  )
}
