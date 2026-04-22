import { useState, useMemo } from 'react'
import { useAuth, surgeonList, DEFAULT_MODULES } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Header  from './Header'

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Fundamentals', 'Simulation', 'Procedure', 'Safety & Compliance', 'Advanced']

const STATUS_META = {
  assigned:    { label: 'Assigned',    bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
  in_progress: { label: 'In Progress', bg: '#fef3c7', text: '#d97706', dot: '#f59e0b' },
  completed:   { label: 'Completed',   bg: '#e6f7f6', text: '#00938e', dot: '#00938e' },
}

const CATEGORY_COLORS = {
  Fundamentals:          { bg: '#eff6ff', text: '#3b82f6', border: '#bfdbfe' },
  Simulation:            { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
  Procedure:             { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' },
  'Safety & Compliance': { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
  Advanced:              { bg: '#e6f7f6', text: '#00938e', border: '#6ee7e4' },
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)
const PlusIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)
const CloseIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)
const ChevronDown = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ value, max, color = '#00938e', height = 6 }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        flex: 1, height, borderRadius: height,
        background: '#f3f4f6', overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: height,
          background: pct === 100 ? '#00938e' : color,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', minWidth: '32px', textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  )
}

// ─── Assign Modules Modal (service only) ──────────────────────────────────────
const AssignModal = ({ surgeon, assignedIds, onClose, onAssign, onUnassign }) => {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')

  const filtered = DEFAULT_MODULES.filter(m => {
    const matchCat  = category === 'All' || m.category === category
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
                        m.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px',
        width: '580px', maxWidth: '95vw', maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
                Assign Training Modules
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0 }}>{surgeon.name} · {surgeon.hospital}</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
              <CloseIcon />
            </button>
          </div>

          {/* Search */}
          <input
            type="text" placeholder="Search modules…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: '9px',
              border: '1px solid #e5e7eb', fontSize: '0.82rem',
              color: '#374151', outline: 'none', boxSizing: 'border-box',
            }}
          />

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{
                padding: '4px 10px', borderRadius: '9999px', border: 'none',
                fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                background: category === c ? '#00938e' : '#f3f4f6',
                color: category === c ? 'white' : '#6b7280',
                transition: 'all 0.15s',
              }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Module list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(m => {
            const isAssigned = assignedIds.includes(m.id)
            const cc = CATEGORY_COLORS[m.category] || CATEGORY_COLORS.Fundamentals
            return (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '12px',
                border: `1px solid ${isAssigned ? '#6ee7e4' : '#f3f4f6'}`,
                background: isAssigned ? '#f0fffe' : 'white',
                transition: 'all 0.15s',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 600, padding: '1px 7px',
                      borderRadius: '9999px', background: cc.bg, color: cc.text,
                      border: `1px solid ${cc.border}`, flexShrink: 0,
                    }}>{m.category}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1f2937' }}>{m.title}</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: 0, lineHeight: 1.4 }}>{m.description}</p>
                  <p style={{ fontSize: '0.68rem', color: '#9ca3af', margin: '4px 0 0' }}>{m.totalSteps} steps</p>
                </div>
                <button
                  onClick={() => isAssigned ? onUnassign(m.id) : onAssign(m.id)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                    background: isAssigned ? '#e6f7f6' : 'linear-gradient(135deg, #00938e, #007a76)',
                    color: isAssigned ? '#00938e' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
                  }}
                  title={isAssigned ? 'Unassign' : 'Assign'}
                >
                  {isAssigned ? <CheckIcon /> : <PlusIcon />}
                </button>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem', padding: '24px 0' }}>No modules found</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Update Progress Modal (service only) ────────────────────────────────────
