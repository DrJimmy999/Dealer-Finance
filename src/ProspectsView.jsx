import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'
import { STAGES, INITIAL_DEALERS, Icon, StagePill, DeleteModal } from './shared.jsx'
import NotesPanel from './NotesPanel.jsx'

// ── ADD / EDIT MODAL ─────────────────────────────────────────────────────────
function ProspectModal({ mode, initial, onSave, onClose, showToast }) {
  const blank = { name: '', stage: 'Prospecting', contacts: [{ name: '', email: '' }], rejection_reason: '', list_status: '' }
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
      <div className="modal" style={{ maxWidth: 640 }}>
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

          {/* Dated notes — only available once the prospect already exists */}
          {mode === 'edit' && initial?.id && (
            <div className="field">
              <label>Notes (dated history)</label>
              <NotesPanel prospectId={initial.id} showToast={showToast} />
            </div>
          )}
          {mode === 'add' && (
            <span className="field-hint">You'll be able to add dated notes once this prospect is created.</span>
          )}
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

// ── MAIN PROSPECTS VIEW ───────────────────────────────────────────────────────
export default function ProspectsView({ showToast }) {
  const [prospects, setProspects]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [modal, setModal]             = useState(null)
  const [seeded, setSeeded]           = useState(false)

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

  const seed = useCallback(async () => {
    const rows = INITIAL_DEALERS.map(d => ({
      name:             d.name,
      stage:            'Prospecting',
      contacts:         [],
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

  const handleAdd = useCallback(async (form) => {
    const { error } = await supabase.from('prospects').insert([{
      name:             form.name.trim(),
      stage:            form.stage,
      contacts:         form.contacts.filter(c => c.name || c.email),
      rejection_reason: form.stage === 'Closed - Rejected' ? form.rejection_reason : '',
      list_status:      '',
    }])
    if (error) { showToast('Error saving: ' + error.message, 'error') }
    else { showToast('Prospect added.'); setModal(null); await load() }
  }, [load, showToast])

  const handleEdit = useCallback(async (form) => {
    const { error } = await supabase.from('prospects').update({
      name:             form.name.trim(),
      stage:            form.stage,
      contacts:         form.contacts.filter(c => c.name || c.email),
      rejection_reason: form.stage === 'Closed - Rejected' ? form.rejection_reason : '',
    }).eq('id', modal.data.id)
    if (error) { showToast('Error saving: ' + error.message, 'error') }
    else { showToast('Changes saved.'); setModal(null); await load() }
  }, [modal, load, showToast])

  const handleDelete = useCallback(async () => {
    const { error } = await supabase.from('prospects').delete().eq('id', modal.data.id)
    if (error) { showToast('Error deleting: ' + error.message, 'error') }
    else { showToast('Prospect removed.'); setModal(null); await load() }
  }, [modal, load, showToast])

  const filtered = prospects.filter(p => {
    const matchStage = stageFilter === 'all' || p.stage === stageFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      (p.contacts || []).some(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q))
    return matchStage && matchSearch
  })

  const counts = {}
  STAGES.forEach(s => { counts[s.id] = prospects.filter(p => p.stage === s.id).length })

  return (
    <main className="main">

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

      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon"><Icon name="search" /></span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by dealer name or contact…"
          />
        </div>
        {stageFilter !== 'all' && (
          <button className="btn btn-secondary btn-sm" onClick={() => setStageFilter('all')}>
            <Icon name="close" size={12} /> Clear filter
          </button>
        )}
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
          <Icon name="plus" /> Add prospect
        </button>
      </div>

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

      {modal?.type === 'add' && (
        <ProspectModal mode="add" onSave={handleAdd} onClose={() => setModal(null)} showToast={showToast} />
      )}
      {modal?.type === 'edit' && (
        <ProspectModal mode="edit" initial={modal.data} onSave={handleEdit} onClose={() => setModal(null)} showToast={showToast} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal title="Remove prospect?" name={modal.data.name} onConfirm={handleDelete} onClose={() => setModal(null)} />
      )}
    </main>
  )
}
