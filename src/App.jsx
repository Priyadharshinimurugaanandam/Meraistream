import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage        from './components/auth/LoginPage'
import ServiceDashboard from './components/service/ServiceDashboard'
import UploadPage       from './components/service/UploadPage'
import SurgeonPage      from './components/service/SurgeonPage'
import HospitalPage     from './components/service/HospitalPage'
import SurgeonDashboard from './components/surgeon/SurgeonDashboard'
import MyVideosPage     from './components/surgeon/MyVideosPage'
import ProceduresPage   from './components/surgeon/ProceduresPage'
import SharedWithMePage from './components/surgeon/SharedWithMePage'
import VideoDetailPage  from './components/common/VideoDetailPage'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user, isServicePerson } = useAuth()

  return (
    <Routes>

      {/* ── Auth ── */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* ── Dashboard (role-based) ── */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {isServicePerson() ? <ServiceDashboard /> : <SurgeonDashboard />}
        </ProtectedRoute>
      } />

      {/* ── Service routes ── */}
      <Route path="/upload" element={
        <ProtectedRoute><UploadPage /></ProtectedRoute>
      } />
      <Route path="/surgeries" element={
        <ProtectedRoute><SurgeonPage /></ProtectedRoute>
      } />
      <Route path="/hospitals" element={
        <ProtectedRoute><HospitalPage /></ProtectedRoute>
      } />

      {/* ── Surgeon routes ── */}
      <Route path="/my-videos" element={
        <ProtectedRoute><MyVideosPage /></ProtectedRoute>
      } />
      <Route path="/procedures" element={
        <ProtectedRoute><ProceduresPage /></ProtectedRoute>
      } />
      <Route path="/shared" element={
        <ProtectedRoute><SharedWithMePage /></ProtectedRoute>
      } />

      {/* ── Shared routes ── */}
      <Route path="/video/:id" element={
        <ProtectedRoute><VideoDetailPage /></ProtectedRoute>
      } />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />

    </Routes>
  )
}