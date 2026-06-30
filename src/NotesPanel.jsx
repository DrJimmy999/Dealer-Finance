import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'
import { Icon } from './shared.jsx'

export default function NotesPanel({ prospectId, showToast }) {
  const [notes, setNotes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [newText, setNewText] = useState('')
  const [newDate, setNewText_date] = useState(() => new Date().toISOString().slice(0, 10))
  const [author, setAuthor]   = useState(() => localStorage.getItem('tracker_author') || '')
  const [saving, setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('prospect_notes')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('note_date', { ascending: false })
      .order('created_at', { ascending: false })
    if (!error) setNotes(data || [])
    setLoading(false)
  }, [prospectId])

  useEffect(() => { load() }, [load])

  const addNote = async () => {
    if (!newText.trim()) return
    setSaving(true)
    if (author) localStorage.setItem('tracker_author', author)
    const { error } = await supabase.from('prospect_notes').insert([{
      prospect_id: prospectId,
      note_date: newDate,
      note_text: newText.trim(),
      author: author.trim(),
    }])
    setSaving(false)
    if (error) {
      showToast?.('Error saving note: ' + error.message, 'error')
    } else {
      setNewText('')
      await load()
    }
  }

  // Group notes by date for clear chronological separation
  const grouped = notes.reduce((acc, n) => {
    const key = n.note_date
    if (!acc[key]) acc[key] = []
    acc[key].push(n)
    return acc
  }, {})
  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Add new note */}
      <div style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
        <div className="field-row" style={{ marginBottom: 10 }}>
          <div className="field">
            <label>Date</label>
            <input type="date" value={newDate} onChange={e => setNewText_date(e.target.value)} />
          </div>
          <div className="field">
            <label>Your name</label>
            <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="e.g. Capper" />
          </div>
        </div>
        <div className="field">
          <label>New note</label>
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Add an update for this date — e.g. call summary, meeting outcome, status change…"
            rows={2}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={addNote} disabled={saving || !newText.trim()}>
            <Icon name="plus" size={12} /> {saving ? 'Saving…' : 'Add note'}
          </button>
        </div>
      </div>

      {/* History */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: 'var(--c-text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
          <Icon name="lock" size={12} /> Note history (locked — append only)
        </div>

        {loading ? (
          <div style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>Loading history…</div>
        ) : dateKeys.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--c-text-muted)', fontStyle: 'italic' }}>No notes yet — add the first update above.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
            {dateKeys.map(dateKey => (
              <div key={dateKey}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: 'var(--c-text-primary)',
                  marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid var(--c-border)'
                }}>
                  {fmtDate(dateKey)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {grouped[dateKey].map(n => (
                    <div key={n.id} style={{
                      background: '#fff', border: '1px solid var(--c-border)',
                      borderRadius: 'var(--radius-sm)', padding: '8px 12px'
                    }}>
                      <div style={{ fontSize: 13, color: 'var(--c-text-primary)', whiteSpace: 'pre-wrap' }}>{n.note_text}</div>
                      {n.author && (
                        <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 4 }}>— {n.author}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
