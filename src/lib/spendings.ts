import type { ExchangeRates, MonthlySpending, Spending } from '../types'
import { toEuros } from './currency'

export function groupMonthlySpendings(
  spendings: readonly Spending[],
  rates: ExchangeRates
): MonthlySpending[] {
  const months = new Map<string, MonthlySpending>()

  for (const spending of spendings) {
    const month = spending.date.slice(0, 7)
    const totalInEuros = toEuros(spending.amount, spending.currency, rates)
    const monthly = months.get(month) ?? { month, total: 0, transactions: [], income: 0, received: [] }
    if (spending.kind === 'income') {
      monthly.income += totalInEuros
      monthly.received.push({ ...spending, totalInEuros })
    } else {
      monthly.total += totalInEuros
      monthly.transactions.push({ ...spending, totalInEuros })
    }
    months.set(month, monthly)
  }

  return [...months.values()].sort((a, b) => b.month.localeCompare(a.month))
}

export type Trend = 'up' | 'down' | null

export function getTrend(current: number, previous: number): Trend {
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return null
}
