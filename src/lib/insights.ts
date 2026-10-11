import type { CategoryId, ConvertedSpending, MonthlySpending } from '../types'
import { getCategoryId, isIncome } from './categories'

export type CategoryTotal = {
  category: CategoryId
  total: number
  share: number
  count: number
}

export function categoryTotals(transactions: readonly ConvertedSpending[]): CategoryTotal[] {
  const totals = new Map<CategoryId, { total: number; count: number }>()
  let grandTotal = 0

  for (const transaction of transactions) {
    if (isIncome(transaction)) continue
    const category = getCategoryId(transaction)
    const entry = totals.get(category) ?? { total: 0, count: 0 }
    entry.total += transaction.totalInEuros
    entry.count += 1
    grandTotal += transaction.totalInEuros
    totals.set(category, entry)
  }

  return [...totals.entries()]
    .map(([category, { total, count }]) => ({
      category,
      total,
      count,
      share: grandTotal > 0 ? total / grandTotal : 0
    }))
    .sort((a, b) => b.total - a.total)
}

// Oldest to newest, limited to the most recent months.
export function recentMonthTotals(monthly: readonly MonthlySpending[], count = 6) {
  return monthly
    .slice(0, count)
    .map(({ month, total }) => ({ month, total }))
    .reverse()
}

export type BudgetStatus = 'ok' | 'warning' | 'over'

// Euro spend per category for a single month ('YYYY-MM').
export function monthSpendByCategory(transactions: readonly ConvertedSpending[], month: string) {
  const totals = new Map<CategoryId, number>()

  for (const transaction of transactions) {
    if (!transaction.date.startsWith(month) || isIncome(transaction)) continue
    const category = getCategoryId(transaction)
    totals.set(category, (totals.get(category) ?? 0) + transaction.totalInEuros)
  }

  return totals
}

export function budgetProgress(spent: number, limit: number) {
  const ratio = limit > 0 ? spent / limit : 0
  const status: BudgetStatus = ratio > 1 ? 'over' : ratio >= 0.8 ? 'warning' : 'ok'
  return { ratio, status, remaining: limit - spent }
}
