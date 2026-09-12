import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import styles from './NotFound.module.css'

export default function NotFound() {
 return (
 <div className={styles.page}>
 <div className={styles.content}>
 <div className={styles.paw}></div>
 <h1 className={styles.code}>404</h1>
 <h2 className={styles.title}>¡Esta página se escapó!</h2>
 <p className={styles.text}>
 Parece que la página que buscas no existe o fue adoptada por alguien más.
 </p>
 <div className={styles.actions}>
 <Link to="/">
 <Button size="lg">Volver al inicio</Button>
 </Link>
 <Link to="/pets">
 <Button size="lg" variant="secondary">Ver mascotas</Button>
 </Link>
 </div>
 </div>
 </div>
 )
}
