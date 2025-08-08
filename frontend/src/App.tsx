import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Watchlist from './pages/Watchlist'
import Memos from './pages/Memos'
import MemoDetail from './pages/MemoDetail'
import DeltaDashboard from './pages/delta/DeltaDashboard'
import TickerChanges from './pages/delta/TickerChanges'
import TickerMemo from './pages/delta/TickerMemo'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/memos" element={<Memos />} />
        <Route path="/memos/:id" element={<MemoDetail />} />
        <Route path="/delta" element={<DeltaDashboard />} />
        <Route path="/delta/t/:ticker/changes" element={<TickerChanges />} />
        <Route path="/delta/t/:ticker/memo" element={<TickerMemo />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App 