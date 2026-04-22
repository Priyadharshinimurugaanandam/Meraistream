import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, surgeonList } from '../../context/AuthContext'

// ─── Icons ────────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {open ? (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    )}
  </svg>
)

const SurgeonSVG = () => (
  <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 14l1.5 4M9 14l-1.5 4" />
  </svg>
)

const ServiceSVG = () => (
  <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const LogoMark = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <path d="M6 10 L18 4 L30 10 L30 26 L18 32 L6 26 Z" stroke="white" strokeWidth="2" fill="none" />
    <path d="M18 4 L18 32 M6 10 L30 26 M30 10 L6 26" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
  </svg>
)

const slides = [
  { title: 'Interactive Modules',   desc: 'Practice with guided modules designed to simulate real-world operating room decisions.' },
  { title: 'Share Surgical Videos', desc: 'Distribute laparoscopic robotic surgical videos seamlessly across hospitals and doctors.' },
  { title: 'Track Your Growth',     desc: 'Analyse your surgical performance and monitor progress over time with rich analytics.' },
  { title: 'Connect Institutions',  desc: 'Bridge the gap between surgeons and hospitals through a unified video platform.' },
]

const RoleCard = ({ role, label, icon: Icon, selected, onClick }) => (
  <button
    onClick={() => onClick(role)}
    style={selected ? {
      borderColor: '#00938e', backgroundColor: '#f0fafa',
      color: '#00938e', boxShadow: '0 4px 12px rgba(0,147,142,0.15)', transform: 'scale(1.02)',
    } : { borderColor: '#e5e7eb', backgroundColor: 'white', color: '#6b7280' }}
    className="flex-1 flex flex-col items-center justify-center gap-2 py-5 px-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 font-medium text-sm"
  >
    <span style={{ color: selected ? '#00938e' : '#9ca3af' }}><Icon /></span>
    <span className="font-semibold">{label}</span>
  </button>
)

