// ====================================================================
//  底部导航栏层
// ====================================================================

import { Outlet, useNavigate } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()

  const navItems = [
    { path: '/hall',  icon: '🏠', label: '大厅' },
    { path: '/chat',  icon: '💬', label: '聊天' },
    { path: '/agent', icon: '🐟', label: '小鱼' },
    { path: '/battle',icon: '⚔️', label: '战斗' },
    { path: '/info',  icon: 'ℹ️', label: '我的' },
  ]

  return (
    <div className="app-layout">
      <main className="app-content">
        <Outlet />
      </main>

      {/* 底部导航栏 */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className="nav-item"
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

    </div>
  )
}
