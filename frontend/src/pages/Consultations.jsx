import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { consultationService, consultationResponseService, userService } from '../services/api'
import Button from '../components/ui/Button'

const STATUS_MAP = {
 pending: { label: 'Pendiente', color: '#D4A017' },
 answered: { label: 'Respondida', color: '#4A7C59' },
 closed: { label: 'Cerrada', color: '#888' },
}

const EMPTY_FORM = { receiverIdUser: '', subject: '', message: '' }

export default function Consultations() {
 const { isAuthenticated, user } = useAuth()
 const navigate = useNavigate()
 const [vets, setVets] = useState([])
 const [sent, setSent] = useState([])
 const [received, setReceived] = useState([])
 const [loading, setLoading] = useState(true)
 const [showForm, setShowForm] = useState(false)
 const [form, setForm] = useState(EMPTY_FORM)
 const [saving, setSaving] = useState(false)
 const [error, setError] = useState('')
 const [success, setSuccess] = useState('')
 const [activeTab, setActiveTab] = useState('vets')
 const [expandedId, setExpandedId] = useState(null)
 const [responses, setResponses] = useState({})
 const [replyText, setReplyText] = useState({})

 useEffect(() => {
 // Cargar usuarios de tipo 'vet' o 'shelter' como posibles receptores
 userService.getAll().then(r => {
 const all = Array.isArray(r.data) ? r.data : []
 const currentId = user?.idUser ?? user?.id
 setVets(all.filter(u => (u.userType === 'vet' || u.userType === 'shelter') && (u.idUser ?? u.id) !== currentId))
 }).catch(() => setVets([]))

 if (isAuthenticated && user?.id) {
 const userId = parseInt(user.id ?? user.idUser)
 if (!isNaN(userId) && userId > 0) {
 Promise.all([
 consultationService.getBySender(userId).catch(() => ({ data: [] })),
 consultationService.getByReceiver(userId).catch(() => ({ data: [] })),
 ]).then(([s, r]) => {
 setSent((Array.isArray(s.data) ? s.data : []).filter(c => !c.subject?.startsWith('marketplace:')))
 setReceived((Array.isArray(r.data) ? r.data : []).filter(c => !c.subject?.startsWith('marketplace:')))
 }).finally(() => setLoading(false))
 } else {
 setLoading(false)
 }
 } else {
 setLoading(false)
 }
 }, [isAuthenticated, user])

 const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

 const handleSubmit = async (e) => {
 e.preventDefault()
 if (!form.receiverIdUser || !form.subject || !form.message) { setError('Completa todos los campos.'); return }
 setSaving(true); setError(''); setSuccess('')
 try {
 const senderId = parseInt(user.id)
 const receiverId = parseInt(form.receiverIdUser)
 const existing = sent.find(c =>
 parseInt(c.receiverIdUser) === receiverId &&
 c.subject?.toLowerCase().trim() === form.subject.toLowerCase().trim()
 )
 if (existing) {
 const cId = existing.idConsultation ?? existing.id
 await consultationResponseService.create({ idConsultation: parseInt(cId), idUser: senderId, responseMessage: form.message })
 await consultationService.updateStatus(cId, 'pending')
 setSuccess('Mensaje agregado a la consulta existente.')
 setForm(EMPTY_FORM); setShowForm(false)
 setExpandedId(cId)
 } else {
 await consultationService.create({ senderIdUser: senderId, receiverIdUser: receiverId, subject: form.subject, message: form.message })
 setSuccess('¡Consulta enviada!')
 setForm(EMPTY_FORM); setShowForm(false)
 }
 const s = await consultationService.getBySender(senderId)
 setSent((Array.isArray(s.data) ? s.data : []).filter(c => !c.subject?.startsWith('marketplace:')))
 } catch (err) {
 setError(err.response?.data?.message || 'Error al enviar.')
 } finally { setSaving(false) }
 }

 const loadResponses = async (consultationId, forceReload = false) => {
 if (responses[consultationId] && !forceReload) { setExpandedId(expandedId === consultationId ? null : consultationId); return }
 try {
 const r = await consultationResponseService.getByConsultation(consultationId)
 const all = Array.isArray(r.data) ? r.data : []
 const consultation = [...sent, ...received].find(c => (c.idConsultation ?? c.id) === consultationId)
 const filtered = consultation ? all.filter(resp => resp.responseMessage !== consultation.message) : all
 setResponses(prev => ({ ...prev, [consultationId]: filtered }))
 setExpandedId(consultationId)
 } catch { setExpandedId(consultationId) }
 }

 const handleReply = async (consultationId) => {
 const msg = replyText[consultationId]
 if (!msg?.trim()) return
 try {
 await consultationResponseService.create({ idConsultation: parseInt(consultationId), idUser: parseInt(user.id ?? user.idUser), responseMessage: msg })
 setReplyText(prev => ({ ...prev, [consultationId]: '' }))
 await consultationService.updateStatus(consultationId, 'answered')
 setReceived(prev => prev.map(c => (c.idConsultation ?? c.id) === consultationId ? { ...c, consultationStatus: 'answered' } : c))
 window.dispatchEvent(new Event('refreshBadges'))
 const r = await consultationResponseService.getByConsultation(consultationId)
 const all = Array.isArray(r.data) ? r.data : []
 const consultation = received.find(c => (c.idConsultation ?? c.id) === consultationId)
 const filtered = consultation ? all.filter(resp => resp.responseMessage !== consultation.message) : all
 setResponses(prev => ({ ...prev, [consultationId]: filtered }))
 } catch { alert('Error al responder.') }
 }

 const inputStyle = { width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }
 const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.4rem' }
 const tabs = [
 { id: 'vets', label: ' Veterinarios / Refugios' },
 ...(isAuthenticated ? [{ id: 'sent', label: ' Enviadas' }, { id: 'received', label: ' Recibidas' }] : []),
 ]

 return (
 <div style={{ padding: 'var(--space-12) 0 var(--space-20)' }}>
 <div className="container">
 <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
 <div>
 <h1 style={{ fontSize: 'var(--text-4xl)', color: 'var(--color-bark)', marginBottom: '0.5rem' }}>Consultas veterinarias</h1>
 <p style={{ color: 'var(--color-text-muted)' }}>Consulta a veterinarios y refugios sobre tus mascotas</p>
 </div>
 {isAuthenticated && (
 <Button onClick={() => { setShowForm(!showForm); setError('') }}>
 {showForm ? ' Cancelar' : '+ Nueva consulta'}
 </Button>
 )}
 </div>

 {!isAuthenticated && (
 <div style={{ background: 'var(--color-primary-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
 <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Inicia sesión para enviar consultas</p>
 <Button onClick={() => navigate('/login')}>Iniciar sesión</Button>
 </div>
 )}

 {success && <div style={{ background: '#EDF5F0', color: '#4A7C59', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 500 }}> {success}</div>}

 {/* Formulario nueva consulta */}
 {showForm && (
 <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
 <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-bark)', marginBottom: '1.5rem' }}>Nueva consulta</h2>
 {error && <div style={{ background: '#FDF0EA', color: 'var(--color-error)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
 <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
 <div>
 <label style={labelStyle}>Enviar a *</label>
 <select name="receiverIdUser" value={form.receiverIdUser} onChange={handleChange} style={inputStyle}>
 <option value="">Selecciona un veterinario o refugio</option>
 {vets.map((v, i) => <option key={v.idUser ?? v.id ?? i} value={v.idUser ?? v.id}>{v.fullName} ({v.userType})</option>)}
 </select>
 </div>
 <div><label style={labelStyle}>Asunto *</label><input name="subject" value={form.subject} onChange={handleChange} placeholder="Ej: Consulta sobre vacunación" style={inputStyle} /></div>
 <div>
 <label style={labelStyle}>Mensaje *</label>
 <textarea name="message" value={form.message} onChange={handleChange} rows={4} placeholder="Describe tu consulta con detalle..."
 style={{ ...inputStyle, resize: 'vertical' }} />
 </div>
 <div><Button type="submit" loading={saving}>Enviar consulta</Button></div>
 </form>
 </div>
 )}

 {/* Tabs */}
 <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '2px solid var(--color-border)', marginBottom: '2rem' }}>
 {tabs.map(t => (
 <button key={t.id} onClick={() => setActiveTab(t.id)}
 style={{ padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
 color: activeTab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
 borderBottom: activeTab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
 marginBottom: '-2px' }}>
 {t.label}
 </button>
 ))}
 </div>

 {/* Contenido de tabs */}
 {activeTab === 'vets' && (
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
 {vets.length === 0
 ? <p style={{ color: 'var(--color-text-muted)', gridColumn: '1/-1' }}>No hay veterinarios registrados aún.</p>
 : vets.map((v, i) => (
 <div key={v.idUser ?? v.id ?? i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
 <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
 {v.userType === 'vet' ? '' : ''}
 </div>
 <div>
 <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{v.fullName}</h3>
 <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>{v.userType === 'vet' ? 'Veterinario' : 'Refugio'} · {v.region || 'Sin provincia'}</p>
 </div>
 {v.profileDescription && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{v.profileDescription}</p>}
 {isAuthenticated && (
 <Button size="sm" onClick={() => { setForm(prev => ({ ...prev, receiverIdUser: v.idUser ?? v.id })); setShowForm(true); setActiveTab('vets') }}>
 Consultar
 </Button>
 )}
 </div>
 ))
 }
 </div>
 )}

 {activeTab === 'sent' && (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
 {loading ? <p style={{ color: 'var(--color-text-muted)' }}>Cargando...</p>
 : sent.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>No has enviado consultas aún.</p>
 : sent.map((c, i) => {
 const cId = c.idConsultation ?? c.id ?? i
 const s = STATUS_MAP[c.consultationStatus?.toLowerCase()] || { label: c.consultationStatus || 'Pendiente', color: '#D4A017' }
 return (
 <div key={cId} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: '12px', padding: '1.25rem' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
 <strong style={{ color: 'var(--color-text-primary)' }}>{c.subject}</strong>
 <span style={{ background: s.color + '20', color: s.color, padding: '2px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</span>
 </div>
 <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>{c.message}</p>
 <button onClick={() => loadResponses(cId)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, padding: 0 }}>
 {expandedId === cId ? ' Ocultar respuestas' : ' Ver respuestas'}
 </button>
 {expandedId === cId && (
 <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
 {(responses[cId] || []).length === 0
 ? <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Sin respuestas aún.</p>
 : (responses[cId] || []).map((res, j) => (
 <div key={res.idResponse ?? res.id ?? j} style={{ background: 'var(--color-surface-alt)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
 {res.responseMessage}
 </div>
 ))
 }
 </div>
 )}
 </div>
 )
 })
 }
 </div>
 )}

 {activeTab === 'received' && (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
 {loading ? <p style={{ color: 'var(--color-text-muted)' }}>Cargando...</p>
 : received.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>No has recibido consultas.</p>
 : received.map((c, i) => {
 const cId = c.idConsultation ?? c.id ?? i
 const s = STATUS_MAP[c.consultationStatus?.toLowerCase()] || { label: c.consultationStatus || 'Pendiente', color: '#D4A017' }
 return (
 <div key={cId} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: '12px', padding: '1.25rem' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
 <strong style={{ color: 'var(--color-text-primary)' }}>{c.subject}</strong>
 <span style={{ background: s.color + '20', color: s.color, padding: '2px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</span>
 </div>
 <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>{c.message}</p>
 <button onClick={() => loadResponses(cId)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, padding: 0 }}>
 {expandedId === cId ? ' Ocultar' : ' Respuestas y responder'}
 </button>
 {expandedId === cId && (
 <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
 {(responses[cId] || []).map((res, j) => (
 <div key={res.idResponse ?? res.id ?? j} style={{ background: 'var(--color-surface-alt)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
 {res.responseMessage}
 </div>
 ))}
 <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
 <input value={replyText[cId] || ''} onChange={e => setReplyText(prev => ({ ...prev, [cId]: e.target.value }))}
 placeholder="Escribe tu respuesta..." style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '0.9rem' }} />
 <Button size="sm" onClick={() => handleReply(cId)}>Responder</Button>
 </div>
 </div>
 )}
 </div>
 )
 })
 }
 </div>
 )}
 </div>
 </div>
 )
}
