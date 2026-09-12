import { Link } from 'react-router-dom'
import styles from './PetCard.module.css'

const HeartIcon = ({ filled }) => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
 <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
 </svg>
)

const petTypeMap = {
 dog: { label: 'Perro', emoji: '' },
 perro: { label: 'Perro', emoji: '' },
 cat: { label: 'Gato', emoji: '' },
 gato: { label: 'Gato', emoji: '' },
 rabbit: { label: 'Conejo', emoji: '' },
 conejo: { label: 'Conejo', emoji: '' },
 bird: { label: 'Ave', emoji: '' },
 ave: { label: 'Ave', emoji: '' },
}

const placeholderBg = {
 dog: 'linear-gradient(135deg, #F5EDD8 0%, #E8C49A 100%)',
 perro: 'linear-gradient(135deg, #F5EDD8 0%, #E8C49A 100%)',
 cat: 'linear-gradient(135deg, #EDF5F0 0%, #A8D5B5 100%)',
 gato: 'linear-gradient(135deg, #EDF5F0 0%, #A8D5B5 100%)',
 default: 'linear-gradient(135deg, #F0EAE0 0%, #D4C4B0 100%)',
}

const genderLabel = { male: 'Macho', female: 'Hembra', macho: 'Macho', hembra: 'Hembra' }
const sizeLabel = { small: 'Pequeño', medium: 'Mediano', large: 'Grande', pequeño: 'Pequeño', mediano: 'Mediano', grande: 'Grande' }

export default function PetCard({ pet }) {
 // Normalizar id: backend puede usar idPet o id
 const petId = pet.id ?? pet.idPet
 // Backend devuelve: id, name, petType, breed, age, gender, size,
 // vaccinated, sterilized, description, region, publicationStatus
 const typeKey = pet.petType?.toLowerCase() || pet.species?.toLowerCase() || 'other'
 const sp = petTypeMap[typeKey] || { label: pet.petType || 'Otro', emoji: '' }
 const bg = placeholderBg[typeKey] || placeholderBg.default

 // age es un número (años) en el backend
 const ageText = pet.age != null
 ? `${pet.age} ${pet.age === 1 ? 'año' : 'años'}`
 : pet.ageYears != null
 ? pet.ageYears === 0 ? `${pet.ageMonths ?? '?'} meses` : `${pet.ageYears} años`
 : 'Edad desconocida'

 const mainPhoto = pet.mainPhoto || pet.imageUrl || null
 const isAvailable = !pet.publicationStatus || pet.publicationStatus === 'available' || pet.publicationStatus === 'active'

 return (
 <Link to={`/pets/${petId}`} className={styles.card}>
 {/* Image */}
 <div className={styles.imageWrapper}>
 {mainPhoto ? (
 <img src={mainPhoto} alt={pet.name} className={styles.image} loading="lazy" />
 ) : (
 <div className={styles.imagePlaceholder} style={{ background: bg }}>
 <span className={styles.placeholderEmoji}>{sp.emoji}</span>
 </div>
 )}

 {isAvailable && (
 <div className={styles.availableBadge}>Disponible</div>
 )}
 </div>

 {/* Content */}
 <div className={styles.content}>
 <div className={styles.header}>
 <h3 className={styles.name}>{pet.name}</h3>
 <span className={styles.speciesTag}>{sp.emoji} {sp.label}</span>
 </div>

 <p className={styles.breed}>{pet.breed || 'Raza mixta'}</p>

 <div className={styles.tags}>
 <span className={styles.tag}>{ageText}</span>
 {pet.gender && (
 <span className={styles.tag}>{genderLabel[pet.gender?.toLowerCase()] || pet.gender}</span>
 )}
 {pet.size && (
 <span className={styles.tag}>{sizeLabel[pet.size?.toLowerCase()] || pet.size}</span>
 )}
 {pet.vaccinated && <span className={styles.tag}> Vacunado</span>}
 {pet.sterilized && <span className={styles.tag}> Esterilizado</span>}
 </div>

 {pet.region && (
 <div className={styles.shelter}>
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
 <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
 </svg>
 {pet.region}
 </div>
 )}
 </div>
 </Link>
 )
}
