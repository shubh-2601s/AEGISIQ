import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { scansApi } from '../lib/api'
import { UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Props { projectId: string }

export default function ScanUpload({ projectId }: Props) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation(
    (file: File) => scansApi.upload(projectId, file),
    {
      onSuccess: () => {
        setSuccess(true)
        setError('')
        queryClient.invalidateQueries(['scans', projectId])
        setTimeout(() => setSuccess(false), 3000)
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Failed to start scan. Please try again.')
      },
    }
  )

  const handleFile = (file: File) => {
    setError('')
    setSuccess(false)
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Only .zip archives are accepted.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('Archive must be smaller than 50MB.')
      return
    }
    mutation.mutate(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div>
      <div
        className={`upload-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".zip" onChange={handleChange} style={{ display: 'none' }} />

        {mutation.isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
            <div style={{ fontWeight: 600, color: 'var(--primary-400)' }}>Uploading &amp; initiating scan...</div>
          </div>
        ) : success ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={36} style={{ color: 'var(--low)' }} />
            <div style={{ fontWeight: 600, color: 'var(--low)' }}>Scan queued successfully!</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Results will appear in Recent Scans</div>
          </div>
        ) : (
          <>
            <div className="upload-icon">
              <UploadCloud size={36} />
            </div>
            <div className="upload-title">Drop your .zip archive here</div>
            <div className="upload-hint">or click to browse · Max 50MB · ZIP only</div>
          </>
        )}
      </div>

      {error && (
        <div className="form-error" style={{ marginTop: '0.5rem' }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        🛡️ <strong>Zero-execution policy:</strong> Files are analyzed via pattern matching only.
        Nothing in your archive is ever compiled or executed.
      </div>
    </div>
  )
}
