import {
  EventType,
  SCHEMA_FIELDS,
  EVENT_NAMES,
  getMonsterConfig,
  type BattleEvent,
  type BattleHeroState,
  type AnimationFrame,
  type NameMap,
} from '@/types'

import { Attr, ATTR_NAMES_FALLBACK } from '@/types'

/** 取事件的指定名字段值(数值) */
export function getField(evt: BattleEvent, name: string): number {
  const fields = SCHEMA_FIELDS[evt.type]
  if (!fields) return 0
  const idx = fields.indexOf(name)
  if (idx < 0 || idx >= evt.fields.length) return 0
  const val = evt.fields[idx]
  return typeof val === 'number' ? val : 0
}

/** 取事件的指定名字段值(字符串) */
export function getStrField(evt: BattleEvent, name: string): string {
  const fields = SCHEMA_FIELDS[evt.type]
  if (!fields) return ''
  const idx = fields.indexOf(name)
  if (idx < 0 || idx >= evt.fields.length) return ''
  const val = evt.fields[idx]
  return typeof val === 'string' ? val : ''
}

// 战报文本转事件列表
export function parseReplayText(text: string): BattleEvent[] {
  const events: BattleEvent[] = []
  for (const _line of text.split('\n')) {
    const line = _line.trim()
    if (!line || line.startsWith('#')) continue
    const parts = line.split(/\s+/)
    const typeId = parseInt(parts[0])
    if (isNaN(typeId)) continue
    // 尝试转数字,失败则保留为字符串(如效果名、状态名等)
    const fields: (number | string)[] = parts.slice(1).map(v => {
      const n = Number(v)
      return isNaN(n) ? v : n
    })
    events.push({
      type: typeId,
      fields,
      line,
    })
  }
  return events
}

