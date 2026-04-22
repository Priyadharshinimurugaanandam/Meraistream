import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'
import VideoCard, { EmptyVideoCard } from '../common/VideoCard'
import { useVideos } from '../../hooks/useVideos'

export default function MyVideosPage() {
  const { user }                  = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const { videos, loading }       = useVideos()
  const sidebarWidth              = collapsed ? 72 : 220

  const myVideos = videos.filter(
    v => v.destinationType === 'surgeon' &&
         v.destinationName?.toLowerCase() === user?.name?.toLowerCase()
  )

  // Group by procedure
  const procedureMap = {}
  myVideos.forEach(v => {
    const key = v.procedure || 'Other'
    if (!procedureMap[key]) procedureMap[key] = []
    procedureMap[key].push(v)
  })
  const groups = Object.entries(procedureMap)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onCollapse={setCollapsed} />
      <div style={{ marginLeft: sidebarWidth }} className="transition-all duration-300 min-h-screen flex flex-col">
        <Header title="My Videos" sidebarCollapsed={collapsed} />
        <main className="flex-1 px-6 py-6" style={{ marginTop: '64px' }}>

          <div className="mb-8">
            <h2 className="text-xl font-display font-bold text-gray-800">My Videos</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Videos uploaded for <span className="text-primary font-medium">{user?.name}</span>
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div style={{ width: '44px', height: '44px', border: '4px solid #e5e7eb', borderTopColor: '#00938e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : myVideos.length === 0 ? (
            <EmptyVideoCard message="No videos uploaded for you yet." />
          ) : (
            <div className="flex flex-col gap-10">
              {groups.map(([procedure, vids]) => (
                <div key={procedure}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-6 rounded-full flex-shrink-0" style={{ background: '#00938e' }} />
                    <h3 className="font-semibold text-gray-800 text-base">{procedure}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary">
                      {vids.length} {vids.length === 1 ? 'video' : 'videos'}
                    </span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {vids.map(video => (
                      <div key={video.id} className="flex-shrink-0 w-72">
                        <VideoCard video={video} size="md" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}