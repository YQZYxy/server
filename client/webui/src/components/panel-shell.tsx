// ====================================================================
//  组件覆盖层基础
// ====================================================================

import { gameStore } from '@/store/game-store'
import type { ReactNode } from 'react'

interface PanelShellProps {
  title: string
  className?: string
  onClose?: () => void
  children: ReactNode
}

export default function PanelShell({ title, className = '', onClose, children }: PanelShellProps) {
  const setActivePanel = gameStore((s) => s.setActivePanel)
  const handleClose = onClose ?? (() => setActivePanel('none'))

  return (
    <div className="panel-overlay" onClick={handleClose}>
      <div className={`panel-container ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <button className="panel-back" onClick={handleClose}>← 返回</button>
          <h3>{title}</h3>
          <div className="panel-header-spacer" />
        </div>
        {children}
      </div>
    </div>
  )
}
