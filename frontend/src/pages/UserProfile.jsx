import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { userService, petService, petPhotoService } from '../services/api'
import PetCard from '../components/pets/PetCard'

const userTypeLabel = {
  adopter:  'Adoptante',
  shelter:  'Refugio / Asociación',
  vet:      'Médico Veterinario',
  Shelter:  'Refugio / Asociación',
}

// Parse vet info from profileDescription (stored as "Graduado | Universidad: UCR | ...")
function parseVetInfo(description) {
  if (!description) return null
  const parts = description.split(' | ')
  const info = {}
  parts.forEach(p => {
    if (p === 'Graduado') info.graduated = true
    else if (p.startsWith('Universidad:')) info.university = p.replace('Universidad:', '').trim()
    else if (p.startsWith('Colegio:')) info.license = p.replace('Colegio:', '').trim()
    else if (p.startsWith('Especialidad:')) info.specialty = p.replace('Especialidad:', '').trim()
    else if (p.startsWith('Experiencia:')) info.years = p.replace('Experiencia:', '').replace('años', '').trim()
  })
  // Extra description after "—"
  const dashIdx = description.indexOf(' — ')
  if (dashIdx > -1) info.extra = description.slice(dashIdx + 3)
  return Object.keys(info).length ? info : null
}

export default function UserProfile() {
  const { id } = useParams()
  const [profileUser, setProfileUser] = useState(null)
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      userService.getById(id),
      petService.getAll(),
    ])
      .then(async ([userRes, petsRes]) => {
        const u = userRes.data
        if (!u) { setNotFound(true); return }
        setProfileUser(u)

        // Get pets published by this user (shelter or vet)
        const allPets = Array.isArray(petsRes.data) ? petsRes.data : []
        const userPets = allPets.filter(p => parseInt(p.idUser) === parseInt(id))

        // Enrich with photos
        const enriched = await Promise.all(userPets.map(async p => {
          try {
            const petId = p.idPet ?? p.id
            const photos = await petPhotoService.getByPet(petId)
            const photoList = Array.isArray(photos.data) ? photos.data : []
            const main = photoList.find(ph => ph.isMain) || photoList[0]
            return { ...p, mainPhoto: main?.photoUrl || null }
          } catch { return p }
        }))
        setPets(enriched)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--color-text-muted)' }}>Cargando perfil...</p>
    </div>
  )

  if (notFound || !profileUser) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Perfil no encontrado.</p>
      <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Volver al inicio</Link>
    </div>
  )

  const isVet     = profileUser.userType === 'vet'
  const isShelter = profileUser.userType === 'shelter' || profileUser.userType === 'Shelter'
  const vetInfo   = isVet ? parseVetInfo(profileUser.profileDescription) : null
  const typeLabel = userTypeLabel[profileUser.userType] || profileUser.userType

  // For vets: show extra description after parsing; for others: show as-is
  const displayDescription = isVet && vetInfo?.extra
    ? vetInfo.extra
    : (!isVet && profileUser.profileDescription) ? profileUser.profileDescription : null

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-20)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>

        {/* Back link */}
        <Link to={-1} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          Volver
        </Link>

        {/* Profile card */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', color: 'white', fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            {profileUser.profileImage
              ? <img src={profileUser.profileImage} alt={profileUser.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : profileUser.fullName?.[0]?.toUpperCase() ?? 'U'
            }
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-bark)', margin: 0 }}>{profileUser.fullName}</h1>
              <span style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary)', padding: '3px 12px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600 }}>
                {typeLabel}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {profileUser.region && (
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                  {profileUser.region}
                </span>
              )}
              {profileUser.phone && (
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  {profileUser.phone}
                </span>
              )}
            </div>

            {displayDescription && (
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {displayDescription}
              </p>
            )}
          </div>
        </div>

        {/* Vet credentials card */}
        {isVet && vetInfo && (
          <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-bark)', marginBottom: '1rem' }}>Credenciales profesionales</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: vetInfo.graduated ? '#EDF5F0' : 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={vetInfo.graduated ? '#4A7C59' : '#aaa'} strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>Título</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: vetInfo.graduated ? '#4A7C59' : 'var(--color-text-muted)', margin: 0 }}>{vetInfo.graduated ? 'Graduado' : 'En formación'}</p>
                </div>
              </div>
              {vetInfo.university && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>Universidad</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{vetInfo.university}</p>
                  </div>
                </div>
              )}
              {vetInfo.license && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h6"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>Colegio profesional</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{vetInfo.license}</p>
                  </div>
                </div>
              )}
              {vetInfo.specialty && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M8.56 2.9A7 7 0 0119 9v4a7 7 0 01-14 0V9c0-1.93.78-3.68 2.05-4.96"/><path d="M12 12v.01"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>Especialidad</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{vetInfo.specialty}</p>
                  </div>
                </div>
              )}
              {vetInfo.years && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>Experiencia</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{vetInfo.years} años</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Published pets (shelter or vet) */}
        {(isShelter || isVet) && (
          <>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-bark)', marginBottom: '1rem' }}>
              Mascotas publicadas {pets.length > 0 && <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>({pets.length})</span>}
            </h2>
            {pets.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No hay mascotas publicadas aún.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {pets.map(pet => <PetCard key={pet.idPet ?? pet.id} pet={pet} />)}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
