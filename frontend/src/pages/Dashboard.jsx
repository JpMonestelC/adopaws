import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { shelterService, petService, petPhotoService, adoptionService } from '../services/api'
import Button from '../components/ui/Button'
import ImageUpload from '../components/ui/ImageUpload'
import styles from './SimpleList.module.css'

const EMPTY_PET = {
 name: '', petType: 'dog', breed: '', age: '', gender: 'male',
 size: 'medium', vaccinated: false, sterilized: false,
 description: '', region: '', photoUrl: '',
}

const inputStyle = { width: '100%', padding: '0.55rem 0.85rem', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '3px' }

const STATUS_MAP = {
 pending: { label: 'Pendiente', color: '#D4A017', bg: '#FDF8E1' },
 approved: { label: 'Aprobada', color: '#4A7C59', bg: '#EDF5F0' },
 rejected: { label: 'Rechazada', color: '#C0392B', bg: '#FDF0EA' },
 answered: { label: 'Respondida', color: '#2980B9', bg: '#EBF5FB' },
}

function PetForm({ initial = EMPTY_PET, onSubmit, onCancel, saving, error, title }) {
 const [form, setForm] = useState(initial)
 const handleChange = (e) => {
 const { name, value, type, checked } = e.target
 if (name === 'age') {
 const num = parseFloat(value)
 if (value !== '' && (num < 0 || num > 20)) return
 }
 setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
 }
 return (
 <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem' }}>
 <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: 'var(--color-bark)', marginBottom: '1.25rem' }}>{title}</h2>
 {error && <div style={{ background: '#FDF0EA', color: 'var(--color-error)', padding: '0.7rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
 <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }}>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
 {[
 { name: 'name', label: 'Nombre *', type: 'text', placeholder: 'Ej: Luna' },
 { name: 'breed', label: 'Raza', type: 'text', placeholder: 'Ej: Labrador Mix' },
 { name: 'age', label: 'Edad (años)', type: 'number', placeholder: '2', min: '0', max: '20' },
 ].map(f => (
 <div key={f.name}>
 <label style={labelStyle}>{f.label}</label>
 <input name={f.name} type={f.type} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} min={f.min} max={f.max} style={inputStyle} />
 </div>
 ))}
 <div>
 <label style={labelStyle}>Provincia</label>
 <select name="region" value={form.region} onChange={handleChange} style={{ ...inputStyle, background: 'white' }}>
 <option value="">Selecciona provincia</option>
 <option value="San José">San José</option>
 <option value="Alajuela">Alajuela</option>
 <option value="Cartago">Cartago</option>
 <option value="Heredia">Heredia</option>
 <option value="Guanacaste">Guanacaste</option>
 <option value="Puntarenas">Puntarenas</option>
 <option value="Limón">Limón</option>
 </select>
 </div>
 {[
 { name: 'petType', label: 'Tipo *', options: [['dog','Perro'],['cat','Gato'],['rabbit','Conejo'],['bird','Ave'],['other','Otro']] },
 { name: 'gender', label: 'Género', options: [['male','Macho'],['female','Hembra']] },
 { name: 'size', label: 'Tamaño', options: [['small','Pequeño'],['medium','Mediano'],['large','Grande']] },
 ].map(f => (
 <div key={f.name}>
 <label style={labelStyle}>{f.label}</label>
 <select name={f.name} value={form[f.name]} onChange={handleChange} style={{ ...inputStyle, background: 'white' }}>
 {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
 </select>
 </div>
 ))}
 </div>
 <div style={{ marginTop: '0.85rem' }}>
 <label style={labelStyle}>Descripción</label>
 <textarea name="description" value={form.description} onChange={handleChange} rows={3}
 placeholder="Personalidad e historia de la mascota..."
 style={{ ...inputStyle, resize: 'vertical' }} />
 </div>
 <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.85rem' }}>
 {[['vaccinated','Vacunado'],['sterilized','Esterilizado']].map(([name, label]) => (
 <label key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
 <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} />
 {label}
 </label>
 ))}
 </div>
 <div style={{ marginTop: '1rem' }}>
 <label style={labelStyle}>Foto</label>
 <ImageUpload label="Seleccionar foto" preview={form.photoUrl}
 onUpload={(url) => setForm(prev => ({ ...prev, photoUrl: url }))} />
 </div>
 <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
 <Button type="submit" loading={saving}>{title.includes('Nueva') ? 'Publicar mascota' : 'Guardar cambios'}</Button>
 <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
 </div>
 </form>
 </div>
 )
}

