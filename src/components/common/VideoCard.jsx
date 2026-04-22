import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PlayIcon = () => (
  <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
)

export default function VideoCard({ video, size = 'md' }) {
  const navigate = useNavigate()

  if (!video) return null

  const sizes = { sm: 'w-56', md: 'w-72', lg: 'w-80' }

  return (
    <div
      className={`${sizes[size]} card overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 group`}
      onClick={() => navigate(`/video/${video.id}`)}
    >
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-teal-900 to-teal-700">
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <PlayIcon />
          </div>
        </div>
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded">
            {video.duration}
          </span>
        )}
      </div>

      <div className="p-3">
        {video.procedure && (
          <span className="text-xs font-semibold" style={{ color: '#00938e' }}>
            {video.procedure}
          </span>
        )}
        <h4 className="text-sm font-semibold text-gray-800 mt-1 line-clamp-2 leading-snug">
          {video.title}
        </h4>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          {video.destinationType === 'hospital' ? '🏥' : '👨‍⚕️'}
          <span className="truncate">{video.destinationName}</span>
        </p>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">
              {video.uploadedBy?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="truncate max-w-[100px]">{video.uploadedBy || 'Unknown'}</span>
          </div>
          <span>{video.uploadedAt}</span>
        </div>
      </div>
    </div>
  )
}

export const EmptyVideoCard = ({ message = 'No videos uploaded yet. Click Upload Video to get started.' }) => (
  <div className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 bg-gray-50/50">
    <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#00938e" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
    </div>
    <p className="text-sm text-gray-400 font-medium">{message}</p>
  </div>
)

export const SkeletonVideoCard = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="aspect-video bg-gray-200" />
    <div className="p-3 flex flex-col gap-2">
      <div className="h-3 bg-gray-200 rounded-full w-1/3" />
      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
      <div className="h-3 bg-gray-200 rounded-full w-1/2" />
      <div className="flex justify-between mt-2">
        <div className="h-3 bg-gray-200 rounded-full w-1/4" />
        <div className="h-3 bg-gray-200 rounded-full w-1/4" />
      </div>
    </div>
  </div>
)