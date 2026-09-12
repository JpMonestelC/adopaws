// src/components/pets/CompatibilityBadge.jsx
import { useState, useEffect } from 'react';
import { compatibilityService } from '../../services/api';

// Niveles que realmente devuelve el backend (CompatibilityService.GetCompatibilityLevel
// en Adopaws.Application): Excelente / Buena / Regular / Baja. Antes estas claves
// estaban en inglés (Excellent/Good/Fair/Low) y nunca hacían match, así que todo
// resultado caía silenciosamente al color por defecto.
const levelColors = {
 Excelente: { bg: '#e6f4ea', color: '#1e7e34', border: '#28a745' },
 Buena: { bg: '#e8f0fe', color: '#1a56a0', border: '#2E75B6' },
 Regular: { bg: '#fff8e1', color: '#856404', border: '#ffc107' },
 Baja: { bg: '#fdecea', color: '#a61c00', border: '#dc3545' },
};

export default function CompatibilityBadge({ userId, petId, inline = false }) {
 const [result, setResult] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(false);

 useEffect(() => {
 if (!userId || !petId) { setLoading(false); return; }

 compatibilityService.getCompatibility(userId, petId)
 .then(res => setResult(res.data))
 .catch(() => setError(true))
 .finally(() => setLoading(false));
 }, [userId, petId]);

 if (loading) return <span style={styles.loading}>Analizando compatibilidad...</span>;
 if (error || !result) return null;

 const colors = levelColors[result.compatibilityLevel] || levelColors.Regular;

 if (inline) {
 return (
 <span style={{ ...styles.badge, background: colors.bg, color: colors.color, border: `1px solid ${colors.border}` }}>
 {result.compatibilityLevel} · {result.compatibilityScore}%
 </span>
 );
 }

 return (
 <div style={{ ...styles.card, borderLeft: `4px solid ${colors.border}`, background: colors.bg }}>
 <div style={styles.header}>
 <span style={{ ...styles.level, color: colors.color }}>
 Compatibilidad: {result.compatibilityLevel}
 </span>
 <span style={{ ...styles.score, color: colors.color }}>{result.compatibilityScore}%</span>
 </div>
 <div style={styles.barBg}>
 <div style={{ ...styles.barFill, width: `${result.compatibilityScore}%`, background: colors.border }} />
 </div>
 <p style={styles.explanation}>{result.explanation}</p>
 {result.aiEnhanced && (
 <span style={styles.aiTag}> Análisis potenciado por IA</span>
 )}
 </div>
 );
}

const styles = {
 loading: { fontSize: '0.8rem', color: '#888', fontStyle: 'italic' },
 badge: { display: 'inline-block', fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '12px' },
 card: { borderRadius: '8px', padding: '14px 16px', marginTop: '12px', marginBottom: '12px' },
 header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
 level: { fontWeight: 700, fontSize: '0.95rem' },
 score: { fontWeight: 800, fontSize: '1.1rem' },
 barBg: { height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' },
 barFill: { height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' },
 explanation: { fontSize: '0.85rem', color: '#444', margin: 0, lineHeight: 1.5 },
 aiTag: { display: 'inline-block', marginTop: '8px', fontSize: '0.72rem', color: '#666', fontStyle: 'italic' },
};
