// ====================================================================
//  战报详情面板
//  在组件内直接显示战报解析内容
// ====================================================================

import { useMemo, useCallback } from 'react'
import { type P_GasBattle_SC } from '@/types'
import {
  parseReplayText,
  parseHeroesFromReport,
  computeFinalHeroes,
  groupEventsByTurn,
  getField,
  getStrField,
  describeEvent,
  EventType,
  SCHEMA_FIELDS,
  EVENT_NAMES,
  type BattleEvent,
  type NameMap,
} from '@/services/battle'
import PanelShell from '@/components/panel-shell'

interface ReportPanelProps {
  reportText?: string
  onClose?: () => void
  /** 由BattleFieldPanel通过registry传入 */
  data?: P_GasBattle_SC
}

/** 将原始战报文本按行解析为元数据映射 */
function parseMetaLines(text: string) {
  const metas: { type: string; content: string }[] = []
  for (const _line of text.split('\n')) {
    const line = _line.trim()
    if (!line) continue
    if (line.startsWith('#')) {
      const colon = line.indexOf(':')
      if (colon > 0) {
        metas.push({ type: line.substring(0, colon), content: line.substring(colon + 1).trim() })
      }
    }
  }
  return { metas }
}

const EVENT_COLORS: Record<number, string> = {
  [EventType.ABILITY_ACTIVATE]: '#FF9800',
  [EventType.DAMAGE]: '#F44336',
  [EventType.HEAL]: '#4CAF50',
  [EventType.DEATH]: '#9C27B0',
  [EventType.STATUS_CHANGE]: '#2196F3',
  [EventType.ATTR_CHANGE]: '#00BCD4',
  [EventType.EFFECT_APPLIED]: '#795548',
  [EventType.EFFECT_REMOVED]: '#795548',
  [EventType.EFFECT_TICK]: '#795548',
}

/** 将事件解码为可读字符串 */
function decodeEvent(evt: BattleEvent, names: NameMap): string {
  const s = (name: string) => name.replace(/_/g, ' ')
  const n = (pid: number) => names[pid] || `[${pid}]`
  const t = evt.type

  if (t === EventType.ABILITY_ACTIVATE) {
    const src = getField(evt, 'source'); const tgt = getField(evt, 'target')
    const abl = getField(evt, 'ability_id'); const ok = getField(evt, 'success')
    return `${n(src)}→${n(tgt)} 技能${abl}${!ok ? '❌' : ''}`
  }
  if (t === EventType.DAMAGE) {
    const src = getField(evt, 'source'); const tgt = getField(evt, 'target')
    const dmg = getField(evt, 'damage'); const hp = getField(evt, 'hp_after')
    return `${n(src)}→${n(tgt)} -${dmg} [HP${hp}]`
  }
  if (t === EventType.HEAL) {
    const src = getField(evt, 'source'); const tgt = getField(evt, 'target')
    const amt = getField(evt, 'amount'); const hp = getField(evt, 'hp_after')
    return `${n(src)}→${n(tgt)} +${amt} [HP${hp}]`
  }
  if (t === EventType.DEATH) {
    return `${n(getField(evt, 'victim'))} ☠️`
  }
  if (t === EventType.EFFECT_APPLIED) {
    return `${n(getField(evt, 'target'))} ← ${s(getStrField(evt, 'effect_name'))}`
  }
  if (t === EventType.EFFECT_REMOVED) {
    return `${n(getField(evt, 'target'))} ✗ ${s(getStrField(evt, 'effect_name'))}`
  }
  if (t === EventType.EFFECT_TICK) {
    return `${n(getField(evt, 'target'))} ⚡${s(getStrField(evt, 'effect_name'))} ${getField(evt, 'value')}`
  }
  if (t === EventType.STATUS_CHANGE) {
    const pid = getField(evt, 'pid')
    const stName = s(getStrField(evt, 'status_name'))
    return `${n(pid)} ${getField(evt, 'added') ? '🔵' : '⚪'} ${stName}`
  }
  if (t === EventType.ATTR_CHANGE) {
    return `${n(getField(evt, 'pid'))} attr${getField(evt, 'attr_id')} ${getField(evt, 'old')}→${getField(evt, 'new')}`
  }
  return evt.line
}

