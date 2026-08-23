import { useEffect, useCallback, useState, useRef } from 'react'
import { gameStore } from '@/store/game-store'
import { getPagePanels,registerActivePanel } from '@/components/registry'
import {
  parseReplayText,
  groupEventsByTurn,
  parseHeroesFromReport,
  getField,
  getStrField,
  describeEvent,
  EventType,
  type BattleEvent,
  type BattleHeroState,
  type AnimationFrame,
} from '@/services/battle'

import { JOB_ICONS, DEFAULT_HERO_ICON, Job, ENEMY_ICONS, DEFAULT_ENEMY_ICONS,
  ANIMATION_SPEED, getAbilityConfig, getBattleTypeConfig 
} from '@/types'
import type { PB_BattleMatchResult } from '@/types'

const BATTLE_FIELD_PANELS = getPagePanels('battle_field')

function getHeroIcon(hero: BattleHeroState) {
  if (hero.isMonster) {
    // 敌方: 按 playerId 取图标,不在映射表中使用默认
    return ENEMY_ICONS[hero.playerId ?? -1] || DEFAULT_ENEMY_ICONS[0]
  }
  // 己方: 按 playerId(职业ID)取图标,找不到用默认
  return JOB_ICONS[hero.playerId as Job] || DEFAULT_HERO_ICON
}

interface BattleFieldPanelProps {
  result: PB_BattleMatchResult
  onBack: () => void
}

