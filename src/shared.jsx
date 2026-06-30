// ── STAGE DEFINITIONS ────────────────────────────────────────────────────────
export const STAGES = [
  { id: 'Prospecting',             label: 'Prospecting',             bg: 'var(--s-prospecting)', color: 'var(--s-prospecting-t)', dot: '#98A2B3' },
  { id: 'Meeting',                 label: 'Meeting',                  bg: 'var(--s-meeting)',     color: 'var(--s-meeting-t)',     dot: '#1849A9' },
  { id: 'Finance Agreed',          label: 'Finance Agreed',           bg: 'var(--s-finance)',     color: 'var(--s-finance-t)',     dot: '#F79009' },
  { id: 'Document Checking',       label: 'Document Checking',        bg: 'var(--s-docs)',        color: 'var(--s-docs-t)',        dot: '#0BA5EC' },
  { id: 'Finance Partner Review',  label: 'Finance Partner Review',   bg: 'var(--s-partner)',     color: 'var(--s-partner-t)',     dot: '#9E77ED' },
  { id: 'Paused',                  label: 'Paused',                   bg: 'var(--s-paused)',      color: 'var(--s-paused-t)',      dot: '#C4320A' },
  { id: 'Closed - Accepted',       label: 'Closed — Accepted',        bg: 'var(--s-accepted)',    color: 'var(--s-accepted-t)',    dot: '#12B76A' },
  { id: 'Closed - Rejected',       label: 'Closed — Rejected',        bg: 'var(--s-rejected)',    color: 'var(--s-rejected-t)',    dot: '#F04438' },
]

export const INITIAL_DEALERS = [
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

export const getStage = (id) => STAGES.find(s => s.id === id) || STAGES[0]

export function StagePill({ stageId }) {
  const s = getStage(stageId)
  return (
    <span className="stage-pill" style={{ background: s.bg, color: s.color }}>
      <span className="stage-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  )
}

// ── ICONS ─────────────────────────────────────────────────────────────────
export function Icon({ name, size = 16 }) {
  const icons = {
    search: <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    plus:   <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    close:  <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    edit:   <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
    trash:  <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    user:   <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 13.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    empty:  <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="32" height="26" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M13 18h14M13 23h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    filter: <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 8h6M8 12h0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    car:    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M2 10.5l1-4a2 2 0 0 1 1.9-1.5h6.2A2 2 0 0 1 13 6.5l1 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><rect x="1.5" y="10.5" width="13" height="3" rx="1" stroke="currentColor" strokeWidth="1.3"/><circle cx="4.5" cy="13.5" r="1" stroke="currentColor" strokeWidth="1.2"/><circle cx="11.5" cy="13.5" r="1" stroke="currentColor" strokeWidth="1.2"/></svg>,
    chart:  <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M2 14V2M2 14h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M4.5 11.5v-3M8 11.5v-6M11.5 11.5v-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
    lock:   <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><rect x="3.5" y="7" width="9" height="6.5" rx="1.3" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3"/></svg>,
    list:   <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M5.5 4.5h8M5.5 8h8M5.5 11.5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="2.3" cy="4.5" r=".9" fill="currentColor"/><circle cx="2.3" cy="8" r=".9" fill="currentColor"/><circle cx="2.3" cy="11.5" r=".9" fill="currentColor"/></svg>,
  }
  return icons[name] || null
}

// ── TOAST ─────────────────────────────────────────────────────────────────
import { useEffect } from 'react'
export function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  return <div className={`toast ${type}`}>{msg}</div>
}

// ── DELETE CONFIRM ──────────────────────────────────────────────────────────
export function DeleteModal({ title = 'Remove item?', name, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{title}</div>
            <div className="modal-sub">This cannot be undone.</div>
          </div>
          <button className="btn-close" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: 'var(--c-text-secondary)' }}>
            Are you sure you want to remove <strong style={{ color: 'var(--c-text-primary)' }}>{name}</strong>?
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
