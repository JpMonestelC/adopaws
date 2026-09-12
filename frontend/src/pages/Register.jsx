import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import Button from "../components/ui/Button";
import styles from "./Auth.module.css";

const CR_PROVINCES = ["San José","Alajuela","Cartago","Heredia","Guanacaste","Puntarenas","Limón"];

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const defaultRole = searchParams.get("role") || "adopter";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: defaultRole,
    phone: "",
    region: "",
    profileDescription: "",
    // Vet-specific fields (stored in profileDescription as JSON or separately)
    vetGraduated: false,
    vetUniversity: "",
    vetLicenseNumber: "",
    vetSpecialty: "",
    vetYearsExp: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const setUserType = (type) => setForm((prev) => ({ ...prev, userType: type }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s.\-]/.test(form.fullName)) {
      setError("El nombre no puede contener símbolos ni números.");
      return;
    }
    if (form.phone && /[^0-9+\s\-]/.test(form.phone)) {
      setError("El teléfono solo puede contener números, +, espacios y guiones.");
      return;
    }

    // Build profileDescription — for vets, embed credentials info
    let profileDescription = form.profileDescription;
    if (form.userType === "vet") {
      const vetInfo = [];
      if (form.vetGraduated) vetInfo.push("Graduado");
      if (form.vetUniversity) vetInfo.push(`Universidad: ${form.vetUniversity}`);
      if (form.vetLicenseNumber) vetInfo.push(`Colegio: ${form.vetLicenseNumber}`);
      if (form.vetSpecialty) vetInfo.push(`Especialidad: ${form.vetSpecialty}`);
      if (form.vetYearsExp) vetInfo.push(`Experiencia: ${form.vetYearsExp} años`);
      if (vetInfo.length) profileDescription = vetInfo.join(" | ") + (form.profileDescription ? ` — ${form.profileDescription}` : "");
    }

    setLoading(true);
    try {
      const { confirmPassword, vetGraduated, vetUniversity, vetLicenseNumber, vetSpecialty, vetYearsExp, ...rest } = form;
      const payload = { ...rest, profileDescription };
      const userData = await authService.register(payload);
      login(userData);
      navigate("/");
    } catch (err) {
      setError(err.message || "Error al crear la cuenta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const isVet = form.userType === "vet";
  const isShelter = form.userType === "shelter";

  const inputStyle2 = { width: "100%", padding: "var(--space-3) var(--space-4)", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "var(--text-base)", color: "var(--color-text-primary)", background: "var(--color-surface)", outline: "none", boxSizing: "border-box" };

  return (
    <div className={styles.page}>
      <div className={styles.visual}>
        <div className={styles.visualContent}>
          <div className={styles.visualLogo}>
            <span className={styles.visualBrand}>Adopaws</span>
          </div>
          <h2 className={styles.visualTitle}>
            Únete a miles de familias que ya encontraron a su compañero ideal
          </h2>
          <div className={styles.pawPattern}></div>
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Crear cuenta</h1>
            <p className={styles.formSub}>
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className={styles.formLink}>Inicia sesión</Link>
            </p>
          </div>

          {/* Selector de tipo — 3 opciones */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
            {[
              { type: "adopter", label: "Adoptante", desc: "Quiero adoptar" },
              { type: "shelter", label: "Refugio / Asociación", desc: "Gestiono un refugio" },
              { type: "vet",     label: "Veterinario",          desc: "Soy profesional veterinario" },
            ].map(({ type, label, desc }) => (
              <button
                key={type}
                type="button"
                onClick={() => setUserType(type)}
                className={`${styles.roleBtn} ${form.userType === type ? styles.roleBtnActive : ""}`}
                style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px", padding: "var(--space-3)" }}
              >
                <strong>{label}</strong>
                <span>{desc}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Nombre */}
            <div className={styles.field}>
              <label htmlFor="fullName" className={styles.label}>
                {isShelter ? "Nombre del refugio / asociación" : isVet ? "Nombre completo" : "Nombre completo"} *
              </label>
              <input id="fullName" type="text" name="fullName" value={form.fullName}
                onChange={e => {
                  // Solo letras, espacios, tildes, ñ, guion y punto
                  const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s.\-]/g, '')
                  setForm(prev => ({ ...prev, fullName: val }))
                  setError('')
                }} className={styles.input} placeholder="Tu nombre" required />
            </div>

            {/* Email */}
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Correo electrónico *</label>
              <input id="email" type="email" name="email" value={form.email}
                onChange={handleChange} className={styles.input} placeholder="tu@correo.com" required />
            </div>

            {/* Teléfono + Provincia */}
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label}>Teléfono</label>
                <input type="tel" name="phone" value={form.phone}
                  onChange={e => {
                    // Solo dígitos, +, espacios y guion
                    const val = e.target.value.replace(/[^0-9+\s\-]/g, '')
                    setForm(prev => ({ ...prev, phone: val }))
                  }} className={styles.input} placeholder="+506 xxxx xxxx" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Provincia</label>
                <select name="region" value={form.region} onChange={handleChange} className={styles.input}>
                  <option value="">Selecciona</option>
                  {CR_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* ─── Campos extra para veterinarios ─── */}
            {isVet && (
              <div style={{ background: "var(--color-primary-bg)", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-bark)", margin: 0 }}>
                  Información profesional
                </p>

                {/* Graduado checkbox */}
                <label style={{ display: "flex", alignItems: "center", gap: "0.65rem", cursor: "pointer", fontSize: "0.9rem", color: "var(--color-text-primary)" }}>
                  <input type="checkbox" name="vetGraduated" checked={form.vetGraduated} onChange={handleChange}
                    style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)" }} />
                  <span>Soy médico veterinario graduado</span>
                </label>

                {form.vetGraduated && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div className={styles.field}>
                      <label className={styles.label}>Universidad</label>
                      <input type="text" name="vetUniversity" value={form.vetUniversity}
                        onChange={handleChange} style={inputStyle2} placeholder="Ej: UCR, UNA, UNED..." />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>N° de colegio profesional</label>
                      <input type="text" name="vetLicenseNumber" value={form.vetLicenseNumber}
                        onChange={handleChange} style={inputStyle2} placeholder="Ej: MV-1234" />
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className={styles.field}>
                    <label className={styles.label}>Especialidad (opcional)</label>
                    <input type="text" name="vetSpecialty" value={form.vetSpecialty}
                      onChange={handleChange} style={inputStyle2} placeholder="Ej: Cirugía, Dermatología..." />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Años de experiencia</label>
                    <input type="number" name="vetYearsExp" value={form.vetYearsExp} min="0"
                      onChange={handleChange} style={inputStyle2} placeholder="0" />
                  </div>
                </div>
              </div>
            )}

            {/* Descripción */}
            <div className={styles.field}>
              <label className={styles.label}>
                {isVet ? "Descripción adicional (opcional)" : "Descripción (opcional)"}
              </label>
              <input type="text" name="profileDescription" value={form.profileDescription}
                onChange={handleChange} className={styles.input}
                placeholder={isVet ? "Clínica, horario, servicios..." : isShelter ? "Cuéntanos sobre el refugio" : "Cuéntanos sobre ti"} />
            </div>

            {/* Contraseñas */}
            <div className={styles.field}>
              <label className={styles.label}>Contraseña *</label>
              <input type="password" name="password" value={form.password}
                onChange={handleChange} className={styles.input} placeholder="Mínimo 8 caracteres" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirmar contraseña *</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange} className={styles.input} placeholder="Repite la contraseña" required />
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>Crear cuenta</Button>

            <p className={styles.terms}>
              Al registrarte aceptas nuestros{" "}
              <Link to="/terms" className={styles.formLink}>Términos de uso</Link>{" "}
              y{" "}
              <Link to="/privacy" className={styles.formLink}>Política de privacidad</Link>.
            </p>
          </form>

          <div className={styles.backHome}>
            <Link to="/" className={styles.backLink}>← Volver al inicio</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
