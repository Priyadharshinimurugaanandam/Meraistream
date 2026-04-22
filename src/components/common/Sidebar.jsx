import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const HomeIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const SurgeryIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
  </svg>
)
const HospitalIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)
const ProcedureIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)
const SharedIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
)
const CalendarIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)
const TrainingIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
)
const LogoutIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)
const LogoMark = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="#00938e" />
    <path d="M12 28V16l8-6 8 6v12M16 28v-7h8v7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const serviceNav = [
  { label: 'Home',     path: '/dashboard', icon: HomeIcon     },
  { label: 'Surgeon',  path: '/surgeries', icon: SurgeryIcon  },
  { label: 'Hospital', path: '/hospitals', icon: HospitalIcon },
  { label: 'Training', path: '/training',  icon: TrainingIcon },
  { label: 'Calendar', path: '/calendar',  icon: CalendarIcon },
]

const surgeonNav = [
  { label: 'Home',           path: '/dashboard',  icon: HomeIcon      },
  { label: 'My Videos',      path: '/my-videos',  icon: SurgeryIcon   },
  { label: 'Procedures',     path: '/procedures', icon: ProcedureIcon },
  { label: 'Shared with Me', path: '/shared',     icon: SharedIcon    },
  { label: 'Training',       path: '/training',   icon: TrainingIcon  },
  { label: 'Calendar',       path: '/calendar',   icon: CalendarIcon  },
]

const NavButton = ({ label, path, icon: Icon, collapsed, navigate, currentPath }) => {
  const isActive = currentPath === path
  return (
    <button
      onClick={() => navigate(path)}
      title={collapsed ? label : ''}
      style={{
        width: '100%', display: 'flex', alignItems: 'center',
        gap: collapsed ? 0 : '10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '10px' : '10px 12px',
        borderRadius: '10px', border: 'none', cursor: 'pointer',
        fontSize: '0.875rem', fontWeight: isActive ? 600 : 400,
        color: isActive ? '#00938e' : '#6b7280',
        backgroundColor: isActive ? '#e6f7f6' : 'transparent',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = '#f0fafa'; e.currentTarget.style.color = '#00938e' } }}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280' } }}
    >
      <span style={{ flexShrink: 0, color: isActive ? '#00938e' : '#9ca3af' }}><Icon /></span>
      {!collapsed && <span>{label}</span>}
    </button>
  )
}

export default function Sidebar({ onCollapse }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate         = useNavigate()
  const location         = useLocation()
  const { logout, user } = useAuth()

  const isSurgeon = user?.role === 'surgeon'
  const navItems  = isSurgeon ? surgeonNav : serviceNav

  useEffect(() => { onCollapse?.(collapsed) }, [collapsed])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside style={{
      width: collapsed ? '72px' : '220px',
      position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40,
      backgroundColor: 'white', borderRight: '1px solid #f3f4f6',
      boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.3s ease', overflow: 'hidden',
    }}>

      {/* Logo + collapse */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 14px', borderBottom: '1px solid #f3f4f6', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ flexShrink: 0 }}><LogoMark size={34} /></div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#00938e' }}>Merai</span>
              <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Stream</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', marginLeft: collapsed ? 'auto' : 0 }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {navItems.map(item => (
          <NavButton
            key={item.path}
            {...item}
            collapsed={collapsed}
            navigate={navigate}
            currentPath={location.pathname}
          />
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '8px 10px 16px', flexShrink: 0, borderTop: '1px solid #f3f4f6' }}>
        {!collapsed && user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px', borderRadius: '10px',
            background: '#f9fafb', marginBottom: '6px',
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: '#e6f7f6', color: '#00938e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.68rem', fontWeight: 700, flexShrink: 0,
            }}>
              {user.initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </p>
              <p style={{ fontSize: '0.62rem', color: '#9ca3af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.role === 'surgeon' ? user.hospital : user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : ''}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : '10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '10px' : '10px 12px',
            borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontSize: '0.875rem', color: '#f87171',
            backgroundColor: 'transparent', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#f87171' }}
        >
          <span style={{ flexShrink: 0 }}><LogoutIcon /></span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}