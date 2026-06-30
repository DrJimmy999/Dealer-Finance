import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'
import { Icon, DeleteModal } from './shared.jsx'
import { monthlyRevenue, buildMonthlyLedger, fmtAED } from './finance.js'

// ── ADD / EDIT VEHICLE MODAL ─────────────────────────────────────────────────
function VehicleModal({ mode, prospects, initial, onSave, onClose }) {
  const blank = {
    prospect_id: prospects[0]?.id || '',
    vehicle_desc: '',
    finance_amount: '',
    finance_start: new Date().toISOString().slice(0, 10),
    finance_end: '',
  }
  const [form, setForm] = useState(initial || blank)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const projected = monthlyRevenue(form.finance_amount)

  const handleSave = async () => {
    if (!form.prospect_id || !form.finance_amount || !form.finance_start) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <div className="modal-title">{mode === 'add' ? 'Add financed vehicle' : 'Edit financed vehicle'}</div>
            <div className="modal-sub">Tracks an individual vehicle under finance for a closed-accepted dealer.</div>
          </div>
          <button className="btn-close" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label>Dealer *</label>
            <select value={form.prospect_id} onChange={e => set('prospect_id', e.target.value)}>
              {prospects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Vehicle description (optional)</label>
            <input
              value={form.vehicle_desc}
              onChange={e => set('vehicle_desc', e.target.value)}
              placeholder="e.g. 2022 Toyota Camry — plate A12345"
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Amount financed (AED) *</label>
              <input
                type="number"
                value={form.finance_amount}
                onChange={e => set('finance_amount', e.target.value)}
                placeholder="e.g. 65000"
              />
            </div>
            <div className="field">
              <label>Finance start date *</label>
              <input type="date" value={form.finance_start} onChange={e => set('finance_start', e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Finance end date</label>
            <input type="date" value={form.finance_end || ''} onChange={e => set('finance_end', e.target.value)} />
            <span className="field-hint">Leave blank while the finance is still active — monthly revenue keeps forecasting until an end date is set.</span>
          </div>

          {form.finance_amount > 0 && (
            <div style={{
              background: 'var(--c-accent-lt)', border: '1px solid var(--c-accent-md)',
              borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13
            }}>
              Forecast monthly revenue: <strong style={{ color: 'var(--c-accent)' }}>{fmtAED(projected)}</strong>
              <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 2 }}>
                ({fmtAED(form.finance_amount)} × 18% × 20% ÷ 12)
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.prospect_id || !form.finance_amount || !form.finance_start}>
            {saving ? 'Saving…' : mode === 'add' ? 'Add vehicle' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MAIN FINANCIALS VIEW ─────────────────────────────────────────────────────
export default function FinancialsView({ showToast }) {
  const [subTab, setSubTab] = useState('summary') // 'summary' | 'vehicles'
  const [vehicles, setVehicles] = useState([])
  const [acceptedProspects, setAcceptedProspects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: prospectsData }, { data: vehiclesData }] = await Promise.all([
      supabase.from('prospects').select('id, name, stage').eq('stage', 'Closed - Accepted').order('name'),
      supabase.from('financed_vehicles').select('*').order('finance_start', { ascending: false }),
    ])
    setAcceptedProspects(prospectsData || [])
    setVehicles(vehiclesData || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const prospectName = (id) => acceptedProspects.find(p => p.id === id)?.name || vehicles.find(v=>v.prospect_id===id)?._dealerName || '—'

  const handleAdd = async (form) => {
    const { error } = await supabase.from('financed_vehicles').insert([{
      prospect_id: form.prospect_id,
      vehicle_desc: form.vehicle_desc.trim(),
      finance_amount: Number(form.finance_amount),
      finance_start: form.finance_start,
      finance_end: form.finance_end || null,
    }])
    if (error) { showToast('Error: ' + error.message, 'error') }
    else { showToast('Vehicle added.'); setModal(null); await load() }
  }

  const handleEdit = async (form) => {
    const { error } = await supabase.from('financed_vehicles').update({
      prospect_id: form.prospect_id,
      vehicle_desc: form.vehicle_desc.trim(),
      finance_amount: Number(form.finance_amount),
      finance_start: form.finance_start,
      finance_end: form.finance_end || null,
    }).eq('id', modal.data.id)
    if (error) { showToast('Error: ' + error.message, 'error') }
    else { showToast('Changes saved.'); setModal(null); await load() }
  }

  const handleDelete = async () => {
    const { error } = await supabase.from('financed_vehicles').delete().eq('id', modal.data.id)
    if (error) { showToast('Error: ' + error.message, 'error') }
    else { showToast('Vehicle removed.'); setModal(null); await load() }
  }

  // ── Calculations ───────────────────────────────────────────────────────
  const ledger = buildMonthlyLedger(vehicles)
  const activeCount = vehicles.filter(v => !v.finance_end).length
  const totalFinanced = vehicles.reduce((sum, v) => sum + (Number(v.finance_amount) || 0), 0)
  const currentMonthKey = new Date().toISOString().slice(0, 7)
  const currentMonthRevenue = ledger.find(l => l.key === currentMonthKey)?.total || 0
  const lifetimeRevenue = ledger.reduce((sum, l) => sum + l.total, 0)
  const maxLedgerVal = Math.max(...ledger.map(l => l.total), 1)

  return (
    <main className="main">
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        <button
          className={`btn btn-sm ${subTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSubTab('summary')}
        >
          <Icon name="chart" size={13} /> Revenue Summary
        </button>
        <button
          className={`btn btn-sm ${subTab === 'vehicles' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSubTab('vehicles')}
        >
          <Icon name="car" size={13} /> Financed Vehicles
        </button>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /><span>Loading financial data…</span></div>
      ) : subTab === 'summary' ? (
        <>
          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
            <KpiCard label="Active vehicles" value={activeCount} sub={`${vehicles.length} total ever financed`} />
            <KpiCard label="Total amount financed" value={fmtAED(totalFinanced)} sub="Across all vehicles" />
            <KpiCard label="This month's revenue" value={fmtAED(currentMonthRevenue)} sub={new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} accent />
            <KpiCard label="Lifetime revenue" value={fmtAED(lifetimeRevenue)} sub="Sum of all monthly forecasts" />
          </div>

          {/* Monthly chart */}
          <div className="table-wrap" style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Monthly revenue forecast</div>
            <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 20 }}>
              Based on (amount financed × 18% × 20%) ÷ 12 per active vehicle, summed by month. Past months remain in the total even after a vehicle's finance ends, for ROI tracking.
            </div>

            {ledger.length === 0 ? (
              <div className="empty-state">
                <Icon name="chart" size={40} />
                <h3>No financed vehicles yet</h3>
                <p>Add vehicles in the "Financed Vehicles" tab to see revenue forecasts here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 220, overflowX: 'auto', paddingBottom: 8 }}>
                {ledger.map(l => (
                  <div key={l.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56, height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-accent)', marginBottom: 4 }}>
                      {fmtAED(l.total)}
                    </div>
                    <div
                      title={`${l.label}: ${fmtAED(l.total)} across ${l.count} vehicle-month(s)`}
                      style={{
                        width: 32,
                        height: `${Math.max((l.total / maxLedgerVal) * 150, 4)}px`,
                        background: 'linear-gradient(180deg, var(--c-accent) 0%, #cc2c14 100%)',
                        borderRadius: '6px 6px 2px 2px',
                      }}
                    />
                    <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 8, whiteSpace: 'nowrap' }}>{l.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Vehicles list */}
          <div className="toolbar">
            <div style={{ flex: 1, fontSize: 13, color: 'var(--c-text-secondary)' }}>
              {acceptedProspects.length === 0 ? (
                <span style={{ color: '#B54708' }}>No dealers are marked "Closed — Accepted" yet — mark a dealer as accepted in the Prospects tab before adding vehicles.</span>
              ) : (
                <span>{vehicles.length} vehicle(s) tracked across {acceptedProspects.length} accepted dealer(s)</span>
              )}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setModal({ type: 'add' })}
              disabled={acceptedProspects.length === 0}
            >
              <Icon name="plus" /> Add vehicle
            </button>
          </div>

          <div className="table-wrap">
            {vehicles.length === 0 ? (
              <div className="empty-state">
                <Icon name="car" size={40} />
                <h3>No financed vehicles yet</h3>
                <p>Add the first vehicle for an accepted dealer to start tracking revenue.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Dealer</th>
                    <th>Vehicle</th>
                    <th>Amount financed</th>
                    <th>Start date</th>
                    <th>End date</th>
                    <th>Monthly revenue</th>
                    <th>Status</th>
                    <th style={{ width: 90 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(v => {
                    const dealer = acceptedProspects.find(p => p.id === v.prospect_id)
                    const rev = monthlyRevenue(v.finance_amount)
                    const active = !v.finance_end
                    return (
                      <tr key={v.id}>
                        <td className="td-name">{dealer?.name || <span style={{ color: 'var(--c-text-muted)', fontStyle: 'italic' }}>Dealer no longer accepted</span>}</td>
                        <td style={{ color: 'var(--c-text-secondary)' }}>{v.vehicle_desc || '—'}</td>
                        <td>{fmtAED(v.finance_amount)}</td>
                        <td>{new Date(v.finance_start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                        <td>{v.finance_end ? new Date(v.finance_end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : <span style={{ color: 'var(--c-text-muted)' }}>—</span>}</td>
                        <td style={{ fontWeight: 600, color: 'var(--c-accent)' }}>{fmtAED(rev)}</td>
                        <td>
                          <span className="stage-pill" style={{
                            background: active ? 'var(--s-accepted)' : 'var(--s-prospecting)',
                            color: active ? 'var(--s-accepted-t)' : 'var(--s-prospecting-t)'
                          }}>
                            <span className="stage-dot" style={{ background: active ? '#12B76A' : '#98A2B3' }} />
                            {active ? 'Active' : 'Ended'}
                          </span>
                        </td>
                        <td className="td-actions">
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'edit', data: v })}>
                              <Icon name="edit" size={13} />
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'delete', data: v })} style={{ color: '#F04438' }}>
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
        </>
      )}

      {modal?.type === 'add' && (
        <VehicleModal mode="add" prospects={acceptedProspects} onSave={handleAdd} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit' && (
        <VehicleModal mode="edit" prospects={acceptedProspects.length ? acceptedProspects : [{ id: modal.data.prospect_id, name: prospectName(modal.data.prospect_id) }]} initial={modal.data} onSave={handleEdit} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal title="Remove financed vehicle?" name={modal.data.vehicle_desc || 'this vehicle'} onConfirm={handleDelete} onClose={() => setModal(null)} />
      )}
    </main>
  )
}

function KpiCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={{ cursor: 'default' }}>
      <div className="stat-label" style={{ marginBottom: 8 }}>{label}</div>
      <div className="stat-count" style={{ fontSize: 22, color: accent ? 'var(--c-accent)' : 'var(--c-text-primary)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 4 }}>{sub}</div>
    </div>
  )
}
