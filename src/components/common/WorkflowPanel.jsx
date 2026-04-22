import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'

// ── Colour palette ────────────────────────────────────────────────────────────
const ARM_COLORS = {
  Left:  { bar: '#00938e', bg: '#e6f7f6', text: '#00938e', light: '#f0fffe' },
  Right: { bar: '#6366f1', bg: '#eef2ff', text: '#6366f1', light: '#f5f3ff' },
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function shortName(name) {
  return name.replace(/_/g, ' ')
}

// ── Empty illustration ────────────────────────────────────────────────────────
const EmptyIllustration = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="40" fill="#f0fffe" />
    <rect x="22" y="28" width="36" height="26" rx="4" fill="#e6f7f6" stroke="#00938e" strokeWidth="1.5" />
    <path d="M33 40l5 5 9-9" stroke="#00938e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ── Upload log button ─────────────────────────────────────────────────────────
const UploadLogButton = ({ videoId, onUploaded }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.json')) { setError('Only .json log files are supported'); return }
    setUploading(true)
    setError('')
    const form = new FormData()
    form.append('log', file)
    try {
      const res  = await fetch(`http://localhost:3001/api/videos/${videoId}/log`, { method: 'POST', body: form })
      const data = await res.json()
      if (data.success) onUploaded()
      else setError(data.error || 'Upload failed')
    } catch {
      setError('Server error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <input ref={inputRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
        style={{
          background: uploading ? '#f3f4f6' : 'linear-gradient(135deg, #00938e, #007a76)',
          color: uploading ? '#9ca3af' : 'white',
          border: 'none',
          cursor: uploading ? 'not-allowed' : 'pointer',
          boxShadow: uploading ? 'none' : '0 2px 12px rgba(0,147,142,0.25)',
        }}
      >
        {uploading ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" stroke="#d1d5db" strokeWidth="4" />
              <path fill="#9ca3af" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Log File
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-400">Accepts .json surgical log files</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Instrument avatar ─────────────────────────────────────────────────────────
const InstrumentAvatar = ({ name, arm }) => {
  const color    = ARM_COLORS[arm] || ARM_COLORS.Left
  const initials = shortName(name).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="flex items-center justify-center rounded-full flex-shrink-0 text-xs font-bold"
      style={{
        width: '28px', height: '28px',
        background: color.bg, color: color.text,
        border: `1.5px solid ${color.bar}30`,
        fontSize: '0.6rem',
      }}
    >
      {initials}
    </div>
  )
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
const Tooltip = ({ visible, x, y, instrument }) => {
  if (!visible || !instrument) return null
  const color = ARM_COLORS[instrument.arm] || ARM_COLORS.Left
  return (
    <div style={{
      position: 'fixed', left: x + 14, top: y - 72,
      background: 'white',
      border: `1px solid ${color.bar}30`,
      borderRadius: '10px', padding: '8px 12px',
      pointerEvents: 'none', zIndex: 9999,
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      minWidth: '180px',
    }}>
      <p className="font-semibold text-gray-800 text-xs mb-1">{shortName(instrument.name)}</p>
      <p className="text-xs font-medium" style={{ color: color.bar }}>
        {instrument.arm} Arm · {formatTime(instrument.start)} → {formatTime(instrument.start + instrument.duration_sec)}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Duration: {instrument.duration_label} · ×{instrument.count}
      </p>
    </div>
  )
}

// ── Stats pill ────────────────────────────────────────────────────────────────
const StatPill = ({ label, value, color }) => (
  <div className="flex flex-col items-center px-4 py-2 rounded-xl" style={{ background: color + '15' }}>
    <span className="text-xs font-bold" style={{ color }}>{value}</span>
    <span className="text-xs text-gray-400 mt-0.5">{label}</span>
  </div>
)

// ── Timeline view ─────────────────────────────────────────────────────────────
const TimelineView = ({ data, videoRef }) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [isDragging,  setIsDragging]  = useState(false)
  const [tooltip,     setTooltip]     = useState({ visible: false, x: 0, y: 0, instrument: null })
  const [hoveredInst, setHoveredInst] = useState(null)
  const timelineRef = useRef(null)

  const parseDuration = (str) => {
    if (!str) return 43 * 60
    const parts = str.split(':').map(Number)
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    return 43 * 60
  }
  const totalDur = parseDuration(data.duration)

  const buildInstruments = () => {
    const instruments = data.instruments || []
    let leftOffset = 0, rightOffset = 0
    return instruments.map(inst => {
      if (inst.arm === 'Left') {
        const item = { ...inst, start: leftOffset }
        leftOffset += inst.duration_sec
        return item
      } else {
        const item = { ...inst, start: rightOffset }
        rightOffset += inst.duration_sec
        return item
      }
    })
  }

  const instruments = buildInstruments()
  const leftInsts   = instruments.filter(i => i.arm === 'Left')
  const rightInsts  = instruments.filter(i => i.arm === 'Right')
  const activeKeys  = instruments
    .filter(i => currentTime >= i.start && currentTime <= i.start + i.duration_sec)
    .map(i => i.name + i.arm)

  useEffect(() => {
    if (!videoRef?.current) return
    const video = videoRef.current
    const onTimeUpdate = () => { if (!isDragging) setCurrentTime(video.currentTime) }
    video.addEventListener('timeupdate', onTimeUpdate)
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [videoRef, isDragging])

  const seekTo = useCallback((clientX) => {
    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect) return
    const ratio   = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const newTime = ratio * totalDur
    setCurrentTime(newTime)
    if (videoRef?.current) videoRef.current.currentTime = newTime
  }, [totalDur, videoRef])

  const onMouseDown = (e) => { e.preventDefault(); setIsDragging(true); seekTo(e.clientX) }
  const onMouseMove = useCallback((e) => { if (isDragging) seekTo(e.clientX) }, [isDragging, seekTo])
  const onMouseUp   = useCallback(() => setIsDragging(false), [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup',  onMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',  onMouseUp)
    }
  }, [isDragging, onMouseMove, onMouseUp])

  const playheadPct = (currentTime / totalDur) * 100
  const ticks = []
  for (let t = 0; t <= totalDur; t += 5 * 60) ticks.push(t)

  const renderRows = (insts) =>
    insts.map((inst, idx) => {
      const leftPct   = (inst.start / totalDur) * 100
      const widthPct  = (inst.duration_sec / totalDur) * 100
      const isActive  = activeKeys.includes(inst.name + inst.arm)
      const isHovered = hoveredInst === inst.name + inst.arm
      const color     = ARM_COLORS[inst.arm]

      return (
        <div key={idx} className="flex items-center gap-2 mb-2">
          <InstrumentAvatar name={inst.name} arm={inst.arm} />
          <span
            className="text-xs font-medium truncate flex-shrink-0"
            style={{ width: '90px', color: isActive ? color.bar : '#6b7280', transition: 'color 0.2s' }}
            title={shortName(inst.name)}
          >
            {shortName(inst.name)}
          </span>

          {/* Track lane */}
          <div
            className="flex-1 relative rounded"
            style={{ height: '16px', background: '#f3f4f6' }}
          >
            <div
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                width: `${Math.max(widthPct, 0.5)}%`,
                top: 0, bottom: 0,
                borderRadius: '4px',
                background: isActive
                  ? color.bar
                  : (isHovered ? color.bar + 'cc' : color.bar + '55'),
                border: isActive ? `1px solid ${color.bar}` : `1px solid ${color.bar}30`,
                cursor: 'pointer',
                transition: 'background 0.2s',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                setHoveredInst(inst.name + inst.arm)
                setTooltip({ visible: true, x: e.clientX, y: e.clientY, instrument: inst })
              }}
              onMouseMove={(e) => setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }))}
              onMouseLeave={() => {
                setHoveredInst(null)
                setTooltip(t => ({ ...t, visible: false }))
              }}
            >
              {widthPct > 10 && (
                <span style={{
                  position: 'absolute', left: '5px', top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.48rem', color: 'white', fontWeight: 700, pointerEvents: 'none',
                }}>
                  {formatTime(inst.start)}
                </span>
              )}
            </div>
          </div>
        </div>
      )
    })

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Stats header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4 pb-4 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Surgeon</p>
          <p className="text-sm font-bold text-gray-800">{data.surgeon_name || '—'}</p>
        </div>
        <div className="flex gap-2">
          <StatPill label="Duration"      value={data.duration    || '—'} color="#00938e" />
          <StatPill label="Clutch Presses" value={data.clutch_count ?? 0}  color="#6366f1" />
          <StatPill label="Now"           value={formatTime(currentTime)}  color="#f59e0b" />
        </div>
      </div>

      {/* ── Active instruments strip ──────────────────────────────────────── */}
      {activeKeys.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3 pb-3 border-b border-gray-100">
          <span className="text-xs text-gray-400 self-center">Active:</span>
          {instruments.filter(i => activeKeys.includes(i.name + i.arm)).map((inst, idx) => {
            const color = ARM_COLORS[inst.arm]
            return (
              <span
                key={idx}
                className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5"
                style={{ background: color.bg, color: color.text }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: color.bar }}
                />
                {shortName(inst.name)}
              </span>
            )
          })}
        </div>
      )}

      {/* ── Gantt rows ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pr-1" style={{ minHeight: 0 }}>
        {[{ label: 'Left Arm', arm: 'Left', insts: leftInsts },
          { label: 'Right Arm', arm: 'Right', insts: rightInsts }].map(({ label, arm, insts }) => {
          const color = ARM_COLORS[arm]
          return (
            <div key={arm} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: color.bar }}
                />
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: color.text }}
                >
                  {label}
                </span>
                <span className="text-xs text-gray-400">
                  ({insts.length} instruments)
                </span>
              </div>
              {insts.length === 0
                ? <p className="text-xs text-gray-300 ml-4">No instruments</p>
                : renderRows(insts)
              }
            </div>
          )
        })}
      </div>

      {/* ── Scrubber ──────────────────────────────────────────────────────── */}
      <div className="pt-3 border-t border-gray-100 flex-shrink-0">
        {/* Tick labels */}
        <div className="relative h-4 mb-1">
          {ticks.map(t => (
            <span
              key={t}
              className="absolute text-gray-300 font-medium"
              style={{
                left: `${(t / totalDur) * 100}%`,
                transform: 'translateX(-50%)',
                fontSize: '0.48rem',
              }}
            >
              {formatTime(t)}
            </span>
          ))}
        </div>

        {/* Track */}
        <div
          ref={timelineRef}
          className="relative rounded-lg"
          style={{
            height: '24px',
            background: '#f3f4f6',
            cursor: isDragging ? 'grabbing' : 'grab',
            border: '1px solid #e5e7eb',
            userSelect: 'none',
          }}
          onMouseDown={onMouseDown}
          onClick={(e) => { if (!isDragging) seekTo(e.clientX) }}
          onTouchStart={(e) => { setIsDragging(true); seekTo(e.touches[0].clientX) }}
          onTouchMove={(e)  => { if (isDragging) seekTo(e.touches[0].clientX) }}
          onTouchEnd={() => setIsDragging(false)}
        >
          {/* Progress fill */}
          <div
            className="absolute left-0 top-0 bottom-0 rounded-lg"
            style={{
              width: `${playheadPct}%`,
              background: 'linear-gradient(90deg, #00938e22, #00938e11)',
              pointerEvents: 'none',
            }}
          />

          {/* Tick lines */}
          {ticks.map(t => (
            <div
              key={t}
              className="absolute top-1 bottom-1"
              style={{
                left: `${(t / totalDur) * 100}%`,
                width: '1px',
                background: '#e5e7eb',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 rounded"
            style={{
              left: `${playheadPct}%`,
              width: '2px',
              background: '#00938e',
              boxShadow: '0 0 6px rgba(0,147,142,0.5)',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              zIndex: 10,
              transition: isDragging ? 'none' : 'left 0.05s linear',
            }}
          >
            <div
              className="absolute rounded-full"
              style={{
                top: '-4px', left: '50%',
                transform: 'translateX(-50%)',
                width: '10px', height: '10px',
                background: '#00938e',
                boxShadow: '0 0 8px rgba(0,147,142,0.6)',
              }}
            />
          </div>
        </div>
      </div>

      <Tooltip {...tooltip} />
    </div>
  )
}

// ── Main WorkflowPanel ────────────────────────────────────────────────────────
export default function WorkflowPanel({ videoId, videoRef }) {
  const { user }  = useAuth()
  const isSurgeon = user?.role === 'surgeon'

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const fetchLog = async () => {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`http://localhost:3001/api/videos/${videoId}/log`)
      const json = await res.json()
      setData(json)
    } catch {
      setError('Failed to load log data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (videoId) fetchLog() }, [videoId])

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading workflow...</p>
      </div>
    </div>
  )

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-red-400">{error}</p>
    </div>
  )

  // ── No log yet ────────────────────────────────────────────────────────────
  if (!data?.hasLog) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
      <EmptyIllustration />
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">No log file attached</p>
        <p className="text-xs text-gray-400">
          {isSurgeon
            ? 'The service team will upload the surgical log.'
            : 'Attach a .json log file to enable the workflow timeline.'
          }
        </p>
      </div>
      {!isSurgeon && <UploadLogButton videoId={videoId} onUploaded={fetchLog} />}
    </div>
  )

  // ── Log exists → show timeline ────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Replace log — service only */}
      {!isSurgeon && (
        <div className="flex justify-end mb-3 flex-shrink-0">
          <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer" style={{ color: '#00938e' }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Replace log
            <input
              type="file" accept=".json" className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0]
                if (!file) return
                const form = new FormData()
                form.append('log', file)
                const res  = await fetch(`http://localhost:3001/api/videos/${videoId}/log`, { method: 'POST', body: form })
                const json = await res.json()
                if (json.success) fetchLog()
              }}
            />
          </label>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <TimelineView data={data} videoRef={videoRef} />
      </div>
    </div>
  )
}