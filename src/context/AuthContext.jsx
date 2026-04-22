import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const surgeonList = [
  { id: 's1', name: 'Dr. Raj',          hospital: 'AIIMS New Delhi'                      },
  { id: 's2', name: 'Dr. Rajesh',        hospital: 'Manipal Hospital New Delhi'           },
  { id: 's3', name: 'Dr. Harini',        hospital: 'Apollo Hospitals Chennai'             },
  { id: 's4', name: 'Dr. Sunita Kapoor', hospital: 'Fortis Hospital Bangalore'            },
  { id: 's5', name: 'Dr. Vikram Nair',   hospital: 'Sir HN Reliance Hospital Mumbai'      },
  { id: 's6', name: 'Dr. Kavita Desai',  hospital: 'Kokilaben Dhirubhai Ambani Hospital'  },
]

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const login = (credentials, role) => {
    if (role === 'surgeon') {
      const surgeon = surgeonList.find(s => s.id === credentials.surgeonId)
      if (!surgeon) return { success: false }
      const nameParts = surgeon.name.replace('Dr. ', '').split(' ')
      setUser({
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isServicePerson, isSurgeon }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}