// 获取英雄初始状态
export function parseHeroesFromReport(rawText: string): BattleHeroState[] {
  const defaults: BattleHeroState[] = [
    { pid: 1, name: '英雄', hp: 500, maxHp: 500, mp: 200, maxMp: 200, teamSide: 1, isMonster: false, alive: true },
    { pid: 2, name: '敌人', hp: 300, maxHp: 300, mp: 100, maxMp: 100, teamSide: 2, isMonster: true, alive: true },
  ]

  try {
    // 按解析顺序收集参与者
    const participantList: { pid: number; playerId: number; playerType: number; name: string; level: number; team_id: number; team_name: string; teamSide: number; hp: number; maxHp: number; mp: number; maxMp: number }[] = []

    for (const _line of rawText.split('\n')) {
      const line = _line.trim()
      if (!line) continue

      // #PARTICIPANT: pid player_id player_type name level team_id team_name team_side [#sym:attrs ...]
      if (line.startsWith('#PARTICIPANT:')) {
        const content = line.substring('#PARTICIPANT:'.length)
        const parts = content.split(/\s+/)
        const pid = parseInt(parts[0]) || 0
        const playerId = parseInt(parts[1]) || 0    // player_id
        const playerType = parseInt(parts[2]) || 0  // player_type
        const name = parts[3] || `英雄${pid}`
        const level = parseInt(parts[4]) || 1
        const team_id = parseInt(parts[5]) || 0  // team_id(玩家UID或怪物队伍ID)
        const team_name = parts[6] || ''           // team_name(队伍名称)
        const teamSide = parseInt(parts[7]) || 1

        // 解析 #sym:attrs attr=val,...
        let hp = 0, maxHp = 0, mp = 0, maxMp = 0
        const attrsIdx = content.indexOf('#sym:attrs')
        if (attrsIdx >= 0) {
          const after = content.substring(attrsIdx + '#sym:attrs'.length).trim()
          // 取到下一个 #sym: 或行尾
          const endIdx = after.indexOf('#sym:')
          const attrsStr = endIdx >= 0 ? after.substring(0, endIdx).trim() : after
          for (const pair of attrsStr.split(',')) {
            const eq = pair.indexOf('=')
            if (eq < 0) continue
            const id = parseInt(pair.substring(0, eq).trim())
            const val = parseFloat(pair.substring(eq + 1).trim())
            if (id === 1) hp = val
            else if (id === -1) maxHp = val
            else if (id === 2) mp = val
            else if (id === -2) maxMp = val
          }
        }

        participantList.push({ pid, playerId, playerType, name, level, team_id, team_name, teamSide, hp, maxHp, mp, maxMp })
        continue
      }
    }

    if (participantList.length === 0) return defaults

    // 按pid排序
    participantList.sort((a, b) => a.pid - b.pid)

    const heroMap = new Map<number, BattleHeroState>()
    for (let i = 0; i < participantList.length; i++) {
      const p = participantList[i]
      const isMonster = p.playerType === 2  // ENTITY_TYPE_MONSTER

      heroMap.set(p.pid, {
        pid: p.pid, name: p.name,
        hp: p.hp, maxHp: p.maxHp, mp: p.mp, maxMp: p.maxMp,
        teamSide: p.teamSide, isMonster, alive: true, level: p.level,
        playerType: p.playerType,
        playerId: p.playerId,
        teamId: p.team_id > 0 ? p.team_id : undefined,
        teamName: p.team_name || undefined,
      })
    }

    // 如果有hp=0的英雄,尝试从DAMAGE事件补全初始HP
    if (heroMap.size > 0) {
      for (const _line of rawText.split('\n')) {
        const line = _line.trim()
        if (!line || line.startsWith('#')) continue
        const parts = line.split(/\s+/)
        const typeId = parseInt(parts[0])
        if (typeId === EventType.DAMAGE && parts.length >= 8) {
          const targetPid = parseInt(parts[2])
          const hero = heroMap.get(targetPid)
          if (hero && hero.hp === 0) {
            const hpBefore = parseFloat(parts[6])
            if (hpBefore > 0) {
              hero.hp = hpBefore
              hero.maxHp = Math.max(hero.maxHp, hpBefore)
            }
          }
        }
      }
    }

    return Array.from(heroMap.values()).sort((a, b) => a.pid - b.pid)
  } catch (e) {
    console.warn('[BattleParser] 解析英雄数据失败:', e)
  }
  return defaults
}

// 事件分组(逐事件)
export function groupEventsByTurn(events: BattleEvent[]): AnimationFrame[] {
  const frames: AnimationFrame[] = []
  let turn = 0

  for (const evt of events) {
    if (evt.type === EventType.BATTLE) continue
    if (evt.type === EventType.TURN) {
      turn = getField(evt, 'turn')
      frames.push({
        events: [evt],
        turn,
        description: evt.line,
      })
      continue
    }
    frames.push({
      events: [evt],
      turn,
      description: evt.line,
    })
  }

  return frames
}

