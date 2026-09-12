import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import Button from "../components/ui/Button";
import styles from "./Auth.module.css";

export default function Login() {
 const navigate = useNavigate();
 const location = useLocation();
 const { login } = useAuth();
 const [form, setForm] = useState({ email: "", password: "" });
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);

 const from = location.state?.from?.pathname || "/";

 const handleChange = (e) => {
 setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
 setError("");
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!form.email || !form.password) {
 setError("Por favor completa todos los campos.");
 return;
 }
 setLoading(true);
 try {
 const userData = await authService.login(form);
 login(userData);
 navigate(from, { replace: true });
 } catch (err) {
 setError(err.message || "Credenciales incorrectas. Intenta de nuevo.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className={styles.page}>
 <div className={styles.visual}>
 <div className={styles.visualContent}>
 <div className={styles.visualLogo}>
 <span className={styles.visualPaw}></span>
 <span className={styles.visualBrand}>Adopaws</span>
 </div>
 <h2 className={styles.visualTitle}>
 Cada historia de amor comienza con una adopción
 </h2>
 <div className={styles.pawPattern}></div>
 </div>
 </div>

 <div className={styles.formSide}>
 <div className={styles.formCard}>
 <div className={styles.formHeader}>
 <h1 className={styles.formTitle}>Iniciar sesión</h1>
 <p className={styles.formSub}>
 ¿No tienes cuenta?{" "}
 <Link to="/register" className={styles.formLink}>
 Regístrate gratis
 </Link>
 </p>
 </div>

 {error && (
 <div className={styles.errorAlert}>
 <svg
 width="16"
 height="16"
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 strokeWidth="2"
 >
 <circle cx="12" cy="12" r="10" />
 <line x1="12" y1="8" x2="12" y2="12" />
 <line x1="12" y1="16" x2="12.01" y2="16" />
 </svg>
 {error}
 </div>
 )}

 <form className={styles.form} onSubmit={handleSubmit}>
 <div className={styles.field}>
 <label htmlFor="email" className={styles.label}>
 Correo electrónico
 </label>
 <input
 id="email"
 type="email"
 name="email"
 value={form.email}
 onChange={handleChange}
 className={styles.input}
 placeholder="tu@correo.com"
 autoComplete="email"
 required
 />
 </div>

 <div className={styles.field}>
 <label htmlFor="password" className={styles.label}>
 Contraseña
 </label>
 <input
 id="password"
 type="password"
 name="password"
 value={form.password}
 onChange={handleChange}
 className={styles.input}
 placeholder="••••••••"
 autoComplete="current-password"
 required
 />
 </div>

 <Button type="submit" fullWidth size="lg" loading={loading}>
 Iniciar sesión
 </Button>
 </form>

 <div className={styles.backHome}>
 <Link to="/" className={styles.backLink}>
 ← Volver al inicio
 </Link>
 </div>
 </div>
 </div>
 </div>
 );
}