// ─── Surgeon Name Picker ──────────────────────────────────────────────────────
const SurgeonPicker = ({ selectedId, onSelect }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', margin: 0 }}>
      Select your name
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
      {surgeonList.map((surgeon) => {
        const isSelected = selectedId === surgeon.id
        const initials   = surgeon.name.replace('Dr. ', '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        return (
          <button
            key={surgeon.id}
            type="button"
            onClick={() => onSelect(surgeon.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '14px',
              border: `1.5px solid ${isSelected ? '#00938e' : '#e5e7eb'}`,
              background: isSelected ? '#f0fafa' : 'white',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s',
              boxShadow: isSelected ? '0 2px 10px rgba(0,147,142,0.12)' : 'none',
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#00938e44' }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#e5e7eb' }}
          >
            {/* Avatar */}
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
              background: isSelected
                ? 'linear-gradient(135deg, #00938e, #007a76)'
                : 'linear-gradient(135deg, #e6f7f6, #b2ebe8)',
              color: isSelected ? 'white' : '#00938e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700,
            }}>
              {initials}
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: isSelected ? '#00938e' : '#374151' }}>
                {surgeon.name}
              </p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ca3af', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {surgeon.hospital}
              </p>
            </div>
            {/* Check */}
            {isSelected && (
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#00938e" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  </div>
)

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [role,       setRole]       = useState(null)
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [surgeonId,  setSurgeonId]  = useState(null)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)

  useState(() => {
    const timer = setInterval(() => setSlideIndex(i => (i + 1) % slides.length), 4000)
    return () => clearInterval(timer)
  })

  // Reset fields when role changes
  const handleRoleChange = (r) => {
    setRole(r)
    setError('')
    setSurgeonId(null)
    setEmail('')
    setPassword('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!role) { setError('Please select your role.'); return }

    if (role === 'surgeon') {
      if (!surgeonId) { setError('Please select your name.'); return }
    } else {
      if (!email)    { setError('Please enter your email.'); return }
      if (!password) { setError('Please enter your password.'); return }
    }

    setLoading(true)
    await new Promise(r => setTimeout(r, 700))

    const credentials = role === 'surgeon'
      ? { surgeonId }
      : { email, password }

    const result = login(credentials, role)
    setLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError('Login failed. Please try again.')
    }
  }

  const currentSlide = slides[slideIndex]
  const canSubmit    = role === 'surgeon' ? !!surgeonId : (!!email && !!password)

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-10"
        style={{ background: 'linear-gradient(135deg, #004745 0%, #006b67 25%, #00938e 55%, #00b5af 80%, #80d8d5 100%)' }}
      >
        <div style={{ position: 'absolute', top: '-80px', left: '-60px', width: '380px', height: '380px', borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%', background: 'rgba(0,181,175,0.35)', filter: 'blur(40px)', animation: 'blobFloat 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '30%', right: '-80px', width: '320px', height: '320px', borderRadius: '40% 60% 30% 70% / 60% 40% 70% 30%', background: 'rgba(0,147,142,0.3)', filter: 'blur(50px)', animation: 'blobFloat 10s ease-in-out infinite reverse', animationDelay: '2s' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '20%', width: '280px', height: '280px', borderRadius: '70% 30% 50% 50% / 40% 60% 40% 60%', background: 'rgba(0,107,103,0.4)', filter: 'blur(45px)', animation: 'blobFloat 12s ease-in-out infinite', animationDelay: '4s' }} />
        <style>{`@keyframes blobFloat { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(15px,-20px) scale(1.05)} 66%{transform:translate(-10px,10px) scale(0.97)} }`}</style>

        <div className="relative z-10 flex items-center gap-3">
          <LogoMark />
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-lg tracking-wide">Merai</span>
            <span className="text-white/70 text-l tracking-widest uppercase font-medium">Stream</span>
          </div>
        </div>

        <div className="relative z-10">
          <div key={slideIndex} className="page-enter">
            <h2 className="text-white font-bold text-3xl mb-3 leading-tight">{currentSlide.title}</h2>
            <p className="text-white/75 text-sm leading-relaxed max-w-xs">{currentSlide.desc}</p>
          </div>
          <div className="flex gap-2 mt-6">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setSlideIndex(i)} style={{ height: '6px', width: i === slideIndex ? '24px' : '12px', borderRadius: '9999px', background: i === slideIndex ? 'white' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 bg-white relative">
        <div className="absolute top-6 right-8">
          <span style={{ fontWeight: 800, fontSize: '1.6rem', color: '#003d3b', letterSpacing: '-0.5px', fontFamily: 'Georgia, serif' }}>
            Meril
          </span>
        </div>

        <div className="w-full max-w-md">
          <h1 style={{ fontWeight: 800, fontSize: '2rem', color: '#00938e', marginBottom: '2rem' }}>
            Login
          </h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            {/* Role Selection */}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-3">I am a</p>
              <div className="flex gap-3">
                <RoleCard role="surgeon" label="Surgeon"        icon={SurgeonSVG} selected={role === 'surgeon'} onClick={handleRoleChange} />
                <RoleCard role="service" label="Service Person" icon={ServiceSVG} selected={role === 'service'} onClick={handleRoleChange} />
              </div>
            </div>

            {/* ── Surgeon: Name Picker ── */}
            {role === 'surgeon' && (
              <div style={{ opacity: 1, animation: 'fadeIn 0.3s ease' }}>
                <SurgeonPicker selectedId={surgeonId} onSelect={setSurgeonId} />
              </div>
            )}

            {/* ── Service: Email + Password ── */}
            {role === 'service' && (
              <div className="flex flex-col gap-4" style={{ animation: 'fadeIn 0.3s ease' }}>
                <input
                  type="email" placeholder="Email Address" value={email}
                  onChange={e => setEmail(e.target.value)} autoComplete="email"
                  style={{ width: '100%', padding: '14px 20px', borderRadius: '9999px', border: '1.5px solid #00938e', backgroundColor: '#f0fafa', color: '#374151', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#007a76'; e.target.style.boxShadow = '0 0 0 3px rgba(0,147,142,0.15)' }}
                  onBlur={e  => { e.target.style.borderColor = '#00938e'; e.target.style.boxShadow = 'none' }}
                />
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'} placeholder="Password" value={password}
                    onChange={e => setPassword(e.target.value)} autoComplete="current-password"
                    style={{ width: '100%', padding: '14px 48px 14px 20px', borderRadius: '9999px', border: '1.5px solid #00938e', backgroundColor: '#f0fafa', color: '#374151', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#007a76'; e.target.style.boxShadow = '0 0 0 3px rgba(0,147,142,0.15)' }}
                    onBlur={e  => { e.target.style.borderColor = '#00938e'; e.target.style.boxShadow = 'none' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <EyeIcon open={showPass} />
                  </button>
                </div>
                <div className="text-right">
                  <button type="button" style={{ color: '#00938e', fontSize: '0.875rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Forgot Password?
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem', borderRadius: '12px', padding: '12px 16px' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            {role && (
              <div className="flex justify-center mt-2">
                <button
                  type="submit" disabled={loading || !canSubmit}
                  style={{ background: canSubmit ? 'linear-gradient(135deg, #00938e 0%, #007a76 100%)' : '#e5e7eb', color: canSubmit ? 'white' : '#9ca3af', border: 'none', borderRadius: '9999px', padding: '14px 64px', fontSize: '1rem', fontWeight: 600, cursor: (loading || !canSubmit) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: canSubmit ? '0 4px 16px rgba(0,147,142,0.35)' : 'none', transition: 'all 0.2s' }}
                >
                  {loading ? (
                    <>
                      <svg style={{ animation: 'spin 0.8s linear infinite' }} width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" strokeOpacity="0.3" />
                        <path fill="white" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : 'Login'}
                </button>
              </div>
            )}
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
              <span className="inline-flex gap-0.5">{[...Array(5)].map((_, i) => <span key={i} className="w-1 h-1 rounded-full bg-gray-300 inline-block" />)}</span>
              Digital Experience Lab
              <span className="inline-flex gap-0.5">{[...Array(5)].map((_, i) => <span key={i} className="w-1 h-1 rounded-full bg-gray-300 inline-block" />)}</span>
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}