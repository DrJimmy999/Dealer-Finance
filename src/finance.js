// Revenue formula: Monthly forecast = (Amount Financed × 18%) × 20% / 12
const INTEREST_RATE = 0.18
const DUBICARS_SHARE = 0.20

export function monthlyRevenue(amountFinanced) {
  return (Number(amountFinanced) || 0) * INTEREST_RATE * DUBICARS_SHARE / 12
}

// Returns array of { year, month, label } between start (inclusive) and end (inclusive)
// If end is null, extends to current month.
export function monthsBetween(startDate, endDate) {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()
  const months = []
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1)
  const last = new Date(end.getFullYear(), end.getMonth(), 1)
  while (cursor <= last) {
    months.push({
      year: cursor.getFullYear(),
      month: cursor.getMonth(),
      label: cursor.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      key: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
    })
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  }
  return months
}

// Builds a monthly revenue ledger across all vehicles.
// Each vehicle contributes its monthly revenue figure for every
// month from finance_start through finance_end (or to current
// month if still active) — historical months stay in the total
// even after a vehicle's finance has ended, so ROI can be tracked
// over time.
export function buildMonthlyLedger(vehicles) {
  const ledger = {} // key: 'YYYY-MM' -> { label, total, count }

  vehicles.forEach(v => {
    if (!v.finance_start) return
    const rev = monthlyRevenue(v.finance_amount)
    const months = monthsBetween(v.finance_start, v.finance_end)
    months.forEach(m => {
      if (!ledger[m.key]) ledger[m.key] = { key: m.key, label: m.label, total: 0, count: 0 }
      ledger[m.key].total += rev
      ledger[m.key].count += 1
    })
  })

  return Object.values(ledger).sort((a, b) => a.key.localeCompare(b.key))
}

export function fmtAED(n) {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(n || 0)
}
