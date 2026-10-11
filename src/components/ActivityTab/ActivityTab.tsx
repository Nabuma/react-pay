import { memo, useDeferredValue, useMemo, type CSSProperties } from 'react'
import { Download, Printer, Search, X } from 'lucide-react'
import {
  EMPTY_FILTERS,
  filterTransactions,
  groupByMonth,
  hasActiveFilters,
  toCsv,
  type ActivityFilters
} from '../../lib/activity'
import { CATEGORIES, EXPENSE_CATEGORY_IDS, INCOME_CATEGORY_IDS, getCategoryId, isIncome } from '../../lib/categories'
import { TOTAL_CURRENCY, formatMoney } from '../../lib/currency'
import { formatDay, formatMonthYear } from '../../lib/dates'
import type { Account, CategoryId, ConvertedSpending } from '../../types'
import './ActivityTab.css'

type ActivityTabProps = {
  accounts: readonly Account[]
  transactions: readonly ConvertedSpending[] | null
  error: string | null
  filters: ActivityFilters
  onFiltersChange: (filters: ActivityFilters) => void
}

const TransactionRow = memo(function TransactionRow({
  transaction,
  accountName
}: {
  transaction: ConvertedSpending
  accountName?: string
}) {
  const category = CATEGORIES[getCategoryId(transaction)]
  const Icon = category.icon
  const income = isIncome(transaction)

  return (
    <li className={income ? 'row activity-row is-income' : 'row activity-row'}>
      <span aria-hidden className="category-chip" style={{ '--chip': category.color } as CSSProperties}>
        <Icon size={18} />
      </span>
      <div className="row-main">
        <h4>
          {transaction.description}
          {income && <span className="income-badge">Received</span>}
        </h4>
        <p>
          {formatDay(transaction.date)} · {category.label}
          {accountName ? ` · ${accountName}` : ''}
        </p>
      </div>
      <div className="amounts">
        <p>
          <span aria-hidden>{income ? '+' : '−'}</span>
          <span className="sr-only">{income ? 'Received ' : 'Spent '}</span>
          {formatMoney(transaction.amount, transaction.currency)}
        </p>
        {transaction.currency !== TOTAL_CURRENCY && (
          <p className="muted">{formatMoney(transaction.totalInEuros)}</p>
        )}
      </div>
    </li>
  )
})

