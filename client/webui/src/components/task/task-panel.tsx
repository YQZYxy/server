// ====================================================================
//  任务面板
// ====================================================================

import { useState } from 'react'
import { gameStore } from '@/store/game-store'
import gameSocket from '@/services/socket'
import { MHT } from '@/types'
import { getTaskConfig, TaskStatus, TASK_STATUS } from '@/types'
import type { PB_TaskSaveData } from '@/types'
import PanelShell from '@/components/panel-shell'

// 注册任务数据协议
gameSocket.onMsg(MHT.MHT_SYNC_TASK_DATA_SC, (body) => gameStore.setState({ task: body }))

/** 从配置查找任务名 (同步,需要已缓存) */
function getTaskName(id: number): string {
  const configs = getTaskConfig()
  const cfg = configs?.find(c => c.task_id === id)
  if (cfg) return cfg.name
  return `任务#${id}`
}

/** 从配置查找任务描述 */
function getTaskDesc(id: number): string {
  const configs = getTaskConfig()
  const cfg = configs?.find(c => c.task_id === id)
  if (cfg) return cfg.description
  return ''
}

export default function TaskPanel() {
  const task = gameStore((s) => s.task)
  const [tab, setTab] = useState<'active' | 'completed'>('active')

  const taskData = task?.task_data
  const activeTasks = taskData?.active_tasks || {}
  const completedIds = taskData?.completed_tasks || []

  // 进行中任务列表
  const activeList = Object.entries(activeTasks)
    .filter(([_, data]) => data?.status === TaskStatus.IN_PROGRESS)
    .map(([id, data]) => ({ id: Number(id), data: data as PB_TaskSaveData }))

  // 已完成+已提交任务列表
  const completedList = completedIds.map((id) => ({ id }))

  return (
    <PanelShell title="任务" className="task-panel">
      {/* 任务统计 */}
      <div className="task-stats">
        <div className="task-stat">
          <span className="task-stat-value">{activeList.length}</span>
          <span className="task-stat-label">进行中</span>
        </div>
        <div className="task-stat">
          <span className="task-stat-value">{completedList.length}</span>
          <span className="task-stat-label">已完成</span>
        </div>
        <div className="task-stat">
          <span className="task-stat-value">{taskData?.max_active ?? 10}</span>
          <span className="task-stat-label">上限</span>
        </div>
      </div>

      {/* 标签切换 */}
      <div className="task-tabs">
        <button
          className={`task-tab ${tab === 'active' ? 'active' : ''}`}
          onClick={() => setTab('active')}
        >
          进行中 ({activeList.length})
        </button>
        <button
          className={`task-tab ${tab === 'completed' ? 'active' : ''}`}
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
            <div className="task-list">
              {activeList.map(({ id, data }) => {
                const objList = data?.objectives || []
                const total = objList.length
                const done = objList.filter((o) => o?.completed)?.length || 0
                const pct = total > 0 ? (done / total) * 100 : 0
                return (
                  <div key={id} className="task-card">
                    <div className="task-card-header">
                      <span className="task-name">{getTaskName(id)}</span>
                      <span className="task-badge" style={{ color: TASK_STATUS[(data?.status ?? 0) as TaskStatus]?.color }}>
                        {TASK_STATUS[(data?.status ?? 0) as TaskStatus]?.label || '未知'}
                      </span>
                    </div>
                    <div className="task-desc">{getTaskDesc(id)}</div>

                    {/* 进度条 */}
                    <div className="task-progress-bar">
                      <div className="task-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="task-progress-text">进度 {done}/{total}</div>

                    {/* 子目标列表 */}
                    {objList.length > 0 && (
                      <div className="task-obj-list">
                        {objList.map((obj, i) => (
                          <div key={i} className={`task-obj ${obj?.completed ? 'done' : ''}`}>
                            <span className="task-obj-icon">{obj?.completed ? '✅' : '⬜'}</span>
                            <span className="task-obj-text">
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
            <div className="task-list">
              {completedList.map(({ id }) => (
                <div key={id} className="task-card completed">
                  <div className="task-card-header">
                    <span className="task-name">{getTaskName(id)}</span>
                    <span className="task-badge" style={{ color: '#4CAF50' }}>✅ 已完成</span>
                  </div>
                  <div className="task-desc">{getTaskDesc(id)}</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </PanelShell>
  )
}
