import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import AppDetail from './pages/AppDetail'
import Developer from './pages/Developer'
import Upload from './pages/Upload'
import Library from './pages/Library'
import NotFound from './pages/NotFound'
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app/:id" element={<AppDetail />} />
        <Route path="/developer" element={<Developer />} />
        <Route path="/developer/upload" element={<Upload />} />
        <Route path="/library" element={<Library />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
