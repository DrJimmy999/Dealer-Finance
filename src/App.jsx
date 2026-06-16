import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase.js'

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const STAGES = [
  { id: 'Prospecting',       label: 'Prospecting',       bg: 'var(--s-prospecting)', color: 'var(--s-prospecting-t)', dot: '#98A2B3' },
  { id: 'Meeting',           label: 'Meeting',            bg: 'var(--s-meeting)',     color: 'var(--s-meeting-t)',     dot: '#1849A9' },
  { id: 'Finance Agreed',    label: 'Finance Agreed',     bg: 'var(--s-finance)',     color: 'var(--s-finance-t)',     dot: '#F79009' },
  { id: 'Document Checking', label: 'Document Checking',  bg: 'var(--s-docs)',        color: 'var(--s-docs-t)',        dot: '#0BA5EC' },
  { id: 'Finance Partner Review', label: 'Finance Partner Review', bg: 'var(--s-partner)', color: 'var(--s-partner-t)', dot: '#9E77ED' },
  { id: 'Paused',            label: 'Paused',             bg: 'var(--s-paused)',      color: 'var(--s-paused-t)',      dot: '#C4320A' },
  { id: 'Closed - Accepted', label: 'Closed — Accepted',  bg: 'var(--s-accepted)',    color: 'var(--s-accepted-t)',    dot: '#12B76A' },
  { id: 'Closed - Rejected', label: 'Closed — Rejected',  bg: 'var(--s-rejected)',    color: 'var(--s-rejected-t)',    dot: '#F04438' },
]

const INITIAL_DEALERS = [
  { name: 'Jst Used Automobile Trading (Expat)', list_status: '' },
  { name: 'RMA Used Car LLC',                    list_status: 'visited' },
  { name: 'Car Superstore',                      list_status: '' },
  { name: 'Carzoo',                              list_status: '' },
  { name: 'Grand Prix',                          list_status: '' },
  { name: 'True Value',                          list_status: '' },
  { name: 'Cariva',                              list_status: '' },
  { name: 'Kush Cars',                           list_status: '' },
  { name: 'Cars4u',                              list_status: '' },
  { name: 'Car Avenue',                          list_status: '' },
  { name: 'Car Point',                           list_status: '' },
  { name: 'R A I D Used Car Trading (Blackline)', list_status: '' },
  { name: 'Sanam Cars',                          list_status: '' },
  { name: 'Jeeper Auto',                         list_status: '' },
  { name: 'Approved Auto',                       list_status: '' },
  { name: 'Linda Cars',                          list_status: '' },
  { name: 'MBA Motors',                          list_status: '' },
  { name: 'Honey Jidosha',                       list_status: '' },
  { name: 'First Choice',                        list_status: '' },
  { name: 'Sanam Cars (2)',                      list_status: '' },
  { name: 'Carugati Motor',                      list_status: '' },
  { name: 'Jeeper Car',                          list_status: '' },
  { name: 'Kaamdhenu Cars',                      list_status: '' },
  { name: 'I Q Cars',                            list_status: '' },
  { name: 'Quatro Motors',                       list_status: '' },
  { name: 'Drivenchy Motors',                    list_status: 'new' },
  { name: 'Verified Hub',                        list_status: 'new' },
  { name: 'We Can Motors',                       list_status: 'new' },
  { name: 'Aurum Motors',                        list_status: 'new' },
  { name: 'Quick Cars',                          list_status: 'new' },
  { name: 'Ideal Cars',                          list_status: 'new' },
  { name: 'Andaleeb Cars',                       list_status: 'new' },
  { name: 'Maurya Cars',                         list_status: 'new' },
  { name: 'ZRS Motors',                          list_status: 'new' },
]

// ── HELPERS ────────────────────────────────────────────────────────────────
const getStage = (id) => STAGES.find(s => s.id === id) || STAGES[0]

