import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { consultationService, marketplaceService } from "../../services/api";
import styles from "./Navbar.module.css";

const PawIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="5.5" cy="6" rx="2" ry="2.5" fill="currentColor" />
    <ellipse cx="10.5" cy="4" rx="2" ry="2.5" fill="currentColor" />
    <ellipse cx="15.5" cy="4" rx="2" ry="2.5" fill="currentColor" />
    <ellipse cx="20.5" cy="6" rx="2" ry="2.5" fill="currentColor" />
    <path
      d="M12 10C8.5 10 5 12.5 5 16c0 2.5 1.5 4 3 4 1 0 2-.5 4-1.5 2 1 3 1.5 4 1.5 1.5 0 3-1.5 3-4 0-3.5-3.5-6-7-6z"
      fill="currentColor"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="22"
    height="22"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="22"
    height="22"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [consultationCount, setConsultationCount] = useState(0);
  const [marketplaceCount, setMarketplaceCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cargar contadores de notificaciones
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const userId = parseInt(user.idUser ?? user.id);
    if (isNaN(userId)) return;

    const loadCounts = async () => {
      try {
        const received = await consultationService.getByReceiver(userId).catch(() => ({ data: [] }));
        const allReceived = Array.isArray(received.data) ? received.data : [];

        // Consultas veterinarias: recibidas que no están respondidas ni cerradas
        const vetPending = allReceived.filter(c => {
          const status = c.consultationStatus?.toLowerCase();
          return !c.subject?.startsWith('marketplace:') && status !== 'answered' && status !== 'closed';
        });
        setConsultationCount(vetPending.length);

        // Mensajes marketplace: solo contar si el usuario tiene items publicados
        // y el subject coincide con uno de sus items
        const allItems = await marketplaceService.getAll().catch(() => ({ data: [] }));
        const myItemIds = new Set(
          (Array.isArray(allItems.data) ? allItems.data : [])
            .filter(i => parseInt(i.idUser) === userId)
            .map(i => i.id ?? i.idMarketplaceItem)
        );

        if (myItemIds.size > 0) {
          const mktPending = allReceived.filter(c => {
            const status = c.consultationStatus?.toLowerCase();
            if (!c.subject?.startsWith('marketplace:')) return false;
            // Solo contar 'pending': comprador escribió y el dueño aún no respondió
            if (status !== 'pending') return false;
            const itemId = parseInt(c.subject.replace('marketplace:', ''));
            return myItemIds.has(itemId);
          });
          setMarketplaceCount(mktPending.length);
        } else {
          setMarketplaceCount(0);
        }
      } catch { /* silencioso */ }
    };

    loadCounts();
    const interval = setInterval(loadCounts, 30000); // refresca cada 30s

    // Escuchar evento global para refrescar badges inmediatamente
    window.addEventListener('refreshBadges', loadCounts);
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshBadges', loadCounts);
    };
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setUserMenuOpen(false);
  };

  const navLinks = [
    { to: "/pets", label: "Mascotas" },
    { to: "/shelters", label: "Refugios" },
    { to: "/how-it-works", label: "Cómo funciona" },
    { to: "/marketplace", label: "Marketplace" },
    { to: "/consultations", label: "Consultas", badge: consultationCount },
  ];

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandIcon}>
            <PawIcon />
          </span>
          <span className={styles.brandName}>Adopaws</span>
        </Link>

        {/* Desktop links */}
        <ul className={styles.links}>
          {navLinks.map(({ to, label, badge }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.linkActive : ""}`
                }
                style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                {label}
                {badge > 0 && (
                  <span style={{ background: "#E05A2B", color: "white", borderRadius: "99px", fontSize: "0.65rem", fontWeight: 700, padding: "1px 6px", lineHeight: 1.4, minWidth: "18px", textAlign: "center" }}>
                    {badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop auth */}
        <div className={styles.actions}>
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <button
                className={styles.avatarBtn}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Menú de usuario"
              >
                <div className={styles.avatar}>
                  {user?.fullName?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className={styles.userName}>
                  {user?.fullName?.split(" ")[0]}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <Link
                    to="/profile"
                    className={styles.dropdownItem}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Mi perfil
                  </Link>
                  <Link
                    to="/my-applications"
                    className={styles.dropdownItem}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Mis solicitudes
                  </Link>
                  <Link
                    to="/profile?tab=messages"
                    className={styles.dropdownItem}
                    onClick={() => setUserMenuOpen(false)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    Mensajes Marketplace
                    {marketplaceCount > 0 && (
                      <span style={{ background: "#E05A2B", color: "white", borderRadius: "99px", fontSize: "0.65rem", fontWeight: 700, padding: "1px 6px", lineHeight: 1.4, minWidth: "18px", textAlign: "center" }}>
                        {marketplaceCount}
                      </span>
                    )}
                  </Link>
                  {user?.userType === "shelter" && (
                    <Link
                      to="/dashboard"
                      className={styles.dropdownItem}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Panel refugio
                    </Link>
                  )}
                  <div className={styles.dropdownDivider} />
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.btnGhost}>
                Iniciar sesión
              </Link>
              <Link to="/register" className={styles.btnPrimary}>
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={styles.mobileToggle}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <ul className={styles.mobileLinks}>
            {navLinks.map(({ to, label, badge }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={styles.mobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className={styles.mobileAuth}>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className={styles.mobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  Mi perfil
                </Link>
                <button className={styles.mobileLogout} onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${styles.mobileLink}`}
                  onClick={() => setMobileOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className={styles.btnPrimary}
                  onClick={() => setMobileOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
