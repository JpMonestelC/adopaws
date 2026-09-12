import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const PawIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <ellipse cx="5.5" cy="6" rx="2" ry="2.5" fill="currentColor"/>
    <ellipse cx="10.5" cy="4" rx="2" ry="2.5" fill="currentColor"/>
    <ellipse cx="15.5" cy="4" rx="2" ry="2.5" fill="currentColor"/>
    <ellipse cx="20.5" cy="6" rx="2" ry="2.5" fill="currentColor"/>
    <path d="M12 10C8.5 10 5 12.5 5 16c0 2.5 1.5 4 3 4 1 0 2-.5 4-1.5 2 1 3 1.5 4 1.5 1.5 0 3-1.5 3-4 0-3.5-3.5-6-7-6z" fill="currentColor"/>
  </svg>
)

const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
)

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.wave}>
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 60V30C240 0 480 60 720 30C960 0 1200 60 1440 30V60H0Z" fill="var(--color-bark)"/>
        </svg>
      </div>

      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Brand col */}
          <div className={styles.brand}>
            <Link to="/" className={styles.brandLink}>
              <span className={styles.brandIcon}><PawIcon /></span>
              <span className={styles.brandName}>Adopaws</span>
            </Link>
            <p className={styles.tagline}>
              Cada mascota merece un hogar lleno de amor. Conectamos corazones con patitas.
            </p>
            <div className={styles.socials}>
              <a href="#" aria-label="Instagram" className={styles.social}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className={styles.social}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links cols */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Adoptar</h4>
            <ul className={styles.colLinks}>
              <li><Link to="/pets">Ver mascotas</Link></li>
              <li><Link to="/pets?species=dog">Perros</Link></li>
              <li><Link to="/pets?species=cat">Gatos</Link></li>
              <li><Link to="/how-it-works">Cómo funciona</Link></li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Refugios</h4>
            <ul className={styles.colLinks}>
              <li><Link to="/shelters">Directorio</Link></li>
              <li><Link to="/register?role=shelter">Registrar refugio</Link></li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Información</h4>
            <ul className={styles.colLinks}>
              <li><Link to="/about">Nosotros</Link></li>
              <li><Link to="/contact">Contacto</Link></li>
              <li><Link to="/privacy">Privacidad</Link></li>
              <li><Link to="/terms">Términos</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {year} Adopaws. Hecho con <HeartIcon /> para los animales.
          </p>
          <p className={styles.legal}>
            <Link to="/privacy">Política de privacidad</Link>
            <span>·</span>
            <Link to="/terms">Términos de uso</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
