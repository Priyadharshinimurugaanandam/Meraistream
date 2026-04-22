import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'
import VideoCard, { EmptyVideoCard } from '../common/VideoCard'
import { useVideos } from '../../hooks/useVideos'
import { useNavigate } from 'react-router-dom'

// ─── Group videos by destinationName ─────────────────────────────────────────
const groupByDestination = (videos, type) => {
  const map = {}
  videos
    .filter((v) => v.destinationType === type)
    .forEach((v) => {
      const key = v.destinationName || 'Unknown'
      if (!map[key]) map[key] = { id: key, name: key, videos: [] }
      map[key].videos.push(v)
    })
  return Object.values(map)
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const StatsBar = ({ videos }) => {
  const uniqueVideos   = videos.filter(
    (v, idx, self) => idx === self.findIndex((x) => (x.fileName || x.id) === (v.fileName || v.id))
  )
  const hospitalVideos = uniqueVideos.filter((v) => v.destinationType === 'hospital')
  const surgeonVideos  = uniqueVideos.filter((v) => v.destinationType === 'surgeon')
  const institutions   = new Set(videos.map((v) => v.destinationName).filter(Boolean))

  const stats = [
    { label: 'Total Videos',    value: uniqueVideos.length,  color: '#00938e' },
    { label: 'Hospital Videos', value: hospitalVideos.length, color: '#007a76' },
    { label: 'Surgeon Videos',  value: surgeonVideos.length,  color: '#00605d' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="card p-4 flex flex-col gap-1"
          style={{ borderLeft: `3px solid ${s.color}` }}
        >
          <span className="text-2xl font-display font-bold" style={{ color: s.color }}>
            {s.value}
          </span>
          <span className="text-xs text-gray-500 font-medium">{s.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Grouped Section ──────────────────────────────────────────────────────────
const GroupedSection = ({ title, groups }) => {
  const hasAny = groups.some((g) => g.videos.length > 0)

  return (
    <div className="mb-10">
      <h2 className="section-title text-xl mb-5">{title}</h2>
      {!hasAny ? (
        <EmptyVideoCard message={`No ${title.toLowerCase()} yet`} />
      ) : (
        <div className="flex flex-col gap-8">
          {groups
            .filter((g) => g.videos.length > 0)
            .map((group) => (
              <div key={group.id}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-2 h-6 rounded-full flex-shrink-0"
                    style={{ background: '#00938e' }}
                  />
                  <h3 className="font-display font-semibold text-gray-800 text-base">
                    {group.name}
                  </h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary">
                    {group.videos.length} {group.videos.length === 1 ? 'video' : 'videos'}
                  </span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {group.videos.map((video) => (
                    <div key={video.id} className="flex-shrink-0 w-72">
                      <VideoCard video={video} size="md" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

// ─── Service Dashboard ────────────────────────────────────────────────────────
export default function ServiceDashboard() {
  const { user }                  = useAuth()
  const navigate                  = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const { videos, loading }       = useVideos()

  const sidebarWidth   = collapsed ? 72 : 220
  const hospitalGroups = groupByDestination(videos, 'hospital')
  const surgeonGroups  = groupByDestination(videos, 'surgeon')

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onCollapse={setCollapsed} />
      <div
        style={{ marginLeft: sidebarWidth }}
        className="transition-all duration-300 min-h-screen flex flex-col"
      >
        <Header title="Dashboard" sidebarCollapsed={collapsed} />
        <main className="flex-1 px-6 py-6 page-enter" style={{ marginTop: '64px' }}>
          <div className="mb-10">
            <h2 className="text-xxl font-display font-bold text-gray-800">Explore All!</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Welcome back, <span className="text-primary font-medium">{user?.name}</span>
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Loading videos...</p>
              </div>
            </div>
          ) : (
            <>
              <StatsBar videos={videos} />
              <GroupedSection title="Hospital Videos" groups={hospitalGroups} />
              <GroupedSection title="Surgeon Videos"  groups={surgeonGroups}  />
            </>
          )}
        </main>
      </div>
    </div>
  )
}