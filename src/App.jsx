import { useState, useCallback } from 'react'
import { Icon, Toast } from './shared.jsx'
import ProspectsView from './ProspectsView.jsx'
import FinancialsView from './FinancialsView.jsx'

export default function App() {
  const [tab, setTab] = useState('prospects') // 'prospects' | 'financials'
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
  }, [])

  return (
    <>
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">DC</div>
          <div>
            <div className="header-title">Dealer Finance Tracker</div>
            <div className="header-sub">Dubicars × Finance Partner Pipeline</div>
          </div>
        </div>
        <div className="header-actions">
          <button
            className={`btn btn-sm ${tab === 'prospects' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('prospects')}
          >
            <Icon name="list" size={13} /> Prospects
          </button>
          <button
            className={`btn btn-sm ${tab === 'financials' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('financials')}
          >
            <Icon name="chart" size={13} /> Financial Summary
          </button>
        </div>
      </header>

      {tab === 'prospects' ? (
        <ProspectsView showToast={showToast} />
      ) : (
        <FinancialsView showToast={showToast} />
      )}

      <div style={{ marginTop: -10, marginBottom: 30, fontSize: 12, color: 'var(--c-text-muted)', textAlign: 'center' }}>
        Dubicars Finance Tracker · {new Date().getFullYear()} · Data stored in Supabase · Changes sync in real time
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  )
}
