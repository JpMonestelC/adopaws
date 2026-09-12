import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { marketplaceService, consultationService, consultationResponseService } from '../services/api'
import Button from '../components/ui/Button'
import ImageUpload from '../components/ui/ImageUpload'

const CATEGORIES = ['Todos', 'Alimento', 'Juguetes', 'Ropa', 'Accesorios', 'Salud', 'Otro']
const CONDITIONS = [['new','Nuevo'],['used','Usado'],['like_new','Como nuevo']]
const EMPTY_FORM = { title: '', category: 'Alimento', description: '', itemCondition: 'new', price: '', region: '', mainPhoto: '' }

// Chat Modal de compra 
function BuyChat({ item, currentUser, onClose }) {
 const [messages, setMessages] = useState([])
 const [text, setText] = useState('')
 const [sending, setSending] = useState(false)
 const [consultationId, setConsultationId] = useState(null)
 const [loadingChat, setLoadingChat] = useState(true)
 const [editMode, setEditMode] = useState(false)
 const [editForm, setEditForm] = useState({})
 const [savingEdit, setSavingEdit] = useState(false)
 const [saleStatus, setSaleStatus] = useState(null) // null | 'prompt' | 'sold' | 'available'
 const bottomRef = useRef(null)

 const isOwner = parseInt(currentUser?.id) === parseInt(item.idUser)
 const totalMessages = messages.length

 useEffect(() => { loadOrCreateChat() }, [])

 useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

 useEffect(() => {
 if (isOwner && totalMessages >= 5 && saleStatus === null) {
 setSaleStatus('prompt')
 }
 }, [totalMessages, isOwner, saleStatus])

 const loadOrCreateChat = async () => {
 setLoadingChat(true)
 try {
 const subject = `marketplace:${item.id ?? item.idMarketplaceItem}`
 const buyerId = parseInt(currentUser.id)
 const sellerId = parseInt(item.idUser)
 let consultation = null

 if (isOwner) {
 const received = await consultationService.getByReceiver(sellerId).catch(() => ({ data: [] }))
 const all = Array.isArray(received.data) ? received.data : []
 consultation = all.find(c => c.subject === subject)
 } else {
 const sent = await consultationService.getBySender(buyerId).catch(() => ({ data: [] }))
 const all = Array.isArray(sent.data) ? sent.data : []
 consultation = all.find(c => c.subject === subject && parseInt(c.receiverIdUser) === sellerId)
 }

 if (consultation) {
 const cId = consultation.idConsultation ?? consultation.id
 setConsultationId(cId)
 if (consultation.consultationStatus === 'closed') setSaleStatus('sold')
 await buildMessages(cId, consultation.message, consultation.senderIdUser, consultation.createdAt)
 }
 // Si no existe consulta y no es dueño, se creará al enviar el primer mensaje
 } catch (err) {
 console.error('Error cargando chat:', err)
 } finally {
 setLoadingChat(false)
 }
 }

 const buildMessages = async (cId, firstMessage, firstSenderId, firstDate) => {
 const r = await consultationResponseService.getByConsultation(cId).catch(() => ({ data: [] }))
 const responses = Array.isArray(r.data) ? r.data : []
 const allMsgs = firstMessage?.trim() ? [{ id: 'first', text: firstMessage, senderId: parseInt(firstSenderId), createdAt: firstDate }] : []
 responses.forEach(resp => allMsgs.push({
 id: resp.idResponse ?? resp.id,
 text: resp.responseMessage,
 senderId: parseInt(resp.idUser),
 createdAt: resp.createdAt
 }))
 setMessages(allMsgs)
 }

 const refreshMessages = async () => {
 if (!consultationId || messages.length === 0) return
 const firstMsg = messages[0]
 await buildMessages(consultationId, firstMsg.text, firstMsg.senderId, firstMsg.createdAt)
 }

 const sendMessage = async () => {
 if (!text.trim()) return
 setSending(true)
 try {
 let cId = consultationId

 // Si el comprador aún no tiene consulta, crearla con el primer mensaje real
 if (!cId && !isOwner) {
 const subject = `marketplace:${item.id ?? item.idMarketplaceItem}`
 const res = await consultationService.create({
 senderIdUser: parseInt(currentUser.id),
 receiverIdUser: parseInt(item.idUser),
 subject: subject,
 message: text.trim()
 })
 const created = res.data
 cId = created.idConsultation ?? created.id
 setConsultationId(cId)
 await consultationService.updateStatus(cId, 'pending').catch(() => {})
 await buildMessages(cId, created.message, currentUser.id, created.createdAt)
 setText('')
 window.dispatchEvent(new Event('refreshBadges'))
 setSending(false)
 return
 }

 if (!cId) return

 await consultationResponseService.create({
 idConsultation: parseInt(cId),
 idUser: parseInt(currentUser.id),
 responseMessage: text.trim()
 })

 // Dueño responde → answered (baja el contador del dueño)
 // Comprador responde → pending (sube el contador del dueño nuevamente)
 if (isOwner) {
 await consultationService.updateStatus(cId, 'answered').catch(() => {})
 } else {
 await consultationService.updateStatus(cId, 'pending').catch(() => {})
 }

 setText('')
 await refreshMessages()
 window.dispatchEvent(new Event('refreshBadges'))
 } catch {
 alert('Error al enviar mensaje.')
 } finally { setSending(false) }
 }

 const handleKeyDown = (e) => {
 if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
 }

 const markAsSold = async () => {
 try {
 await marketplaceService.update(item.id ?? item.idMarketplaceItem, { ...item, publicationStatus: 'sold' })
 if (consultationId) await consultationService.updateStatus(consultationId, 'closed').catch(() => {})
 setSaleStatus('sold')
 window.dispatchEvent(new Event('refreshBadges'))
 } catch { alert('Error al actualizar estado.') }
 }

 const keepAvailable = async () => {
 setSaleStatus('available')
 if (consultationId) await consultationService.updateStatus(consultationId, 'answered').catch(() => {})
 }

 const openEdit = () => {
 setEditForm({ title: item.title||'', category: item.category||'Alimento', description: item.description||'', itemCondition: item.itemCondition||'new', price: item.price??'', region: item.region||'', mainPhoto: item.mainPhoto||'' })
 setEditMode(true)
 }

 const saveEdit = async () => {
 if (!editForm.title.trim()) { alert('El título es requerido.'); return }
 if (!editForm.description.trim()) { alert('La descripción es requerida.'); return }
 if (!editForm.region) { alert('La provincia es requerida.'); return }
 if (editForm.price === '' || editForm.price === null || editForm.price === undefined) { alert('El precio es requerido.'); return }
 setSavingEdit(true)
 try {
 await marketplaceService.update(item.id ?? item.idMarketplaceItem, { ...editForm, price: parseFloat(editForm.price) || 0 })
 Object.assign(item, editForm)
 setEditMode(false)
 } catch { alert('Error al guardar cambios.') }
 finally { setSavingEdit(false) }
 }

 const inputStyle = { width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }
 const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.4rem' }

 return (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
 <div style={{ background: 'var(--color-surface)', borderRadius: '20px', width: '100%', maxWidth: '540px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>

 {/* Header */}
 <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
 <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #F5EDD8, #E8C49A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 {item.mainPhoto
 ? <img src={item.mainPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
 : <span style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>—</span>}
 </div>
 <div style={{ flex: 1, minWidth: 0 }}>
 <p style={{ fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
 <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
              {item.price > 0 ? `₡${item.price?.toLocaleString('es-CR')}` : 'Precio a consultar'}
              {!isOwner && item.idUser && (
                <>{' · '}<Link to={`/user/${item.idUser}`} onClick={onClose} style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Ver perfil del vendedor</Link></>
              )}
            </p>
 </div>
 {isOwner && (
 <button onClick={openEdit} style={{ background: 'var(--color-primary-bg)', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}>
 Editar
 </button>
 )}
 <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1, padding: '4px', flexShrink: 0 }}>✕</button>
 </div>

 {/* Formulario edición inline (dueño) */}
 {editMode && (
 <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', overflowY: 'auto', background: 'var(--color-surface-alt)', flexShrink: 0 }}>
 <p style={{ fontWeight: 700, color: 'var(--color-bark)', marginBottom: '0.85rem', fontSize: '0.95rem' }}> Editar publicación</p>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
 <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Título</label><input value={editForm.title} onChange={e => setEditForm(p => ({...p, title: e.target.value}))} style={inputStyle} /></div>
 <div><label style={labelStyle}>Precio (₡)</label><input type="number" min="0" value={editForm.price} onChange={e => setEditForm(p => ({...p, price: e.target.value}))} style={inputStyle} /></div>
 <div>
 <label style={labelStyle}>Provincia</label>
 <select value={editForm.region} onChange={e => setEditForm(p => ({...p, region: e.target.value}))} style={inputStyle}>
 <option value="">Selecciona provincia</option>
 <option value="San José">San José</option>
 <option value="Alajuela">Alajuela</option>
 <option value="Cartago">Cartago</option>
 <option value="Heredia">Heredia</option>
 <option value="Guanacaste">Guanacaste</option>
 <option value="Puntarenas">Puntarenas</option>
 <option value="Limón">Limón</option>
 </select>
 </div>
 <div>
 <label style={labelStyle}>Categoría</label>
 <select value={editForm.category} onChange={e => setEditForm(p => ({...p, category: e.target.value}))} style={inputStyle}>
 {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
 </select>
 </div>
 <div>
 <label style={labelStyle}>Estado</label>
 <select value={editForm.itemCondition} onChange={e => setEditForm(p => ({...p, itemCondition: e.target.value}))} style={inputStyle}>
 {CONDITIONS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
 </select>
 </div>
 <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Descripción</label><textarea rows={2} value={editForm.description} onChange={e => setEditForm(p => ({...p, description: e.target.value}))} style={{ ...inputStyle, resize: 'vertical' }} /></div>
 </div>
 <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
 <Button size="sm" loading={savingEdit} onClick={saveEdit}>Guardar cambios</Button>
 <button onClick={() => setEditMode(false)} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '6px 14px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>Cancelar</button>
 </div>
 </div>
 )}

 {/* Mensajes */}
 <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
 {loadingChat ? (
 <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Cargando conversación...</div>
 ) : messages.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
 
 <p>Inicia la conversación</p>
 </div>
 ) : messages.map((msg, i) => {
 const isMine = msg.senderId === parseInt(currentUser.id)
 return (
 <div key={msg.id ?? i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
 <div style={{
 maxWidth: '75%', padding: '0.65rem 1rem',
 borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
 background: isMine ? 'var(--color-primary)' : 'var(--color-surface-alt)',
 color: isMine ? 'white' : 'var(--color-text-primary)',
 fontSize: '0.9rem', lineHeight: 1.45,
 boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
 }}>
 {msg.text}
 </div>
 </div>
 )
 })}

 {/* Prompt de venta (dueño, tras 5 mensajes) */}
 {saleStatus === 'prompt' && isOwner && (
 <div style={{ background: 'linear-gradient(135deg, #FDF8ED, #FFF3CD)', border: '1.5px solid #F0C000', borderRadius: '14px', padding: '1.1rem 1.25rem', textAlign: 'center', marginTop: '0.5rem' }}>
 <p style={{ fontWeight: 700, color: '#8B6914', marginBottom: '0.35rem', fontSize: '0.95rem' }}> ¿Se concretó la venta?</p>
 <p style={{ fontSize: '0.83rem', color: '#A07820', marginBottom: '0.9rem' }}>Han intercambiado varios mensajes. ¿Qué pasó con este artículo?</p>
 <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
 <button onClick={markAsSold} style={{ background: '#4A7C59', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 18px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
 Marcar como vendido
 </button>
 <button onClick={keepAvailable} style={{ background: 'white', color: '#8B6914', border: '1.5px solid #F0C000', borderRadius: '10px', padding: '8px 18px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
 Sigue en venta
 </button>
 </div>
 </div>
 )}

 {saleStatus === 'sold' && (
 <div style={{ background: '#EDF5F0', border: '1.5px solid #4A7C59', borderRadius: '14px', padding: '1rem', textAlign: 'center', color: '#4A7C59', fontWeight: 600, fontSize: '0.9rem' }}>
 Este artículo fue marcado como <strong>vendido</strong>
 </div>
 )}

 {saleStatus === 'available' && (
 <div style={{ background: 'var(--color-primary-bg)', border: '1.5px solid var(--color-primary)', borderRadius: '14px', padding: '0.85rem', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.88rem' }}>
 El artículo sigue en venta
 </div>
 )}

 <div ref={bottomRef} />
 </div>

 {/* Input */}
 {saleStatus !== 'sold' && (
 <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.6rem', alignItems: 'flex-end', flexShrink: 0 }}>
 <textarea
 value={text}
 onChange={e => setText(e.target.value)}
 onKeyDown={handleKeyDown}
 placeholder="Escribe un mensaje… (Enter para enviar)"
 rows={1}
 style={{ flex: 1, padding: '0.65rem 0.9rem', border: '1.5px solid var(--color-border)', borderRadius: '12px', fontSize: '0.9rem', resize: 'none', outline: 'none', lineHeight: 1.4, maxHeight: '100px', overflow: 'auto' }}
 />
 <button
 onClick={sendMessage}
 disabled={!text.trim() || sending || loadingChat}
 style={{ background: text.trim() ? 'var(--color-primary)' : 'var(--color-border)', border: 'none', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: text.trim() ? 'pointer' : 'default', fontSize: '1.1rem', transition: 'background 0.15s', flexShrink: 0 }}>
 {sending ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
 </button>
 </div>
 )}
 </div>
 </div>
 )
}

// Modal de confirmación de eliminación 
function ConfirmDeleteModal({ itemTitle, onConfirm, onCancel, loading }) {
 return (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
 <div style={{ background: 'var(--color-surface)', borderRadius: '18px', width: '100%', maxWidth: '400px', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}>
 <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}></div>
 <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', color: 'var(--color-bark)', fontWeight: 700 }}>
 ¿Eliminar artículo?
 </h3>
 <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: '0 0 1.75rem', lineHeight: 1.5 }}>
 Estás a punto de eliminar <strong>"{itemTitle}"</strong>. Esta acción no se puede deshacer.
 </p>
 <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
 <button
 onClick={onCancel}
 disabled={loading}
 style={{ flex: 1, background: 'var(--color-surface-alt)', border: '1.5px solid var(--color-border)', color: 'var(--color-text-secondary)', borderRadius: '10px', padding: '10px 0', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
 >
 Cancelar
 </button>
 <button
 onClick={onConfirm}
 disabled={loading}
 style={{ flex: 1, background: '#C0392B', border: 'none', color: 'white', borderRadius: '10px', padding: '10px 0', fontSize: '0.9rem', fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
 >
 {loading ? 'Eliminando…' : 'Sí, eliminar'}
 </button>
 </div>
 </div>
 </div>
 )
}

// Componente principal 
export default function Marketplace() {
 const { isAuthenticated, user } = useAuth()
 const [items, setItems] = useState([])
 const [loading, setLoading] = useState(true)
 const [catFilter, setCatFilter] = useState('Todos')
 const [showForm, setShowForm] = useState(false)
 const [form, setForm] = useState(EMPTY_FORM)
 const [saving, setSaving] = useState(false)
 const [error, setError] = useState('')
 const [chatItem, setChatItem] = useState(null)
 const [confirmDelete, setConfirmDelete] = useState(null) // { id, title }
 const [deleting, setDeleting] = useState(false)

 const load = () => {
 setLoading(true)
 marketplaceService.getAll()
 .then(r => setItems(Array.isArray(r.data) ? r.data : []))
 .catch(() => setItems([]))
 .finally(() => setLoading(false))
 }
 useEffect(() => { load() }, [])

 const filtered = catFilter === 'Todos' ? items : items.filter(i => i.category === catFilter)
 const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

 const handleSubmit = async (e) => {
 e.preventDefault()
 if (!form.title.trim()) { setError('El título es requerido.'); return }
 if (!form.description.trim()) { setError('La descripción es requerida.'); return }
 if (!form.region) { setError('La provincia es requerida.'); return }
 if (form.price === '' || form.price === null || form.price === undefined) { setError('El precio es requerido.'); return }
 setSaving(true); setError('')
 try {
 await marketplaceService.create({ ...form, price: parseFloat(form.price) || 0, idUser: user.id })
 setForm(EMPTY_FORM); setShowForm(false); load()
 } catch (err) {
 setError(err.response?.data?.message || 'Error al publicar.')
 } finally { setSaving(false) }
 }

 const handleDelete = (id, title) => {
 setConfirmDelete({ id, title })
 }

 const confirmDeleteAction = async () => {
 if (!confirmDelete) return
 setDeleting(true)
 try {
 await marketplaceService.delete(confirmDelete.id)
 setItems(prev => prev.filter(i => (i.id ?? i.idMarketplaceItem) !== confirmDelete.id))
 setConfirmDelete(null)
 window.dispatchEvent(new Event('refreshBadges'))
 } catch {
 alert('Error al eliminar.')
 } finally { setDeleting(false) }
 }

 const inputStyle = { width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }
 const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.4rem' }

 return (
 <div style={{ padding: 'var(--space-12) 0 var(--space-20)' }}>
 <div className="container">
 {/* Header */}
 <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
 <div>
 <h1 style={{ fontSize: 'var(--text-4xl)', color: 'var(--color-bark)', marginBottom: '0.5rem' }}>Marketplace</h1>
 <p style={{ color: 'var(--color-text-muted)' }}>Artículos para mascotas de segunda mano y nuevos</p>
 </div>
 {isAuthenticated && (
 <Button onClick={() => { setShowForm(!showForm); setError('') }}>
 {showForm ? ' Cancelar' : '+ Publicar artículo'}
 </Button>
 )}
 </div>

 {/* Formulario */}
 {showForm && (
 <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
 <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-bark)', marginBottom: '1.5rem' }}>Nuevo artículo</h2>
 {error && <div style={{ background: '#FDF0EA', color: 'var(--color-error)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
 <form onSubmit={handleSubmit}>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
 <div><label style={labelStyle}>Título *</label><input name="title" value={form.title} onChange={handleChange} placeholder="Ej: Cama para perro" style={inputStyle} /></div>
 <div><label style={labelStyle}>Precio (₡)</label><input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="0" style={inputStyle} /></div>
 <div>
 <label style={labelStyle}>Provincia</label>
 <select name="region" value={form.region} onChange={handleChange} style={inputStyle}>
 <option value="">Selecciona provincia</option>
 <option value="San José">San José</option>
 <option value="Alajuela">Alajuela</option>
 <option value="Cartago">Cartago</option>
 <option value="Heredia">Heredia</option>
 <option value="Guanacaste">Guanacaste</option>
 <option value="Puntarenas">Puntarenas</option>
 <option value="Limón">Limón</option>
 </select>
 </div>
 <div>
 <label style={labelStyle}>Categoría</label>
 <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
 {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
 </select>
 </div>
 <div>
 <label style={labelStyle}>Estado</label>
 <select name="itemCondition" value={form.itemCondition} onChange={handleChange} style={inputStyle}>
 {CONDITIONS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
 </select>
 </div>
 </div>
 <div style={{ marginTop: '1rem' }}>
 <label style={labelStyle}>Descripción</label>
 <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Descripción del artículo..."
 style={{ ...inputStyle, resize: 'vertical' }} />
 </div>
 <div style={{ marginTop: '1rem' }}>
 <label style={labelStyle}>Foto del artículo</label>
 <ImageUpload label="Seleccionar foto" preview={form.mainPhoto} onUpload={(url) => setForm(prev => ({ ...prev, mainPhoto: url }))} />
 </div>
 <div style={{ marginTop: '1.5rem' }}><Button type="submit" loading={saving}>Publicar artículo</Button></div>
 </form>
 </div>
 )}

 {/* Filtros */}
 <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
 {CATEGORIES.map(cat => (
 <button key={cat} onClick={() => setCatFilter(cat)}
 style={{ padding: '0.4rem 1rem', borderRadius: '99px', border: '1.5px solid', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s',
 borderColor: catFilter === cat ? 'var(--color-primary)' : 'var(--color-border)',
 background: catFilter === cat ? 'var(--color-primary)' : 'white',
 color: catFilter === cat ? 'white' : 'var(--color-text-secondary)' }}>
 {cat}
 </button>
 ))}
 </div>

 {/* Grid */}
 {loading ? <p style={{ color: 'var(--color-text-muted)' }}>Cargando...</p>
 : filtered.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '4rem 0' }}>
 <div style={{ marginBottom: '1rem', opacity: 0.4 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div>
 <p style={{ color: 'var(--color-text-muted)' }}>No hay artículos en esta categoría aún.</p>
 </div>
 ) : (
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
 {filtered.map((item, i) => {
 const itemId = item.id ?? item.idMarketplaceItem ?? i
 const isOwner = isAuthenticated && parseInt(user?.id) === parseInt(item.idUser)
 const isSold = item.publicationStatus === 'sold'

 return (
 <div key={itemId} style={{ background: 'var(--color-surface)', border: `1px solid ${isSold ? '#C8E6C9' : 'var(--color-border-light)'}`, borderRadius: '16px', overflow: 'hidden', position: 'relative', opacity: isSold ? 0.75 : 1 }}>
 {isSold && (
 <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#4A7C59', color: 'white', padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, zIndex: 2 }}>
 VENDIDO
 </div>
 )}
 {item.mainPhoto
 ? <img src={item.mainPhoto} alt={item.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
 : <div style={{ height: '180px', background: 'linear-gradient(135deg, #F5EDD8, #E8C49A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div>
 }
 <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
 <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{item.title}</h3>
 {item.price > 0 && <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>₡{item.price?.toLocaleString('es-CR')}</span>}
 </div>
 {item.description && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>{item.description}</p>}
 <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
 {item.category && <span style={{ fontSize: '0.75rem', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '99px', fontWeight: 500 }}>{item.category}</span>}
 {item.itemCondition && <span style={{ fontSize: '0.75rem', background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', padding: '2px 8px', borderRadius: '99px' }}>{CONDITIONS.find(c => c[0] === item.itemCondition)?.[1] || item.itemCondition}</span>}
 {item.region && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}> {item.region}</span>}
 </div>

 {!isOwner && item.idUser && (
 <Link to={`/user/${item.idUser}`}
 onClick={e => e.stopPropagation()}
 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--color-text-muted)', textDecoration: 'none', margin: '0.1rem 0 0.35rem' }}>
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/></svg>
 Ver perfil del vendedor
 </Link>
 )}

 <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
 {/* Comprador: botón contactar */}
 {isAuthenticated && !isOwner && !isSold && (
 <button onClick={() => setChatItem(item)}
 style={{ flex: 1, background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 14px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
 Contactar vendedor
 </button>
 )}
 {/* Dueño: ver mensajes */}
 {isOwner && (
 <button onClick={() => setChatItem(item)}
 style={{ flex: 1, background: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '8px 14px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
 Ver mensajes
 </button>
 )}
 {/* No autenticado */}
 {!isAuthenticated && !isSold && (
 <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', padding: '6px 0' }}>Inicia sesión para contactar</span>
 )}
 {/* Eliminar */}
 {isOwner && (
 <button onClick={() => handleDelete(itemId, item.title)}
 style={{ background: 'none', border: '1px solid #C0392B', color: '#C0392B', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>
 Eliminar
 </button>
 )}
 </div>
 </div>
 </div>
 )
 })}
 </div>
 )
 }
 </div>

 {/* Confirm delete modal */}
 {confirmDelete && (
 <ConfirmDeleteModal
 itemTitle={confirmDelete.title}
 loading={deleting}
 onConfirm={confirmDeleteAction}
 onCancel={() => setConfirmDelete(null)}
 />
 )}
 {/* Chat modal */}
 {chatItem && isAuthenticated && (
 <BuyChat item={chatItem} currentUser={user} onClose={() => { setChatItem(null); load() }} />
 )}
 </div>
 )
}
