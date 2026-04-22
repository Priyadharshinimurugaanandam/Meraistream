import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const surgeonList = [
  { id: 's1', name: 'Dr. Raj',          hospital: 'AIIMS New Delhi'                     },
  { id: 's2', name: 'Dr. Rajesh',        hospital: 'Manipal Hospital New Delhi'          },
  { id: 's3', name: 'Dr. Harini',        hospital: 'Apollo Hospitals Chennai'            },
  { id: 's4', name: 'Dr. Sunita Kapoor', hospital: 'Fortis Hospital Bangalore'           },
  { id: 's5', name: 'Dr. Vikram Nair',   hospital: 'Sir HN Reliance Hospital Mumbai'     },
  { id: 's6', name: 'Dr. Kavita Desai',  hospital: 'Kokilaben Dhirubhai Ambani Hospital' },
]

export const AuthProvider = ({ children }) => {
  const [user,      setUser]      = useState(null)
  // reminders shape: { [surgeonId]: [ { id, title, date, time, type, note } ] }
  const [reminders, setReminders] = useState({})

  const login = (credentials, role) => {
    if (role === 'surgeon') {
      const surgeon = surgeonList.find(s => s.id === credentials.surgeonId)
      if (!surgeon) return { success: false }
      const nameParts = surgeon.name.replace('Dr. ', '').split(' ')
      setUser({
        id:       surgeon.id,
        name:     surgeon.name,
        hospital: surgeon.hospital,
        role:     'surgeon',
        initials: nameParts.map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      })
      return { success: true }
    }
    if (role === 'service') {
      if (!credentials.email || !credentials.password) return { success: false }
      setUser({
        name:     'Hara',
        email:    credentials.email,
        role:     'service',
        initials: 'H',
      })
      return { success: true }
    }
    return { success: false }
  }

  const logout = () => setUser(null)

  const isServicePerson = () => user?.role === 'service'
  const isSurgeon       = () => user?.role === 'surgeon'

  // ── Reminder helpers ──────────────────────────────────────────────────────
  // surgeonId = surgeon the reminder belongs to
  const addReminder = (surgeonId, reminder) => {
    const entry = { ...reminder, id: `r_${Date.now()}` }
    setReminders(prev => ({
      ...prev,
      [surgeonId]: [...(prev[surgeonId] || []), entry],
    }))
  }

  const deleteReminder = (surgeonId, reminderId) => {
    setReminders(prev => ({
      ...prev,
      [surgeonId]: (prev[surgeonId] || []).filter(r => r.id !== reminderId),
    }))
  }

  // Returns reminders for a specific surgeon
  const getReminders = (surgeonId) => reminders[surgeonId] || []

  // Returns all reminders across all surgeons (for service view)
  const getAllReminders = () => {
    const all = []
    Object.entries(reminders).forEach(([sId, list]) => {
      const surgeon = surgeonList.find(s => s.id === sId)
      list.forEach(r => all.push({ ...r, surgeonId: sId, surgeonName: surgeon?.name || sId }))
    })
    return all.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
  }

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      isServicePerson, isSurgeon,
      addReminder, deleteReminder, getReminders, getAllReminders,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}