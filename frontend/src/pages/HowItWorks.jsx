import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import styles from './HowItWorks.module.css'

const STEPS = [
 { n: '01', emoji: '', title: 'Explora mascotas', desc: 'Navega por cientos de mascotas disponibles en refugios de toda la región. Usa los filtros para encontrar la que mejor se adapte a tu estilo de vida.' },
 { n: '02', emoji: '', title: 'Crea tu perfil', desc: 'Regístrate y crea tu perfil de adoptante. Comparte información sobre tu hogar y estilo de vida para que los refugios puedan evaluar tu solicitud.' },
 { n: '03', emoji: '', title: 'Solicita la adopción', desc: 'Envía una solicitud de adopción para la mascota que te robó el corazón. El refugio revisará tu perfil y se pondrá en contacto contigo.' },
 { n: '04', emoji: '', title: '¡Bienvenido a casa!', desc: 'Una vez aprobada tu solicitud, coordina la entrega con el refugio. ¡Prepárate para recibir a tu nuevo compañero!' },
]

export default function HowItWorks() {
 return (
 <div className={styles.page}>
 <div className="container">
 <div className={styles.hero}>
 <h1 className={styles.title}>¿Cómo funciona Adopaws?</h1>
 <p className={styles.sub}>Adoptar una mascota es fácil, seguro y completamente gratuito.</p>
 </div>
 <div className={styles.steps}>
 {STEPS.map((s, i) => (
 <div key={s.n} className={styles.step}>
 <div className={styles.stepNum}>{s.n}</div>
 <div className={styles.stepEmoji}>{s.emoji}</div>
 <h3 className={styles.stepTitle}>{s.title}</h3>
 <p className={styles.stepDesc}>{s.desc}</p>
 {i < STEPS.length - 1 && <div className={styles.connector} />}
 </div>
 ))}
 </div>
 <div className={styles.cta}>
 <h2>¿Listo para encontrar tu compañero?</h2>
 <Link to="/pets"><Button size="xl">Ver mascotas disponibles</Button></Link>
 </div>
 </div>
 </div>
 )
}