export function ReportPanel({ reportText: propText, onClose, data: propData }: ReportPanelProps = {}) {
  const reportText = propText ?? propData?.battle_report

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  const { rawText, heroes, frames, metas, names } = useMemo(() => {
    if (!reportText) return { rawText: '', heroes: [], frames: [], metas: [], names: {} }
    const text = typeof reportText === 'string' ? reportText : new TextDecoder().decode(reportText)
    const events = parseReplayText(text)
    const h = computeFinalHeroes(text)
    const f = groupEventsByTurn(events)
    const { metas: m } = parseMetaLines(text)
    const nm: NameMap = {}; for (const hh of h) nm[hh.pid] = hh.name
    return { rawText: reportText, heroes: h, frames: f, metas: m, names: nm }
  }, [reportText])

  if (!reportText) return null

  return (
    <PanelShell title="战斗详情" onClose={handleClose}>
      <div className="report-panel-body">
        {/* 基本信息 */}
        <div className="report-info-bar">
          <span>帧数: {frames.length}</span>
          <span>事件: {frames.length}</span>
          <span>英雄: {heroes.length}</span>
        </div>

        {/* 战斗实例列表 */}
        <div className="report-team-list">
          {/* 攻击方(玩家) */}
          <div className="report-team-section attack">
            <div className="report-team-header attack">
              🛡️ 攻击方{heroes.filter(h => h.teamSide === 1)[0]?.teamName ? ` - ${heroes.filter(h => h.teamSide === 1)[0]!.teamName!.replace(/_/g, ' ')}` : ''}
              {heroes.filter(h => h.teamSide === 1)[0]?.teamId ? ` UID:${heroes.filter(h => h.teamSide === 1)[0]!.teamId}` : ''}
            </div>
            <div className="report-hero-chips">
              {heroes.filter(h => h.teamSide === 1).map(h => (
                <span key={h.pid} className={`report-hero-chip ${h.hp > 0 ? 'alive attack' : 'dead'}`}>
                  {h.name} HP:{Math.floor(h.hp)}/{Math.floor(h.maxHp)} MP:{Math.floor(h.mp)}/{Math.floor(h.maxMp)}
                </span>
              ))}
            </div>
          </div>

          {/* 防守方(怪物/敌方) */}
          <div className="report-team-section defense">
            <div className="report-team-header defense">
              ⚔️ 防守方{heroes.filter(h => h.teamSide === 2)[0]?.teamName ? ` - ${heroes.filter(h => h.teamSide === 2)[0]!.teamName!.replace(/_/g, ' ')}` : ''}
              {heroes.filter(h => h.teamSide === 2)[0]?.teamId ? ` UID:${heroes.filter(h => h.teamSide === 2)[0]!.teamId}` : ''}
            </div>
            <div className="report-hero-chips">
              {heroes.filter(h => h.teamSide === 2).map(h => (
                <span key={h.pid} className={`report-hero-chip ${h.hp > 0 ? 'alive defense' : 'dead'}`}>
                  {h.name} HP:{Math.floor(h.hp)}/{Math.floor(h.maxHp)} MP:{Math.floor(h.mp)}/{Math.floor(h.maxMp)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 按回合分组的事件 */}
        <div className="report-event-list">
          {frames.map((frame, fi) => {
            const evt = frame.events[0]
            const typeName = EVENT_NAMES[evt.type] || `T${evt.type}`
            const color = EVENT_COLORS[evt.type] || '#9E9E9E'

            // 回合切换时插入回合头
            const isNewTurn = fi === 0 || frame.turn !== frames[fi - 1].turn

            return (
              <div key={fi}>
                {isNewTurn && (
                  <div className="report-turn-header">
                    回合 {frame.turn}
                  </div>
                )}
                <div className={`report-event-row${fi % 2 === 0 ? ' even' : ''}`}>
                  <span className="report-event-idx">#{fi + 1}</span>
                  <span className="report-event-type" style={{ color }}>{typeName}</span>
                  <span className="report-event-desc">{decodeEvent(evt, names)}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* 按钮 */}
        <div className="result-actions">
          <button className="btn-primary" onClick={handleClose}>关闭</button>
        </div>
      </div>
    </PanelShell>
  )
}