export default function Dashboard() {
 const { user } = useAuth()

 // Compatibilidad: el backend devuelve idUser, pero también puede venir id
 const userId = user?.idUser ?? user?.id

 const [activeTab, setActiveTab] = useState('pets')
 const [pets, setPets] = useState([])
 const [requests, setRequests] = useState([])
 const [loading, setLoading] = useState(true)
 const [loadingReqs, setLoadingReqs] = useState(false)
 const [showCreate, setShowCreate] = useState(false)
 const [editingId, setEditingId] = useState(null)
 const [expandedReq, setExpandedReq] = useState(null)
 const [saving, setSaving] = useState(false)
 const [error, setError] = useState('')
 const [success, setSuccess] = useState('')

 const loadPets = async () => {
 setLoading(true)
 try {
 const r = await shelterService.getMyPets()
 const list = Array.isArray(r.data) ? r.data : []
 const enriched = await Promise.all(list.map(async p => {
 try {
 const petId = p.idPet ?? p.id
 const photos = await petPhotoService.getByPet(petId)
 const photoList = Array.isArray(photos.data) ? photos.data : []
 const main = photoList.find(ph => ph.isMain) || photoList[0]
 return { ...p, mainPhoto: main?.photoUrl || null }
 } catch { return p }
 }))
 setPets(enriched)
 } catch { setPets([]) }
 finally { setLoading(false) }
 }

 const loadRequests = async () => {
 setLoadingReqs(true)
 try {
 const r = await shelterService.getMyPets()
 const list = Array.isArray(r.data) ? r.data : []
 const allReqs = await Promise.all(list.map(async p => {
 try {
 const petId = p.idPet ?? p.id
 const res = await adoptionService.getByPet(petId)
 const reqs = Array.isArray(res.data) ? res.data : []
 return reqs.map(req => ({ ...req, petName: p.name, petType: p.petType }))
 } catch { return [] }
 }))
 setRequests(allReqs.flat())
 } catch { setRequests([]) }
 finally { setLoadingReqs(false) }
 }

 useEffect(() => { loadPets() }, [])
 useEffect(() => { if (activeTab === 'requests') loadRequests() }, [activeTab])

 const handleCreate = async (form) => {
 if (!form.name.trim()) { setError('El nombre es requerido.'); return }
 if (!form.breed.trim()) { setError('La raza es requerida.'); return }
 if (form.age === '' || form.age === null || form.age === undefined) { setError('La edad es requerida.'); return }
 if (!form.region) { setError('La provincia es requerida.'); return }
 if (!form.description.trim()) { setError('La descripción es requerida.'); return }
 setSaving(true); setError(''); setSuccess('')
 try {
 const { photoUrl, ...petData } = form
 // Usa idUser del objeto user correctamente
 const res = await petService.create({ ...petData, age: parseInt(form.age) || 0, idUser: userId })
 if (photoUrl && res.data?.idPet) {
 await petPhotoService.create({ idPet: res.data.idPet, photoUrl, isMain: true }).catch(() => {})
 }
 setSuccess('¡Mascota publicada!')
 setShowCreate(false)
 loadPets()
 } catch (err) {
 setError(err.response?.data?.message || 'Error al publicar.')
 } finally { setSaving(false) }
 }

 const handleEdit = async (form, petId) => {
 if (!form.name.trim()) { setError('El nombre es requerido.'); return }
 if (!form.breed.trim()) { setError('La raza es requerida.'); return }
 if (form.age === '' || form.age === null || form.age === undefined) { setError('La edad es requerida.'); return }
 if (!form.region) { setError('La provincia es requerida.'); return }
 if (!form.description.trim()) { setError('La descripción es requerida.'); return }
 setSaving(true); setError(''); setSuccess('')
 try {
 const { photoUrl, ...updateData } = form
 await petService.update(petId, { ...updateData, age: parseInt(form.age) || 0 })
 if (photoUrl) {
 await petPhotoService.create({ idPet: petId, photoUrl, isMain: true }).catch(() => {})
 }
 setSuccess('¡Cambios guardados!')
 setEditingId(null)
 loadPets()
 } catch (err) {
 setError(err.response?.data?.message || 'Error al guardar.')
 } finally { setSaving(false) }
 }

 const handleDelete = async (petId, petName) => {
 if (!window.confirm(`¿Eliminar a ${petName}? Esta acción no se puede deshacer.`)) return
 try {
 // Eliminar primero las solicitudes de adopción (restricción FK del backend)
 try {
 const reqs = await adoptionService.getByPet(petId)
 const list = Array.isArray(reqs.data) ? reqs.data : []
 await Promise.all(list.map(r => adoptionService.delete(r.idAdoptionRequest ?? r.id).catch(() => {})))
 } catch { /* si falla, igual intentamos eliminar la mascota */ }
 await petService.delete(petId)
 setPets(prev => prev.filter(p => (p.idPet ?? p.id) !== petId))
 setSuccess(`${petName} eliminado.`)
 } catch { alert('Error al eliminar. Intenta de nuevo.') }
 }

 const handleReqStatus = async (reqId, status) => {
 try {
 await adoptionService.updateStatus(reqId, status)
 setRequests(prev => prev.map(r => (r.idAdoptionRequest ?? r.id) === reqId ? { ...r, requestStatus: status } : r))
 setSuccess(status === 'approved' ? ' Solicitud aprobada' : ' Solicitud rechazada')
 } catch { alert('Error al actualizar estado.') }
 }

 const typeLabel = { dog: 'Perro', cat: 'Gato', rabbit: 'Conejo', bird: 'Ave', other: 'Otro' }
 const genderLabel = { male: 'Macho', female: 'Hembra' }
 const sizeLabel = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' }
 const pendingCount = requests.filter(r => r.requestStatus?.toLowerCase() === 'pending').length

 return (
 <div className={styles.page}>
 <div className="container">

 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
 <div>
 <h1 className={styles.title} style={{ marginBottom: '0.25rem' }}>Panel del refugio</h1>
 <p style={{ color: 'var(--color-text-muted)' }}>Hola, {user?.fullName} · {pets.length} mascotas publicadas</p>
 </div>
 {activeTab === 'pets' && (
 <Button onClick={() => { setShowCreate(!showCreate); setEditingId(null); setError('') }}>
 {showCreate ? ' Cancelar' : '+ Publicar mascota'}
 </Button>
 )}
 </div>

 {success && (
 <div style={{ background: '#EDF5F0', color: '#4A7C59', padding: '0.9rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 500 }}>
 {success}
 </div>
 )}

 <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0' }}>
 {[
 { id: 'pets', label: ' Mis mascotas' },
 { id: 'requests', label: ` Solicitudes${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
 ].map(t => (
 <button key={t.id} onClick={() => { setActiveTab(t.id); setSuccess('') }}
 style={{ padding: '0.6rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600,
 color: activeTab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
 borderBottom: activeTab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
 marginBottom: '-2px', transition: 'all 0.15s' }}>
 {t.label}
 </button>
 ))}
 </div>

 {/* TAB: MASCOTAS */}
 {activeTab === 'pets' && (
 <>
 {showCreate && (
 <PetForm title="Nueva mascota" initial={EMPTY_PET} saving={saving} error={error}
 onSubmit={handleCreate}
 onCancel={() => { setShowCreate(false); setError('') }} />
 )}
 {loading ? <p style={{ color: 'var(--color-text-muted)' }}>Cargando...</p>
 : pets.length === 0 ? (
 <div className={styles.empty}>
 <span></span>
 <p>No tienes mascotas publicadas aún.</p>
 <Button onClick={() => setShowCreate(true)}>Publicar primera mascota</Button>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
 {pets.map(p => {
 const petId = p.idPet ?? p.id
 const isEditing = editingId === petId
 return (
 <div key={petId}>
 {isEditing ? (
 <PetForm title="Editar mascota"
 initial={{ name: p.name||'', petType: p.petType||'dog', breed: p.breed||'', age: p.age??'', gender: p.gender||'male', size: p.size||'medium', vaccinated: p.vaccinated||false, sterilized: p.sterilized||false, description: p.description||'', region: p.region||'', photoUrl: '' }}
 saving={saving} error={error}
 onSubmit={(form) => handleEdit(form, petId)}
 onCancel={() => { setEditingId(null); setError('') }} />
 ) : (
 <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: '14px', padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
 <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#F5EDD8,#E8C49A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
 {p.mainPhoto
 ? <img src={p.mainPhoto} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
 : (p.petType === 'cat' ? '' : p.petType === 'rabbit' ? '' : p.petType === 'bird' ? '' : '')}
 </div>
 <div style={{ flex: 1, minWidth: '180px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
 <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{p.name}</h3>
 <span style={{ fontSize: '0.75rem', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '99px', fontWeight: 500 }}>
 {typeLabel[p.petType?.toLowerCase()] || p.petType}
 </span>
 </div>
 <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 0.4rem' }}>
 {p.breed || 'Raza mixta'} · {p.age != null ? `${p.age} años` : ''} · {genderLabel[p.gender?.toLowerCase()] || p.gender} · {sizeLabel[p.size?.toLowerCase()] || p.size}
 </p>
 {p.region && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}> {p.region}</p>}
 </div>
 <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
 <button onClick={() => { setEditingId(petId); setShowCreate(false); setError(''); setSuccess('') }}
 style={{ padding: '0.45rem 1rem', border: '1.5px solid var(--color-primary)', color: 'var(--color-primary)', background: 'white', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
 Editar
 </button>
 <button onClick={() => handleDelete(petId, p.name)}
 style={{ padding: '0.45rem 1rem', border: '1.5px solid #C0392B', color: '#C0392B', background: 'white', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
 Eliminar
 </button>
 </div>
 </div>
 )}
 </div>
 )
 })}
 </div>
 )
 }
 </>
 )}

 {/* TAB: SOLICITUDES */}
 {activeTab === 'requests' && (
 <div>
 {loadingReqs ? <p style={{ color: 'var(--color-text-muted)' }}>Cargando solicitudes...</p>
 : requests.length === 0 ? (
 <div className={styles.empty}>
 <span></span>
 <p>No hay solicitudes de adopción aún.</p>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
 {requests.map((req, i) => {
 const reqId = req.idAdoptionRequest ?? req.id ?? i
 const st = STATUS_MAP[req.requestStatus?.toLowerCase()] || STATUS_MAP.pending
 const isExpanded = expandedReq === reqId
 return (
 <div key={reqId} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: '14px', overflow: 'hidden' }}>
 <div style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
 <div style={{ flex: 1, minWidth: '200px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
 <strong style={{ color: 'var(--color-text-primary)', fontSize: '1rem' }}>
 Solicitud para {req.petName}
 </strong>
 <span style={{ fontSize: '0.73rem', background: st.bg, color: st.color, padding: '2px 10px', borderRadius: '99px', fontWeight: 600 }}>
 {st.label}
 </span>
 </div>
 <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
 {req.contactPhone || 'Sin teléfono'} · {req.housingType || '—'} · {req.address || '—'}
 </p>
 </div>
 <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flexShrink: 0 }}>
 <button onClick={() => setExpandedReq(isExpanded ? null : reqId)}
 style={{ padding: '0.4rem 0.9rem', border: '1.5px solid var(--color-border)', color: 'var(--color-text-secondary)', background: 'white', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
 {isExpanded ? ' Ocultar' : ' Ver detalles'}
 </button>
 {req.requestStatus?.toLowerCase() === 'pending' && (
 <>
 <button onClick={() => handleReqStatus(reqId, 'approved')}
 style={{ padding: '0.4rem 0.9rem', border: '1.5px solid #4A7C59', color: '#4A7C59', background: 'white', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 500 }}>
 Aprobar
 </button>
 <button onClick={() => handleReqStatus(reqId, 'rejected')}
 style={{ padding: '0.4rem 0.9rem', border: '1.5px solid #C0392B', color: '#C0392B', background: 'white', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 500 }}>
 Rechazar
 </button>
 </>
 )}
 </div>
 </div>
 {isExpanded && (
 <div style={{ borderTop: '1px solid var(--color-border)', padding: '1.25rem', background: '#FAFAF8', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
 {[
 ['Razón de adopción', req.adoptionReason],
 ['Experiencia con mascotas', req.petExperience],
 ['Otras mascotas en casa', req.hasOtherPets ? 'Sí' : 'No'],
 ['Tipo de vivienda', req.housingType],
 ['Dirección', req.address],
 ['Teléfono de contacto', req.contactPhone],
 ].map(([label, value]) => value != null && (
 <div key={label}>
 <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 3px' }}>{label}</p>
 <p style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', margin: 0 }}>{String(value)}</p>
 </div>
 ))}
 </div>
 )}
 </div>
 )
 })}
 </div>
 )
 }
 </div>
 )}
 </div>
 </div>
 )
}