function StagePill({ stageId }) {
  const s = getStage(stageId)
  return (
    <span className="stage-pill" style={{ background: s.bg, color: s.color }}>
      <span className="stage-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  )
}

function Icon({ name, size = 16 }) {
  const icons = {
    search: <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    plus:   <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    close:  <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    edit:   <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
    trash:  <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    user:   <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 13.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    empty:  <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="32" height="26" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M13 18h14M13 23h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    filter: <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 8h6M8 12h0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  }
  return icons[name] || null
}

// ── TOAST ──────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  return <div className={`toast ${type}`}>{msg}</div>
}

// ── ADD / EDIT MODAL ───────────────────────────────────────────────────────
function ProspectModal({ mode, initial, onSave, onClose }) {
  const blank = { name: '', stage: 'Prospecting', contacts: [{ name: '', email: '' }], notes: '', rejection_reason: '', list_status: '' }
  const [form, setForm] = useState(initial || blank)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setContact = (i, k, v) => {
    const c = [...form.contacts]
    c[i] = { ...c[i], [k]: v }
    setForm(f => ({ ...f, contacts: c }))
  }
  const addContact    = () => setForm(f => ({ ...f, contacts: [...f.contacts, { name: '', email: '' }] }))
  const removeContact = (i) => setForm(f => ({ ...f, contacts: f.contacts.filter((_, j) => j !== i) }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <div className="modal-title">{mode === 'add' ? 'Add new prospect' : 'Edit prospect'}</div>
            <div className="modal-sub">{mode === 'add' ? 'Enter dealer details below — contacts can be added later.' : form.name}</div>
          </div>
          <button className="btn-close" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="modal-body">
          {/* Dealer name */}
          <div className="field">
            <label>Dealer name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Al Futtaim Motors" />
          </div>

          {/* Stage */}
          <div className="field">
            <label>Stage</label>
            <select value={form.stage} onChange={e => set('stage', e.target.value)}>
              {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* Rejection reason — only show when rejected */}
          {form.stage === 'Closed - Rejected' && (
            <div className="field">
              <label>Rejection reason / comments</label>
              <textarea
                value={form.rejection_reason || ''}
                onChange={e => set('rejection_reason', e.target.value)}
                placeholder="Reason for rejection, feedback, or follow-up notes…"
                rows={3}
              />
            </div>
          )}

          {/* Contacts */}
          <div className="field">
            <div className="contacts-header">
              <label>Contacts</label>
              <button className="btn btn-secondary btn-sm" onClick={addContact}>
                <Icon name="plus" size={12} /> Add contact
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              {form.contacts.map((c, i) => (
                <div className="contact-entry" key={i}>
                  <div className="contact-entry-row">
                    <input
                      value={c.name}
                      onChange={e => setContact(i, 'name', e.target.value)}
                      placeholder="Contact name"
                    />
                    <input
                      value={c.email}
                      onChange={e => setContact(i, 'email', e.target.value)}
                      placeholder="Email address"
                      type="email"
                    />
                    {form.contacts.length > 1 && (
                      <button className="btn btn-ghost btn-sm" onClick={() => removeContact(i)} style={{ color: '#F04438', padding: '0 8px' }}>
                        <Icon name="trash" size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <span className="field-hint">Contact details can be filled in later by any team member.</span>
          </div>

          {/* Notes */}
          <div className="field">
            <label>Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any relevant context, HubSpot flags, overdue history…"
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? 'Saving…' : mode === 'add' ? 'Add prospect' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── DELETE CONFIRM ─────────────────────────────────────────────────────────
function DeleteModal({ name, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Remove prospect?</div>
            <div className="modal-sub">This cannot be undone.</div>
          </div>
          <button className="btn-close" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: 'var(--c-text-secondary)' }}>
            Are you sure you want to remove <strong style={{ color: 'var(--c-text-primary)' }}>{name}</strong> from the tracker?
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Remove</button>
        </div>
      </div>
    </div>
  )
}

// ── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [prospects, setProspects]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [modal, setModal]             = useState(null)  // { type: 'add'|'edit'|'delete', data? }
  const [toast, setToast]             = useState(null)
  const [seeded, setSeeded]           = useState(false)
  const toastRef = useRef(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
  }, [])

  // ── Load data ────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) {
      showToast('Failed to load data — check Supabase connection.', 'error')
    } else {
      setProspects(data || [])
      if ((data || []).length > 0) setSeeded(true)
    }
    setLoading(false)
  }, [showToast])

  useEffect(() => { load() }, [load])

  // ── Seed initial dealers ─────────────────────────────────────────────────
  const seed = useCallback(async () => {
    const rows = INITIAL_DEALERS.map(d => ({
      name:             d.name,
      stage:            'Prospecting',
      contacts:         [],
      notes:            '',
      rejection_reason: '',
      list_status:      d.list_status,
    }))
    const { error } = await supabase.from('prospects').insert(rows)
    if (error) {
      showToast('Seed failed: ' + error.message, 'error')
    } else {
      showToast('34 dealers loaded successfully!', 'success')
      setSeeded(true)
      await load()
    }
  }, [load, showToast])

  // ── Add ──────────────────────────────────────────────────────────────────
  const handleAdd = useCallback(async (form) => {
    const { error } = await supabase.from('prospects').insert([{
      name:             form.name.trim(),
      stage:            form.stage,
      contacts:         form.contacts.filter(c => c.name || c.email),
      notes:            form.notes,
      rejection_reason: form.stage === 'Closed - Rejected' ? form.rejection_reason : '',
      list_status:      '',
    }])
    if (error) { showToast('Error saving: ' + error.message, 'error') }
    else { showToast('Prospect added.'); setModal(null); await load() }
  }, [load, showToast])

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = useCallback(async (form) => {
    const { error } = await supabase.from('prospects').update({
      name:             form.name.trim(),
      stage:            form.stage,
      contacts:         form.contacts.filter(c => c.name || c.email),
      notes:            form.notes,
      rejection_reason: form.stage === 'Closed - Rejected' ? form.rejection_reason : '',
    }).eq('id', modal.data.id)
    if (error) { showToast('Error saving: ' + error.message, 'error') }
    else { showToast('Changes saved.'); setModal(null); await load() }
  }, [modal, load, showToast])

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    const { error } = await supabase.from('prospects').delete().eq('id', modal.data.id)
    if (error) { showToast('Error deleting: ' + error.message, 'error') }
    else { showToast('Prospect removed.'); setModal(null); await load() }
  }, [modal, load, showToast])

  // ── Filter / search ──────────────────────────────────────────────────────
  const filtered = prospects.filter(p => {
    const matchStage = stageFilter === 'all' || p.stage === stageFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      (p.contacts || []).some(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)) ||
      (p.notes || '').toLowerCase().includes(q)
    return matchStage && matchSearch
  })

  // ── Stage counts ─────────────────────────────────────────────────────────
  const counts = {}
  STAGES.forEach(s => { counts[s.id] = prospects.filter(p => p.stage === s.id).length })

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">DC</div>
          <div>
            <div className="header-title">Dealer Finance Tracker</div>
            <div className="header-sub">Dubicars × Finance Partner Pipeline</div>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary btn-sm" onClick={load}>
            Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
            <Icon name="plus" /> Add prospect
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="main">

        {/* Seed banner */}
        {!loading && !seeded && (
          <div style={{
            background: '#FFFAEB', border: '1px solid #FEC84B',
            borderRadius: 'var(--radius-md)', padding: '14px 20px',
            marginBottom: 20, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16
          }}>
            <div>
              <strong style={{ color: '#B54708' }}>No prospects yet.</strong>
              <span style={{ color: '#92400E', marginLeft: 8, fontSize: 13 }}>
                Load the 34 restricted dealers from the Eid Holiday visit list to get started.
              </span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={seed}>Load 34 dealers</button>
          </div>
        )}

        {/* Stage stat cards */}
        <div className="stats-row">
          <div
            className={`stat-card${stageFilter === 'all' ? ' active' : ''}`}
            onClick={() => setStageFilter('all')}
          >
            <div className="stat-count" style={{ color: 'var(--c-text-primary)' }}>{prospects.length}</div>
            <div className="stat-label">All Prospects</div>
          </div>
          {STAGES.map(s => (
            <div
              key={s.id}
              className={`stat-card${stageFilter === s.id ? ' active' : ''}`}
              onClick={() => setStageFilter(stageFilter === s.id ? 'all' : s.id)}
            >
              <div>
                <span className="stat-pill" style={{ background: s.bg, color: s.color }}>
                  <span className="stage-dot" style={{ background: s.dot, display: 'inline-block', marginRight: 4, verticalAlign: 'middle' }} />
                  {s.label}
                </span>
              </div>
              <div className="stat-count" style={{ color: s.color }}>{counts[s.id] || 0}</div>
              <div className="stat-label">Deals</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon"><Icon name="search" /></span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by dealer name, contact, or notes…"
            />
          </div>
          {stageFilter !== 'all' && (
            <button className="btn btn-secondary btn-sm" onClick={() => setStageFilter('all')}>
              <Icon name="close" size={12} /> Clear filter
            </button>
          )}
        </div>

        {/* Table */}
        <div className="table-wrap">
          <div className="table-header-row">
            <span className="table-count">
              Showing <strong>{filtered.length}</strong> of <strong>{prospects.length}</strong> prospects
            </span>
          </div>

          {loading ? (
            <div className="loading-wrap">
              <div className="spinner" />
              <span>Loading prospects…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Icon name="empty" size={40} />
              <h3>{search || stageFilter !== 'all' ? 'No matches found' : 'No prospects yet'}</h3>
              <p>{search || stageFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Add your first prospect or load the dealer list.'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Dealer name</th>
                  <th>Stage</th>
                  <th>Contacts</th>
                  <th>Notes</th>
                  <th>Updated</th>
                  <th style={{ width: 100 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const contacts = (p.contacts || []).filter(c => c.name || c.email)
                  const updated = p.updated_at
                    ? new Date(p.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
                    : '—'
                  return (
                    <tr key={p.id}>
                      <td className="td-num">{i + 1}</td>
                      <td className="td-name">
                        {p.name}
                        {p.list_status === 'new'     && <span className="new-badge">NEW</span>}
                        {p.list_status === 'visited' && <span className="visited-badge">VISITED</span>}
                      </td>
                      <td>
                        <div>
                          <StagePill stageId={p.stage} />
                          {p.stage === 'Closed - Rejected' && p.rejection_reason && (
                            <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 4, fontStyle: 'italic', maxWidth: 160 }}>
                              {p.rejection_reason.slice(0, 60)}{p.rejection_reason.length > 60 ? '…' : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="td-contacts">
                        {contacts.length === 0 ? (
                          <span style={{ color: 'var(--c-text-muted)', fontStyle: 'italic' }}>No contacts yet</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {contacts.map((c, ci) => (
                              <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Icon name="user" size={11} />
                                <span style={{ fontWeight: 500 }}>{c.name || '—'}</span>
                                {c.email && <span style={{ color: 'var(--c-text-muted)' }}>· {c.email}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="td-notes">
                        {p.notes || <span style={{ color: 'var(--c-text-muted)', fontStyle: 'italic' }}>—</span>}
                      </td>
                      <td style={{ color: 'var(--c-text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{updated}</td>
                      <td className="td-actions">
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Edit"
                            onClick={() => setModal({ type: 'edit', data: { ...p, contacts: (p.contacts || []).length ? p.contacts : [{ name: '', email: '' }] } })}
                          >
                            <Icon name="edit" size={13} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Remove"
                            onClick={() => setModal({ type: 'delete', data: p })}
                            style={{ color: '#F04438' }}
                          >
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 20, fontSize: 12, color: 'var(--c-text-muted)', textAlign: 'center' }}>
          Dubicars Finance Tracker · {new Date().getFullYear()} · Data stored in Supabase · Changes sync in real time
        </div>
      </main>

      {/* MODALS */}
      {modal?.type === 'add' && (
        <ProspectModal mode="add" onSave={handleAdd} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit' && (
        <ProspectModal mode="edit" initial={modal.data} onSave={handleEdit} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal name={modal.data.name} onConfirm={handleDelete} onClose={() => setModal(null)} />
      )}

      {/* TOAST */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </>
  )
}
