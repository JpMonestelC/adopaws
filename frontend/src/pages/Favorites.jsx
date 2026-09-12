import { useState, useEffect } from 'react'
import { favoriteService } from '../services/api'
import PetCard from '../components/pets/PetCard'
import styles from './SimpleList.module.css'

// Los favoritos se guardan localmente (ver favoriteService en services/api.js):
// el backend todavía no expone un endpoint de favoritos por usuario.
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
