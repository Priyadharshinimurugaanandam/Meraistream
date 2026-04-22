import { useState, useEffect } from 'react'

const BACKEND_URL = 'http://localhost:3001'

export const useVideos = () => {
  const [videos,  setVideos]  = useState([])
  const [loading, setLoading] = useState(true)

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/videos`)
      if (response.ok) {
        const backendVideos = await response.json()
        // Deduplicate by fileName — each physical file = one video
        const seen   = new Set()
        const unique = backendVideos.filter((v) => {
          const key = v.fileName || v.id
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        setVideos(unique)
      } else {
        setVideos([])
      }
    } catch {
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
    window.addEventListener('videosUpdated', fetchVideos)
    return () => window.removeEventListener('videosUpdated', fetchVideos)
  }, [])

  return { videos, loading, refresh: fetchVideos }
}