// 生成文本描述(含名字解析)
export function describeEvent(evt: BattleEvent, names: NameMap): string {
  const n = (pid: number) => names[pid] || `[${pid}]`
  const s = (name: string) => name.replace(/_/g, ' ')
  const t = evt.type

  if (t === EventType.ABILITY_ACTIVATE) {
    const src = getField(evt, 'source')
    const abl = getField(evt, 'ability_id')
    const ok = getField(evt, 'success')
    return `${n(src)} 施放技能 ${abl}${!ok ? ' 失败' : ''}`
  }
  if (t === EventType.DAMAGE) {
    const src = getField(evt, 'source')
    const tgt = getField(evt, 'target')
    const dmg = getField(evt, 'damage')
    const crit = getField(evt, 'is_crit')
    const hp = getField(evt, 'hp_after')
    return `${n(src)} → ${n(tgt)} -${dmg}${crit ? ' 暴击!' : ''} [HP${hp}]`
  }
  if (t === EventType.HEAL) {
    const src = getField(evt, 'source')
    const tgt = getField(evt, 'target')
    const amt = getField(evt, 'amount')
    const hp = getField(evt, 'hp_after')
    return `${n(src)} → ${n(tgt)} +${amt} [HP${hp}]`
  }
  if (t === EventType.DEATH) {
    const v = getField(evt, 'victim')
    const k = getField(evt, 'killer')
    return `${n(v)} 被 ${n(k)} 击败! ☠️`
  }
  if (t === EventType.EFFECT_APPLIED) {
    const tgt = getField(evt, 'target')
    const eff = getStrField(evt, 'effect_name')
    const dur = getField(evt, 'duration')
    return `${n(tgt)} ← ${s(eff)}${dur > 0 ? ` ${dur}s` : ''}`
  }
  if (t === EventType.EFFECT_REMOVED) {
    const tgt = getField(evt, 'target')
    const eff = getStrField(evt, 'effect_name')
    return `${n(tgt)} ✗ ${s(eff)}`
  }
  if (t === EventType.EFFECT_TICK) {
    const tgt = getField(evt, 'target')
    const eff = getStrField(evt, 'effect_name')
    const val = getField(evt, 'value')
    return `${n(tgt)} ⚡${s(eff)} ${val}`
  }
  if (t === EventType.STATUS_CHANGE) {
    const pid = getField(evt, 'pid')
    const st = getStrField(evt, 'status_name')
    const add = getField(evt, 'added')
    return `${n(pid)} ${add ? '获得' : '失去'} ${s(st)}`
  }
  if (t === EventType.ATTR_CHANGE) {
    const pid = getField(evt, 'pid')
    const attr = getField(evt, 'attr_id')
    const oldV = getField(evt, 'old')
    const newV = getField(evt, 'new')
    return `${n(pid)} ${ATTR_NAMES_FALLBACK[attr as Attr] || `属性${attr}`} ${oldV} → ${newV}`
  }
  if (t === EventType.CUSTOM) {
    return `${evt.line}`
  }

  return evt.line
}

// 调试输出
export function logParsedReport(rawText: string, label = '战报解析'): void {
  const events = parseReplayText(rawText)
  const heroes = parseHeroesFromReport(rawText)
  const frames = groupEventsByTurn(events)

  console.groupCollapsed(`%c${label}`, 'font-weight:bold;color:#FFD700')
  console.log(`事件总数: ${events.length}, 英雄数: ${heroes.length}, 帧数: ${frames.length}`)

  // 打印完整原始战报
  console.groupCollapsed('%c原始战报', 'color:#FF9800')
  console.log(rawText)
  console.groupEnd()

  console.groupCollapsed('%c英雄', 'color:#4CAF50')
  for (const h of heroes) {
    console.log(`  pid=${h.pid} "${h.name}" team=${h.teamSide} HP=${h.hp}/${h.maxHp} MP=${h.mp}/${h.maxMp} ${h.alive ? '' : '💀'}`)
  }
  console.groupEnd()

  // 按回合打印全部事件(含BATTLE/TURN,按Schema解码字段名)
  console.log(`%c=== 全部解析事件 ===`, 'color:#FFD700;font-weight:bold')
  let frameIdx = 0
  let currentTurn = 0
  let lastTurn = -1

  for (const evt of events) {
    if (evt.type === EventType.BATTLE) {
      const bf = SCHEMA_FIELDS[EventType.BATTLE] || []
      const parts: string[] = []
      for (let fi = 0; fi < bf.length && fi < evt.fields.length; fi++) {
        parts.push(`${bf[fi]}=${evt.fields[fi]}`)
      }
      const isStart = getField(evt, 'type') === 0
      console.log(`%c[BATTLE ${isStart ? '开始' : '结束'}] ${parts.join(', ')}`, 'color:#FF5722')
      continue
    }

    // TURN 事件: 记录当前回合号,不打印
    if (evt.type === EventType.TURN) {
      if (getField(evt, 'type') === 0) {
        currentTurn = getField(evt, 'turn')
      }
      continue
    }

    // 回合切换时打印分组头
    if (currentTurn !== lastTurn) {
      if (lastTurn >= 0) console.groupEnd()
      console.group(`%c回合 ${currentTurn}`, 'color:#AB47BC;font-weight:bold;font-size:13px')
      lastTurn = currentTurn
    }

    const typeName = EVENT_NAMES[evt.type] || `TYPE_${evt.type}`
    const fields = SCHEMA_FIELDS[evt.type]
    let detail = ''
    if (fields) {
      const parts: string[] = []
      for (let fii = 0; fii < fields.length && fii < evt.fields.length; fii++) {
        parts.push(`${fields[fii]}=${evt.fields[fii]}`)
      }
      detail = parts.join(', ')
    } else {
      detail = evt.line
    }
    const color = EVENT_COLORS[evt.type] || '#9E9E9E'
    ++frameIdx
    console.log(`%c  [#${frameIdx}][${evt.type}][${typeName}] ${detail}`, `color:${color}`)
  }
  if (lastTurn >= 0) console.groupEnd()

  console.groupEnd()
}