export default function BattleFieldPanel({ result, onBack }: BattleFieldPanelProps) {
  const activePanel = gameStore(s => s.activePanel)
  const setActivePanel = gameStore(s => s.setActivePanel)

  // 单场详情
  const battleType = result.battle_type ?? 0

  const [animFrames, setAnimFrames] = useState<AnimationFrame[]>([])
  const [animIndex, setAnimIndex] = useState(-1)
  const [animHeroes, setAnimHeroes] = useState<BattleHeroState[]>([])
  const [animPlaying, setAnimPlaying] = useState(false)
  const [animDesc, setAnimDesc] = useState('')
  const [floatTexts, setFloatTexts] = useState<{ id: number; text: string; type: 'damage' | 'heal' | 'info'; x: number; y: number }[]>([])

  const floatIdRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialHeroesRef = useRef<BattleHeroState[]>([]) // 缓存的初始英雄状态,用于重播
  const nameMapRef = useRef<{ [pid: number]: string }>({}) // 名字映射
  const hasAutoShownRef = useRef(false)
  const [focusPids, setFocusPids] = useState<number[]>([])

  // ---- 解析战报 ----
  useEffect(() => {
    const rawText = (result.battle_report as string) || ''
    if (!rawText) return

    const events = parseReplayText(rawText)
    const heroes = parseHeroesFromReport(rawText)
    const frames = groupEventsByTurn(events)

    // 构建名字映射
    const nm: { [pid: number]: string } = {}
    for (const h of heroes) nm[h.pid] = h.name
    nameMapRef.current = nm

    // 缓存初始状态
    initialHeroesRef.current = heroes.map(h => ({ ...h }))

    setAnimFrames(frames)
    setAnimHeroes(heroes)
    setAnimIndex(-1)
    setAnimPlaying(true)
    setFloatTexts([])

    console.log('[Battle] 初始英雄:', heroes.map(h => `${h.pid} HP=${h.hp}/${h.maxHp} MP=${h.mp}/${h.maxMp}`))
  }, [result])

  // ---- 队伍统计 ----
  const playerHeroes = animHeroes.filter(h => h.teamSide === 1)
  const enemyHeroes = animHeroes.filter(h => h.teamSide === 2)
  const playerTotalHp = playerHeroes.reduce((s, h) => s + Math.max(0, h.hp), 0)
  const playerTotalMaxHp = playerHeroes.reduce((s, h) => s + h.maxHp, 0)
  const enemyTotalHp = enemyHeroes.reduce((s, h) => s + Math.max(0, h.hp), 0)
  const enemyTotalMaxHp = enemyHeroes.reduce((s, h) => s + h.maxHp, 0)

  // 从第一个英雄取队伍信息
  const playerTeamInfo = playerHeroes[0]
  const enemyTeamInfo = enemyHeroes[0]

  // ---- 根据事件类型获取浮动文字应定位到的 pid ----
  const getDisplayPid = useCallback((evt: BattleEvent): number => {
    switch (evt.type) {
      case EventType.ABILITY_ACTIVATE:
        // 技能释放 → 在施法者(source)上显示
        return getField(evt, 'source')
      case EventType.DAMAGE:
        // 伤害 → 在受伤目标(target)上显示
        return getField(evt, 'target')
      case EventType.HEAL:
        // 治疗 → 在被治疗目标(target)上显示
        return getField(evt, 'target')
      case EventType.EFFECT_APPLIED:
      case EventType.EFFECT_REMOVED:
      case EventType.EFFECT_TICK:
        // 效果 → 在目标(target)上显示
        return getField(evt, 'target')
      case EventType.DEATH:
        // 死亡 → 在死者(victim)上显示
        return getField(evt, 'victim')
      case EventType.STATUS_CHANGE:
      case EventType.ATTR_CHANGE:
        // 状态/属性变化 → 在主体(pid)上显示
        return getField(evt, 'pid')
      default:
        return getField(evt, 'target') || getField(evt, 'source') || getField(evt, 'victim') || getField(evt, 'pid') || 0
    }
  }, [])

  /** 根据 pid 计算浮动文字位置 */
  const getFloatPosition = useCallback((pid: number, heroes: BattleHeroState[]) => {
    const hero = heroes.find(h => h.pid === pid)
    const isEnemy = hero?.teamSide === 2 || pid > 10
    return {
      x: isEnemy ? 25 + Math.random() * 50 : 25 + Math.random() * 50,
      y: isEnemy ? 15 + Math.random() * 10 : 65 + Math.random() * 10,
      isEnemy,
    }
  }, [])

  // ---- 应用帧事件 ----
  const applyFrameEvents = useCallback((events: BattleEvent[]) => {
    setAnimHeroes(prev => {
      const updated = prev.map(h => ({ ...h }))
      const floats: typeof floatTexts = []
      const nameMap = nameMapRef.current

      for (const evt of events) {
        const displayPid = getDisplayPid(evt)
        const { x: floatX, y: floatY, isEnemy: isEnemyTarget } = getFloatPosition(displayPid, updated)

        if (evt.type === EventType.ABILITY_ACTIVATE) {
          const abilityId = getField(evt, 'ability_id')
          const success = getField(evt, 'success')
          if (!success) continue
          // 从配置表获取技能名和消耗
          let abilityName = ''
          let abilityCfg: { name?: string; cost_attrs?: [number, number][] } | undefined
          try {
            const cfgs = getAbilityConfig()
            abilityCfg = cfgs?.find(c => c.id === abilityId)
            abilityName = abilityCfg?.name || ''
          } catch (_) { /* 配置未加载 */ }
          // 扣除技能消耗的法力值
          const srcPid = getField(evt, 'source')
          const srcHero = updated.find(h => h.pid === srcPid)
          if (srcHero && abilityCfg?.cost_attrs) {
            for (const [attrId, cost] of abilityCfg.cost_attrs) {
              if (attrId === 2) {
                srcHero.mp = Math.max(0, srcHero.mp - cost)
              }
            }
          }
          floats.push({
            id: floatIdRef.current++, text: `⚡ ${abilityName || abilityId}`, type: 'info',
            x: floatX, y: floatY,
          })
        } else if (evt.type === EventType.TURN) {
          // 回合开始/结束浮动显示
          const turnType = getField(evt, 'type')  // 0=开始 1=结束
          const turnNum = getField(evt, 'turn')
          const isStart = turnType === 0
          floats.push({
            id: floatIdRef.current++,
            text: isStart ? `🎯 第${turnNum}回合` : `✅ 第${turnNum}回合结束`,
            type: 'info',
            x: 50, y: isStart ? 40 : 45,
          })
        } else if (evt.type === EventType.DAMAGE) {
          const targetPid = getField(evt, 'target')
          const targetHero = updated.find(h => h.pid === targetPid)
          if (targetHero && targetHero.hp <= 0) continue
          const dmg = getField(evt, 'damage')
          const hpAfter = getField(evt, 'hp_after')
          if (targetHero) {
            targetHero.hp = hpAfter > 0 ? hpAfter : Math.max(0, targetHero.hp - dmg)
            if (targetHero.hp <= 0) targetHero.alive = false
          }
          floats.push({ id: floatIdRef.current++, text: `-${Math.floor(dmg)}`, type: 'damage', x: floatX, y: floatY })
        } else if (evt.type === EventType.HEAL) {
          const targetPid = getField(evt, 'target')
          const targetHero = updated.find(h => h.pid === targetPid)
          if (targetHero && targetHero.hp <= 0) continue
          const amt = getField(evt, 'amount')
          const hpAfter = getField(evt, 'hp_after')
          if (targetHero) {
            targetHero.hp = hpAfter > 0 ? hpAfter : Math.min(targetHero.maxHp, targetHero.hp + amt)
            if (targetHero.hp > 0) targetHero.alive = true
          }
          floats.push({ id: floatIdRef.current++, text: `+${Math.floor(amt)}`, type: 'heal', x: floatX, y: floatY })
        } else if (evt.type === EventType.DEATH) {
          const victimPid = getField(evt, 'victim')
          const victim = updated.find(h => h.pid === victimPid)
          if (victim) { victim.alive = false; victim.hp = 0 }
          const vName = victim?.name || nameMap[victimPid] || `[${victimPid}]`
          floats.push({ id: floatIdRef.current++, text: `${vName} 阵亡!`, type: 'info', x: 50, y: isEnemyTarget ? 20 : 70 })
        } else if (evt.type === EventType.EFFECT_APPLIED) {
          // 效果应用浮动显示
          const effectName = getStrField(evt, 'effect_name')
          const dur = getField(evt, 'duration')
          floats.push({
            id: floatIdRef.current++, text: `✨ ${effectName.replace(/_/g, ' ')}${dur > 0 ? ` ${dur}s` : ''}`,
            type: 'info', x: floatX, y: floatY,
          })
        } else if (evt.type === EventType.ATTR_CHANGE) {
          // 属性变化: 处理法力回复消耗等
          const pid = getField(evt, 'pid')
          const attrId = getField(evt, 'attr_id')
          const newVal = getField(evt, 'new')
          const hero = updated.find(h => h.pid === pid)
          if (hero && attrId === 8) {
            // 法力回复: 增加MP
            hero.mp = Math.min(hero.maxMp, hero.mp + newVal)
          }
        } else if (evt.type === EventType.STATUS_CHANGE) {
          const stName = getStrField(evt, 'status_name')
          const added = getField(evt, 'added')
          floats.push({
            id: floatIdRef.current++,
            text: `${added ? '🔵' : '⚪'} ${stName.replace(/_/g, ' ')}`,
            type: 'info', x: floatX, y: floatY,
          })
        } else if (evt.type === EventType.EFFECT_REMOVED) {
          // 效果移除浮动显示
          const effectName = getStrField(evt, 'effect_name')
          floats.push({
            id: floatIdRef.current++, text: `❌ ${effectName.replace(/_/g, ' ')}`,
            type: 'info', x: floatX, y: floatY,
          })
        } else if (evt.type === EventType.EFFECT_TICK) {
          // 效果周期触发浮动显示
          const effectName = getStrField(evt, 'effect_name')
          const tickVal = getField(evt, 'value')
          floats.push({
            id: floatIdRef.current++, text: `⚡ ${effectName.replace(/_/g, ' ')} ${tickVal}`,
            type: 'info', x: floatX, y: floatY,
          })
        } else if (evt.type === EventType.CUSTOM) {
          // 自定义事件浮动显示
          const extType = getStrField(evt, 'ext_type')
          const dataVal = getField(evt, 'data')
          floats.push({
            id: floatIdRef.current++, text: `📦 ${extType.replace(/_/g, ' ')}${dataVal > 0 ? ` ${dataVal}` : ''}`,
            type: 'info', x: floatX, y: floatY,
          })
        }
      }

      setFloatTexts(floats)
      if (floats.length > 0) setTimeout(() => setFloatTexts([]), 1500)
      return updated
    })
  }, [getDisplayPid, getFloatPosition])

  // ---- 自动播放 ----
  const playNextFrame = useCallback(() => {
    setAnimIndex(prev => {
      const next = prev + 1
      if (next >= animFrames.length) {
        setAnimPlaying(false)
        setAnimDesc('战斗结束')
        return prev
      }
      return next
    })
  }, [animFrames.length])

  // ---- 监听动画结束,自动弹窗(仅第一次) ----
  useEffect(() => {
    if (animIndex < 0) return
    if (animIndex >= animFrames.length - 1 && !animPlaying && !hasAutoShownRef.current) {
      hasAutoShownRef.current = true
      const t = setTimeout(() => setActivePanel('result'), 800)
      return () => clearTimeout(t)
    }
  }, [animIndex, animPlaying, animFrames.length])

  useEffect(() => {
    if (animIndex < 0 || animIndex >= animFrames.length) return
    const frame = animFrames[animIndex]
    const evt = frame.events[0]
    if (evt) {
      const desc = describeEvent(evt, nameMapRef.current)
      setAnimDesc(desc)
      // 收集帧内所有事件关联的pid,高亮所有相关英雄卡片
      const allPids = new Set<number>()
      for (const e of frame.events) {
        const pid = getDisplayPid(e)
        if (pid > 0) allPids.add(pid)
      }
      setFocusPids(Array.from(allPids))
    }
    applyFrameEvents(frame.events)
  }, [animIndex, animFrames, applyFrameEvents, getDisplayPid])

  useEffect(() => {
    if (!animPlaying || animFrames.length === 0) return
    timerRef.current = setTimeout(playNextFrame, ANIMATION_SPEED)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [animPlaying, animIndex, animFrames.length, playNextFrame])

  // ---- 重播(重置自动弹窗标记) ----
  const handleReplay = useCallback(() => {
    // 用缓存的初始状态重置
    const initial = initialHeroesRef.current
    if (initial.length > 0) {
      setAnimHeroes(initial.map(h => ({ ...h })))
    }
    setAnimIndex(-1)
    setAnimPlaying(true)
    setFloatTexts([])
    setAnimDesc('')
  }, [])

  // ---- 渲染 ----
  return (
    <div className="battle-page">

      {/* ---- 注册面板覆盖层(传入当前场 PB_BattleMatchResult, 战报/结果面板) ---- */}
      {registerActivePanel(activePanel, setActivePanel, result)}  

      {/* 顶部栏 */}
      <div className="battle-topbar">
        <div className="battle-topbar-left">
          <button className="arena-back-btn" onClick={onBack}>← 返回</button>
        </div>
        <div className="battle-topbar-center">
          {animIndex >= animFrames.length - 1 ? (
            <button className="btn-view-result" onClick={() => setActivePanel('result')}>
              🏆 {getBattleTypeConfig(battleType)?.label ?? '战斗'}结果
            </button>
          ) : (
            <h2>{getBattleTypeConfig(battleType)?.label ?? '战斗'}战斗中</h2>
          )}
        </div>
        <div className="battle-topbar-right">
          <button className="btn-more" onClick={() => setActivePanel('report')}>📋 战报</button>
        </div>
      </div>

      <div className="battle-field">
        {/* 敌方总血量 */}
        <div className="battle-team-info enemy-team-info">
          <div className="team-hp-bar">
            <div className="team-hp-label">
              <span>HP</span>
              {enemyTeamInfo?.teamId ? <span className="team-info-text">UID:{enemyTeamInfo.teamId}</span> : null}
              {enemyTeamInfo?.teamName ? <span className="team-info-text">{enemyTeamInfo.teamName.replace(/_/g, ' ')}</span> : null}
            </div>
            <div className="hp-bar-track">
              <div className="hp-bar-fill enemy" style={{ width: `${enemyTotalMaxHp > 0 ? (enemyTotalHp / enemyTotalMaxHp) * 100 : 0}%` }} />
            </div>
            <span className="team-hp-text">{Math.floor(enemyTotalHp)}/{Math.floor(enemyTotalMaxHp)}</span>
          </div>
        </div>

        {/* 敌方英雄 */}
        <div className="battle-heroes enemy-heroes">
          {enemyHeroes.map((h, i) => (
            <div key={h.pid} className={`battle-hero-card ${!h.alive ? 'dead' : ''}`}>
              <div className="hero-icon">
                {getHeroIcon(h)}
                {animDesc && focusPids.includes(h.pid) && (
                  <div className="hero-anim-desc" key={`${animIndex}-${h.pid}`}>{animDesc}</div>
                )}
              </div>
              <div className="hero-name-tag">{h.name}</div>
              <div className="hero-hp-bar">
                <div className="hp-bar-track">
                  <div className="hp-bar-fill enemy" style={{ width: `${h.maxHp > 0 ? (Math.max(0, h.hp) / h.maxHp) * 100 : 0}%` }} />
                </div>
                <span className="hero-hp-text">{Math.max(0, Math.floor(h.hp))}</span>
              </div>
              <div className="hero-mp-bar">
                <div className="mp-bar-track">
                  <div className="mp-bar-fill" style={{ width: `${h.maxMp > 0 ? (Math.max(0, h.mp) / h.maxMp) * 100 : 0}%` }} />
                </div>
                <span className="hero-mp-text">{Math.max(0, Math.floor(h.mp))}</span>
              </div>
              {!h.alive && <div className="dead-overlay"></div>}
            </div>
          ))}
        </div>

        {/* 中间战场 */}
        <div className="battle-center">
          <div className="battle-field-view">
            {/* 浮动文字 */}
            <div className="float-texts-container">
              {floatTexts.map(ft => (
                <div key={ft.id} className={`float-text float-${ft.type}`} style={{ left: `${ft.x}%`, top: `${ft.y}%` }}>
                  {ft.text}
                </div>
              ))}
            </div>

            {/* 控制栏 */}
            <div className="battle-controls">
              {/* 帧跳转输入 */}
              <input
                className="frame-input"
                type="number"
                min={1}
                max={animFrames.length}
                value={Math.max(1, animIndex + 1)}
                onChange={e => {
                  const v = parseInt(e.target.value)
                  if (v >= 1 && v <= animFrames.length) {
                    setAnimPlaying(false)
                    setAnimIndex(v - 1)
                  }
                }}
              />
              <span className="battle-progress">/ {animFrames.length}</span>

              {/* 后退一帧 */}
              <button className="btn-control" title="上一帧" onClick={() => {
                setAnimPlaying(false);
                setAnimIndex(prev => Math.max(0, prev - 1))
              }}>⏪</button>

              {/* 暂停/播放(从当前帧继续) */}
              {animPlaying ? (
                <button className="btn-control" title="暂停" onClick={() => setAnimPlaying(false)}>⏸</button>
              ) : (
                <button className="btn-control" title="播放" onClick={() => {
                  if (animIndex >= animFrames.length - 1) {
                    // 已播完,重置到开头
                    const initial = initialHeroesRef.current
                    if (initial.length > 0) setAnimHeroes(initial.map(h => ({ ...h })))
                    setAnimIndex(-1)
                    setFloatTexts([])
                    setAnimDesc('')
                  }
                  setAnimPlaying(true)
                }}>▶</button>
              )}

              {/* 前进一帧 */}
              <button className="btn-control" title="下一帧" onClick={() => {
                setAnimPlaying(false);
                setAnimIndex(prev => Math.min(animFrames.length - 1, prev + 1))
              }}>⏩</button>

              {/* 跳到最后 */}
              <button className="btn-control" title="跳到最后" onClick={() => {
                setAnimPlaying(false);
                setAnimIndex(animFrames.length - 1)
              }}>⏭</button>
            </div>

            {/* 战斗结束自动弹出结果 */}
          </div>
        </div>

        {/* 己方英雄 */}
        <div className="battle-heroes player-heroes">
          {playerHeroes.map((h, i) => (
            <div key={h.pid} className={`battle-hero-card ${!h.alive ? 'dead' : ''}`}>
              <div className="hero-icon">
                {getHeroIcon(h)}
                {animDesc && focusPids.includes(h.pid) && (
                  <div className="hero-anim-desc" key={`${animIndex}-${h.pid}`}>{animDesc}</div>
                )}
              </div>
              <div className="hero-name-tag">{h.name}</div>
              <div className="hero-hp-bar">
                <div className="hp-bar-track">
                  <div className="hp-bar-fill" style={{ width: `${h.maxHp > 0 ? (Math.max(0, h.hp) / h.maxHp) * 100 : 0}%` }} />
                </div>
                <span className="hero-hp-text">{Math.max(0, Math.floor(h.hp))}</span>
              </div>
              <div className="hero-mp-bar">
                <div className="mp-bar-track">
                  <div className="mp-bar-fill" style={{ width: `${h.maxMp > 0 ? (Math.max(0, h.mp) / h.maxMp) * 100 : 0}%` }} />
                </div>
                <span className="hero-mp-text">{Math.max(0, Math.floor(h.mp))}</span>
              </div>
              {!h.alive && <div className="dead-overlay">💀</div>}
            </div>
          ))}
        </div>

        {/* 己方总血量 */}
        <div className="battle-team-info player-team-info">
          <div className="team-hp-bar">
            <div className="team-hp-label">
              <span>HP</span>
              {playerTeamInfo?.teamId ? <span className="team-info-text">UID:{playerTeamInfo.teamId}</span> : null}
              {playerTeamInfo?.teamName ? <span className="team-info-text">{playerTeamInfo.teamName.replace(/_/g, ' ')}</span> : null}
            </div>
            <div className="hp-bar-track">
              <div className="hp-bar-fill" style={{ width: `${playerTotalMaxHp > 0 ? (playerTotalHp / playerTotalMaxHp) * 100 : 0}%` }} />
            </div>
            <span className="team-hp-text">{Math.floor(playerTotalHp)}/{Math.floor(playerTotalMaxHp)}</span>
          </div>
        </div>
      </div>

    </div>
  )
}
