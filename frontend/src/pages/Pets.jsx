import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PetCard from '../components/pets/PetCard'
import Button from '../components/ui/Button'
import ImageUpload from '../components/ui/ImageUpload'
import { petService, petPhotoService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from './Pets.module.css'

const SPECIES_OPTIONS = [
 { value: '', label: 'Todos' },
 { value: 'dog', label: ' Perros' },
 { value: 'cat', label: ' Gatos' },
 { value: 'rabbit', label: ' Conejos' },
 { value: 'bird', label: ' Aves' },
 { value: 'other', label: ' Otros' },
]
const AGE_OPTIONS = [
 { value: '', label: 'Cualquier edad' },
 { value: 'baby', label: 'Bebé (0-6 meses)' },
 { value: 'young', label: 'Joven (6m-2 años)' },
 { value: 'adult', label: 'Adulto (2-8 años)' },
 { value: 'senior', label: 'Senior (8+ años)' },
]
const SIZE_OPTIONS = [
 { value: '', label: 'Cualquier tamaño' },
 { value: 'small', label: 'Pequeño' },
 { value: 'medium', label: 'Mediano' },
 { value: 'large', label: 'Grande' },
]
const GENDER_OPTIONS = [
 { value: '', label: 'Cualquier género' },
 { value: 'male', label: 'Macho' },
 { value: 'female', label: 'Hembra' },
]

const PROVINCE_OPTIONS = [
  { value: '', label: 'Todas las provincias' },
  { value: 'San José', label: 'San José' },
  { value: 'Alajuela', label: 'Alajuela' },
  { value: 'Cartago', label: 'Cartago' },
  { value: 'Heredia', label: 'Heredia' },
  { value: 'Guanacaste', label: 'Guanacaste' },
  { value: 'Puntarenas', label: 'Puntarenas' },
  { value: 'Limón', label: 'Limón' },
]

const PET_TYPES = ['dog','cat','rabbit','bird','other']
const PET_TYPE_LABELS = { dog:'Perro', cat:'Gato', rabbit:'Conejo', bird:'Ave', other:'Otro' }

const EMPTY_EDIT = {
 name: '', petType: 'dog', breed: '', age: '', gender: 'male',
 size: 'medium', vaccinated: false, sterilized: false,
 description: '', region: '', publicationStatus: 'available', mainPhoto: ''
}

// Modal de edición 
function EditPetModal({ pet, onClose, onSaved }) {
 const [form, setForm] = useState({
 name: pet.name || '',
 petType: pet.petType || 'dog',
 breed: pet.breed || '',
 age: pet.age ?? '',
 gender: pet.gender || 'male',
 size: pet.size || 'medium',
 vaccinated: pet.vaccinated || false,
 sterilized: pet.sterilized || false,
 description: pet.description || '',
 region: pet.region || '',
 publicationStatus: pet.publicationStatus || 'available',
 mainPhoto: pet.mainPhoto || ''
 })
 const [saving, setSaving] = useState(false)
 const [error, setError] = useState('')

 const set = (key, val) => setForm(p => ({ ...p, [key]: val }))
 const handleChange = e => {
 const { name, value, type, checked } = e.target
 if (name === 'age') {
 const num = parseFloat(value)
 if (value !== '' && (num < 0 || num > 20)) return
 }
 set(name, type === 'checkbox' ? checked : value)
 }

 const handleSubmit = async () => {
 if (!form.name.trim()) { setError('El nombre es requerido.'); return }
 if (!form.breed.trim()) { setError('La raza es requerida.'); return }
 if (form.age === '' || form.age === null || form.age === undefined) { setError('La edad es requerida.'); return }
    if (parseFloat(form.age) < 0 || parseFloat(form.age) > 20) { setError('La edad debe estar entre 0 y 20 años.'); return }
 if (!form.region) { setError('La provincia es requerida.'); return }
 if (!form.description.trim()) { setError('La descripción es requerida.'); return }
 setSaving(true); setError('')
 try {
 const petId = pet.idPet ?? pet.id
 await petService.update(petId, {
 name: form.name, petType: form.petType, breed: form.breed,
 age: parseFloat(form.age) || 0, gender: form.gender, size: form.size,
 vaccinated: form.vaccinated, sterilized: form.sterilized,
 description: form.description, region: form.region,
 publicationStatus: form.publicationStatus
 })
 // Si hay nueva foto principal, actualizar foto
 if (form.mainPhoto && form.mainPhoto !== pet.mainPhoto) {
 try {
 await petPhotoService.create({ idPet: petId, photoUrl: form.mainPhoto, isMain: true })
 } catch { /* foto no crítica */ }
 }
 onSaved()
 } catch (err) {
 setError(err.response?.data?.message || 'Error al guardar.')
 } finally { setSaving(false) }
 }

 const inputStyle = { width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }
 const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.4rem' }

 return (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
 <div style={{ background: 'var(--color-surface)', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
 {/* Header */}
 <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
 <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-bark)' }}> Editar mascota</h2>
 <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}></button>
 </div>

 {/* Form */}
 <div style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
 {error && <div style={{ background: '#FDF0EA', color: 'var(--color-error)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
 <div style={{ gridColumn: '1/-1' }}>
 <label style={labelStyle}>Nombre *</label>
 <input name="name" value={form.name} onChange={handleChange} style={inputStyle} placeholder="Nombre de la mascota" />
 </div>
 <div>
 <label style={labelStyle}>Especie</label>
 <select name="petType" value={form.petType} onChange={handleChange} style={inputStyle}>
 {PET_TYPES.map(t => <option key={t} value={t}>{PET_TYPE_LABELS[t]}</option>)}
 </select>
 </div>
 <div>
 <label style={labelStyle}>Raza</label>
 <input name="breed" value={form.breed} onChange={handleChange} style={inputStyle} placeholder="Ej: Labrador" />
 </div>
 <div>
 <label style={labelStyle}>Edad (años)</label>
 <input name="age" type="number" min="0" max="20" step="0.5" value={form.age} onChange={handleChange} style={inputStyle} placeholder="Ej: 2" />
 </div>
 <div>
 <label style={labelStyle}>Género</label>
 <select name="gender" value={form.gender} onChange={handleChange} style={inputStyle}>
 <option value="male">Macho</option>
 <option value="female">Hembra</option>
 </select>
 </div>
 <div>
 <label style={labelStyle}>Tamaño</label>
 <select name="size" value={form.size} onChange={handleChange} style={inputStyle}>
 <option value="small">Pequeño</option>
 <option value="medium">Mediano</option>
 <option value="large">Grande</option>
 </select>
 </div>
 <div>
 <label style={labelStyle}>Provincia</label>
 <select name="region" value={form.region} onChange={handleChange} style={inputStyle}>
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
 <div>
 <label style={labelStyle}>Estado de publicación</label>
 <select name="publicationStatus" value={form.publicationStatus} onChange={handleChange} style={inputStyle}>
 <option value="available">Disponible</option>
 <option value="adopted">Adoptado</option>
 <option value="pending">En proceso</option>
 </select>
 </div>
 <div style={{ gridColumn: '1/-1', display: 'flex', gap: '1.5rem' }}>
 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
 <input type="checkbox" name="vaccinated" checked={form.vaccinated} onChange={handleChange} />
 Vacunado
 </label>
 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
 <input type="checkbox" name="sterilized" checked={form.sterilized} onChange={handleChange} />
 Esterilizado
 </label>
 </div>
 <div style={{ gridColumn: '1/-1' }}>
 <label style={labelStyle}>Descripción</label>
 <textarea name="description" value={form.description} onChange={handleChange} rows={3}
 style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe la personalidad, historia, necesidades..." />
 </div>
 <div style={{ gridColumn: '1/-1' }}>
 <label style={labelStyle}>Foto principal</label>
 <ImageUpload
 label="Cambiar foto"
 preview={form.mainPhoto}
 onUpload={url => set('mainPhoto', url)}
 />
 </div>
 </div>
 </div>

 {/* Footer */}
 <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexShrink: 0 }}>
 <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '8px 20px', fontSize: '0.9rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
 Cancelar
 </button>
 <Button loading={saving} onClick={handleSubmit}>Guardar cambios</Button>
 </div>
 </div>
 </div>
 )
}

// Componente principal 
export default function Pets() {
 const [searchParams, setSearchParams] = useSearchParams()
 const { isAuthenticated, user } = useAuth()
 const [allPets, setAllPets] = useState([])
 const [pets, setPets] = useState([])
 const [loading, setLoading] = useState(true)
 const [page, setPage] = useState(1)
 const [editPet, setEditPet] = useState(null) // mascota que se está editando
 const PAGE_SIZE = 12

 const isShelter = isAuthenticated && (
 user?.userType === 'shelter' || user?.userType === 'Shelter' ||
 user?.userType === 'association' || user?.userType === 'institution'
 )

  const filters = {
    search:   searchParams.get('search')   || '',
    species:  searchParams.get('species')  || '',
    age:      searchParams.get('age')      || '',
    size:     searchParams.get('size')     || '',
    gender:   searchParams.get('gender')   || '',
    province: searchParams.get('province') || '',
  }

 const updateFilter = (key, value) => {
 const next = new URLSearchParams(searchParams)
 if (value) next.set(key, value)
 else next.delete(key)
 next.delete('page')
 setSearchParams(next)
 setPage(1)
 }

 const clearFilters = () => { setSearchParams({}); setPage(1) }
 const hasFilters = Object.values(filters).some(Boolean)

 const loadPets = () => {
 setLoading(true)
 petService.getAll()
 .then(async res => {
 const list = Array.isArray(res.data) ? res.data : []
 const enriched = await Promise.all(list.map(async p => {
 try {
 const petId = p.idPet ?? p.id
 const photos = await petPhotoService.getByPet(petId)
 const photoList = Array.isArray(photos.data) ? photos.data : []
 const main = photoList.find(ph => ph.isMain) || photoList[0]
 return { ...p, mainPhoto: main?.photoUrl || null }
 } catch { return p }
 }))
 setAllPets(enriched)
 })
 .catch(() => setAllPets([]))
 .finally(() => setLoading(false))
 }

 useEffect(() => { loadPets() }, [])

 useEffect(() => {
 let filtered = [...allPets]
 if (filters.search) {
 const q = filters.search.toLowerCase()
 filtered = filtered.filter(p => p.name?.toLowerCase().includes(q) || p.breed?.toLowerCase().includes(q))
 }
 if (filters.species) filtered = filtered.filter(p => p.petType?.toLowerCase() === filters.species.toLowerCase())
 if (filters.size) filtered = filtered.filter(p => p.size?.toLowerCase() === filters.size.toLowerCase())
 if (filters.gender)   filtered = filtered.filter(p => p.gender?.toLowerCase()  === filters.gender.toLowerCase())
 if (filters.province)  filtered = filtered.filter(p => p.region === filters.province)
 if (filters.age) {
 filtered = filtered.filter(p => {
 const age = p.age ?? 0
 if (filters.age === 'baby') return age < 1
 if (filters.age === 'young') return age >= 1 && age < 2
 if (filters.age === 'adult') return age >= 2 && age <= 8
 if (filters.age === 'senior') return age > 8
 return true
 })
 }
 setPets(filtered)
 setPage(1)
 }, [allPets, filters.search, filters.species, filters.age, filters.size, filters.gender, filters.province])

 const handleDelete = async (pet) => {
 const petId = pet.idPet ?? pet.id
 if (!window.confirm(`¿Eliminar a ${pet.name}? Esta acción no se puede deshacer.`)) return
 try {
 await petService.delete(petId)
 setAllPets(prev => prev.filter(p => (p.idPet ?? p.id) !== petId))
 } catch { alert('Error al eliminar la mascota.') }
 }

 const totalCount = pets.length
 const totalPages = Math.ceil(totalCount / PAGE_SIZE)
 const paginatedPets = pets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

 return (
 <div className={styles.page}>
 <div className="container">
 <div className={styles.header}>
 <div>
 <h1 className={styles.title}>Mascotas disponibles</h1>
 <p className={styles.subtitle}>
 {totalCount > 0 ? `${totalCount} mascotas esperan un hogar` : 'Encuentra a tu compañero ideal'}
 </p>
 </div>
 </div>

 <div className={styles.layout}>
 <aside className={styles.sidebar}>
 <div className={styles.filterCard}>
 <div className={styles.filterHeader}>
 <h3>Filtros</h3>
 {hasFilters && <button className={styles.clearBtn} onClick={clearFilters}>Limpiar</button>}
 </div>
 <div className={styles.filterGroup}>
 <label className={styles.filterLabel}>Buscar</label>
 <div className={styles.searchField}>
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
 <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
 </svg>
 <input type="text" placeholder="Nombre, raza..." value={filters.search} onChange={e => updateFilter('search', e.target.value)} />
 </div>
 </div>
 <div className={styles.filterGroup}>
 <label className={styles.filterLabel}>Especie</label>
 <div className={styles.radioGroup}>
 {SPECIES_OPTIONS.map(opt => (
 <label key={opt.value} className={styles.radioLabel}>
 <input type="radio" name="species" value={opt.value} checked={filters.species === opt.value} onChange={() => updateFilter('species', opt.value)} />
 <span>{opt.label}</span>
 </label>
 ))}
 </div>
 </div>
 <div className={styles.filterGroup}>
 <label className={styles.filterLabel}>Edad</label>
 <select className={styles.selectField} value={filters.age} onChange={e => updateFilter('age', e.target.value)}>
 {AGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
 </select>
 </div>
 <div className={styles.filterGroup}>
 <label className={styles.filterLabel}>Tamaño</label>
 <select className={styles.selectField} value={filters.size} onChange={e => updateFilter('size', e.target.value)}>
 {SIZE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
 </select>
 </div>
 <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Género</label>
              <select className={styles.selectField} value={filters.gender} onChange={e => updateFilter('gender', e.target.value)}>
                {GENDER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Provincia</label>
              <select className={styles.selectField} value={filters.province} onChange={e => updateFilter('province', e.target.value)}>
                {PROVINCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        </aside>

 <div className={styles.main}>
 {loading ? (
 <div className={styles.skeletonGrid}>
 {Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skeleton} />)}
 </div>
 ) : paginatedPets.length === 0 ? (
 <div className={styles.empty}>
 <span className={styles.emptyIcon}></span>
 <h3>No encontramos resultados</h3>
 <p>{hasFilters ? 'Intenta ajustar los filtros.' : 'No hay mascotas disponibles aún.'}</p>
 {hasFilters && <Button onClick={clearFilters} variant="secondary">Limpiar filtros</Button>}
 </div>
 ) : (
 <>
 <div className={styles.petsGrid}>
 {paginatedPets.map(pet => {
 const petId = pet.idPet ?? pet.id
 const isOwner = isShelter && parseInt(user?.id ?? user?.idUser) === parseInt(pet.idUser)

 return (
 <div key={petId} style={{ position: 'relative' }}>
 <PetCard pet={pet} />
 {/* Botones de acción para el dueño (shelter) */}
 {isOwner && (
 <div style={{
 position: 'absolute', bottom: '12px', left: '12px', right: '12px',
 display: 'flex', gap: '6px', zIndex: 10
 }}>
 <button
 onClick={e => { e.preventDefault(); e.stopPropagation(); setEditPet(pet) }}
 style={{ flex: 1, background: 'white', border: '1.5px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '8px', padding: '6px 0', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
 >
 Editar
 </button>
 <button
 onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete(pet) }}
 style={{ flex: 1, background: 'white', border: '1.5px solid #C0392B', color: '#C0392B', borderRadius: '8px', padding: '6px 0', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
 >
 Eliminar
 </button>
 </div>
 )}
 </div>
 )
 })}
 </div>
 {totalPages > 1 && (
 <div className={styles.pagination}>
 <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</Button>
 <div className={styles.pageInfo}>Página {page} de {totalPages}</div>
 <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Siguiente →</Button>
 </div>
 )}
 </>
 )}
 </div>
 </div>
 </div>

 {/* Modal edición */}
 {editPet && (
 <EditPetModal
 pet={editPet}
 onClose={() => setEditPet(null)}
 onSaved={() => { setEditPet(null); loadPets() }}
 />
 )}
 </div>
 )
}
