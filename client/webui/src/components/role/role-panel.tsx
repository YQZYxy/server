// ====================================================================
//  角色数据面板
// ====================================================================

import { gameStore } from '@/store/game-store'
import gameSocket from '@/services/socket'
import { MHT } from '@/types'
import { BattleType } from '@/types'
import { getHeroConfig } from '@/types'
import { Job, JOB_ICONS, DEFAULT_HERO_ICON } from '@/types'
import PanelShell from '@/components/panel-shell'

// 注册协议处理器
gameSocket.onMsg(MHT.MHT_SYNC_ROLE_INFO_RET_SC, (body) => gameStore.setState({ roleInfo: body }))

/** 从配置获取英雄图标 */
function getHeroIcon(heroId: number): string {
  const configs = getHeroConfig()
  const job = configs?.find(c => c.id === heroId)?.job
  return JOB_ICONS[(job ?? 0) as Job] ?? DEFAULT_HERO_ICON
}

/** 从配置获取英雄名 */
function getHeroName(heroId: number): string {
  const configs = getHeroConfig()
  return configs?.find(c => c.id === heroId)?.name || `英雄#${heroId}`
}

export default function RolePanel() {
  const roleInfo = gameStore((s) => s.roleInfo)
  const heroData = gameStore((s) => s.heroData)
  const lineupData = gameStore((s) => s.lineupData)

  const baseInfo = roleInfo?.role_base_info
  const heroes = heroData?.hero_data?.heroes ?? []
  const lineups = lineupData?.lineup_data?.lineups ?? []
  const mainLineup = lineups.find(l => l.battle_type === BattleType.MAIN_BATTLE)

  return (
    <PanelShell title="角色数据" className="role-panel">
      {/* 基本信息卡片 */}
      <div className="role-info-card">
        <div className="role-avatar-placeholder">
          <span className="role-avatar-icon">🧙</span>
        </div>
        <div className="role-details">
          <div className="role-name">{baseInfo?.name || '未知'}</div>
          <div className="role-meta">
            <span>UID: {baseInfo?.uid ?? '-'}</span>
            <span>服务器: {roleInfo?.server_id ?? '-'}</span>
          </div>
        </div>
      </div>

      {/* 数据概览 */}
      <div className="panel-scroll">
        <div className="attr-group">
          <div className="attr-group-title">账号信息</div>
          <div className="attr-grid">
            <div className="attr-item">
              <span className="attr-name">用户名</span>
              <span className="attr-value">{baseInfo?.user_name || '-'}</span>
            </div>
            <div className="attr-item">
              <span className="attr-name">角色名</span>
              <span className="attr-value">{baseInfo?.name || '-'}</span>
            </div>
            <div className="attr-item">
              <span className="attr-name">UID</span>
              <span className="attr-value">{baseInfo?.uid ?? '-'}</span>
            </div>
            <div className="attr-item">
              <span className="attr-name">服务器</span>
              <span className="attr-value">{roleInfo?.server_id ?? '-'}</span>
            </div>
          </div>
        </div>

        {/* 主线阵容战力 */}
        {mainLineup && (
          <div className="attr-group">
            <div className="attr-group-title">主阵容</div>
            <div className="role-combat-power" style={{ padding: '8px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="cp-label">总战力</span>
              <span className="cp-value">{(mainLineup.combat_power ?? 0).toLocaleString()}</span>
            </div>
            <div className="ability-list" style={{ marginTop: 4 }}>
              {mainLineup.hero_ids?.filter(id => id > 0).map(hid => {
                const h = heroes.find(hh => hh.hero_id === hid)
                return (
                  <div key={hid} className="ability-chip">
                    <span className="ability-icon">{getHeroIcon(hid)}</span>
                    <span>{getHeroName(hid)} Lv.{h?.level ?? 1}</span>
                    <span style={{ marginLeft: 6, color: 'var(--accent)' }}>战力: {(h?.combat_power ?? 0).toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="attr-group">
          <div className="attr-group-title-row">
            <span className="attr-group-title">英雄概览</span>
            <span className="attr-group-count">拥有 {heroes.length} 个英雄</span>
          </div>
          {heroes.length > 0 && (
            <div className="ability-list" style={{ marginTop: 8 }}>
              {heroes.map((h, i) => (
                <div key={i} className="ability-chip">
                    <span className="ability-icon">{getHeroIcon(h.hero_id ?? 0)}</span>
                  <span>{getHeroName(h.hero_id ?? 0)} Lv.{h.level}</span>
                  <span style={{ marginLeft: 6, color: 'var(--accent)' }}>{(h.combat_power ?? 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  )
}
