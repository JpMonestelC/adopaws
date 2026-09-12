// src/components/pets/PetRecommendations.jsx
import { useState, useEffect } from 'react';
import { compatibilityService } from '../../services/api';

// Mismas claves que CompatibilityBadge.jsx: el backend responde en español
// (Excelente/Buena/Regular/Baja), no en inglés.
const levelColors = {
 Excelente: { bg: '#e6f4ea', color: '#1e7e34', bar: '#28a745' },
 Buena: { bg: '#e8f0fe', color: '#1a56a0', bar: '#2E75B6' },
 Regular: { bg: '#fff8e1', color: '#856404', bar: '#ffc107' },
 Baja: { bg: '#fdecea', color: '#a61c00', bar: '#dc3545' },
};

export default function PetRecommendations({ userId }) {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(false);

 useEffect(() => {
 if (!userId) { setLoading(false); return; }

 compatibilityService.getRecommendations(userId, 6)
 .then(res => setData(res.data))
 .catch(() => setError(true))
 .finally(() => setLoading(false));
 }, [userId]);

 if (loading) return <p style={styles.status}>Calculando recomendaciones para ti...</p>;
 if (error) return null; // Falla silenciosa — no rompe la página
 if (!data || data.recommendations.length === 0) return null;

 return (
 <section style={styles.section}>
 <div style={styles.titleRow}>
 <h2 style={styles.title}> Recomendaciones para ti</h2>
 <span style={styles.subtitle}>
 {data.totalPetsAnalyzed} mascotas analizadas · Top {data.recommendations.length}
 </span>
 </div>

 <div style={styles.grid}>
 {data.recommendations.map(pet => {
 const colors = levelColors[pet.compatibilityLevel] || levelColors.Regular;
 return (
 <div key={pet.idPet} style={{ ...styles.card, borderTop: `4px solid ${colors.bar}` }}>
 <div style={styles.cardHeader}>
 <div>
 <h3 style={styles.petName}>{pet.petName}</h3>
 <span style={styles.petType}>{pet.petType}{pet.breed ? ` · ${pet.breed}` : ''}</span>
 </div>
 <div style={{ ...styles.scoreBadge, background: colors.bg, color: colors.color }}>
 <span style={styles.scoreNum}>{pet.compatibilityScore}%</span>
 <span style={styles.scoreLabel}>{pet.compatibilityLevel}</span>
 </div>
 </div>

 <div style={styles.barBg}>
 <div style={{ ...styles.barFill, width: `${pet.compatibilityScore}%`, background: colors.bar }} />
 </div>

 <div style={styles.meta}>
 {pet.age != null && <span style={styles.tag}>{pet.age} año{pet.age !== 1 ? 's' : ''}</span>}
 {pet.size && <span style={styles.tag}>{pet.size}</span>}
 {pet.region && <span style={styles.tag}> {pet.region}</span>}
 </div>

 <p style={styles.explanation}>{pet.explanation}</p>

 <div style={styles.cardFooter}>
 {pet.aiEnhanced && <span style={styles.aiTag}> IA</span>}
 <a href={`/pets/${pet.idPet}`} style={styles.link}>Ver mascota →</a>
 </div>
 </div>
 );
 })}
 </div>
 </section>
 );
}

const styles = {
 section: { padding: '32px 0' },
 status: { color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '24px' },
 titleRow: { display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
 title: { fontSize: '1.5rem', fontWeight: 700, color: '#1E3A5F', margin: 0 },
 subtitle: { fontSize: '0.85rem', color: '#888' },
 grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
 card: { background: '#fff', borderRadius: '10px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' },
 cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
 petName: { margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1E3A5F' },
 petType: { fontSize: '0.8rem', color: '#666' },
 scoreBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '8px', padding: '6px 10px', minWidth: '60px' },
 scoreNum: { fontWeight: 800, fontSize: '1.1rem' },
 scoreLabel: { fontSize: '0.7rem', fontWeight: 600 },
 barBg: { height: '5px', background: '#eee', borderRadius: '3px', overflow: 'hidden' },
 barFill: { height: '100%', borderRadius: '3px', transition: 'width 0.6s ease' },
 meta: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
 tag: { fontSize: '0.75rem', background: '#f0f4f8', color: '#444', padding: '2px 8px', borderRadius: '10px' },
 explanation: { fontSize: '0.83rem', color: '#444', margin: 0, lineHeight: 1.5, flexGrow: 1 },
 cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' },
 aiTag: { fontSize: '0.72rem', color: '#888', fontStyle: 'italic' },
 link: { fontSize: '0.85rem', color: '#2E75B6', fontWeight: 600, textDecoration: 'none' },
};
