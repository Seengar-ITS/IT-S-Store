import { Routes, Route } from 'react-router-dom'
import { ThemeProvider, ITSShell } from '@its-universe/os'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import AppDetail from './pages/AppDetail'
import Developer from './pages/Developer'
import Upload from './pages/Upload'
import Library from './pages/Library'
import NotFound from './pages/NotFound'

function AppContent() {
  const { user } = useAuth()
  const itsUser = user ? { id: user.id, name: user.email, email: user.email } : null
  return (
    <ITSShell serviceName="IT-S Store" user={itsUser}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app/:id" element={<AppDetail />} />
        <Route path="/developer" element={<Developer />} />
        <Route path="/developer/upload" element={<Upload />} />
        <Route path="/library" element={<Library />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ITSShell>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
