import { useMemo, useState, type CSSProperties } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CATEGORIES } from '../../lib/categories'
import { formatMoney } from '../../lib/currency'
import { formatMonth, formatMonthYear } from '../../lib/dates'
import { categoryTotals, recentMonthTotals } from '../../lib/insights'
import { getTrend } from '../../lib/spendings'
import type { MonthlySpending } from '../../types'
import './InsightsTab.css'

type InsightsTabProps = {
  monthlySpendings: readonly MonthlySpending[] | null
  error: string | null
}

function Donut({ segments }: { segments: ReturnType<typeof categoryTotals> }) {
  const offsets = segments.map((_, index) =>
    25 - segments.slice(0, index).reduce((sum, segment) => sum + segment.share * 100, 0)
  )

  return (
    <svg aria-hidden className="donut" viewBox="0 0 42 42">
      <circle className="donut-track" cx="21" cy="21" fill="none" r="15.9155" strokeWidth="5" />
      {segments.map((segment, index) => {
        const length = Math.max(segment.share * 100 - 0.6, 0)

        return (
          <circle
            cx="21"
            cy="21"
            fill="none"
            key={segment.category}
            r="15.9155"
            stroke={CATEGORIES[segment.category].color}
            strokeDasharray={`${length} ${100 - length}`}
            strokeDashoffset={offsets[index]}
            strokeWidth="5"
          />
        )
      })}
    </svg>
  )
}

export function InsightsTab({ monthlySpendings, error }: InsightsTabProps) {
  const [index, setIndex] = useState(0)

  const months = useMemo(() => monthlySpendings ?? [], [monthlySpendings])
  const current = months[Math.min(index, Math.max(months.length - 1, 0))]
  const previous = current ? months[months.indexOf(current) + 1] : undefined

  const categories = useMemo(() => (current ? categoryTotals(current.transactions) : []), [current])
  const bars = useMemo(() => recentMonthTotals(months), [months])
  const maxBar = Math.max(...bars.map(bar => bar.total), 1)

  if (monthlySpendings === null) {
    return error
      ? <p className="card muted" role="alert">{error}</p>
      : <div aria-busy className="card"><span className="skeleton" style={{ height: '12rem' }} /></div>
  }

  if (!current) return <p className="card empty-note">Spending insights will appear once you have transactions.</p>

  const trend = previous ? getTrend(current.total, previous.total) : null
  const change = previous && previous.total > 0 ? ((current.total - previous.total) / previous.total) * 100 : null
  const top = categories[0]
  const position = months.indexOf(current)

  return (
    <div className="tab-panel">
      <div className="card insights-month">
        <button
          aria-label="Previous month"
          className="icon-button"
          disabled={position >= months.length - 1}
          onClick={() => setIndex(position + 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="section-title" aria-live="polite">{formatMonthYear(current.month)}</h2>
        <button
          aria-label="Next month"
          className="icon-button"
          disabled={position === 0}
          onClick={() => setIndex(position - 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <p>Total spent</p>
          <p>{formatMoney(current.total)}</p>
          <p>{current.transactions.length} transactions</p>
        </div>
        <div className="stat">
          <p>Vs previous month</p>
          <p className={trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : undefined}>
            {change === null ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(0)}%`}
          </p>
          <p>{previous ? formatMoney(previous.total) : 'No earlier data'}</p>
        </div>
        <div className="stat">
          <p>Top category</p>
          <p>{top ? CATEGORIES[top.category].label : '—'}</p>
          <p>{top ? `${formatMoney(top.total)} · ${Math.round(top.share * 100)}%` : ''}</p>
        </div>
        <div className="stat">
          <p>Average transaction</p>
          <p>{formatMoney(current.total / current.transactions.length)}</p>
          <p>Converted to EUR</p>
        </div>
      </div>

      <div className="split-grid">
        <section className="card">
          <h3 className="section-title">By category</h3>
          <div className="insights-donut">
            <div className="donut-wrap">
              <Donut segments={categories} />
              <div className="donut-center">
                <p>{formatMoney(current.total)}</p>
                <p className="muted">{formatMonth(current.month)}</p>
              </div>
            </div>
            <ul className="legend">
              {categories.map(segment => {
                const category = CATEGORIES[segment.category]
                return (
                  <li key={segment.category}>
                    <span aria-hidden className="legend-dot" style={{ background: category.color }} />
                    <span className="legend-name">{category.label}</span>
                    <span className="legend-value">{formatMoney(segment.total)}</span>
                    <span className="legend-share muted">{Math.round(segment.share * 100)}%</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <section className="card">
          <h3 className="section-title">Last {bars.length} months</h3>
          <ul className="bars">
            {bars.map(bar => (
              <li
                className={bar.month === current.month ? 'bar bar-active' : 'bar'}
                key={bar.month}
                style={{ '--height': bar.total / maxBar } as CSSProperties}
              >
                <span className="bar-value">{formatMoney(bar.total)}</span>
                <span className="bar-fill" />
                <span className="bar-label">{formatMonth(bar.month)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
