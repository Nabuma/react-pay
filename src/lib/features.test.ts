import { describe, expect, it } from 'vitest'
import { EMPTY_FILTERS, filterTransactions, groupByMonth, hasActiveFilters, toCsv } from './activity'
import { categorize, getCategoryId } from './categories'
import { formatIban, isValidIban } from './iban'
import { budgetProgress, categoryTotals, monthSpendByCategory } from './insights'
import { advanceDate, describeDue, nextRunAfter } from './schedule'
import { splitEvenly } from './split'
import type { ConvertedSpending } from '../types'

const tx = (overrides: Partial<ConvertedSpending>): ConvertedSpending => ({
  id: 1,
  date: '2026-10-01',
  description: 'Groceries',
  amount: 10,
  currency: 'EUR',
  totalInEuros: 10,
  ...overrides
})

describe('categorize', () => {
  it('maps descriptions to categories', () => {
    expect(categorize('Groceries')).toBe('groceries')
    expect(categorize('Rent')).toBe('housing')
    expect(categorize('Weekend trip')).toBe('travel')
    expect(categorize('Train tickets')).toBe('transport')
    expect(categorize('Mystery')).toBe('other')
  })

  it('treats transfers as transfers even when they mention rent', () => {
    expect(categorize('Transfer to SCI Les Tilleuls (rent)')).toBe('transfer')
  })

  it('prefers an explicit category', () => {
    expect(getCategoryId({ description: 'Groceries', category: 'health' })).toBe('health')
  })
})

describe('isValidIban', () => {
  it('accepts valid IBANs regardless of spacing and case', () => {
    expect(isValidIban('GB29 NWBK 6016 1331 9268 19')).toBe(true)
    expect(isValidIban('de44500105175407324931')).toBe(true)
  })

  it('rejects wrong checksums and malformed values', () => {
    expect(isValidIban('GB29 NWBK 6016 1331 9268 18')).toBe(false)
    expect(isValidIban('1234')).toBe(false)
    expect(isValidIban('')).toBe(false)
  })

  it('formats in groups of four', () => {
    expect(formatIban('gb29nwbk60161331926819')).toBe('GB29 NWBK 6016 1331 9268 19')
  })
})

describe('splitEvenly', () => {
  it('splits exactly when divisible', () => {
    expect(splitEvenly(90, 3)).toEqual([30, 30, 30])
  })

  it('gives leftover cents to the first shares so the total is preserved', () => {
    const shares = splitEvenly(100, 3)
    expect(shares).toEqual([33.34, 33.33, 33.33])
    expect(Math.round(shares.reduce((a, b) => a + b, 0) * 100)).toBe(10000)
  })
})

describe('schedule', () => {
  it('advances weekly, monthly and yearly dates', () => {
    expect(advanceDate('2026-10-28', 'weekly')).toBe('2026-11-04')
    expect(advanceDate('2026-10-14', 'monthly')).toBe('2026-11-14')
    expect(advanceDate('2026-10-14', 'yearly')).toBe('2027-10-14')
  })

  it('clamps to the last day of shorter months', () => {
    expect(advanceDate('2026-01-31', 'monthly')).toBe('2026-02-28')
    expect(advanceDate('2028-02-29', 'yearly')).toBe('2029-02-28')
  })

  it('skips past overdue occurrences', () => {
    expect(nextRunAfter('2026-08-10', 'monthly', '2026-10-11')).toBe('2026-11-10')
  })

  it('describes how soon a payment is due', () => {
    expect(describeDue('2026-10-09', '2026-10-11').tone).toBe('late')
    expect(describeDue('2026-10-11', '2026-10-11').label).toBe('Due today')
    expect(describeDue('2026-10-12', '2026-10-11').label).toBe('Due tomorrow')
    expect(describeDue('2026-10-30', '2026-10-11').tone).toBe('later')
  })
})