function downloadCsv(content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `toss-activity-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function ActivityTab({ accounts, transactions, error, filters, onFiltersChange }: ActivityTabProps) {
  const accountNames = useMemo(
    () => new Map(accounts.map(account => [account.id, account.name])),
    [accounts]
  )
  // The list re-filters from a deferred copy so typing in the inputs stays responsive.
  const deferredFilters = useDeferredValue(filters)
  const filtered = useMemo(
    () => (transactions ? filterTransactions(transactions, deferredFilters) : null),
    [transactions, deferredFilters]
  )
  const months = useMemo(() => (filtered ? groupByMonth(filtered) : []), [filtered])
  const spent = filtered?.reduce((sum, item) => sum + (isIncome(item) ? 0 : item.totalInEuros), 0) ?? 0
  const received = filtered?.reduce((sum, item) => sum + (isIncome(item) ? item.totalInEuros : 0), 0) ?? 0

  function update<K extends keyof ActivityFilters>(key: K, value: ActivityFilters[K]) {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="tab-panel">
      <section className="card activity-filters no-print">
        <div className="section-head">
          <h2 className="section-title">Activity</h2>
          <div className="row-actions">
            {hasActiveFilters(filters) && (
              <button className="button button-small" onClick={() => onFiltersChange(EMPTY_FILTERS)}>
                <X aria-hidden size={14} />
                Clear filters
              </button>
            )}
            <button
              className="button button-small"
              disabled={!filtered || filtered.length === 0}
              onClick={() => filtered && downloadCsv(toCsv(filtered, accountNames))}
            >
              <Download aria-hidden size={14} />
              CSV
            </button>
            <button
              className="button button-small"
              disabled={!filtered || filtered.length === 0}
              onClick={() => window.print()}
            >
              <Printer aria-hidden size={14} />
              PDF
            </button>
          </div>
        </div>

        <div className="activity-search">
          <Search aria-hidden size={16} />
          <input
            aria-label="Search transactions"
            className="input"
            onChange={event => update('search', event.target.value)}
            placeholder="Search by description or category"
            type="search"
            value={filters.search}
          />
        </div>

        <div className="segmented activity-flow" role="group" aria-label="Transaction type">
          {([['all', 'All'], ['in', 'Money in'], ['out', 'Money out']] as const).map(([value, label]) => (
            <button
              aria-pressed={filters.flow === value}
              key={value}
              onClick={() => update('flow', value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="form-grid activity-grid">
          <div className="field">
            <label htmlFor="filter-account">Account</label>
            <select
              className="input"
              id="filter-account"
              onChange={event =>
                update('accountId', event.target.value === 'all' ? 'all' : Number(event.target.value))
              }
              value={filters.accountId}
            >
              <option value="all">All accounts</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter-category">Category</label>
            <select
              className="input"
              id="filter-category"
              onChange={event => update('category', event.target.value as CategoryId | 'all')}
              value={filters.category}
            >
              <option value="all">All categories</option>
              <optgroup label="Money out">
                {EXPENSE_CATEGORY_IDS.map(id => (
                  <option key={id} value={id}>{CATEGORIES[id].label}</option>
                ))}
              </optgroup>
              <optgroup label="Money in">
                {INCOME_CATEGORY_IDS.map(id => (
                  <option key={id} value={id}>{CATEGORIES[id].label}</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter-from">From</label>
            <input
              className="input"
              id="filter-from"
              max={filters.to || undefined}
              onChange={event => update('from', event.target.value)}
              type="date"
              value={filters.from}
            />
          </div>
          <div className="field">
            <label htmlFor="filter-to">To</label>
            <input
              className="input"
              id="filter-to"
              min={filters.from || undefined}
              onChange={event => update('to', event.target.value)}
              type="date"
              value={filters.to}
            />
          </div>
          <div className="field">
            <label htmlFor="filter-min">Min amount (€)</label>
            <input
              className="input"
              id="filter-min"
              inputMode="decimal"
              min="0"
              onChange={event => update('minAmount', event.target.value)}
              placeholder="0"
              type="number"
              value={filters.minAmount}
            />
          </div>
          <div className="field">
            <label htmlFor="filter-max">Max amount (€)</label>
            <input
              className="input"
              id="filter-max"
              inputMode="decimal"
              min="0"
              onChange={event => update('maxAmount', event.target.value)}
              placeholder="Any"
              type="number"
              value={filters.maxAmount}
            />
          </div>
        </div>
      </section>

      {filtered === null ? (
        error ? (
          <p className="card muted" role="alert">{error}</p>
        ) : (
          <div aria-busy className="card skeleton-list">
            <span className="skeleton" style={{ height: '3rem' }} />
            <span className="skeleton" style={{ height: '3rem' }} />
            <span className="skeleton" style={{ height: '3rem' }} />
          </div>
        )
      ) : filtered.length === 0 ? (
        <p className="card empty-note">No transactions match these filters.</p>
      ) : (
        <>
          <p aria-live="polite" className="activity-summary muted">
            {filtered.length} {filtered.length === 1 ? 'transaction' : 'transactions'}
            {received > 0 && <> · <span className="amount-in">+{formatMoney(received)}</span> in</>}
            {spent > 0 && <> · <span>−{formatMoney(spent)}</span> out</>}
          </p>
          {months.map(month => (
            <section className="card" key={month.month}>
              <header className="section-head">
                <h3 className="section-title">{formatMonthYear(month.month)}</h3>
                <p className="activity-month-total">
                  {month.income > 0 && <span className="amount-in">+{formatMoney(month.income)}</span>}
                  {month.total > 0 && <span>−{formatMoney(month.total)}</span>}
                </p>
              </header>
              <ul className="rows">
                {month.transactions.map(transaction => (
                  <TransactionRow
                    accountName={accountNames.get(transaction.accountId ?? -1)}
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  )
}
