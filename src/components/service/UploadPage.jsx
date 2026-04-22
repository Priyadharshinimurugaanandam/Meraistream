import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'
import { hospitals, surgeons, procedures } from '../../data/mockData'

// ─── Icons (kept unchanged) ───────────────────────────────────────────────────
const UploadCloudIcon = () => (
  <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#00938e" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const VideoFileIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const CheckIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const InfoIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const PlusIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)

const AnalyticsIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

// ─── Step Indicator (unchanged) ───────────────────────────────────────────────
const StepIndicator = ({ currentStep }) => {
  const steps = ['Select Video', 'Video Details', 'Upload Destination']

  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, idx) => {
        const step = idx + 1
        const done = step < currentStep
        const active = step === currentStep

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                ${done ? 'bg-primary text-white' : ''}
                ${active ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                ${!done && !active ? 'bg-gray-100 text-gray-400' : ''}
              `}>
                {done ? <CheckIcon /> : step}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-primary' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-300 ${done ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Drop Zone (unchanged) ────────────────────────────────────────────────────
const DropZone = ({ file, onFileSelect, onRemove }) => {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type.startsWith('video/')) onFileSelect(dropped)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  if (file) {
    return (
      <div className="flex items-center justify-between p-4 rounded-2xl bg-primary-50 border-2 border-primary/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <VideoFileIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 truncate max-w-xs">{file.name}</p>
            <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="w-8 h-8 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors"
        >
          <TrashIcon />
        </button>
      </div>
    )
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      className={`drop-zone cursor-pointer transition-all duration-200 ${drag ? 'border-primary bg-primary-50 scale-[1.01]' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files[0]
          if (f) onFileSelect(f)
        }}
      />
      <UploadCloudIcon />
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700">Drag & drop your video here</p>
        <p className="text-xs text-gray-400 mt-1">or <span className="text-primary font-medium">browse files</span></p>
      </div>
      <p className="text-xs text-gray-400">Supports MP4, MOV, AVI, MKV — Max 2GB</p>
    </div>
  )
}

// ─── Destination Selector (unchanged) ─────────────────────────────────────────
const DestinationSelector = ({
  destType, setDestType,
  destId, setDestId,
  customName, setCustomName,
}) => {
  const [addingCustom, setAddingCustom] = useState(false)
  const list = destType === 'hospital' ? hospitals : surgeons

  const handleTypeChange = (type) => {
    setDestType(type)
    setDestId('')
    setCustomName('')
    setAddingCustom(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        {['hospital', 'surgeon'].map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`
              flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm capitalize transition-all duration-200
              ${destType === type ? 'border-primary bg-primary-50 text-primary' : 'border-gray-200 text-gray-400 hover:border-primary/40'}
            `}
          >
            {type === 'hospital' ? '🏥' : '👨‍⚕️'} {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {destType && !addingCustom && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Select {destType === 'hospital' ? 'Hospital' : 'Surgeon'}
          </label>
          <select
            value={destId}
            onChange={(e) => {
              if (e.target.value === '__custom__') {
                setAddingCustom(true)
                setDestId('')
              } else {
                setDestId(e.target.value)
              }
            }}
            className="input-field appearance-none cursor-pointer"
            style={{ borderRadius: '12px' }}
          >
            <option value="">— Select {destType === 'hospital' ? 'Hospital' : 'Surgeon'} —</option>
            {list.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}{item.hospital ? ` — ${item.hospital}` : ''}
              </option>
            ))}
            <option value="__custom__">+ Add manually</option>
          </select>
        </div>
      )}

      {addingCustom && (
        <div className="flex flex-col gap-2 page-enter">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Enter {destType === 'hospital' ? 'Hospital' : 'Surgeon'} Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={destType === 'hospital' ? 'e.g. City Hospital Mumbai' : 'e.g. Dr. Rajesh Kumar'}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="input-field flex-1"
              style={{ borderRadius: '12px' }}
              autoFocus
            />
            <button
              onClick={() => { setAddingCustom(false); setDestId('') }}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-400 text-sm hover:border-red-300 hover:text-red-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {destType && !addingCustom && (
        <button
          onClick={() => { setAddingCustom(true); setDestId('') }}
          className="flex items-center gap-2 text-sm text-primary font-medium hover:underline w-fit transition-colors"
        >
          <PlusIcon />
          Add {destType === 'hospital' ? 'hospital' : 'surgeon'} manually
        </button>
      )}
    </div>
  )
}

