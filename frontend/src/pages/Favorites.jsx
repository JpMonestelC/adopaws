import { useState, useEffect } from 'react'
import { favoriteService } from '../services/api'
import PetCard from '../components/pets/PetCard'
import styles from './SimpleList.module.css'

// Los favoritos viven en el backend (GET /api/favorites, ver favoriteService
// en services/api.js) y se resuelven contra el usuario autenticado por JWT.
export default function Favorites() {
 const [favs, setFavs] = useState([])
 const [loading, setLoading] = useState(true)
 useEffect(() => {
 favoriteService.getFavorites().then(r => setFavs(r.data)).catch(() => setFavs([])).finally(() => setLoading(false))
 }, [])
 return (
 <div className={styles.page}>
 <div className="container">
 <h1 className={styles.title}>Mis favoritos</h1>
 {loading ? <p>Cargando...</p> : favs.length === 0 ? (
 <div className={styles.empty}><span></span><p>No has guardado favoritos aún.</p></div>
 ) : (
 <div className={styles.grid}>
 {favs.map(pet => <PetCard key={pet.id} pet={pet} />)}
 </div>
 )}
 </div>
 </div>
 )
}
