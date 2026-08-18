import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Layout from '@/components/layout'
import LoginPage from '@/pages/login-page'
import HallPage from '@/pages/hall-page'
import ChatPage from '@/pages/chat-page'
import BattlePage from '@/pages/battle-page'
import InfoPage from '@/pages/info-page'
import AgentPage from '@/pages/agent-page'
import ArenaPage from '@/pages/arena/arena-page'
import BattleFieldPage from '@/pages/battle-field-page'
import Toast from '@/components/toast'
import LoadingOverlay from '@/components/loading-overlay'
import { DragProvider } from '@/hooks/use-drag-system'
import { setBattleNavigate } from '@/services/battle'

function AppContent() {
  const navigate = useNavigate()

  useEffect(() => {
    setBattleNavigate(navigate)
  }, [navigate])

  return (
    <>
      <Toast />
      <LoadingOverlay />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/hall" element={<HallPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/agent" element={<AgentPage />} />
          <Route path="/arena" element={<ArenaPage />} />
        </Route>
        <Route path="/battle-field" element={<BattleFieldPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <DragProvider>
        <AppContent />
      </DragProvider>
    </BrowserRouter>
  )
}
