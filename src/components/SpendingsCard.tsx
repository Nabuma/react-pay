import { memo } from 'react'
import { ChevronRight, TrendingDown, TrendingUp } from 'lucide-react'
import { formatMoney } from '../lib/currency'
import { formatMonth, getPreviousMonth } from '../lib/dates'
import { getTrend, type Trend } from '../lib/spendings'
import type { MonthlySpending } from '../types'
import './SpendingsCard.css'

function TrendBadge({ trend }: { trend: Exclude<Trend, null> }) {
  const Icon = trend === 'up' ? TrendingUp : TrendingDown

  return (
    <span className={`badge badge-${trend}`}>
      <Icon aria-hidden size={14} />
      {trend === 'up' ? 'Up' : 'Down'}
      <span className="sr-only"> compared to previous month</span>
    </span>
  )
}

type SpendingsCardProps = {
  monthlySpendings: readonly MonthlySpending[] | null
  error: string | null
  onViewAll: () => void
}

export const SpendingsCard = memo(function SpendingsCard({
  monthlySpendings,
  error,
  onViewAll
}: SpendingsCardProps) {
  const latest = monthlySpendings?.[0]
  const previous = latest
    ? monthlySpendings?.find(monthly => monthly.month === getPreviousMonth(latest.month))
    : undefined
  const trend = latest && previous ? getTrend(latest.total, previous.total) : null

  return (
    <section className="card">
      <h2 className="section-title">Spendings</h2>
      {monthlySpendings === null ? (
        error ? (
          <p className="muted">{error}</p>
        ) : (
          <span aria-busy className="skeleton spendings-skeleton" />
        )
      ) : latest ? (
        <div className="summary">
          <div className="row-main">
            <p className="muted">{formatMonth(latest.month)}</p>
            <p className="summary-amount">
              {formatMoney(latest.total)}
              {trend && <TrendBadge trend={trend} />}
            </p>
          </div>
          <button className="button" onClick={onViewAll}>
            View all
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <p className="muted">No spendings recorded.</p>
      )}
    </section>
  )
})
