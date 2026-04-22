import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const BellIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

const UploadIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
)

const SearchIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const LogoutIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const ProfileIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const mockNotifications = [
  { id: 'n1', message: 'New video uploaded to Sir HN Reliance Hospital Mumbai', time: '2 min ago',   unread: true  },
  { id: 'n2', message: 'Dr. Arjun Mehta received your shared video',            time: '1 hour ago',  unread: true  },
  { id: 'n3', message: 'Robotic Cholecystectomy is now available',               time: '3 hours ago', unread: false },
  { id: 'n4', message: 'Upload complete: ASD Repair',                            time: 'Yesterday',   unread: false },
]

export default function Header({ title, breadcrumb, sidebarCollapsed }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const isSurgeon        = user?.role === 'surgeon'

  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile,       setShowProfile]       = useState(false)
  const [searchQuery,       setSearchQuery]       = useState('')
  const [notifications,     setNotifications]     = useState(mockNotifications)

  const notifRef    = useRef(null)
  const profileRef  = useRef(null)

  const unreadCount  = notifications.filter(n => n.unread).length
  const sidebarWidth = sidebarCollapsed ? 72 : 220

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotifications(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead  = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header style={{
      position: 'fixed', top: 0,
      left: sidebarWidth, width: `calc(100% - ${sidebarWidth}px)`,
      height: '56px', backgroundColor: 'white',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', zIndex: 30,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      transition: 'left 0.3s ease, width 0.3s ease',
    }}>

      {/* ── Left: Title / Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {breadcrumb && (
          <>
            <span
              style={{ color: '#9ca3af', fontSize: '0.875rem', cursor: 'pointer' }}
              onClick={() => navigate('/dashboard')}
            >
              {breadcrumb}
            </span>
            <span style={{ color: '#d1d5db', fontSize: '1rem' }}>›</span>
          </>
        )}
        <h1 style={{
          fontSize: breadcrumb ? '1.1rem' : '1rem', fontWeight: 700,
          color: breadcrumb ? '#00938e' : '#111827', margin: 0,
        }}>
          {title}
        </h1>
      </div>

      {/* ── Right: Actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: '10px', color: '#9ca3af', display: 'flex' }}>
            <SearchIcon />
          </span>
          <input
            type="text" placeholder="Search..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '32px', paddingRight: '14px',
              paddingTop: '7px', paddingBottom: '7px',
              borderRadius: '9999px', fontSize: '0.82rem',
              border: '1px solid #e5e7eb', backgroundColor: '#f9fafb',
              outline: 'none', width: '180px', color: '#374151', transition: 'width 0.2s',
            }}
            onFocus={e => e.target.style.width = '220px'}
            onBlur={e  => e.target.style.width = '180px'}
          />
        </div>

        {/* Upload — service only */}
        {!isSurgeon && (
          <button
            onClick={() => navigate('/upload')}
            title="Upload Video"
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #00938e, #007a76)',
              color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,147,142,0.3)', flexShrink: 0,
            }}
          >
            <UploadIcon />
          </button>
        )}

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f9fafb', border: '1px solid #e5e7eb',
              color: '#6b7280', cursor: 'pointer', position: 'relative', flexShrink: 0,
            }}
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-2px',
                width: '16px', height: '16px', borderRadius: '50%',
                backgroundColor: '#ef4444', color: 'white',
                fontSize: '0.6rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute', right: 0, top: '42px', width: '300px',
              background: 'white', borderRadius: '16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid #f3f4f6',
              zIndex: 50, overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: '0.75rem', color: '#00938e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start',
                    cursor: 'pointer', backgroundColor: n.unread ? '#f0fafa' : 'transparent',
                    borderBottom: '1px solid #f9fafb',
                  }}>
                    <span style={{ marginTop: '5px', width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, backgroundColor: n.unread ? '#00938e' : 'transparent' }} />
                    <div>
                      <p style={{ fontSize: '0.78rem', color: '#374151', margin: '0 0 2px', lineHeight: 1.4 }}>{n.message}</p>
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid #f3f4f6' }}>
                <button style={{ fontSize: '0.75rem', color: '#00938e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #00938e, #007a76)',
              color: 'white', fontSize: '0.75rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {user?.initials}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
              {user?.name}
            </span>
          </button>

          {showProfile && (
            <div style={{
              position: 'absolute', right: 0, top: '42px', width: '220px',
              background: 'white', borderRadius: '16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid #f3f4f6',
              zIndex: 50, overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00938e, #007a76)',
                  color: 'white', fontWeight: 700, fontSize: '0.8rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {user?.initials}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>{user?.name}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af', textTransform: 'capitalize' }}>
                    {user?.role === 'service' ? 'Service Person' : 'Surgeon'}
                  </p>
                </div>
              </div>
              <div style={{ padding: '4px 0' }}>
                <button
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.875rem', color: '#374151', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <ProfileIcon /> My Profile
                </button>
                <button
                  onClick={handleLogout}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.875rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogoutIcon /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}