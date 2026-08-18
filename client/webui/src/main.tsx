import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
// 基础
import './styles/base.css'
import './styles/layout.css'
import './styles/overlay.css'
// 页面
import './styles/login.css'
import './styles/hall.css'
import './styles/chat.css'
import './styles/battle.css'
import './styles/gm.css'
import './styles/info.css'
// 面板
import './styles/panel.css'
import './styles/role-panel.css'
import './styles/inventory-panel.css'
import './styles/quest-panel.css'
import './styles/hero-panel.css'
import './styles/lineup-panel.css'
// Agent
import './styles/agent.css'
// 排行榜
import './styles/rank.css'
// 竞技场
import './styles/arena.css'
// 断线重连
import './services/reconnect'
// 预加载配置
import { preloadAllConfigs } from './services/configmanager'

const root = document.getElementById('root')!
preloadAllConfigs().then(() => {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
