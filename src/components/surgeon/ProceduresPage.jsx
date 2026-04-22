import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'
import VideoCard, { EmptyVideoCard } from '../common/VideoCard'
import { useVideos } from '../../hooks/useVideos'

const ProcedureIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#00938e" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)

const BackIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
)

export default function ProceduresPage() {
  const { user }                    = useAuth()
  const [collapsed,  setCollapsed]  = useState(false)
  const [selected,   setSelected]   = useState(null)
  const { videos, loading }         = useVideos()
  const sidebarWidth                = collapsed ? 72 : 220

  const myVideos = videos.filter(
    v => v.destinationType === 'surgeon' &&
         v.destinationName?.toLowerCase() === user?.name?.toLowerCase()
  )

  // Build procedure map
  const procedureMap = {}
  myVideos.forEach(v => {
    const key = v.procedure || 'Other'
    if (!procedureMap[key]) procedureMap[key] = []
    procedureMap[key].push(v)
  })
  const procedures = Object.entries(procedureMap)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onCollapse={setCollapsed} />
      <div style={{ marginLeft: sidebarWidth }} className="transition-all duration-300 min-h-screen flex flex-col">
        <Header title="Procedures" sidebarCollapsed={collapsed} />
        <main className="flex-1 px-6 py-6" style={{ marginTop: '64px' }}>

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold text-gray-800">Procedures</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {procedures.length} procedure{procedures.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
            {selected && (
              <button
                onClick={() => setSelected(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  color: '#374151', fontSize: '0.875rem', fontWeight: 500,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                <BackIcon /> All Procedures
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div style={{ width: '44px', height: '44px', border: '4px solid #e5e7eb', borderTopColor: '#00938e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : procedures.length === 0 ? (
            <EmptyVideoCard message="No procedures recorded yet." />
          ) : !selected ? (
            // ── Procedure grid ──
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {procedures.map(([name, vids]) => (
                <button
                  key={name}
                  onClick={() => setSelected(name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 20px', borderRadius: '16px',
                    border: '1px solid #f3f4f6', background: 'white',
                    cursor: 'pointer', textAlign: 'left',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,147,142,0.1)'
                    e.currentTarget.style.borderColor = '#00938e33'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'
                    e.currentTarget.style.borderColor = '#f3f4f6'
                  }}
                >
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '12px',
                    background: '#e6f7f6', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ProcedureIcon />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {name}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
                      {vids.length} {vids.length === 1 ? 'video' : 'videos'}
                    </p>
                  </div>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#d1d5db" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            // ── Selected procedure videos ──
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-6 rounded-full flex-shrink-0" style={{ background: '#00938e' }} />
                <h3 className="font-semibold text-gray-800 text-base">{selected}</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary">
                  {procedureMap[selected]?.length} {procedureMap[selected]?.length === 1 ? 'video' : 'videos'}
                </span>
              </div>
              <div className="flex flex-wrap gap-4">
                {procedureMap[selected]?.map(video => (
                  <div key={video.id} className="flex-shrink-0 w-72">
                    <VideoCard video={video} size="md" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}