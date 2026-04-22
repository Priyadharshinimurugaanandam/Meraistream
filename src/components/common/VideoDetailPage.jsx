import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { mockVideos } from '../../data/mockData'
import { useVideos } from '../../hooks/useVideos'
import WorkflowPanel from './WorkflowPanel'

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlayIcon = () => (
  <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
)
const VolumeIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-4-4H4V10h4l4-4z" />
  </svg>
)
const FullscreenIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
)
const PenIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
)
const DotsIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
)
const EyeIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)
const CalendarIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)
const DeleteIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)
const BackIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
)

// ─── Video Player ─────────────────────────────────────────────────────────────
// Accepts videoRef from parent so WorkflowPanel can sync to it
const VideoPlayer = ({ videoSrc, videoRef }) => {
  const [playing,       setPlaying]       = useState(false)
  const [currentTime,   setCurrentTime]   = useState(0)
  const [duration,      setDuration]      = useState(0)
  const [volume,        setVolume]        = useState(1)
  const [speed,         setSpeed]         = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) { videoRef.current.pause(); setPlaying(false) }
    else         { videoRef.current.play();  setPlaying(true)  }
  }

  const formatTime = (s) => {
    const m   = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const handleFullscreen = () => {
    const el = videoRef.current?.parentElement
    if (el?.requestFullscreen) el.requestFullscreen()
  }

  const changeSpeed = (s) => {
    setSpeed(s)
    if (videoRef.current) videoRef.current.playbackRate = s
    setShowSpeedMenu(false)
  }

  return (
    <div style={{
      position: 'relative', width: '100%',
      aspectRatio: '16/9', borderRadius: '16px',
      overflow: 'hidden', background: '#000', flexShrink: 0,
    }}>
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          crossOrigin="anonymous"
          preload="metadata"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onTimeUpdate={()     => setCurrentTime(videoRef.current?.currentTime || 0)}
          onLoadedMetadata={()  => setDuration(videoRef.current?.duration || 0)}
          onEnded={()           => setPlaying(false)}
          onError={(e)          => console.error('Video error:', e.target.error)}
          onClick={togglePlay}
        />
      ) : (
        <div
          onClick={togglePlay}
          style={{
            width: '100%', height: '100%', cursor: 'pointer',
            background: 'linear-gradient(135deg, #004745 0%, #00938e 60%, #00b5af 100%)',
          }}
        />
      )}

      {/* Centre play button */}
      {!playing && (
        <div
          onClick={togglePlay}
          style={{
            position: 'absolute', inset: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            border: '2px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(4px)',
          }}>
            <PlayIcon />
          </div>
        </div>
      )}

      {/* Control bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
        padding: '20px 16px 12px',
      }}>
        <input
          type="range" min={0} max={duration || 100} value={currentTime}
          onChange={(e) => {
            const t = Number(e.target.value)
            setCurrentTime(t)
            if (videoRef.current) videoRef.current.currentTime = t
          }}
          style={{
            width: '100%', height: '3px', accentColor: '#fff',
            marginBottom: '8px', display: 'block', cursor: 'pointer',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'white', fontSize: '0.78rem', fontFamily: 'monospace' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <VolumeIcon />
              <input
                type="range" min={0} max={1} step={0.05} value={volume}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setVolume(v)
                  if (videoRef.current) videoRef.current.volume = v
                }}
                style={{ width: '60px', height: '3px', accentColor: '#fff', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.8, padding: '4px' }}>
              <PenIcon />
            </button>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '9999px', color: 'white',
                  fontSize: '0.75rem', fontWeight: 600,
                  padding: '3px 10px', cursor: 'pointer',
                }}
              >
                {speed}x
              </button>
              {showSpeedMenu && (
                <div style={{
                  position: 'absolute', bottom: '32px', right: 0,
                  background: 'rgba(0,0,0,0.92)', borderRadius: '10px',
                  overflow: 'hidden', minWidth: '70px', zIndex: 10,
                }}>
                  {speeds.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      style={{
                        display: 'block', width: '100%', padding: '6px 14px',
                        color: speed === s ? '#00938e' : 'white',
                        fontSize: '0.8rem', background: 'none', border: 'none',
                        cursor: 'pointer', textAlign: 'center',
                        fontWeight: speed === s ? 700 : 400,
                      }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleFullscreen}
              style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.8, padding: '4px' }}
            >
              <FullscreenIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ title, onConfirm, onCancel, loading }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{
      background: 'white', borderRadius: '20px',
      padding: '28px 32px', maxWidth: '400px', width: '90%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '50%',
        background: '#fef2f2', display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 16px',
      }}>
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <h3 style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
        Delete Video?
      </h3>
      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', margin: '0 0 24px', lineHeight: 1.5 }}>
        <strong style={{ color: '#374151' }}>"{title}"</strong> will be permanently deleted
        from the server and cannot be recovered.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onCancel} disabled={loading}
          style={{
            flex: 1, padding: '10px', borderRadius: '10px',
            border: '1px solid #e5e7eb', background: 'white',
            fontSize: '0.875rem', fontWeight: 600, color: '#374151', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm} disabled={loading}
          style={{
            flex: 1, padding: '10px', borderRadius: '10px',
            border: 'none', background: '#ef4444',
            fontSize: '0.875rem', fontWeight: 600, color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          {loading ? (
            <>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" strokeOpacity="0.3" />
                <path fill="white" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Deleting...
            </>
          ) : 'Yes, Delete'}
        </button>
      </div>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

// ─── Video Detail Page ────────────────────────────────────────────────────────
export default function VideoDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { videos } = useVideos()

  const [collapsed, setCollapsed] = useState(false)
  const [showMenu,  setShowMenu]  = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [deleted,   setDeleted]   = useState(false)

  // ── Single videoRef shared between VideoPlayer and WorkflowPanel ──
  const videoRef = useRef(null)
  const menuRef  = useRef(null)

  const video      = videos.find((v) => v.id === id) || mockVideos.find((v) => v.id === id)
  const sidebarWidth = collapsed ? 72 : 220
  const videoSrc   = video?.videoURL ? `http://localhost:3001${video.videoURL}` : null
  const initials   = video?.uploadedBy
    ? video.uploadedBy.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      const res  = await fetch(`http://localhost:3001/api/videos/${video.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setDeleted(true)
        setShowModal(false)
        setTimeout(() => navigate('/dashboard', { replace: true }), 1200)
      } else {
        alert('Delete failed: ' + (data.error || 'Unknown error'))
        setDeleting(false)
      }
    } catch {
      alert('Server error. Make sure backend is running on port 3001.')
      setDeleting(false)
    }
  }

  if (!video) {
    return (
      <div style={{ height: '100vh', overflow: 'hidden', background: '#f9fafb', display: 'flex' }}>
        <Sidebar onCollapse={setCollapsed} />
        <div style={{ marginLeft: sidebarWidth, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#9ca3af' }}>Video not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#f9fafb', display: 'flex' }}>
      <Sidebar onCollapse={setCollapsed} />

      {showModal && (
        <DeleteModal
          title={video.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowModal(false)}
          loading={deleting}
        />
      )}

      {deleted && (
        <div style={{
          position: 'fixed', top: '68px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#ef4444', color: 'white',
          padding: '10px 24px', borderRadius: '9999px',
          fontSize: '0.875rem', fontWeight: 600,
          boxShadow: '0 4px 16px rgba(239,68,68,0.4)', zIndex: 300,
        }}>
          Video deleted. Redirecting...
        </div>
      )}

      <div style={{
        marginLeft: sidebarWidth, flex: 1,
        height: '100vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'margin-left 0.3s ease',
      }}>
        <Header title={video.title} breadcrumb="Dashboard" sidebarCollapsed={collapsed} />

        <div style={{
          flex: 1, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          padding: '14px 24px', marginTop: '56px',
        }}>
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: '#374151', fontSize: '0.875rem', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              marginBottom: '12px', padding: 0, flexShrink: 0,
            }}
          >
            <BackIcon /> Back
          </button>

          {/* Two-column grid */}
          <div style={{
            flex: 1, overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '1100px 1fr',
            gap: '20px',
            minHeight: 0,
            height: '100%',
            alignItems: 'stretch',
          }}>

            {/* ── Left: player + info ── */}
            <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {/* videoRef passed in so WorkflowPanel can read/seek it */}
              <VideoPlayer videoSrc={videoSrc} videoRef={videoRef} />

              <div style={{ marginTop: '14px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#00938e', margin: '0 0 3px' }}>
                      {video.title}
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
                      {video.procedure}
                      {video.destinationName && <> &bull; {video.destinationName}</>}
                    </p>
                  </div>

                  <div style={{ position: 'relative' }} ref={menuRef}>
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#9ca3af', padding: '4px', borderRadius: '6px',
                      }}
                    >
                      <DotsIcon />
                    </button>
                    {showMenu && (
                      <div style={{
                        position: 'absolute', right: 0, top: '32px',
                        background: 'white', borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        border: '1px solid #f3f4f6',
                        overflow: 'hidden', zIndex: 50, minWidth: '160px',
                      }}>
                        <button
                          onClick={() => { setShowMenu(false); setShowModal(true) }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '11px 16px', fontSize: '0.875rem', color: '#ef4444',
                            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <DeleteIcon /> Delete Video
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <hr style={{ margin: '12px 0', borderColor: '#f3f4f6' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: '#e6f7f6', color: '#00938e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {initials}
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#374151' }}>
                      {video.uploadedBy || 'Unknown'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#9ca3af', fontSize: '0.78rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CalendarIcon /> {video.uploadedAt}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <EyeIcon /> {video.views ?? 4} Views
                    </span>
                  </div>
                </div>

                {video.uploadedBy && (
                  <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '6px' }}>
                    Credits: {video.uploadedBy}
                  </p>
                )}
              </div>
            </div>

            {/* ── Right: WorkflowPanel wired to videoRef ── */}
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
              <h2 style={{
                fontSize: '1rem', fontWeight: 700,
                color: '#00938e', marginBottom: '12px', flexShrink: 0,
              }}>
                Workflow
              </h2>
              <div style={{
                flex: 1, background: 'white',
                borderRadius: '16px', border: '1px solid #f3f4f6',
                padding: '16px', overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                minHeight: 0,
              }}>
                <WorkflowPanel videoId={id} videoRef={videoRef} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}