// 事件颜色映射(用于console输出)
const EVENT_COLORS: Record<number, string> = {
  [EventType.ABILITY_ACTIVATE]: '#FF9800', [EventType.DAMAGE]: '#F44336', [EventType.HEAL]: '#4CAF50',
  [EventType.DEATH]: '#9C27B0', [EventType.STATUS_CHANGE]: '#2196F3', [EventType.ATTR_CHANGE]: '#00BCD4',
  [EventType.EFFECT_APPLIED]: '#795548', [EventType.EFFECT_REMOVED]: '#795548', [EventType.EFFECT_TICK]: '#795548',
  [EventType.TURN]: '#9E9E9E',
}

// 计算战后最终英雄状态(遍历全部事件到结束)
export function computeFinalHeroes(rawText: string): BattleHeroState[] {
  const heroes = parseHeroesFromReport(rawText)
  if (heroes.length === 0) return heroes

  const heroMap = new Map<number, BattleHeroState>()
  for (const h of heroes) heroMap.set(h.pid, { ...h })

  const events = parseReplayText(rawText)
  for (const evt of events) {
    if (evt.type === EventType.DAMAGE) {
      const targetPid = getField(evt, 'target')
      const hpAfter = getField(evt, 'hp_after')
      const hero = heroMap.get(targetPid)
      if (hero) {
        hero.hp = hpAfter > 0 ? hpAfter : Math.max(0, hero.hp - getField(evt, 'damage'))
        if (hero.hp <= 0) hero.alive = false
      }
    } else if (evt.type === EventType.HEAL) {
      const targetPid = getField(evt, 'target')
      const hpAfter = getField(evt, 'hp_after')
      const hero = heroMap.get(targetPid)
      if (hero) {
        hero.hp = hpAfter > 0 ? hpAfter : Math.min(hero.maxHp, hero.hp + getField(evt, 'amount'))
        if (hero.hp > 0) hero.alive = true
      }
    } else if (evt.type === EventType.DEATH) {
      const victimPid = getField(evt, 'victim')
      const hero = heroMap.get(victimPid)
      if (hero) { hero.hp = 0; hero.alive = false }
    } else if (evt.type === EventType.ATTR_CHANGE) {
      const pid = getField(evt, 'pid')
      const attrId = getField(evt, 'attr_id')
      const newVal = getField(evt, 'new')
      const hero = heroMap.get(pid)
      if (hero && attrId === 2) {
        // MANA变化
        hero.mp = newVal
      } else if (hero && attrId === 1) {
        // HEALTH变化(直接设置HP)
        hero.hp = newVal
      }
    }
  }

  return Array.from(heroMap.values()).sort((a, b) => a.pid - b.pid)
}