describe('activity filters', () => {
  const items = [
    tx({ id: 1, date: '2026-10-05', description: 'Groceries', totalInEuros: 80, accountId: 1 }),
    tx({ id: 2, date: '2026-09-20', description: 'Rent', totalInEuros: 1000, accountId: 2 }),
    tx({ id: 3, date: '2026-09-02', description: 'Coffee shop', totalInEuros: 4, accountId: 1 })
  ]

  it('returns everything newest first with no filters', () => {
    expect(filterTransactions(items, EMPTY_FILTERS).map(item => item.id)).toEqual([1, 2, 3])
  })

  it('combines search, account, category, date and amount filters', () => {
    expect(filterTransactions(items, { ...EMPTY_FILTERS, search: 'coffee' }).map(i => i.id)).toEqual([3])
    expect(filterTransactions(items, { ...EMPTY_FILTERS, accountId: 1 }).map(i => i.id)).toEqual([1, 3])
    expect(filterTransactions(items, { ...EMPTY_FILTERS, category: 'housing' }).map(i => i.id)).toEqual([2])
    expect(filterTransactions(items, { ...EMPTY_FILTERS, from: '2026-09-10', to: '2026-09-30' }).map(i => i.id)).toEqual([2])
    expect(filterTransactions(items, { ...EMPTY_FILTERS, minAmount: '50', maxAmount: '500' }).map(i => i.id)).toEqual([1])
  })

  it('detects active filters', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false)
    expect(hasActiveFilters({ ...EMPTY_FILTERS, search: 'a' })).toBe(true)
  })

  it('groups by month keeping order', () => {
    const groups = groupByMonth(filterTransactions(items, EMPTY_FILTERS))
    expect(groups.map(group => group.month)).toEqual(['2026-10', '2026-09'])
    expect(groups[1].total).toBe(1004)
  })

  it('exports CSV and neutralises spreadsheet formulas', () => {
    const csv = toCsv(
      [tx({ description: '=HYPERLINK("x")', accountId: 1 }), tx({ id: 2, description: 'Cafe, "Main"' })],
      new Map([[1, 'N26']])
    )
    const lines = csv.split('\r\n')
    expect(lines[0]).toBe('Date,Description,Category,Type,Account,Amount,Currency,Amount (EUR)')
    expect(lines[1]).toContain(`"'=HYPERLINK(""x"")"`)
    expect(lines[1]).toContain('"N26"')
    expect(lines[2]).toContain('"Cafe, ""Main"""')
  })
})

describe('income', () => {
  const salary = tx({ id: 9, description: 'Salary', totalInEuros: 2000, kind: 'income', category: 'salary' })
  const items = [tx({ id: 1, description: 'Groceries', totalInEuros: 50 }), salary]

  it('falls back to the deposit category for income without one', () => {
    expect(getCategoryId({ description: 'Groceries refund', kind: 'income' })).toBe('income')
  })

  it('filters by money in or out', () => {
    expect(filterTransactions(items, { ...EMPTY_FILTERS, flow: 'in' }).map(i => i.id)).toEqual([9])
    expect(filterTransactions(items, { ...EMPTY_FILTERS, flow: 'out' }).map(i => i.id)).toEqual([1])
    expect(hasActiveFilters({ ...EMPTY_FILTERS, flow: 'in' })).toBe(true)
  })

  it('separates income from spending in month groups, insights and CSV', () => {
    expect(groupByMonth(items)[0]).toMatchObject({ total: 50, income: 2000 })
    expect(categoryTotals(items).map(item => item.category)).toEqual(['groceries'])
    expect(monthSpendByCategory(items, '2026-10').has('salary')).toBe(false)
    expect(toCsv([salary], new Map()).split('\r\n')[1]).toContain(',Income,')
  })
})

describe('insights', () => {
  const items = [
    tx({ id: 1, description: 'Groceries', totalInEuros: 60 }),
    tx({ id: 2, description: 'Groceries', totalInEuros: 40 }),
    tx({ id: 3, description: 'Rent', totalInEuros: 100, date: '2026-09-01' })
  ]

  it('totals categories with shares, largest first', () => {
    const totals = categoryTotals(items)
    expect(totals[0]).toMatchObject({ category: 'groceries', total: 100, count: 2 })
    expect(totals[0].share).toBeCloseTo(0.5)
  })

  it('sums a single month per category', () => {
    const spent = monthSpendByCategory(items, '2026-10')
    expect(spent.get('groceries')).toBe(100)
    expect(spent.has('housing')).toBe(false)
  })

  it('classifies budget progress', () => {
    expect(budgetProgress(50, 100).status).toBe('ok')
    expect(budgetProgress(80, 100).status).toBe('warning')
    expect(budgetProgress(100, 100).status).toBe('warning')
    expect(budgetProgress(101, 100)).toMatchObject({ status: 'over', remaining: -1 })
  })
})
