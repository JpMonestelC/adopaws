import { useState, useRef } from 'react'

const CLOUD_NAME = 'dlpbvof4a'
const UPLOAD_PRESET = 'bbklbamq'

export default function ImageUpload({ onUpload, label = 'Subir imagen', preview = null }) {
 const [uploading, setUploading] = useState(false)
 const [previewUrl, setPreviewUrl] = useState(preview)
 const [error, setError] = useState('')
 const inputRef = useRef()

 const handleFile = async (e) => {
 const file = e.target.files[0]
 if (!file) return
 if (!file.type.startsWith('image/')) { setError('Solo se permiten imágenes.'); return }
 if (file.size > 5 * 1024 * 1024) { setError('La imagen debe pesar menos de 5MB.'); return }

 setUploading(true)
 setError('')

 const formData = new FormData()
 formData.append('file', file)
 formData.append('upload_preset', UPLOAD_PRESET)

 try {
 const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
 method: 'POST',
 body: formData,
 })
 const data = await res.json()
 if (data.secure_url) {
 setPreviewUrl(data.secure_url)
 onUpload(data.secure_url)
 } else {
 setError('Error al subir la imagen.')
 }
 } catch {
 setError('Error de conexión con Cloudinary.')
 } finally {
 setUploading(false)
 }
 }

 return (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
 {previewUrl && (
 <div style={{ position: 'relative', width: '100%', maxWidth: '240px' }}>
 <img src={previewUrl} alt="Preview"
 style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', border: '1.5px solid var(--color-border)' }} />
 <button onClick={() => { setPreviewUrl(null); onUpload('') }}
 style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 
 </button>
 </div>
 )}

 <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', border: '1.5px dashed var(--color-border)', borderRadius: '8px', background: uploading ? 'var(--color-surface-alt)' : 'white', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '0.9rem', color: 'var(--color-text-secondary)', width: 'fit-content', transition: 'all 0.15s' }}>
 {uploading ? '⏳ Subiendo...' : ` ${label}`}
 </button>

 <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

 {error && <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: 0 }}>{error}</p>}
 </div>
 )
}
