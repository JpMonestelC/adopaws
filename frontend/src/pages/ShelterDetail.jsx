import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { shelterService, petService, petPhotoService } from '../services/api'
import PetCard from '../components/pets/PetCard'
import Button from '../components/ui/Button'
import ImageUpload from '../components/ui/ImageUpload'
import styles from './SimpleList.module.css'

const inputStyle = { width: '100%', padding: '0.55rem 0.85rem', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '3px' }
const typeLabel = { dog: 'Perro', cat: 'Gato', rabbit: 'Conejo', bird: 'Ave', other: 'Otro' }
const genderLabel = { male: 'Macho', female: 'Hembra' }
const sizeLabel = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' }

function EditPetForm({ pet, onSave, onCancel, saving, error }) {
 const [form, setForm] = useState({
 name: pet.name || '', breed: pet.breed || '', age: pet.age ?? '',
 gender: pet.gender || 'male', size: pet.size || 'medium',
 vaccinated: pet.vaccinated || false, sterilized: pet.sterilized || false,
 description: pet.description || '', region: pet.region || '', photoUrl: '',
 })
 const handleChange = (e) => {
 const { name, value, type, checked } = e.target
 setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
 }
 return (
 <div style={{ background: '#FFFBF5', border: '2px solid var(--color-primary)', borderRadius: '14px', padding: '1.5rem', marginTop: '0.5rem' }}>
 <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-bark)', marginBottom: '1rem' }}>Editar: {pet.name}</h3>
 {error && <div style={{ background: '#FDF0EA', color: 'var(--color-error)', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
 <form onSubmit={e => { e.preventDefault(); onSave(form) }}>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
 {[
 { name: 'name', label: 'Nombre *', type: 'text' },
 { name: 'breed', label: 'Raza', type: 'text' },
 { name: 'age', label: 'Edad (años)', type: 'number' },
 ].map(f => (
 <div key={f.name}>
 <label style={labelStyle}>{f.label}</label>
 <input name={f.name} type={f.type} value={form[f.name]} onChange={handleChange} style={inputStyle} />
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

 <div style={{ marginTop: '0.75rem' }}>
 <label style={labelStyle}>Descripción</label>
 <textarea name="description" value={form.description} onChange={handleChange} rows={2}
 style={{ ...inputStyle, resize: 'vertical' }} />
 </div>

 <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem' }}>
 {[['vaccinated','Vacunado'],['sterilized','Esterilizado']].map(([name, label]) => (
 <label key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
 <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} /> {label}
 </label>
 ))}
 </div>

 <div style={{ marginTop: '0.75rem' }}>
 <label style={labelStyle}>Cambiar foto</label>
 <ImageUpload label="Seleccionar foto" preview={form.photoUrl}
 onUpload={(url) => setForm(prev => ({ ...prev, photoUrl: url }))} />
 </div>

 <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
 <Button type="submit" loading={saving}>Guardar cambios</Button>
 <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
 </div>
 </form>
 </div>
 )
}

export default function ShelterDetail() {
 const { id } = useParams()
 const { user, isAuthenticated } = useAuth()
 const [shelter, setShelter] = useState(null)
 const [pets, setPets] = useState([])
 const [loading, setLoading] = useState(true)
 const [editingId, setEditingId] = useState(null)
 const [saving, setSaving] = useState(false)
 const [error, setError] = useState('')
 const [success, setSuccess] = useState('')

 const isOwner = isAuthenticated && String(user?.id) === String(id)

 const loadData = async () => {
 setLoading(true)
 try {
 const [s, p] = await Promise.all([
 shelterService.getById(id).catch(() => ({ data: { id, fullName: 'Refugio', region: '', profileDescription: '' } })),
 shelterService.getPetsByShelterId(id).catch(() => ({ data: [] })),
 ])
 setShelter(s.data)
 const list = Array.isArray(p.data) ? p.data : []
 const enriched = await Promise.all(list.map(async pet => {
 try {
 const petId = pet.idPet ?? pet.id
 const photos = await petPhotoService.getByPet(petId)
 const photoList = Array.isArray(photos.data) ? photos.data : []
 const main = photoList.find(ph => ph.isMain) || photoList[0]
 return { ...pet, mainPhoto: main?.photoUrl || null }
 } catch { return pet }
 }))
 setPets(enriched)
 } finally { setLoading(false) }
 }

 useEffect(() => { loadData() }, [id])

 const handleEdit = async (form, petId) => {
 if (!form.name) { setError('El nombre es requerido.'); return }
 setSaving(true); setError(''); setSuccess('')
 try {
 const { photoUrl, ...updateData } = form
 await petService.update(petId, { ...updateData, age: parseInt(form.age) || 0 })
 if (photoUrl) {
 await petPhotoService.create({ idPet: petId, photoUrl, isMain: true }).catch(() => {})
 }
 setSuccess('¡Cambios guardados!')
 setEditingId(null)
 loadData()
 } catch (err) {
 setError(err.response?.data?.message || 'Error al guardar.')
 } finally { setSaving(false) }
 }

 const handleDelete = async (petId, petName) => {
 if (!window.confirm(`¿Eliminar a ${petName}? Esta acción no se puede deshacer.`)) return
 try {
 await petService.delete(petId)
 setPets(prev => prev.filter(p => (p.idPet ?? p.id) !== petId))
 setSuccess(`${petName} eliminado.`)
 } catch {
 alert('Error al eliminar.')
 }
 }

 if (loading) return <div style={{ padding: '4rem', textAlign: 'center', fontSize: '3rem' }}></div>

 return (
 <div className={styles.page}>
 <div className="container">

 {/* Header refugio */}
 <div style={{ marginBottom: '2rem' }}>
 <h1 className={styles.title}>{shelter?.fullName}</h1>
 {shelter?.region && <p style={{ color: 'var(--color-text-muted)' }}> {shelter.region}</p>}
 {shelter?.profileDescription && (
 <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.75rem' }}>{shelter.profileDescription}</p>
 )}
 </div>

 {success && (
 <div style={{ background: '#EDF5F0', color: '#4A7C59', padding: '0.9rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 500 }}>
 {success}
 </div>
 )}

 <h2 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
 Mascotas disponibles
 {isOwner && <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: '0.75rem' }}>· Modo administrador</span>}
 </h2>

 {pets.length === 0 ? (
 <div className={styles.empty}><span></span><p>Sin mascotas disponibles actualmente.</p></div>
 ) : isOwner ? (
 /* Vista administrador con editar/eliminar */
 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
 {pets.map(p => {
 const petId = p.idPet ?? p.id
 return (
 <div key={petId}>
 <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: '14px', padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
 {/* Icono */}
 <div style={{ width: '72px', height: '72px', borderRadius: '10px', background: 'linear-gradient(135deg,#F5EDD8,#E8C49A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0 }}>
 {p.petType === 'cat' ? '' : p.petType === 'rabbit' ? '' : p.petType === 'bird' ? '' : ''}
 </div>
 {/* Info */}
 <div style={{ flex: 1, minWidth: '160px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
 <strong style={{ color: 'var(--color-text-primary)' }}>{p.name}</strong>
 <span style={{ fontSize: '0.73rem', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '99px', fontWeight: 500 }}>
 {typeLabel[p.petType?.toLowerCase()] || p.petType}
 </span>
 </div>
 <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0 0 0.25rem' }}>
 {p.breed || 'Raza mixta'} · {p.age != null ? `${p.age} años` : ''} · {genderLabel[p.gender?.toLowerCase()] || p.gender} · {sizeLabel[p.size?.toLowerCase()] || p.size}
 </p>
 {p.region && <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}> {p.region}</p>}
 </div>
 {/* Botones */}
 <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
 <button onClick={() => { setEditingId(editingId === petId ? null : petId); setError('') }}
 style={{ padding: '0.4rem 0.9rem', border: '1.5px solid var(--color-primary)', color: 'var(--color-primary)', background: 'white', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 500 }}>
 {editingId === petId ? ' Cerrar' : ' Editar'}
 </button>
 <button onClick={() => handleDelete(petId, p.name)}
 style={{ padding: '0.4rem 0.9rem', border: '1.5px solid #C0392B', color: '#C0392B', background: 'white', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 500 }}>
 Eliminar
 </button>
 </div>
 </div>

 {editingId === petId && (
 <EditPetForm pet={p} saving={saving} error={error}
 onSave={(form) => handleEdit(form, petId)}
 onCancel={() => { setEditingId(null); setError('') }} />
 )}
 </div>
 )
 })}
 </div>
 ) : (
 /* Vista pública normal */
 <div className={styles.grid}>
 {pets.map(p => <PetCard key={p.idPet ?? p.id} pet={p} />)}
 </div>
 )}
 </div>
 </div>
 )
}
