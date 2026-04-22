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

// ── Default training modules for laparoscopic robotic surgery ─────────────────
export const DEFAULT_MODULES = [
  {
    id: 'm1',
    category: 'Fundamentals',
    title: 'Robot Setup & Docking',
    description: 'Patient cart positioning, trocar placement, and arm docking for da Vinci / CMR Versius systems.',
    totalSteps: 8,
  },
  {
    id: 'm2',
    category: 'Fundamentals',
    title: 'Console Ergonomics & Controls',
    description: 'Surgeon console setup, finger clutch mechanics, camera control, and pedal functions.',
    totalSteps: 6,
  },
  {
    id: 'm3',
    category: 'Simulation',
    title: 'Peg Transfer Drill',
    description: 'Basic bimanual manipulation — transfer rings between pegs using Maryland forceps.',
    totalSteps: 5,
  },
  {
    id: 'm4',
    category: 'Simulation',
    title: 'Needle Driving & Suturing',
    description: 'Intracorporeal knot tying, needle loading, and suture tensioning on phantom tissue.',
    totalSteps: 7,
  },
  {
    id: 'm5',
    category: 'Procedure',
    title: 'Robotic Cholecystectomy',
    description: 'Critical view of safety, cystic duct/artery identification, clip application, and gallbladder extraction.',
    totalSteps: 10,
  },
  {
    id: 'm6',
    category: 'Procedure',
    title: 'Robotic Inguinal Hernia Repair (TAPP)',
    description: 'Peritoneal flap creation, mesh placement and fixation, peritoneal closure.',
    totalSteps: 9,
  },
  {
    id: 'm7',
    category: 'Procedure',
    title: 'Robotic Hemi-Colectomy',
    description: 'Medial-to-lateral dissection, vascular ligation, bowel resection and anastomosis.',
    totalSteps: 12,
  },
  {
    id: 'm8',
    category: 'Safety & Compliance',
    title: 'Emergency Undocking Protocol',
    description: 'Rapid instrument withdrawal, arm retraction, and patient cart release under emergency conditions.',
    totalSteps: 4,
  },
  {
    id: 'm9',
    category: 'Safety & Compliance',
    title: 'Instrument Fault Handling',
    description: 'Recognising instrument errors, safe hot-swap, and intraoperative troubleshooting on Medicaroid / Hugo systems.',
    totalSteps: 5,
  },
  {
    id: 'm10',
    category: 'Advanced',
    title: 'Robotic Prostatectomy (RARP)',
    description: 'Bladder neck dissection, neurovascular bundle preservation, urethro-vesical anastomosis.',
    totalSteps: 14,
  },
]

export const AuthProvider = ({ children }) => {
  const [user,      setUser]      = useState(null)
  const [reminders, setReminders] = useState({})
  // training shape: { [surgeonId]: { [moduleId]: { assignedAt, completedSteps, status, notes, updatedAt } } }
  const [training,  setTraining]  = useState({})

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
      setUser({ name: 'Hara', email: credentials.email, role: 'service', initials: 'H' })
      return { success: true }
    }
    return { success: false }
  }

  const logout = () => setUser(null)
  const isServicePerson = () => user?.role === 'service'
  const isSurgeon       = () => user?.role === 'surgeon'

  // ── Reminder helpers ──────────────────────────────────────────────────────
  const addReminder = (surgeonId, reminder) => {
    setReminders(prev => ({
      ...prev,
      [surgeonId]: [...(prev[surgeonId] || []), { ...reminder, id: `r_${Date.now()}` }],
    }))
  }
  const deleteReminder = (surgeonId, reminderId) => {
    setReminders(prev => ({
      ...prev,
      [surgeonId]: (prev[surgeonId] || []).filter(r => r.id !== reminderId),
    }))
  }
  const getReminders    = (surgeonId) => reminders[surgeonId] || []
  const getAllReminders  = () => {
    const all = []
    Object.entries(reminders).forEach(([sId, list]) => {
      const surgeon = surgeonList.find(s => s.id === sId)
      list.forEach(r => all.push({ ...r, surgeonId: sId, surgeonName: surgeon?.name || sId }))
    })
    return all.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
  }

  // ── Training helpers ──────────────────────────────────────────────────────
  // Assign a module to a surgeon (service only)
  const assignModule = (surgeonId, moduleId) => {
    setTraining(prev => {
      const surgeonTraining = prev[surgeonId] || {}
      if (surgeonTraining[moduleId]) return prev // already assigned
      return {
        ...prev,
        [surgeonId]: {
          ...surgeonTraining,
          [moduleId]: {
            assignedAt:     new Date().toISOString(),
            completedSteps: 0,
            status:         'assigned',  // assigned | in_progress | completed
            notes:          '',
            updatedAt:      new Date().toISOString(),
          },
        },
      }
    })
  }

  // Update progress (service updates steps/status; surgeon can add notes)
  const updateModuleProgress = (surgeonId, moduleId, updates) => {
    setTraining(prev => {
      const existing = prev[surgeonId]?.[moduleId]
      if (!existing) return prev
      const module = DEFAULT_MODULES.find(m => m.id === moduleId)
      const completedSteps = updates.completedSteps ?? existing.completedSteps
      const status = completedSteps >= (module?.totalSteps || 1) ? 'completed'
        : completedSteps > 0 ? 'in_progress'
        : 'assigned'
      return {
        ...prev,
        [surgeonId]: {
          ...prev[surgeonId],
          [moduleId]: {
            ...existing,
            ...updates,
            completedSteps,
            status,
            updatedAt: new Date().toISOString(),
          },
        },
      }
    })
  }

  const unassignModule = (surgeonId, moduleId) => {
    setTraining(prev => {
      const copy = { ...prev[surgeonId] }
      delete copy[moduleId]
      return { ...prev, [surgeonId]: copy }
    })
  }

  // Get all assigned modules for a surgeon with progress info
  const getSurgeonTraining = (surgeonId) => {
    const assigned = training[surgeonId] || {}
    return DEFAULT_MODULES
      .filter(m => assigned[m.id])
      .map(m => ({ ...m, progress: assigned[m.id] }))
  }

  // Get all training across all surgeons (for service overview)
  const getAllTraining = () => {
    return surgeonList.map(s => ({
      ...s,
      modules: getSurgeonTraining(s.id),
    }))
  }

  return (
    <AuthContext.Provider value={{
      user, login, logout, isServicePerson, isSurgeon,
      addReminder, deleteReminder, getReminders, getAllReminders,
      assignModule, updateModuleProgress, unassignModule,
      getSurgeonTraining, getAllTraining,
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