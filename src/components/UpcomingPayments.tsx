import { CalendarClock } from 'lucide-react'
import { useBankContext } from '../hooks/useBankContext'
import { formatMoney } from '../lib/currency'
import { toDateKey } from '../lib/dates'
import { describeDue } from '../lib/schedule'

export function UpcomingPayments({ onManage }: { onManage: () => void }) {
  const { accounts, scheduled } = useBankContext()
  const today = toDateKey(new Date())
  const upcoming = scheduled
    .filter(payment => payment.active)
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
    .slice(0, 3)

  return (
    <section className="card">
      <div className="section-head">
        <h2 className="section-title">Upcoming payments</h2>
        <button className="button button-small" onClick={onManage}>Manage</button>
      </div>

      {upcoming.length === 0 ? (
        <p className="empty-note">Nothing scheduled.</p>
      ) : (
        <ul className="rows">
          {upcoming.map(payment => {
            const due = describeDue(payment.nextDate, today)
            const currency = accounts.find(account => account.id === payment.accountId)?.currency

            return (
              <li className="row" key={payment.id}>
                <span aria-hidden className="category-chip"><CalendarClock size={18} /></span>
                <div className="row-main">
                  <h3>{payment.payee}</h3>
                  <p>{formatMoney(payment.amount, currency)}</p>
                </div>
                <span className={`pill pill-${due.tone === 'later' ? 'muted' : due.tone}`}>{due.label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
