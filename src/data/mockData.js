// ─── Hospitals ───────────────────────────────────────────────────────────────
export const hospitals = [
  { id: 'h1', name: 'Sir HN Reliance Hospital Mumbai' },
  { id: 'h2', name: 'Manipal Hospital New Delhi' },
  { id: 'h3', name: 'AIIMS New Delhi' },
  { id: 'h4', name: 'Apollo Hospitals Chennai' },
  { id: 'h5', name: 'Fortis Hospital Bangalore' },
  { id: 'h6', name: 'Kokilaben Dhirubhai Ambani Hospital' },
]

// ─── Surgeons ─────────────────────────────────────────────────────────────────
export const surgeons = [
  { id: 's1', name: 'Dr. Raj',    hospital: 'AIIMS New Delhi' },
  { id: 's2', name: 'Dr. Rajesh',   hospital: 'Manipal Hospital New Delhi' },
  { id: 's3', name: 'Dr. Harini',    hospital: 'Apollo Hospitals Chennai' },
  { id: 's4', name: 'Dr. Sunita Kapoor',  hospital: 'Fortis Hospital Bangalore' },
  { id: 's5', name: 'Dr. Vikram Nair',    hospital: 'Sir HN Reliance Hospital Mumbai' },
  { id: 's6', name: 'Dr. Kavita Desai',   hospital: 'Kokilaben Dhirubhai Ambani Hospital' },
]

// ─── Procedures ───────────────────────────────────────────────────────────────
export const procedures = [
  { id: 'p1',  name: 'Robotic Hysterectomy',    analytics: true  },
  { id: 'p2',  name: 'Robotic Fundoplication',  analytics: true  },
  { id: 'p3',  name: 'Robotic Cholecystectomy',       analytics: false },
  { id: 'p4',  name: 'Appendix',                 analytics: true  },
  { id: 'p5',  name: 'Unilateral Inguinal Hernia',         analytics: false },
  { id: 'p6',  name: 'Bilateral Inguinal Hernia',                    analytics: true  },
  { id: 'p7',  name: 'Gastrojejunostomy',               analytics: true  },
  { id: 'p8',  name: 'Laparoscopic Appendectomy',     analytics: false },
  { id: 'p9', name: 'Other',                         analytics: false },
]

// ─── Mock Videos (static) ─────────────────────────────────────────────────────
export const mockVideos = [

]

// ─── Export function to get all videos ───────────────────────────────────────
export const getAllVideos = () => {
  return mockVideos
}

// ─── Helper functions for grouping videos ────────────────────────────────────
export const getVideosByHospitalFromList = (videosList) => {
  return hospitals.map((h) => ({
    ...h,
    videos: videosList.filter(
      (v) => v.destinationType === 'hospital' && v.destinationId === h.id
    ),
  }))
}

export const getVideosBySurgeonFromList = (videosList) => {
  return surgeons.map((s) => ({
    ...s,
    videos: videosList.filter(
      (v) => v.destinationType === 'surgeon' && v.destinationId === s.id
    ),
  }))
}

// Legacy exports for backward compatibility
export const getVideosByHospital = () => {
  return getVideosByHospitalFromList(mockVideos)
}

export const getVideosBySurgeon = () => {
  return getVideosBySurgeonFromList(mockVideos)
}

// Thumbnail placeholder color based on id
export const getThumbnailColor = (id) => {
  const colors = [
    '#00938e22', '#007a7622', '#00b5af22',
    '#004745aa', '#00938e44', '#00605d33',
  ]
  const index = parseInt(id?.replace(/\D/g, '') || '0') % colors.length
  return colors[index]
}