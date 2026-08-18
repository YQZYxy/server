// ====================================================================
//  英雄详情面板
// ====================================================================

import { useCallback, useMemo, useState } from 'react'
import { getAttrConfig } from '@/types'
import type { PB_HeroData, AttrConfig } from '@/types'
import { Attr, ATTR_NAMES_FALLBACK, getHeroConfig, getAbilityConfig } from '@/types'

interface HeroDetailPanelProps {
  hero: PB_HeroData
  onBack: () => void
}

export default function HeroDetailPanel({ hero, onBack }: HeroDetailPanelProps) {
  // 属性配置由 preloadAllConfigs 统一预加载,直接同步构建映射
  const attrConfigs = useMemo(() => {
    const arr = getAttrConfig()
    if (!arr) return null
    const map: Record<number, AttrConfig> = {}
    for (const c of arr) map[c.id] = c
    return map
  }, [])

  // 获取属性名: 优先从配置, 否则用后备
  const getAttrName = useCallback((id: number): string => {
    const attrId = id as Attr
    return attrConfigs?.[id]?.name || ATTR_NAMES_FALLBACK[attrId] || `属性#${id}`
  }, [attrConfigs])

  // 英雄名和技能名配置查找
  const heroName = useMemo(() => {
    const configs = getHeroConfig()
    return configs?.find(c => c.id === hero.hero_id)?.name || `英雄#${hero.hero_id}`
  }, [hero.hero_id])

  const getAbilityName = useCallback((id: number): string => {
    const configs = getAbilityConfig()
    return configs?.find(c => c.id === id)?.name || `技能#${id}`
  }, [])

  const attrPairs = useMemo(() => hero?.attrs?.attrs ?? [], [hero])
  const abilityIds = useMemo(() => hero?.abilities?.ability_ids ?? [], [hero])
  const combatPower = useMemo(() => hero.combat_power ?? 0, [hero])

  // 属性分组
  const attrGroups = useMemo(() => {
    const map: Record<number, number> = {}
    for (const a of attrPairs) {
      if (a.attr_id != null && a.value != null) map[a.attr_id] = a.value
    }
    return [
      { label: '生命/法力', ids: [Attr.HEALTH, Attr.MANA], format: (v: number) => v.toFixed(0) },
      { label: '主属性', ids: [Attr.STRENGTH, Attr.AGILITY, Attr.INTELLIGENCE, Attr.VITALITY, Attr.LUCK], format: (v: number) => v.toFixed(0) },
      { label: '战斗属性', ids: [Attr.CRIT_CHANCE, Attr.CRIT_DAMAGE, Attr.ATTACK_SPEED, Attr.DODGE_CHANCE, Attr.BLOCK_CHANCE, Attr.DAMAGE_MULTIPLIER], format: (v: number) => v < 10 ? `${(v * 100).toFixed(1)}%` : v.toFixed(2) },
      { label: '护甲', ids: [Attr.ARMOR], format: (v: number) => v.toFixed(0) },
    ]
  }, [attrPairs])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onBack()
  }, [onBack])

  return (
    <div className="panel-overlay hero-detail-overlay" onClick={handleOverlayClick}>
      <div className="panel-container hero-detail-container" onClick={e => e.stopPropagation()}>
        <div className="panel-header">
          <button className="panel-back" onClick={onBack}>← 返回</button>
        </div>

        <div className="panel-scroll">
          {/* 英雄图标 + 战斗力 */}
          <div className="hero-detail-avatar">
            <span className="hero-detail-icon">🧙</span>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <h2 className="panel-title-center">{heroName}</h2>
            <span className="cp-label">战斗力 </span>
            <span className="cp-value">{combatPower.toLocaleString()}</span>
          </div>

          {/* 基本信息 */}
          <div className="hero-detail-section">
            <div className="hero-detail-section-title">基础信息</div>
            <div className="hero-detail-grid">
              <div className="hero-detail-item">
                <span className="detail-label">英雄ID</span>
                <span className="detail-value">{hero.hero_id}</span>
              </div>
              <div className="hero-detail-item">
                <span className="detail-label">等级</span>
                <span className="detail-value">Lv.{hero.level ?? 1}</span>
              </div>
              <div className="hero-detail-item">
                <span className="detail-label">经验</span>
                <span className="detail-value">{hero.exp ?? 0}</span>
              </div>
            </div>
          </div>

          {/* 属性 */}
          {attrGroups.map(group => {
            const items = group.ids
              .map(id => ({ id, name: getAttrName(id), val: attrPairs.find(a => a.attr_id === id)?.value ?? 0 }))
            if (items.length === 0) return null
            return (
              <div key={group.label} className="hero-detail-section">
                <div className="hero-detail-section-title">{group.label}</div>
                <div className="hero-detail-grid">
                  {items.map(a => (
                    <div key={a.id} className="hero-detail-item">
                      <span className="detail-label">{a.name}</span>
                      <span className="detail-value">{group.format(a.val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* 技能 */}
          <div className="hero-detail-section">
            <div className="hero-detail-section-title">已学习技能</div>
            {abilityIds.length > 0 ? (
              <div className="ability-list">
                {abilityIds.map((id, i) => (
                  <div key={i} className="ability-chip">
                    <span className="ability-icon">⚡</span>
                    <span>{getAbilityName(id)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-hint">暂无已学习技能</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
