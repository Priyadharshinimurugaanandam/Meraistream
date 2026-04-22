import { useState, useMemo } from 'react'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'
import VideoCard from '../common/VideoCard'
import { useAuth } from '../../context/AuthContext'
import { useVideos } from '../../hooks/useVideos'

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)

const GridIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2
         2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0
         012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2
         2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0
         01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2
         0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)

const ListIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const ChevronDown = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

const ChevronUp = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
)

const CloseIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const EmptyIcon = () => (
  <svg width="48" height="48" fill="none" viewBox="0 0 24 24"
    stroke="#00938e" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2
         0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5
         10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

// ─── Hospital Collection Group ────────────────────────────────────────────────
const HospitalCollectionGroup = ({ hospital, view }) => {
  const [expanded, setExpanded] = useState(true)

  const totalDuration = hospital.videos.reduce((acc, v) => {
    const parts = v.duration?.split(':').map(Number) || [0, 0]
    return acc + (parts[0] * 60 + (parts[1] || 0))
  }, 0)

  const formatTotal = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="mb-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-4 group text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-1.5 h-7 rounded-full flex-shrink-0"
            style={{ background: 'linear-gradient(180deg, #00938e, #007a76)' }}
          />
          <div>
            <h3 className="font-display font-bold text-gray-800 text-base group-hover:text-primary transition-colors">
              {hospital.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {hospital.videos.length} {hospital.videos.length === 1 ? 'Video' : 'Videos'}
              {' · '}
              For Everyone
              {' · '}
              {formatTotal(totalDuration)}
            </p>
          </div>
        </div>
        <span className="text-gray-400 group-hover:text-primary transition-colors">
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </span>
      </button>

      {expanded && (
        <div className={`page-enter ${
          view === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'flex flex-col gap-3'
        }`}>
          {hospital.videos.map((video) =>
            view === 'grid' ? (
              <VideoCard key={video.id} video={video} size="md" />
            ) : (
              <div
                key={video.id}
                className="card flex gap-4 p-3 cursor-pointer hover:shadow-md transition-all duration-200"
              >
                <div
                  className="w-32 h-20 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center relative"
                  style={{ background: 'linear-gradient(135deg, #004745, #00938e)' }}
                >
                  <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {video.duration && (
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      {video.duration}
                    </span>
                  )}
                </div>
                <div className="flex flex-col justify-center gap-1 flex-1 min-w-0">
                  <span className="text-xs font-semibold" style={{ color: '#00938e' }}>
                    {video.procedure}
                  </span>
                  <h4 className="text-sm font-semibold text-gray-800 truncate leading-snug">
                    {video.title}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">{hospital.name}</p>
                  <p className="text-xs text-gray-400">{video.uploadedAt}</p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

// ─── Create Hospital Modal ────────────────────────────────────────────────────
const CreateHospitalModal = ({ onClose, onCreate }) => {
  const [name, setName]         = useState('')
  const [location, setLocation] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate({
      name:     name.trim() + (location.trim() ? ` ${location.trim()}` : ''),
      rawName:  name.trim(),
      location: location.trim(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm page-enter">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-xl text-gray-800">Add Hospital</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Hospital Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Apollo Hospitals"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              style={{ borderRadius: '12px' }}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Chennai"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
              style={{ borderRadius: '12px' }}
            />
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 py-2.5">
              Add Hospital
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Hospital Page ────────────────────────────────────────────────────────────
export default function HospitalPage() {
  const { isServicePerson }               = useAuth()
  const [collapsed, setCollapsed]         = useState(false)
  const [view, setView]                   = useState('grid')
  const [search, setSearch]               = useState('')
  const [showModal, setShowModal]         = useState(false)
  const [extraHospitals, setExtraHospitals] = useState([])

  const sidebarWidth    = collapsed ? 72 : 220
  const { videos }      = useVideos()

  const hospitalGroups = useMemo(() => {
    const map = {}
    videos
      .filter((v) => v.destinationType === 'hospital')
      .forEach((v) => {
        const key = v.destinationName || 'Unknown'
        if (!map[key]) map[key] = { id: key, name: key, videos: [] }
        map[key].videos.push(v)
      })
    return Object.values(map)
  }, [videos])

  const allHospitals = useMemo(() => {
    let hospitals = [...hospitalGroups]

    extraHospitals.forEach((eh) => {
      if (!hospitals.find((h) => h.name === eh.name)) {
        hospitals.push({ ...eh, videos: [], id: eh.name })
      }
    })

    if (search.trim()) {
      hospitals = hospitals
        .map((h) => ({
          ...h,
          videos: h.videos.filter(
            (v) =>
              v.title?.toLowerCase().includes(search.toLowerCase()) ||
              v.procedure?.toLowerCase().includes(search.toLowerCase()) ||
              h.name?.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((h) => h.videos.length > 0 || h.name.toLowerCase().includes(search.toLowerCase()))
    }

    return hospitals
  }, [search, extraHospitals, hospitalGroups])

  const totalVideos = allHospitals.reduce((acc, h) => acc + h.videos.length, 0)

  const handleCreateHospital = (data) => {
    setExtraHospitals((prev) => [...prev, data])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showModal && (
        <CreateHospitalModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateHospital}
        />
      )}

      <Sidebar onCollapse={setCollapsed} />

      <div
        style={{ marginLeft: sidebarWidth }}
        className="transition-all duration-300 min-h-screen"
      >
        <Header title="Hospital" sidebarCollapsed={collapsed} />

        <main className="px-6 py-6 page-enter" style={{ marginTop: '64px' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display font-bold text-l text-gray-800">Explore Hospitals</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {totalVideos} {totalVideos === 1 ? 'video' : 'videos'} across{' '}
                {allHospitals.filter((h) => h.videos.length > 0).length} hospitals
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  width="15" height="15" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search hospitals or videos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-56"
                />
              </div>

              <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 transition-all duration-200 ${
                    view === 'grid' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 transition-all duration-200 ${
                    view === 'list' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <ListIcon />
                </button>
              </div>

              {isServicePerson() && (
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary flex items-center gap-2 text-sm py-2"
                >
                  <PlusIcon />
                  Add Hospital
                </button>
              )}
            </div>
          </div>

          {allHospitals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <EmptyIcon />
              <p className="text-gray-400 font-medium">No hospitals found</p>
              <p className="text-sm text-gray-300">Upload a video assigned to a hospital to see it here</p>
            </div>
          ) : (
            allHospitals.map((hospital) => (
              <HospitalCollectionGroup key={hospital.id} hospital={hospital} view={view} />
            ))
          )}
        </main>
      </div>
    </div>
  )
}