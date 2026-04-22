import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, surgeonList } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Header  from './Header'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TODAY = new Date()

const pad  = (n) => String(n).padStart(2, '0')
const dateStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`
const parseDate = (str) => new Date(str + 'T00:00:00')

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

const TYPE_COLORS = {
  surgery:  { bg: '#fef3c7', text: '#d97706', border: '#fcd34d', dot: '#f59e0b' },
  reminder: { bg: '#e6f7f6', text: '#00938e', border: '#6ee7e4', dot: '#00938e' },
  meeting:  { bg: '#eef2ff', text: '#6366f1', border: '#c7d2fe', dot: '#6366f1' },
  review:   { bg: '#fce7f3', text: '#db2777', border: '#f9a8d4', dot: '#ec4899' },
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const ChevronLeft = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
)
const ChevronRight = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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
const PlusIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)

// ─── Add Reminder Modal ───────────────────────────────────────────────────────
const AddReminderModal = ({ onClose, onAdd, defaultDate, isService }) => {
  const [title,     setTitle]     = useState('')
  const [date,      setDate]      = useState(defaultDate)
  const [time,      setTime]      = useState('09:00')
  const [type,      setType]      = useState('surgery')
  const [note,      setNote]      = useState('')
  const [surgeonId, setSurgeonId] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !date || !time) return
    if (isService && !surgeonId) return
    onAdd({ title: title.trim(), date, time, type, note: note.trim(), surgeonId: isService ? surgeonId : undefined })
    onClose()
  }

  const inp = {
    width: '100%', padding: '9px 11px', borderRadius: '9px',
    border: '1px solid #e5e7eb', fontSize: '0.82rem', color: '#374151',
    outline: 'none', boxSizing: 'border-box', background: 'white', fontFamily: 'inherit',
  }
  const lbl = {
    display: 'block', fontSize: '0.7rem', fontWeight: 600,
    color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '26px',
        width: '360px', maxWidth: '94vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            {isService ? 'Schedule for Surgeon' : 'Add Reminder'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
          {isService && (
            <div>
              <label style={lbl}>Surgeon <span style={{ color: '#ef4444' }}>*</span></label>
              <select value={surgeonId} onChange={e => setSurgeonId(e.target.value)} required style={inp}>
                <option value="">Select surgeon…</option>
                {surgeonList.map(s => <option key={s.id} value={s.id}>{s.name} — {s.hospital}</option>)}
              </select>
            </div>
          )}

          <div>
            <label style={lbl}>Title <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Laparoscopic Surgery" required style={inp} autoFocus />
          </div>

          <div>
            <label style={lbl}>Type</label>
            <select value={type} onChange={e => setType(e.target.value)} style={inp}>
              <option value="surgery">Surgery</option>
              <option value="reminder">Reminder</option>
              <option value="meeting">Meeting</option>
              <option value="review">Review</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={lbl}>Date <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={inp} />
            </div>
            <div>
              <label style={lbl}>Time <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} required style={inp} />
            </div>
          </div>

          <div>
            <label style={lbl}>Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Optional note…" rows={2}
              style={{ ...inp, resize: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              border: '1px solid #e5e7eb', background: 'white',
              fontSize: '0.84rem', fontWeight: 600, color: '#374151', cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #00938e, #007a76)',
              fontSize: '0.84rem', fontWeight: 600, color: 'white', cursor: 'pointer',
            }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Day Detail Panel ─────────────────────────────────────────────────────────
const DayPanel = ({ dateStr, reminders, onClose, onAdd, onDelete, isService }) => {
  const d    = parseDate(dateStr)
  const disp = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{
      width: '300px', flexShrink: 0,
      background: 'white', borderRadius: '16px',
      border: '1px solid #f3f4f6',
      boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 18px', borderBottom: '1px solid #f3f4f6',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Selected Date
          </p>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', margin: 0 }}>{disp}</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px' }}>
          <CloseIcon />
        </button>
      </div>

      {/* Events */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        {reminders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: '#f0fffe', margin: '0 auto 10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#00938e" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>No events this day</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {reminders.map(r => {
              const tc = TYPE_COLORS[r.type] || TYPE_COLORS.reminder
              return (
                <div key={r.id} style={{
                  padding: '10px 12px', borderRadius: '10px',
                  background: tc.bg, border: `1px solid ${tc.border}`,
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tc.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1f2937' }}>{r.title}</span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: '0 0 2px', paddingLeft: '12px' }}>
                      {r.time} · <span style={{
                        padding: '1px 6px', borderRadius: '9999px',
                        background: 'white', color: tc.text, fontSize: '0.65rem', fontWeight: 600,
                      }}>{r.type}</span>
                    </p>
                    {isService && r.surgeonName && (
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0, paddingLeft: '12px' }}>{r.surgeonName}</p>
                    )}
                    {r.note && (
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: '3px 0 0', paddingLeft: '12px' }}>{r.note}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onDelete(r.id, r.surgeonId)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '2px', flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
                  >
                    <TrashIcon />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add button */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
        <button
          onClick={onAdd}
          style={{
            width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #00938e, #007a76)',
            color: 'white', fontSize: '0.84rem', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          <PlusIcon /> Add Event
        </button>
      </div>
    </div>
  )
}

// ─── Full Month Grid ──────────────────────────────────────────────────────────
const MonthGrid = ({ year, month, reminders, selectedDate, onSelectDate }) => {
  const firstDay   = new Date(year, month, 1).getDay()
  const daysInMon  = new Date(year, month + 1, 0).getDate()

  const reminderMap = useMemo(() => {
    const map = {}
    reminders.forEach(r => {
      if (!map[r.date]) map[r.date] = []
      map[r.date].push(r)
    })
    return map
  }, [reminders])

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMon; d++) cells.push(d)
  // pad to full 6-row grid
  while (cells.length < 42) cells.push(null)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Day headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        borderBottom: '1px solid #f3f4f6', marginBottom: '0',
      }}>
        {DAYS.map(d => (
          <div key={d} style={{
            textAlign: 'center', padding: '10px 0',
            fontSize: '0.72rem', fontWeight: 700,
            color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gridTemplateRows: 'repeat(6, 1fr)',
        flex: 1,
      }}>
        {cells.map((day, idx) => {
          if (!day) return (
            <div key={idx} style={{ borderRight: '1px solid #f9fafb', borderBottom: '1px solid #f9fafb', background: '#fafafa' }} />
          )

          const ds         = dateStr(year, month, day)
          const dayEvents  = reminderMap[ds] || []
          const isToday    = day === TODAY.getDate() && month === TODAY.getMonth() && year === TODAY.getFullYear()
          const isSelected = selectedDate === ds
          const isWeekend  = idx % 7 === 0 || idx % 7 === 6

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(isSelected ? null : ds)}
              style={{
                border: '1px solid #f3f4f6',
                borderColor: isSelected ? '#00938e' : '#f3f4f6',
                background: isSelected ? '#f0fffe' : isWeekend ? '#fafafa' : 'white',
                padding: '8px 10px',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                transition: 'background 0.1s',
                position: 'relative',
                minHeight: '90px',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fffe' }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isWeekend ? '#fafafa' : 'white' }}
            >
              {/* Date number */}
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: isToday ? '#00938e' : 'transparent',
                color: isToday ? 'white' : isSelected ? '#00938e' : isWeekend ? '#9ca3af' : '#374151',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.82rem', fontWeight: isToday || isSelected ? 700 : 400,
                flexShrink: 0, marginBottom: '4px',
              }}>
                {day}
              </div>

              {/* Events (max 3 shown) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                {dayEvents.slice(0, 3).map((ev, i) => {
                  const tc = TYPE_COLORS[ev.type] || TYPE_COLORS.reminder
                  return (
                    <div key={i} style={{
                      fontSize: '0.62rem', fontWeight: 600,
                      color: tc.text, background: tc.bg,
                      padding: '1px 5px', borderRadius: '4px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      border: `1px solid ${tc.border}`,
                    }}>
                      {ev.time} {ev.title}
                    </div>
                  )
                })}
                {dayEvents.length > 3 && (
                  <div style={{ fontSize: '0.6rem', color: '#9ca3af', paddingLeft: '4px' }}>
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Calendar Page ────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const { user, isServicePerson, addReminder, deleteReminder, getReminders, getAllReminders } = useAuth()
  const navigate = useNavigate()

  const [collapsed,      setCollapsed]      = useState(false)
  const [year,           setYear]           = useState(TODAY.getFullYear())
  const [month,          setMonth]          = useState(TODAY.getMonth())
  const [selectedDate,   setSelectedDate]   = useState(null)
  const [showModal,      setShowModal]      = useState(false)
  const [filterSurgeon,  setFilterSurgeon]  = useState('all')

  const isService    = isServicePerson()
  const sidebarWidth = collapsed ? 72 : 220

  // All reminders relevant to current user/filter
  const allReminders = isService ? getAllReminders() : getReminders(user?.id)
  const visibleReminders = isService && filterSurgeon !== 'all'
    ? allReminders.filter(r => r.surgeonId === filterSurgeon)
    : allReminders

  // Reminders on selected day
  const dayReminders = selectedDate
    ? visibleReminders.filter(r => r.date === selectedDate)
    : []

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }
  const goToday   = () => { setYear(TODAY.getFullYear()); setMonth(TODAY.getMonth()) }

  const handleAdd = ({ surgeonId, ...rest }) => {
    const targetId = isService ? surgeonId : user?.id
    if (!targetId) return
    addReminder(targetId, rest)
  }

  const handleDelete = (reminderId, surgeonId) => {
    const targetId = isService ? surgeonId : user?.id
    deleteReminder(targetId, reminderId)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex' }}>
      <Sidebar onCollapse={setCollapsed} />

      <div style={{
        marginLeft: sidebarWidth, flex: 1,
        display: 'flex', flexDirection: 'column',
        height: '100vh', overflow: 'hidden',
        transition: 'margin-left 0.3s ease',
      }}>
        <Header title="Calendar" sidebarCollapsed={collapsed} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 24px', marginTop: '64px', overflow: 'hidden' }}>

          {/* ── Top bar ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '12px', marginBottom: '20px', flexShrink: 0,
          }}>
            {/* Month/year + nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={prevMonth} style={{
                width: '34px', height: '34px', borderRadius: '8px',
                border: '1px solid #e5e7eb', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#374151',
              }}>
                <ChevronLeft />
              </button>

              <div style={{ textAlign: 'center', minWidth: '160px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  {MONTHS[month]}
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0 }}>{year}</p>
              </div>

              <button onClick={nextMonth} style={{
                width: '34px', height: '34px', borderRadius: '8px',
                border: '1px solid #e5e7eb', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#374151',
              }}>
                <ChevronRight />
              </button>

              <button onClick={goToday} style={{
                padding: '6px 14px', borderRadius: '8px',
                border: '1px solid #e5e7eb', background: 'white',
                fontSize: '0.8rem', fontWeight: 600, color: '#374151',
                cursor: 'pointer',
              }}>
                Today
              </button>
            </div>

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Surgeon filter — service only */}
              {isService && (
                <select
                  value={filterSurgeon}
                  onChange={e => setFilterSurgeon(e.target.value)}
                  style={{
                    padding: '7px 10px', borderRadius: '8px',
                    border: '1px solid #e5e7eb', background: 'white',
                    fontSize: '0.8rem', color: '#374151', cursor: 'pointer',
                  }}
                >
                  <option value="all">All Surgeons</option>
                  {surgeonList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}

              <button
                onClick={() => { setSelectedDate(selectedDate || dateStr(year, month, TODAY.getDate())); setShowModal(true) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #00938e, #007a76)',
                  color: 'white', fontSize: '0.84rem', fontWeight: 600,
                  cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,147,142,0.25)',
                }}
              >
                <PlusIcon /> Add Event
              </button>
            </div>
          </div>

          {/* ── Legend ── */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexShrink: 0, flexWrap: 'wrap' }}>
            {Object.entries(TYPE_COLORS).map(([type, c]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.dot }} />
                <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500, textTransform: 'capitalize' }}>{type}</span>
              </div>
            ))}
          </div>

          {/* ── Main area: calendar + day panel ── */}
          <div style={{
            flex: 1, display: 'flex', gap: '20px',
            overflow: 'hidden', minHeight: 0,
          }}>

            {/* Month grid */}
            <div style={{
              flex: 1, background: 'white', borderRadius: '16px',
              border: '1px solid #f3f4f6',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden', minWidth: 0,
            }}>
              <MonthGrid
                year={year}
                month={month}
                reminders={visibleReminders}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>

            {/* Day detail panel — slides in when a date is selected */}
            {selectedDate && (
              <DayPanel
                dateStr={selectedDate}
                reminders={dayReminders}
                onClose={() => setSelectedDate(null)}
                onAdd={() => setShowModal(true)}
                onDelete={handleDelete}
                isService={isService}
              />
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <AddReminderModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
          defaultDate={selectedDate || dateStr(year, month, TODAY.getDate())}
          isService={isService}
        />
      )}
    </div>
  )
}