import type { CategoryId, ConvertedSpending } from '../types'
import { CATEGORIES, getCategoryId, isIncome } from './categories'

export type ActivityFilters = {
  search: string
  accountId: number | 'all'
  category: CategoryId | 'all'
  flow: 'all' | 'in' | 'out'
  from: string
  to: string
  minAmount: string
  maxAmount: string
}

export const EMPTY_FILTERS: ActivityFilters = {
  search: '',
  accountId: 'all',
  category: 'all',
  flow: 'all',
  from: '',
  to: '',
  minAmount: '',
  maxAmount: ''
}

export const hasActiveFilters = (filters: ActivityFilters) =>
  (Object.keys(EMPTY_FILTERS) as (keyof ActivityFilters)[]).some(key => filters[key] !== EMPTY_FILTERS[key])

const parseAmount = (value: string) => (value.trim() === '' ? null : Number(value))

export function filterTransactions(
  transactions: readonly ConvertedSpending[],
  filters: ActivityFilters
): ConvertedSpending[] {
  const search = filters.search.trim().toLowerCase()
  const min = parseAmount(filters.minAmount)
  const max = parseAmount(filters.maxAmount)

  return transactions
    .filter(transaction => {
      const category = getCategoryId(transaction)

      if (filters.accountId !== 'all' && transaction.accountId !== filters.accountId) return false
      if (filters.category !== 'all' && category !== filters.category) return false
      if (filters.flow !== 'all' && isIncome(transaction) !== (filters.flow === 'in')) return false
      if (filters.from && transaction.date < filters.from) return false
      if (filters.to && transaction.date > filters.to) return false
      if (min !== null && Number.isFinite(min) && transaction.totalInEuros < min) return false
      if (max !== null && Number.isFinite(max) && transaction.totalInEuros > max) return false
      if (search) {
        const haystack = `${transaction.description} ${CATEGORIES[category].label}`.toLowerCase()
        if (!haystack.includes(search)) return false
      }
      return true
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
}

// `total` is what was spent; `income` is what was received.
export type ActivityMonth = { month: string; total: number; income: number; transactions: ConvertedSpending[] }

// Expects transactions already sorted newest first.
export function groupByMonth(transactions: readonly ConvertedSpending[]): ActivityMonth[] {
  const months = new Map<string, ActivityMonth>()

  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7)
    const group = months.get(month) ?? { month, total: 0, income: 0, transactions: [] }
    if (isIncome(transaction)) group.income += transaction.totalInEuros
    else group.total += transaction.totalInEuros
    group.transactions.push(transaction)
    months.set(month, group)
  }

  return [...months.values()]
}

// Spreadsheet apps run cells that start with these characters as formulas.
const escapeCell = (value: string) => {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

export function toCsv(
  transactions: readonly ConvertedSpending[],
  accountNames: ReadonlyMap<number, string>
) {
  const header = ['Date', 'Description', 'Category', 'Type', 'Account', 'Amount', 'Currency', 'Amount (EUR)']
  const rows = transactions.map(transaction => [
    transaction.date,
    escapeCell(transaction.description),
    escapeCell(CATEGORIES[getCategoryId(transaction)].label),
    isIncome(transaction) ? 'Income' : 'Expense',
    escapeCell(accountNames.get(transaction.accountId ?? -1) ?? ''),
    String(transaction.amount),
    transaction.currency,
    transaction.totalInEuros.toFixed(2)
  ])

  return [header, ...rows].map(row => row.join(',')).join('\r\n')
}
