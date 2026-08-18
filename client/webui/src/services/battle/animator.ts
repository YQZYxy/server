/**
 * 战斗帧动画
 * 基于 replay-parser 解析的战报事件，按时间线逐帧驱动动画播放
 *
 * 战报格式说明:
 *   # 开头 = 元数据行
 *   无前缀 = 事件行: type_id field1 field2 ...
 */

import {
  type BattleEvent,
  type BattleHeroState,
  type AnimationFrame,
  EventType,
  SCHEMA_FIELDS,
} from '@/types'
import { getField, parseReplayText } from './replay-parser'

/**
 * 将事件分组成动画帧 (按turn分组,同回合事件合并为一帧)
 * 比 replay-parser 的逐事件分组更适合动画播放
 */
export function groupEventsByTurn(events: BattleEvent[]): AnimationFrame[] {
  const frames: AnimationFrame[] = []
  let currentTurn = 0
  let currentEvents: BattleEvent[] = []

  for (const evt of events) {
    if (evt.type === EventType.BATTLE) continue

    if (evt.type === EventType.TURN && getField(evt, 'type') === 0) {
      if (currentEvents.length > 0) {
        frames.push({
          events: [...currentEvents],
          turn: currentTurn,
          description: describeEvents(currentEvents),
        })
      }
      currentTurn = getField(evt, 'turn')
      currentEvents = []
      continue
    }

    currentEvents.push(evt)
  }

  if (currentEvents.length > 0) {
    frames.push({
      events: [...currentEvents],
      turn: currentTurn,
      description: describeEvents(currentEvents),
    })
  }

  return frames
}

function describeEvents(events: BattleEvent[]): string {
  for (const e of events) {
    if (e.type === EventType.DAMAGE) {
      const dmg = getField(e, 'damage')
      return `造成 ${dmg} 点伤害`
    }
    if (e.type === EventType.HEAL) {
      const amt = getField(e, 'amount')
      return `恢复 ${amt} 点生命`
    }
    if (e.type === EventType.DEATH) {
      return `被击败!`
    }
    if (e.type === EventType.ABILITY_ACTIVATE) {
      return `施放技能`
    }
  }
  return ''
}