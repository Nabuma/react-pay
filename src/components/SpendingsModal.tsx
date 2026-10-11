import {
  ArrowLeftRight,
  BookOpen,
  Bus,
  Coffee,
  Home,
  Music2,
  Pill,
  Plane,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  Utensils,
  Zap
} from 'lucide-react'
import { TOTAL_CURRENCY, formatMoney } from '../lib/currency'
import { formatDay, formatMonthYear } from '../lib/dates'
import type { MonthlySpending } from '../types'
import { Modal } from './Modal'
import { ArrowDownLeft, CalendarDays } from 'lucide-react'
import './SpendingsModal.css'

type SpendingsModalProps = {
  monthlySpendings: readonly MonthlySpending[] | null
  error: string | null
  onClose: () => void
}

function getSpendingIcon(description: string) {
  const category = description.toLowerCase()

  if (category.includes('rent')) return Home
  if (category.includes('grocer')) return ShoppingCart
  if (category.includes('travel') || category.includes('trip') || category.includes('train')) return Plane
  if (category.includes('transport')) return Bus
  if (category.includes('restaurant') || category.includes('dining')) return Utensils
  if (category.includes('coffee')) return Coffee
  if (category.includes('shopping') || category.includes('electronics') || category.includes('decor')) {
    return ShoppingBag
  }
  if (category.includes('utilit')) return Zap
  if (category.includes('book')) return BookOpen
  if (category.includes('pharmacy')) return Pill
  if (category.includes('concert')) return Music2
  if (category.includes('transfer')) return ArrowLeftRight
  return ReceiptText
}

export function SpendingsModal({ monthlySpendings, error, onClose }: SpendingsModalProps) {
  return (
    <Modal
      className="modal-spendings"
      closeLabel="Close spending activity"
      onClose={onClose}
      title="Spending activity"
    >
      {monthlySpendings === null ? (
        error ? (
          <p className="muted spending-state" role="alert">{error}</p>
        ) : (
          <div aria-busy className="skeleton-list">
            <span className="skeleton" />
            <span className="skeleton" />
            <span className="skeleton" />
          </div>
        )
      ) : monthlySpendings.length === 0 ? (
        <div className="spending-empty">
          <span aria-hidden className="spending-empty-icon"><ReceiptText size={22} /></span>
          <h3>No spending activity yet</h3>
          <p className="muted">Your transactions will appear here as they come in.</p>
        </div>
      ) : (
        <div className="spending-view">
          <section aria-label="Spending overview" className="spending-overview">
            <div className="spending-overview-icon">
              <ArrowDownLeft aria-hidden size={19} />
            </div>
            <div className="spending-overview-copy">
              <p className="spending-overview-label">Total recorded spending</p>
              <p className="spending-overview-total">
                {formatMoney(monthlySpendings.reduce((total, month) => total + month.total, 0))}
              </p>
            </div>
            <div className="spending-overview-count">
              <span>{monthlySpendings.reduce((total, month) => total + month.transactions.length, 0)}</span>
              <span>transactions</span>
            </div>
          </section>

          <div className="spending-history-heading">
            <div>
              <h3>Recent activity</h3>
              <p className="muted">Grouped by month · converted to {TOTAL_CURRENCY}</p>
            </div>
            <CalendarDays aria-hidden className="spending-calendar-icon" size={18} />
          </div>

          <div className="spending-months">
            {monthlySpendings.map(monthly => (
              <section className="spending-month" key={monthly.month}>
                <header className="month-header">
                  <div>
                    <h4>{formatMonthYear(monthly.month)}</h4>
                    <p>{monthly.transactions.length} {monthly.transactions.length === 1 ? 'transaction' : 'transactions'}</p>
                  </div>
                  <p className="month-total">{formatMoney(monthly.total)}</p>
                </header>
                <ul className="spending-transactions">
                  {monthly.transactions.map(spending => {
                    const Icon = getSpendingIcon(spending.description)

                    return (
                      <li className="transaction" key={spending.id}>
                        <span aria-hidden className="transaction-icon">
                          <Icon size={17} />
                        </span>
                        <div className="transaction-main">
                          <h5>{spending.description}</h5>
                          <p>{formatDay(spending.date)}</p>
                        </div>
                        <div className="amounts">
                          <p>{formatMoney(spending.amount, spending.currency)}</p>
                          {spending.currency !== TOTAL_CURRENCY && (
                            <p className="muted">{formatMoney(spending.totalInEuros)}</p>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
