import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'
import VideoCard, { EmptyVideoCard } from '../common/VideoCard'
import { useVideos } from '../../hooks/useVideos'

export default function SharedWithMePage() {
  const { user }                  = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const { videos, loading }       = useVideos()
  const sidebarWidth              = collapsed ? 72 : 220

  // Hospital videos shared with everyone
const sharedVideos = videos.filter(
  v => v.destinationType === 'hospital' &&
       v.destinationName?.toLowerCase() === user?.hospital?.toLowerCase()
)

// TEMP: remove after fixing
console.log('user.hospital:', user?.hospital)
console.log('all hospital videos:', videos.filter(v => v.destinationType === 'hospital').map(v => v.destinationName))

  // Group by hospital name
  const hospitalMap = {}
  sharedVideos.forEach(v => {
    const key = v.destinationName || 'Unknown'
    if (!hospitalMap[key]) hospitalMap[key] = []
    hospitalMap[key].push(v)
  })
  const groups = Object.entries(hospitalMap)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onCollapse={setCollapsed} />
      <div style={{ marginLeft: sidebarWidth }} className="transition-all duration-300 min-h-screen flex flex-col">
        <Header title="Shared with Me" sidebarCollapsed={collapsed} />
        <main className="flex-1 px-6 py-6" style={{ marginTop: '64px' }}>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800">Shared with Me</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Hospital videos available to all surgeons
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div style={{ width: '44px', height: '44px', border: '4px solid #e5e7eb', borderTopColor: '#00938e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : sharedVideos.length === 0 ? (
            <EmptyVideoCard message="No shared videos available yet." />
          ) : (
            <div className="flex flex-col gap-10">
              {groups.map(([hospital, vids]) => (
                <div key={hospital}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-6 rounded-full flex-shrink-0" style={{ background: '#00938e' }} />
                    <h3 className="font-semibold text-gray-800 text-base">{hospital}</h3>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600,
                      padding: '2px 10px', borderRadius: '9999px',
                      background: '#e6f7f6', color: '#00938e',
                    }}>
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