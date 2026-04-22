import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'
import VideoCard, { EmptyVideoCard } from '../common/VideoCard'
import { useVideos } from '../../hooks/useVideos'

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <div
        style={{
          width: '44px', height: '44px',
          border: '4px solid #e5e7eb',
          borderTopColor: '#00938e',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px',
        }}
      />
      <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Loading videos...</p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

// ─── Section ──────────────────────────────────────────────────────────────────
const Section = ({ title, videos, emptyMessage }) => (
  <div className="mb-10">
    <div className="flex items-center gap-3 mb-5">
      <h2 className="section-title text-xl mb-0">{title}</h2>
      {videos.length > 0 && (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary">
          {videos.length} {videos.length === 1 ? 'video' : 'videos'}
        </span>
      )}
    </div>

    {videos.length === 0 ? (
      <EmptyVideoCard message={emptyMessage} />
    ) : (
      <div
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {videos.map((video) => (
          <div key={video.id} className="flex-shrink-0 w-72">
            <VideoCard video={video} size="md" />
          </div>
        ))}
      </div>
    )}
  </div>
)

// ─── Procedure Card ───────────────────────────────────────────────────────────
const ProcedureCard = ({ name, count }) => (
  <div style={{
    background: 'white',
    borderRadius: '14px',
    padding: '16px 20px',
    border: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s, border-color 0.2s',
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px',
        background: '#e6f7f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#00938e" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
      </div>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
        {name}
      </span>
    </div>
    {/* <span style={{
      fontSize: '0.75rem', fontWeight: 700,
      color: '#00938e',
      background: '#e6f7f6',
      padding: '3px 10px', borderRadius: '9999px',
    }}>
      {count} {count === 1 ? 'video' : 'videos'}
    </span> */}
  </div>
)

// ─── Surgeon Dashboard ────────────────────────────────────────────────────────
export default function SurgeonDashboard() {
  const { user }                  = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const { videos, loading }       = useVideos()

  const sidebarWidth = collapsed ? 72 : 220

  // ── My Videos: uploaded to this surgeon by name ───────────────────────────
  const myVideos = videos.filter(
    (v) =>
      v.destinationType === 'surgeon' &&
      v.destinationName?.toLowerCase() === user?.name?.toLowerCase()
  )

  // ── Shared with Me: hospital videos (shared with everyone) ────────────────
 const sharedVideos = videos.filter(
  (v) => v.destinationType === 'hospital' &&
         v.destinationName?.toLowerCase() === user?.hospital?.toLowerCase()
)

  // ── All videos this surgeon can see ───────────────────────────────────────
  const allVisible = [...myVideos, ...sharedVideos]

  // ── Procedures: group by procedure name from myVideos ────────────────────
  const procedureMap = {}
  myVideos.forEach((v) => {
    const key = v.procedure || 'Other'
    if (!procedureMap[key]) procedureMap[key] = 0
    procedureMap[key]++
  })
  const procedures = Object.entries(procedureMap).map(([name, count]) => ({ name, count }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onCollapse={setCollapsed} />

      <div
        style={{ marginLeft: sidebarWidth }}
        className="transition-all duration-300 min-h-screen flex flex-col"
      >
        {/* Header — no upload button for surgeons */}
        <Header title="Dashboard" sidebarCollapsed={collapsed} hiddenUpload />

        <main className="flex-1 px-6 py-6 page-enter" style={{ marginTop: '64px' }}>

          {/* Welcome */}
          <div className="mb-8">
            <h2 className="text-xl font-display font-bold text-gray-800">Explore All!</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Welcome back,{' '}
              <span className="text-primary font-medium">{user?.name}</span>
            </p>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {/* ── My Videos ── */}
              <Section
                title="My Videos"
                videos={myVideos}
                emptyMessage="No videos uploaded for you yet."
              />

              {/* ── Procedures ── */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="section-title text-xl mb-0">Procedures</h2>
                  {procedures.length > 0 && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary">
                      {procedures.length} {procedures.length === 1 ? 'procedure' : 'procedures'}
                    </span>
                  )}
                </div>

                {procedures.length === 0 ? (
                  <EmptyVideoCard message="No procedures recorded yet." />
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '12px',
                  }}>
                    {procedures.map((p) => (
                      <ProcedureCard key={p.name} name={p.name} count={p.count} />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Shared with Me ── */}
              <Section
                title="Shared with Me"
                videos={sharedVideos}
                emptyMessage="No shared videos yet."
              />
            </>
          )}
        </main>
      </div>
    </div>
  )
}