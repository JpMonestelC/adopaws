import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { shelterService } from '../services/api'
import styles from './Shelters.module.css'

export default function Shelters() {
 const [shelters, setShelters] = useState([])
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 shelterService.getAll()
 .then(r => setShelters(Array.isArray(r.data) ? r.data : []))
 .catch(() => setShelters([]))
 .finally(() => setLoading(false))
 }, [])

 return (
 <div className={styles.page}>
 <div className="container">
 <div className={styles.header}>
 <h1 className={styles.title}>Refugios aliados</h1>
 <p className={styles.subtitle}>Organizaciones comprometidas con el bienestar animal</p>
 </div>

 {loading ? (
 <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Cargando refugios...</p>
 ) : shelters.length === 0 ? (
 <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
 No hay refugios registrados aún. Regístrate como refugio para aparecer aquí.
 </p>
 ) : (
 <div className={styles.grid}>
 {shelters.map((s, i) => {
 const sId = s.idUser ?? s.id ?? i
 return (
 <Link key={sId} to={`/shelters/${sId}`} className={styles.card}>
 <div className={styles.cardIcon}></div>
 <h3 className={styles.cardName}>{s.fullName || s.name}</h3>
 <p className={styles.cardCity}> {s.region || 'Sin provincia'}</p>
 <p className={styles.cardDesc}>{s.profileDescription || s.description || ''}</p>
 <div className={styles.cardFooter}>
 <span className={styles.cardLink}>Ver más →</span>
 </div>
 </Link>
 )
 })}
 </div>
 )}
 </div>
 </div>
 )
}
