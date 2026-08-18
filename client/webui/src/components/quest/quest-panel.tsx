// ====================================================================
//  任务面板
// ====================================================================

import { useState } from 'react'
import { gameStore } from '@/store/game-store'
import gameSocket from '@/services/socket'
import { MHT } from '@/types'
import { getQuestConfig, QuestStatus, QUEST_STATUS } from '@/types'
import type { PB_QuestSaveData } from '@/types'
import PanelShell from '@/components/panel-shell'

// 注册任务数据协议
gameSocket.onMsg(MHT.MHT_SYNC_QUEST_DATA_SC, (body) => gameStore.setState({ quest: body }))

/** 从配置查找任务名 (同步,需要已缓存) */
function getQuestName(id: number): string {
  const configs = getQuestConfig()
  const cfg = configs?.find(c => c.id === id)
  if (cfg) return cfg.name
  return `任务#${id}`
}

/** 从配置查找任务描述 */
function getQuestDesc(id: number): string {
  const configs = getQuestConfig()
  const cfg = configs?.find(c => c.id === id)
  if (cfg) return cfg.description
  return ''
}

export default function QuestPanel() {
  const quest = gameStore((s) => s.quest)
  const [tab, setTab] = useState<'active' | 'completed'>('active')

  const questData = quest?.quest_data
  const activeQuests = questData?.active_quests || {}
  const completedIds = questData?.completed_quests || []

  // 进行中任务列表
  const activeList = Object.entries(activeQuests)
    .filter(([_, data]) => data?.status === QuestStatus.IN_PROGRESS)
    .map(([id, data]) => ({ id: Number(id), data: data as PB_QuestSaveData }))

  // 已完成+已提交任务列表
  const completedList = completedIds.map((id) => ({ id }))

  return (
    <PanelShell title="任务" className="quest-panel">
      {/* 任务统计 */}
      <div className="quest-stats">
        <div className="quest-stat">
          <span className="quest-stat-value">{activeList.length}</span>
          <span className="quest-stat-label">进行中</span>
        </div>
        <div className="quest-stat">
          <span className="quest-stat-value">{completedList.length}</span>
          <span className="quest-stat-label">已完成</span>
        </div>
        <div className="quest-stat">
          <span className="quest-stat-value">{questData?.max_active ?? 10}</span>
          <span className="quest-stat-label">上限</span>
        </div>
      </div>

      {/* 标签切换 */}
      <div className="quest-tabs">
        <button
          className={`quest-tab ${tab === 'active' ? 'active' : ''}`}
          onClick={() => setTab('active')}
        >
          进行中 ({activeList.length})
        </button>
        <button
          className={`quest-tab ${tab === 'completed' ? 'active' : ''}`}
          onClick={() => setTab('completed')}
        >
          已完成 ({completedList.length})
        </button>
      </div>

      {/* 任务列表 */}
      <div className="panel-scroll">
        {tab === 'active' ? (
          activeList.length === 0 ? (
            <div className="empty-hint">暂无进行中的任务</div>
          ) : (
            <div className="quest-list">
              {activeList.map(({ id, data }) => {
                const objList = data?.objectives || []
                const total = objList.length
                const done = objList.filter((o) => o?.completed)?.length || 0
                const pct = total > 0 ? (done / total) * 100 : 0
                return (
                  <div key={id} className="quest-card">
                    <div className="quest-card-header">
                      <span className="quest-name">{getQuestName(id)}</span>
                      <span className="quest-badge" style={{ color: QUEST_STATUS[(data?.status ?? 0) as QuestStatus]?.color }}>
                        {QUEST_STATUS[(data?.status ?? 0) as QuestStatus]?.label || '未知'}
                      </span>
                    </div>
                    <div className="quest-desc">{getQuestDesc(id)}</div>

                    {/* 进度条 */}
                    <div className="quest-progress-bar">
                      <div className="quest-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="quest-progress-text">进度 {done}/{total}</div>

                    {/* 子目标列表 */}
                    {objList.length > 0 && (
                      <div className="quest-obj-list">
                        {objList.map((obj, i) => (
                          <div key={i} className={`quest-obj ${obj?.completed ? 'done' : ''}`}>
                            <span className="quest-obj-icon">{obj?.completed ? '✅' : '⬜'}</span>
                            <span className="quest-obj-text">
                              目标 {i + 1}: {obj?.current_count ?? 0}/{obj?.current_count ?? '?'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        ) : (
          completedList.length === 0 ? (
            <div className="empty-hint">暂无已完成的任务</div>
          ) : (
            <div className="quest-list">
              {completedList.map(({ id }) => (
                <div key={id} className="quest-card completed">
                  <div className="quest-card-header">
                    <span className="quest-name">{getQuestName(id)}</span>
                    <span className="quest-badge" style={{ color: '#4CAF50' }}>✅ 已完成</span>
                  </div>
                  <div className="quest-desc">{getQuestDesc(id)}</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </PanelShell>
  )
}