const UpdateProgressModal = ({ surgeon, module, progress, onClose, onUpdate }) => {
  const [steps, setSteps] = useState(progress.completedSteps)
  const [notes, setNotes] = useState(progress.notes || '')

  const pct = Math.round((steps / module.totalSteps) * 100)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px',
        width: '400px', maxWidth: '94vw',
        boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
        padding: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Update Progress</h3>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0 }}>{surgeon.name} · {module.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
            <CloseIcon />
          </button>
        </div>

        {/* Steps slider */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>
              Completed Steps
            </label>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00938e' }}>
              {steps} / {module.totalSteps} ({pct}%)
            </span>
          </div>
          <input
            type="range" min={0} max={module.totalSteps} value={steps}
            onChange={e => setSteps(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#00938e' }}
          />
          <ProgressBar value={steps} max={module.totalSteps} height={8} />
        </div>

        {/* Step buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {Array.from({ length: module.totalSteps }, (_, i) => i + 1).map(s => (
            <button
              key={s}
              onClick={() => setSteps(s)}
              style={{
                width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                background: s <= steps ? '#00938e' : '#f3f4f6',
                color: s <= steps ? 'white' : '#9ca3af',
                fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >{s}</button>
          ))}
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>
            Training Notes
          </label>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            rows={3} placeholder="Add notes about this session…"
            style={{
              width: '100%', padding: '8px 10px', borderRadius: '9px',
              border: '1px solid #e5e7eb', fontSize: '0.8rem',
              color: '#374151', outline: 'none', resize: 'none',
              fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', borderRadius: '10px',
            border: '1px solid #e5e7eb', background: 'white',
            fontSize: '0.84rem', fontWeight: 600, color: '#374151', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={() => { onUpdate({ completedSteps: steps, notes }); onClose() }} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #00938e, #007a76)',
            fontSize: '0.84rem', fontWeight: 600, color: 'white', cursor: 'pointer',
          }}>Save Progress</button>
        </div>
      </div>
    </div>
  )
}

// ─── Module Card ──────────────────────────────────────────────────────────────
const ModuleCard = ({ module, progress, isService, surgeon, onUpdate, onUnassign }) => {
  const sm  = STATUS_META[progress.status] || STATUS_META.assigned
  const cc  = CATEGORY_COLORS[module.category] || CATEGORY_COLORS.Fundamentals
  const pct = Math.round((progress.completedSteps / module.totalSteps) * 100)

  const updatedAt = new Date(progress.updatedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div style={{
      background: 'white', borderRadius: '14px',
      border: '1px solid #f3f4f6',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.62rem', fontWeight: 600, padding: '1px 7px',
              borderRadius: '9999px', background: cc.bg, color: cc.text,
              border: `1px solid ${cc.border}`, flexShrink: 0,
            }}>{module.category}</span>
            <span style={{
              fontSize: '0.62rem', fontWeight: 600, padding: '1px 7px',
              borderRadius: '9999px', background: sm.bg, color: sm.text, flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '3px',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sm.dot }} />
              {sm.label}
            </span>
          </div>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>{module.title}</h4>
        </div>

        {isService && (
          <button
            onClick={() => onUnassign(module.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '2px', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
            title="Unassign module"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
        {module.description}
      </p>

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
            {progress.completedSteps} of {module.totalSteps} steps
          </span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: pct === 100 ? '#00938e' : '#374151' }}>
            {pct}%
          </span>
        </div>
        <ProgressBar value={progress.completedSteps} max={module.totalSteps} height={7} />
      </div>

      {/* Notes */}
      {progress.notes && (
        <div style={{
          padding: '7px 10px', borderRadius: '8px', background: '#f9fafb',
          border: '1px solid #f3f4f6',
        }}>
          <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: 0, lineHeight: 1.4 }}>
            📝 {progress.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Updated {updatedAt}</span>
        {isService && (
          <button
            onClick={() => onUpdate(module)}
            style={{
              padding: '5px 12px', borderRadius: '8px', border: 'none',
              background: pct === 100 ? '#e6f7f6' : 'linear-gradient(135deg, #00938e, #007a76)',
              color: pct === 100 ? '#00938e' : 'white',
              fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {pct === 100 ? '✓ Completed' : 'Update Progress'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Surgeon Training Card (service overview) ─────────────────────────────────
const SurgeonTrainingCard = ({ surgeon, modules, onAssign, onUpdateProgress, onUnassign, isExpanded, onToggle }) => {
  const total     = modules.length
  const completed = modules.filter(m => m.progress.status === 'completed').length
  const inProg    = modules.filter(m => m.progress.status === 'in_progress').length
  const overallPct = total > 0
    ? Math.round(modules.reduce((acc, m) => acc + (m.progress.completedSteps / m.totalSteps), 0) / total * 100)
    : 0

  const [updateTarget, setUpdateTarget] = useState(null)

  return (
    <div style={{
      background: 'white', borderRadius: '16px',
      border: '1px solid #f3f4f6',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      overflow: 'hidden', marginBottom: '12px',
    }}>
      {/* Surgeon header row */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '14px',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          borderBottom: isExpanded ? '1px solid #f3f4f6' : 'none',
        }}
      >
        {/* Avatar */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #00938e, #007a76)',
          color: 'white', fontWeight: 700, fontSize: '0.78rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {surgeon.name.replace('Dr. ', '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2937' }}>{surgeon.name}</span>
            {completed === total && total > 0 && (
              <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '1px 7px', borderRadius: '9999px', background: '#e6f7f6', color: '#00938e' }}>
                All Complete
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>{surgeon.hospital}</p>

          {total > 0 && (
            <div style={{ marginTop: '6px' }}>
              <ProgressBar value={overallPct} max={100} height={5} />
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
          {[
            { label: 'Total',       value: total,     color: '#374151' },
            { label: 'In Progress', value: inProg,    color: '#d97706' },
            { label: 'Completed',   value: completed, color: '#00938e' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: '0.6rem', color: '#9ca3af', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Chevron */}
        <span style={{
          color: '#9ca3af', flexShrink: 0,
          transform: isExpanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }}>
          <ChevronDown />
        </span>
      </button>

      {/* Expanded modules */}
      {isExpanded && (
        <div style={{ padding: '16px 20px' }}>
          {/* Assign button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
            <button
              onClick={() => onAssign(surgeon)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 14px', borderRadius: '9px', border: 'none',
                background: 'linear-gradient(135deg, #00938e, #007a76)',
                color: 'white', fontSize: '0.78rem', fontWeight: 600,
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,147,142,0.2)',
              }}
            >
              <PlusIcon /> Assign Modules
            </button>
          </div>

          {modules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: '0.82rem' }}>
              No modules assigned yet. Click "Assign Modules" to get started.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px',
            }}>
              {modules.map(m => (
                <ModuleCard
                  key={m.id}
                  module={m}
                  progress={m.progress}
                  isService={true}
                  surgeon={surgeon}
                  onUpdate={(mod) => setUpdateTarget(mod)}
                  onUnassign={(mid) => onUnassign(surgeon.id, mid)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Update progress modal */}
      {updateTarget && (
        <UpdateProgressModal
          surgeon={surgeon}
          module={updateTarget}
          progress={updateTarget.progress}
          onClose={() => setUpdateTarget(null)}
          onUpdate={(updates) => onUpdateProgress(surgeon.id, updateTarget.id, updates)}
        />
      )}
    </div>
  )
}

// ─── Training Page ────────────────────────────────────────────────────────────
export default function TrainingPage() {
  const {
    user, isServicePerson,
    getSurgeonTraining, getAllTraining,
    assignModule, unassignModule, updateModuleProgress,
  } = useAuth()

  const [collapsed,      setCollapsed]      = useState(false)
  const [expandedIds,    setExpandedIds]    = useState({})
  const [assignTarget,   setAssignTarget]   = useState(null)   // surgeon object
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterStatus,   setFilterStatus]   = useState('all')

  const isService    = isServicePerson()
  const sidebarWidth = collapsed ? 72 : 220

  // ── Service data ──────────────────────────────────────────────────────────
  const allTraining = getAllTraining()

  // ── Surgeon data ──────────────────────────────────────────────────────────
  const myModules = useMemo(() => {
    if (!user?.id) return []
    return getSurgeonTraining(user.id).filter(m => {
      const matchCat    = filterCategory === 'All' || m.category === filterCategory
      const matchStatus = filterStatus   === 'all' || m.progress.status === filterStatus
      return matchCat && matchStatus
    })
  }, [user, getSurgeonTraining, filterCategory, filterStatus])

  const myAll       = user?.id ? getSurgeonTraining(user.id) : []
  const myCompleted = myAll.filter(m => m.progress.status === 'completed').length
  const myInProg    = myAll.filter(m => m.progress.status === 'in_progress').length
  const myOverall   = myAll.length > 0
    ? Math.round(myAll.reduce((acc, m) => acc + (m.progress.completedSteps / m.totalSteps), 0) / myAll.length * 100)
    : 0

  const toggleExpand = (id) => setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }))

  // ── Assign modal handlers ─────────────────────────────────────────────────
  const assignedIds = assignTarget
    ? (getAllTraining().find(s => s.id === assignTarget.id)?.modules || []).map(m => m.id)
    : []

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex' }}>
      <Sidebar onCollapse={setCollapsed} />

      <div style={{
        marginLeft: sidebarWidth, flex: 1,
        display: 'flex', flexDirection: 'column',
        transition: 'margin-left 0.3s ease',
      }}>
        <Header title="Training" sidebarCollapsed={collapsed} />

        <main style={{ padding: '24px', marginTop: '64px' }}>

          {/* ── SERVICE VIEW ── */}
          {isService && (
            <>
              {/* Summary stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
                {[
                  { label: 'Total Surgeons',    value: surgeonList.length,                                                                                      color: '#00938e' },
                  { label: 'Modules Assigned',  value: allTraining.reduce((a, s) => a + s.modules.length, 0),                                                  color: '#6366f1' },
                  { label: 'In Progress',       value: allTraining.reduce((a, s) => a + s.modules.filter(m => m.progress.status === 'in_progress').length, 0),  color: '#f59e0b' },
                  { label: 'Completed',         value: allTraining.reduce((a, s) => a + s.modules.filter(m => m.progress.status === 'completed').length, 0),    color: '#10b981' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'white', borderRadius: '14px', padding: '16px 18px',
                    border: '1px solid #f3f4f6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    borderLeft: `3px solid ${s.color}`,
                  }}>
                    <p style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, margin: '0 0 2px' }}>{s.value}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>
                Surgeon Training Overview
              </h2>

              {allTraining.map(s => (
                <SurgeonTrainingCard
                  key={s.id}
                  surgeon={s}
                  modules={s.modules}
                  isExpanded={!!expandedIds[s.id]}
                  onToggle={() => toggleExpand(s.id)}
                  onAssign={(surgeon) => setAssignTarget(surgeon)}
                  onUpdateProgress={updateModuleProgress}
                  onUnassign={unassignModule}
                />
              ))}
            </>
          )}

          {/* ── SURGEON VIEW ── */}
          {!isService && (
            <>
              {/* Personal summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
                {[
                  { label: 'Assigned',    value: myAll.length,  color: '#00938e' },
                  { label: 'In Progress', value: myInProg,      color: '#f59e0b' },
                  { label: 'Completed',   value: myCompleted,   color: '#10b981' },
                  { label: 'Overall',     value: `${myOverall}%`, color: '#6366f1' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'white', borderRadius: '14px', padding: '16px 18px',
                    border: '1px solid #f3f4f6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    borderLeft: `3px solid ${s.color}`,
                  }}>
                    <p style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, margin: '0 0 2px' }}>{s.value}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Overall progress bar */}
              {myAll.length > 0 && (
                <div style={{
                  background: 'white', borderRadius: '14px', padding: '16px 20px',
                  border: '1px solid #f3f4f6', marginBottom: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Overall Training Progress</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00938e' }}>{myOverall}%</span>
                  </div>
                  <ProgressBar value={myOverall} max={100} height={10} />
                </div>
              )}

              {/* Filters */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setFilterCategory(c)} style={{
                      padding: '5px 12px', borderRadius: '9999px', border: 'none',
                      fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                      background: filterCategory === c ? '#00938e' : '#f3f4f6',
                      color: filterCategory === c ? 'white' : '#6b7280',
                      transition: 'all 0.15s',
                    }}>{c}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                  {['all', 'assigned', 'in_progress', 'completed'].map(s => {
                    const lbl = s === 'all' ? 'All Status' : STATUS_META[s]?.label || s
                    return (
                      <button key={s} onClick={() => setFilterStatus(s)} style={{
                        padding: '5px 12px', borderRadius: '9999px',
                        border: `1px solid ${filterStatus === s ? '#00938e' : '#e5e7eb'}`,
                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                        background: filterStatus === s ? '#e6f7f6' : 'white',
                        color: filterStatus === s ? '#00938e' : '#6b7280',
                        transition: 'all 0.15s',
                      }}>{lbl}</button>
                    )
                  })}
                </div>
              </div>

              {myModules.length === 0 ? (
                <div style={{
                  background: 'white', borderRadius: '16px', padding: '48px 24px',
                  textAlign: 'center', border: '1px solid #f3f4f6',
                }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: '#f0fffe', margin: '0 auto 12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#00938e" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 600, margin: '0 0 4px' }}>
                    {myAll.length === 0 ? 'No training assigned yet' : 'No modules match your filters'}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>
                    {myAll.length === 0
                      ? 'Your service team will assign robotic surgery training modules here.'
                      : 'Try changing the category or status filter.'
                    }
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '14px',
                }}>
                  {myModules.map(m => (
                    <ModuleCard
                      key={m.id}
                      module={m}
                      progress={m.progress}
                      isService={false}
                      surgeon={user}
                      onUpdate={() => {}}
                      onUnassign={() => {}}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Assign modules modal */}
      {assignTarget && (
        <AssignModal
          surgeon={assignTarget}
          assignedIds={assignedIds}
          onClose={() => setAssignTarget(null)}
          onAssign={(mid)   => assignModule(assignTarget.id, mid)}
          onUnassign={(mid) => unassignModule(assignTarget.id, mid)}
        />
      )}
    </div>
  )
}