// ─── Success Modal (unchanged) ────────────────────────────────────────────────
const SuccessModal = ({ onClose, onUploadAnother }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm page-enter">
    <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center gap-4 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary-50">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#00938e" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="font-display font-bold text-xl text-gray-800">Video Uploaded!</h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        Your video has been successfully uploaded and is now available in the assigned destination.
      </p>
      <div className="flex gap-3 w-full mt-2">
        <button onClick={onUploadAnother} className="btn-outline flex-1 py-2.5">Upload Another</button>
        <button onClick={onClose} className="btn-primary flex-1 py-2.5">Go to Dashboard</button>
      </div>
    </div>
  </div>
)

// ─── Upload Page ──────────────────────────────────────────────────────────────
export default function UploadPage() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = collapsed ? 72 : 220

  // Form state
  const [step, setStep] = useState(1)
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [procedure, setProcedure] = useState('')
  const [destType, setDestType] = useState('hospital')
  const [destId, setDestId] = useState('')
  const [customName, setCustomName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  const selectedProcedure = procedures.find((p) => p.id === procedure)

  const validateStep = (s) => {
    const errs = {}
    if (s === 1 && !file) errs.file = 'Please select a video file.'
    if (s === 2) {
      if (!title.trim()) errs.title = 'Title is required.'
      if (!procedure) errs.procedure = 'Please select a procedure.'
    }
    if (s === 3) {
      if (!destType) errs.dest = 'Please select a destination type.'
      if (!destId && !customName.trim()) errs.dest = 'Please select or enter a destination.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3))
  }

  const prevStep = () => {
    setErrors({})
    setStep((s) => Math.max(s - 1, 1))
  }

  // ── REAL FILE UPLOAD ────────────────────────────────────────────────────────
// Upload to backend
const handleUpload = async () => {
  if (!validateStep(3)) return

  setUploading(true)
  setProgress(0)

  try {
    // Create FormData
    const formData = new FormData()
    formData.append('video', file)
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    formData.append('procedure', procedures.find((p) => p.id === procedure)?.name || '')
    formData.append('uploadedBy', 'Service Person')

    // Get destination info
    let destinationName = ''
    let destinationId = destId

    if (customName.trim()) {
      destinationName = customName.trim()
      destinationId = `custom_${Date.now()}`
    } else {
      if (destType === 'hospital') {
        const hospital = hospitals.find((h) => h.id === destId)
        destinationName = hospital?.name || ''
      } else {
        const surgeon = surgeons.find((s) => s.id === destId)
        destinationName = surgeon?.name || ''
      }
    }

    formData.append('destType', destType)
    formData.append('destId', destinationId)
    formData.append('destName', destinationName)

    // Upload to backend with progress tracking
    const xhr = new XMLHttpRequest()

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100
        setProgress(percentComplete)
      }
    })

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText)
        console.log('Upload successful:', response)
        setProgress(100)
        setUploading(false)
        setSuccess(true)
        
        // Trigger refresh
        window.dispatchEvent(new Event('videosUpdated'))
      } else {
        const error = JSON.parse(xhr.responseText)
        console.error('Upload failed:', error)
        alert(`Upload failed: ${error.error || 'Unknown error'}`)
        setUploading(false)
      }
    })

    // Handle errors
    xhr.addEventListener('error', () => {
      console.error('Upload error')
      alert('Upload failed. Please check your connection and try again.')
      setUploading(false)
    })

    // Send request
    xhr.open('POST', 'http://localhost:3001/api/upload')
    xhr.send(formData)

  } catch (error) {
    console.error('Upload error:', error)
    alert('Upload failed: ' + error.message)
    setUploading(false)
  }
}

  const resetForm = () => {
    setStep(1)
    setFile(null)
    setTitle('')
    setDescription('')
    setProcedure('')
    setDestType('hospital')
    setDestId('')
    setCustomName('')
    setProgress(0)
    setSuccess(false)
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {success && (
        <SuccessModal
          onClose={() => navigate('/dashboard')}
          onUploadAnother={resetForm}
        />
      )}

      <Sidebar onCollapse={setCollapsed} />

      <div
        style={{ marginLeft: sidebarWidth }}
        className="transition-all duration-300 min-h-screen"
      >
        <Header title="Upload Video" sidebarCollapsed={collapsed} />

        <main
          className="px-6 py-6 page-enter max-w-3xl"
          style={{ marginTop: '64px' }}
        >
          <StepIndicator currentStep={step} />

          <div className="card p-6">

            {step === 1 && (
              <div className="flex flex-col gap-5 page-enter">
                <div>
                  <h2 className="font-display font-bold text-lg text-gray-800 mb-1">Select Video File</h2>
                  <p className="text-sm text-gray-500">Choose a video file from your device to upload.</p>
                </div>

                <DropZone
                  file={file}
                  onFileSelect={setFile}
                  onRemove={() => setFile(null)}
                />

                {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}

                <div className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-amber-500 flex-shrink-0 mt-0.5"><InfoIcon /></span>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Before You Upload —</strong> Ensure the video does not contain any patient-identifiable information. All uploads are reviewed for compliance with medical data guidelines.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-5 page-enter">
                <div>
                  <h2 className="font-display font-bold text-lg text-gray-800 mb-1">Video Details</h2>
                  <p className="text-sm text-gray-500">Provide information about this surgical video.</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter video title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    style={{ borderRadius: '12px' }}
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Description <span className="text-gray-300 normal-case font-normal">(optional)</span>
                  </label>
                  <textarea
                    placeholder="Enter video description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="input-field resize-none"
                    style={{ borderRadius: '12px' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Procedure <span className="text-red-400">*</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-2">
                    If you cannot find the procedure, select "Other" and we will be in touch with you to classify the procedure.
                  </p>
                  <select
                    value={procedure}
                    onChange={(e) => setProcedure(e.target.value)}
                    className="input-field appearance-none cursor-pointer"
                    style={{ borderRadius: '12px' }}
                  >
                    <option value="">— Select Procedure —</option>
                    {procedures.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.analytics ? ' 📊' : ''}
                      </option>
                    ))}
                  </select>
                  {errors.procedure && <p className="text-xs text-red-500 mt-1">{errors.procedure}</p>}

                  {selectedProcedure?.analytics && (
                    <div className="flex items-center gap-1.5 mt-2 text-primary text-xs font-medium">
                      <AnalyticsIcon />
                      Analytics available for this procedure
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-5 page-enter">
                <div>
                  <h2 className="font-display font-bold text-lg text-gray-800 mb-1">Upload Destination</h2>
                  <p className="text-sm text-gray-500">
                    Choose where this video will be visible — a hospital or a specific surgeon.
                  </p>
                </div>

                <DestinationSelector
                  destType={destType} setDestType={setDestType}
                  destId={destId} setDestId={setDestId}
                  customName={customName} setCustomName={setCustomName}
                />

                {errors.dest && <p className="text-sm text-red-500">{errors.dest}</p>}

                {(destId || customName) && (
                  <div className="p-4 rounded-2xl bg-primary-50 border border-primary/20 page-enter">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Upload Summary</p>
                    <div className="flex flex-col gap-1.5 text-sm text-gray-700">
                      <div className="flex gap-2">
                        <span className="text-gray-400 w-24">File:</span>
                        <span className="font-medium truncate">{file?.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-400 w-24">Title:</span>
                        <span className="font-medium">{title}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-400 w-24">Procedure:</span>
                        <span className="font-medium">{selectedProcedure?.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-400 w-24">{destType === 'hospital' ? 'Hospital:' : 'Surgeon:'}</span>
                        <span className="font-medium">
                          {customName || (destType === 'hospital'
                            ? hospitals.find(h => h.id === destId)?.name
                            : surgeons.find(s => s.id === destId)?.name)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {uploading && (
                  <div className="flex flex-col gap-2 page-enter">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Uploading...</span>
                      <span>{Math.min(Math.round(progress), 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          background: 'linear-gradient(90deg, #00938e, #00b5af)',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="btn-outline px-6 py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Back
              </button>

              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="btn-primary px-8 py-2.5 text-sm"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className="btn-primary px-8 py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    '⬆ Upload Video'
                  )}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


